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

// 슬랙 웹훅으로 메시지 보내기
async function sendSlackNotification(content: string, email: string | null) {
  try {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!slackWebhookUrl) {
      console.warn('SLACK_WEBHOOK_URL이 설정되지 않았습니다.');
      return;
    }
    
    // 이메일 주소 인코딩 (mailto: 링크용)
    const encodedEmail = email ? encodeURIComponent(email) : '';
    const emailSubject = encodeURIComponent('암기훈련소 피드백 답변');
    const emailBody = encodeURIComponent(`안녕하세요,\n\n피드백에 대한 답변을 드립니다:\n\n원본 피드백: "${content}"\n\n`);
    
    // 슬랙 메시지 블록 구성
    // 슬랙 Block Kit 형식을 any로 처리하여 타입 오류 방지
    const messageBlocks: any[] = [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "📫 새로운 피드백이 도착했습니다",
          "emoji": true
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*내용:*\n${content}`
        }
      }
    ];
    
    // 이메일 정보와 답장 버튼 추가
    if (email) {
      messageBlocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*연락처:* ${email}`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "이메일로 답장하기",
            "emoji": true
          },
          "url": `mailto:${encodedEmail}?subject=${emailSubject}&body=${emailBody}`,
          "action_id": "reply_email"
        }
      });
    }
    
    // 현재 시간 추가
    messageBlocks.push({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": `*접수 시간:* ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`
        }
      ]
    });
    
    // 분리선 추가
    messageBlocks.push({
      "type": "divider"
    });
    
    // 슬랙 웹훅 호출
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blocks: messageBlocks
      }),
    });
    
    if (!response.ok) {
      throw new Error('슬랙 알림 전송 실패');
    }
    
    return true;
  } catch (error) {
    console.error('슬랙 알림 전송 오류:', error);
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

export async function POST(request: Request) {
  try {
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
    
    const { content, email } = await request.json();
    
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
    
    // Supabase에 피드백 데이터 저장
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
      return NextResponse.json(
        { error: '피드백 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 슬랙 알림 전송 (비동기로 처리하고 결과는 기다리지 않음)
    sendSlackNotification(content, email).catch(err => {
      console.error('슬랙 알림 전송 중 오류 발생:', err);
    });
    
    return NextResponse.json({ 
      success: true, 
      message: '피드백이 성공적으로 저장되었습니다.',
      data
    });
    
  } catch (error) {
    console.error('피드백 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 