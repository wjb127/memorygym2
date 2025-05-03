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
    
    const messageBlocks = [
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
    
    // 이메일이 있는 경우 추가 정보로 표시
    if (email) {
      messageBlocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*연락처:* ${email}`
        }
      });
    }
    
    // 현재 시간 추가
    messageBlocks.push({
      "type": "context",
      "elements": [
        {
          "type": "plain_text",
          "text": `접수 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
          "emoji": true
        }
      ]
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
    
    // Supabase에 피드백 데이터 저장
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        content,
        email: email || null,
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