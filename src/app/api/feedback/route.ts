import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

// 속도 제한을 위한 메모리 저장소
const RATE_LIMIT_WINDOW = 60 * 1000; // 1분 (밀리초)
const MAX_REQUESTS_PER_WINDOW = 3; // IP당 최대 요청 수

// IP 요청 추적을 위한 임시 저장소
// 실제 프로덕션에서는 Redis나 다른 영구적인 저장소를 사용하는 것이 좋음
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestRecords: Map<string, RateLimitRecord> = new Map();

// 5분마다 오래된 레코드 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestRecords.entries()) {
    if (record.resetTime < now) {
      ipRequestRecords.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// feedback 테이블이 존재하는지 확인하고 없으면 생성하는 함수
async function ensureFeedbackTable() {
  try {
    // 테이블 존재 여부 확인
    const { error: checkError } = await supabase
      .from('feedback')
      .select('count')
      .limit(1);
    
    // 테이블이 없는 경우 에러 코드 확인 (42P01은 테이블 없음을 의미)
    if (checkError && checkError.code === '42P01') {
      console.log('피드백 테이블이 없습니다. 테이블을 생성합니다.');
      
      // SQL을 사용하여 테이블 생성 (RLS 제약 없음)
      const { error: createError } = await supabase.rpc('create_feedback_table');
      
      if (createError) {
        console.error('테이블 생성 오류:', createError);
        return false;
      }
      
      console.log('피드백 테이블이 성공적으로 생성되었습니다.');
      return true;
    }
    
    return !checkError;
  } catch (err) {
    console.error('테이블 확인/생성 중 오류:', err);
    return false;
  }
}

// 슬랙 웹훅으로 메시지 보내기
async function sendSlackNotification(content: string, email: string | null) {
  // 슬랙 알림이 성공하지 못해도 피드백 기능에 영향을 주지 않도록 try-catch로 감싸기
  try {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    const isDevEnv = process.env.NODE_ENV === 'development';
    
    console.log('환경 확인:', {
      env: process.env.NODE_ENV,
      isDev: isDevEnv,
      hasSlackUrl: !!slackWebhookUrl,
      urlLength: slackWebhookUrl?.length || 0
    });
    
    if (!slackWebhookUrl) {
      console.log('슬랙 웹훅 URL이 설정되지 않아 알림을 건너뜁니다.');
      return false;
    }

    console.log('슬랙 알림 전송 시도:', { webhookExists: !!slackWebhookUrl });
    
    // 기본 메시지 텍스트 만들기 (모든 형식에서 사용)
    const messageText = `📫 새로운 피드백이 도착했습니다\n\n*내용:* ${content}\n*연락처:* ${email}\n*접수 시간:* ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`;

    // 가장 단순한 형식으로 시도 (호환성 최대화)
    try {
      const simplePayload = { text: messageText };
      console.log('단순 텍스트 형식으로 슬랙 알림 전송 시도');
      
      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplePayload),
      });
      
      if (response.ok) {
        console.log('슬랙 알림 전송 성공');
        return true;
      } else {
        const responseText = await response.text();
        console.log('슬랙 알림 전송 실패:', { 
          status: response.status, 
          statusText: response.statusText,
          responseText 
        });
      }
    } catch (e) {
      console.log('슬랙 단순 메시지 전송 중 오류:', e);
    }
    
    // 첫 번째 시도가 실패하면 로그만 남기고 계속 진행
    console.log('슬랙 알림 전송을 건너뛰고 계속 진행합니다.');
    return false;
  } catch (error) {
    // 모든 슬랙 관련 오류는 여기서 처리하고 피드백 저장에 영향을 주지 않음
    console.log('슬랙 알림 처리 중 오류가 발생했지만 무시하고 계속 진행합니다:', error);
    return false;
  }
}

// 속도 제한 확인 함수
function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  
  // IP 레코드 가져오기 또는 새로 생성
  let record = ipRequestRecords.get(ip);
  
  if (!record || record.resetTime < now) {
    // 새 창 시작
    record = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW
    };
  }
  
  // 제한 확인
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { 
      allowed: false,
      resetTime: record.resetTime
    };
  }
  
  // 요청 횟수 증가
  record.count++;
  ipRequestRecords.set(ip, record);
  
  return { allowed: true };
}

