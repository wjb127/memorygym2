import { NextResponse } from 'next/server';

/**
 * 포트원 V2 결제 검증 API
 * 클라이언트에서 결제 성공 후 서버에서 결제 정보를 검증합니다.
 */
export async function POST(request: Request) {
  try {
    const { paymentId, orderId, amount } = await request.json();
    
    if (!paymentId || !orderId || !amount) {
      return NextResponse.json(
        { success: false, message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    console.log('결제 검증 요청:', { paymentId, orderId, amount });
    
    // API 키와 Secret 키 확인
    console.log('환경변수 확인:', { 
      apiKeyExists: !!process.env.PORTONE_API_KEY,
      secretKeyExists: !!process.env.PORTONE_SECRET_KEY,
      apiKeyFirstChars: process.env.PORTONE_API_KEY ? process.env.PORTONE_API_KEY.substring(0, 3) + '...' : 'undefined',
    });
    
    // 1. 액세스 토큰 요청
    const tokenResponse = await fetch('https://api.portone.io/login/api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: process.env.PORTONE_API_KEY,
        secretKey: process.env.PORTONE_SECRET_KEY,
      }),
    });
    
    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('토큰 발급 실패:', tokenError);
      return NextResponse.json(
        { success: false, message: `결제 검증을 위한 인증에 실패했습니다. 상태코드: ${tokenResponse.status}, 오류: ${tokenError}` },
        { status: 500 }
      );
    }
    
    const tokenData = await tokenResponse.json();
    console.log('토큰 발급 성공:', { accessTokenExists: !!tokenData.accessToken });
    
    if (!tokenData.accessToken) {
      console.error('액세스 토큰이 없음:', tokenData);
      return NextResponse.json(
        { success: false, message: '액세스 토큰이 발급되지 않았습니다.' },
        { status: 500 }
      );
    }
    
    const accessToken = tokenData.accessToken;
    
    // 2. 결제 정보 조회
    const paymentResponse = await fetch(`https://api.portone.io/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.text();
      console.error('결제 정보 조회 실패:', paymentError);
      return NextResponse.json(
        { success: false, message: `결제 정보 조회에 실패했습니다. 상태코드: ${paymentResponse.status}, 오류: ${paymentError}` },
        { status: 500 }
      );
    }
    
    const paymentData = await paymentResponse.json();
    console.log('결제 정보 조회 성공:', paymentData);
    
    // 3. 결제 정보 검증
    if (paymentData.payment?.order?.id !== orderId) {
      console.error('주문 ID 불일치:', { expected: orderId, actual: paymentData.payment?.order?.id });
      return NextResponse.json(
        { success: false, message: '주문 ID가 일치하지 않습니다.' },
        { status: 400 }
      );
    }
    
    if (paymentData.payment?.amount !== amount) {
      console.error('결제 금액 불일치:', { expected: amount, actual: paymentData.payment?.amount });
      return NextResponse.json(
        { success: false, message: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }
    
    // 4. 결제 상태 확인
    if (paymentData.payment?.status !== 'PAID') {
      console.error('결제 상태 불일치:', { status: paymentData.payment?.status });
      return NextResponse.json(
        { success: false, message: `결제가 완료되지 않았습니다. 현재 상태: ${paymentData.payment?.status}` },
        { status: 400 }
      );
    }
    
    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '결제가 성공적으로 검증되었습니다.',
    });
  } catch (error) {
    console.error('결제 검증 처리 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, message: `결제 검증 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 