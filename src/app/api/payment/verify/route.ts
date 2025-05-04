import { NextResponse } from 'next/server';

/**
 * 포트원 V2 결제 검증 API
 * 클라이언트에서 결제 성공 후 서버에서 결제 정보를 검증합니다.
 */
export async function POST(request: Request) {
  try {
    // 클라이언트에서 전송한 결제 정보
    const { paymentId, orderId, amount } = await request.json();
    
    // 필수 파라미터 확인
    if (!paymentId || !orderId || !amount) {
      return NextResponse.json(
        { success: false, message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    console.log('결제 검증 요청:', { paymentId, orderId, amount });
    
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
        { success: false, message: '결제 검증을 위한 인증에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    const { accessToken } = await tokenResponse.json();
    
    // 2. 결제 정보 조회
    const verifyResponse = await fetch(`https://api.portone.io/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!verifyResponse.ok) {
      const verifyError = await verifyResponse.text();
      console.error('결제 정보 조회 실패:', verifyError);
      return NextResponse.json(
        { success: false, message: '결제 정보 조회에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    const payment = await verifyResponse.json();
    console.log('결제 정보 조회 결과:', payment);
    
    // 3. 결제 금액 검증
    if (payment.payment?.totalAmount !== amount) {
      console.error('결제 금액 불일치:', { 
        expected: amount, 
        actual: payment.payment?.totalAmount 
      });
      return NextResponse.json(
        { success: false, message: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }
    
    // 4. 결제 상태 확인
    if (payment.payment?.status !== 'PAID') {
      console.error('잘못된 결제 상태:', payment.payment?.status);
      return NextResponse.json(
        { success: false, message: '결제가 완료되지 않았습니다.' },
        { status: 400 }
      );
    }
    
    // 5. 결제 검증 성공
    console.log('결제 검증 성공:', { paymentId, orderId });
    
    // 이 부분에서 결제 정보를 데이터베이스에 저장하거나 유저 정보 업데이트 가능
    // ex) await db.payments.create({ ... })
    // ex) await db.users.update({ id: userId }, { isPremium: true })
    
    return NextResponse.json({
      success: true,
      message: '결제가 성공적으로 검증되었습니다.',
    });
    
  } catch (error) {
    console.error('결제 검증 처리 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, message: '결제 검증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 