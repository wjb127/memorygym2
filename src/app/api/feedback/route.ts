import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

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
    const emailSubject = encodeURIComponent('메모리짐 피드백 답변');
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

export async function POST(request: Request) {
  try {
    const { content, email } = await request.json();
    
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