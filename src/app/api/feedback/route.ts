import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// 피드백 데이터 저장 함수
async function saveFeedback(content: string, email: string | null) {
  try {
    // 여기서는 DB에 직접 접근하는 대신 API 호출로 대체
    // 실제 구현에서는 Prisma 사용을 고려할 수 있음
    console.log('피드백 데이터 저장:', { content, email });
    
    // 성공적으로 저장된 것으로 가정
    return { success: true, data: { content, email, created_at: new Date().toISOString() } };
  } catch (err) {
    console.error('피드백 저장 중 오류:', err);
    return { success: false, data: null };
  }
}

// 슬랙 웹훅으로 메시지 보내기
async function sendSlackNotification(content: string, email: string | null) {
  try {
    // 새 환경 변수 이름 사용 (Vercel에서 캐시 문제 해결용)
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL_NEW || process.env.SLACK_WEBHOOK_URL;
    const isDevEnv = process.env.NODE_ENV === 'development';
    
    console.log('## 슬랙 호출 환경 ##', {
      env: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
      hasSlackUrl: !!slackWebhookUrl,
      slackUrlLength: slackWebhookUrl?.length || 0,
      slackUrlStart: slackWebhookUrl?.substring(0, 30) || '',
      slackUrlEnd: slackWebhookUrl?.substring(slackWebhookUrl?.length - 10 || 0) || '',
      // 어떤 환경 변수가 사용되었는지 표시
      usingNewVar: !!process.env.SLACK_WEBHOOK_URL_NEW,
      usingOldVar: !!process.env.SLACK_WEBHOOK_URL && !process.env.SLACK_WEBHOOK_URL_NEW
    });
    
    if (!slackWebhookUrl) {
      console.log('슬랙 웹훅 URL이 설정되지 않아 알림을 건너뜁니다.');
      return false;
    }
    
    console.log('## 슬랙 알림 전송 시도 ##', { webhookExists: !!slackWebhookUrl });
    
    // 기본 메시지 텍스트 만들기 (모든 형식에서 사용)
    const messageText = `📫 새로운 피드백이 도착했습니다\n\n*내용:* ${content}\n*연락처:* ${email}\n*접수 시간:* ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`;
    
    // 페이로드 생성
    const simplePayload = { text: messageText };
    const payloadString = JSON.stringify(simplePayload);
    
    // URL 직접 생성 방식 시도 - Vercel 환경에서 URL 캐싱 문제 해결
    const webhookParts = slackWebhookUrl.match(/https:\/\/hooks.slack.com\/services\/([^\/]+)\/([^\/]+)\/(.+)/);
    const directUrl = webhookParts 
      ? `https://hooks.slack.com/services/${webhookParts[1]}/${webhookParts[2]}/${webhookParts[3]}`
      : slackWebhookUrl;
      
    console.log('## 슬랙 요청 정보 ##', {
      method: 'POST',
      url: directUrl,
      headers: { 'Content-Type': 'application/json' },
      bodyLength: payloadString.length,
      bodyPreview: payloadString.substring(0, 50) + '...',
      urlReconstructed: !!webhookParts
    });
    
    // 가장 단순한 형식으로 시도 (호환성 최대화)
    try {
      console.log('## 슬랙 요청 시작 ##');
      const startTime = Date.now();
      
      const response = await fetch(directUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payloadString,
      });
      
      const endTime = Date.now();
      const responseText = await response.text();
      
      console.log('## 슬랙 응답 정보 ##', { 
        status: response.status, 
        statusText: response.statusText,
        responseText,
        responseTime: `${endTime - startTime}ms`,
        ok: response.ok,
        headers: {
          contentType: response.headers.get('content-type'),
          server: response.headers.get('server')
        }
      });
      
      if (response.ok) {
        console.log('## 슬랙 알림 전송 성공 ##');
        return true;
      } else {
        console.log('## 슬랙 알림 전송 실패 ##', { 
          status: response.status, 
          statusText: response.statusText,
          responseText 
        });
      }
    } catch (e) {
      console.log('## 슬랙 전송 중 예외 발생 ##', {
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined
      });
    }
    
    // 첫 번째 시도가 실패하면 로그만 남기고 계속 진행
    console.log('슬랙 알림 전송을 건너뛰고 계속 진행합니다.');
    return false;
  } catch (error) {
    // 모든 슬랙 관련 오류는 여기서 처리하고 피드백 저장에 영향을 주지 않음
    console.log('## 슬랙 알림 처리 중 최종 오류 발생 ##', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
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

// 피드백 데이터를 로컬에 저장하는 함수
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

export async function POST(request: NextRequest) {
  try {
    const { feedback, rating } = await request.json();

    if (!feedback?.trim()) {
      return NextResponse.json(
        { error: '피드백 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Authorization 헤더에서 JWT 토큰 추출 (선택사항)
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    // 피드백 데이터 준비
    const feedbackData = {
      feedback: feedback.trim(),
      rating: rating || null,
      user_id: userId, // 비로그인 사용자는 null
      user_agent: request.headers.get('user-agent') || '',
      ip_address: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      created_at: new Date().toISOString()
    };

    console.log('[POST /api/feedback] 피드백 저장:', {
      hasUserId: !!userId,
      feedbackLength: feedback.length,
      rating
    });

    // TODO: 실제 피드백 저장 로직 구현
    // 현재는 콘솔에만 로그 출력
    console.log('피드백 수신:', feedbackData);

    return NextResponse.json({ 
      success: true,
      message: '소중한 피드백 감사합니다!' 
    });
  } catch (error) {
    console.error('[POST /api/feedback] 오류:', error);
    return NextResponse.json(
      { error: '피드백 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 