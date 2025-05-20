import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 이 부분에 실제 이메일 전송 로직이 들어가야 합니다.
    // Next Auth에서는 비밀번호 재설정을 위한 별도의 API가 없으므로
    // 외부 이메일 서비스(예: SendGrid, Mailgun 등)를 사용하여 구현해야 합니다.
    
    console.log(`[비밀번호 재설정] 요청: ${email}`);
    
    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.'
    });
  } catch (error) {
    console.error('[비밀번호 재설정] 오류:', error);
    return NextResponse.json(
      { error: '비밀번호 재설정 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 