// 피드백 데이터를 로컬에 저장하는 함수 (Supabase 실패 시 대체 방법)
const localFeedbackCache: { content: string; email: string; created_at: string }[] = [];

function saveLocalFeedback(content: string, email: string): { success: boolean, data: any } {
  try {
    const feedback = {
      content,
      email,
      created_at: new Date().toISOString()
    };
    localFeedbackCache.push(feedback);
    console.log('로컬 저장소에 피드백 저장:', feedback);
    return { success: true, data: feedback };
  } catch (error) {
    console.error('로컬 저장 실패:', error);
    return { success: false, data: null };
  }
}

export async function POST(request: Request) {
  try {
    // Supabase 연결 확인 및 환경 변수 로깅
    console.log('Supabase 설정 확인:', {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isDev: process.env.NODE_ENV === 'development',
      vercel: !!process.env.VERCEL,
      slackUrlSet: !!process.env.SLACK_WEBHOOK_URL
    });
    
    // 테이블 확인 및 생성
    await ensureFeedbackTable();
    
    // 클라이언트 IP 가져오기
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'localhost';
    
    // 속도 제한 확인
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime || 0;
      const waitSeconds = Math.ceil((resetTime - Date.now()) / 1000);
      
      return NextResponse.json(
        { 
          error: `너무 많은 피드백을 보냈습니다. ${waitSeconds}초 후에 다시 시도해주세요.` 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': waitSeconds.toString()
          }
        }
      );
    }
    
    // 요청 본문 파싱
    let content = '';
    let email = '';
    try {
      const requestData = await request.json();
      content = requestData.content || '';
      email = requestData.email || '';
    } catch (parseError) {
      console.error('요청 본문 파싱 오류:', parseError);
      return NextResponse.json(
        { error: '유효하지 않은 요청 형식입니다.' },
        { status: 400 }
      );
    }
    
    // 콘텐츠 길이 제한 (최대 1000자)
    if (content && content.length > 1000) {
      return NextResponse.json(
        { error: '피드백 내용은 최대 1000자까지 입력 가능합니다.' },
        { status: 400 }
      );
    }
    
    // 기본 검증
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: '피드백 내용은 필수입니다.' }, 
        { status: 400 }
      );
    }
    
    // 이메일 검증
    if (!email || email.trim() === '') {
      return NextResponse.json(
        { error: '이메일 주소는 필수입니다.' }, 
        { status: 400 }
      );
    }
    
    // 간단한 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    let savedData = null;
    let supabaseError = null;
    
    // Supabase에 피드백 데이터 저장 시도
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          content,
          email,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Supabase 에러:', error);
        console.error('Supabase 에러 상세:', JSON.stringify({
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }));
        supabaseError = error;
      } else {
        savedData = data;
        console.log('Supabase에 피드백 저장 성공:', data);
      }
    } catch (supabaseErr) {
      console.error('Supabase 호출 예외:', supabaseErr);
      console.error('Supabase 호출 예외 상세:', JSON.stringify(supabaseErr, null, 2));
      supabaseError = supabaseErr;
    }
    
    // Supabase 저장 실패 시 로컬 저장소에 백업
    if (supabaseError || !savedData) {
      console.log('Supabase 저장 실패, 로컬 저장소에 백업합니다.');
      const localResult = saveLocalFeedback(content, email);
      if (localResult.success) {
        savedData = localResult.data;
      }
    }
    
    // 슬랙 알림 전송 (실패해도 사용자 응답에 영향을 주지 않음)
    // 여기서 await를 제거하여 비동기적으로 실행하고 응답은 즉시 반환
    sendSlackNotification(content, email)
      .catch(err => {
        console.error('슬랙 알림 전송 중 오류가 발생했지만 무시하고 계속 진행합니다:', err);
      });
    
    // 사용자에게 응답 - Supabase 저장 실패해도 사용자에게는 성공으로 응답
    return NextResponse.json({ 
      success: true, 
      message: '피드백이 성공적으로 저장되었습니다.',
      data: savedData
    });
    
  } catch (error) {
    console.error('피드백 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 