import { NextResponse } from 'next/server';

/**
 * 포트원 V2 결제 검증 API - V2 인증 방식 사용
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
    
    // API 시크릿 키 확인
    const secretKey = process.env.PORTONE_V2_API_SECRET;
    console.log('환경변수 확인:', { 
      secretKeyExists: !!secretKey,
      secretKeyFirstChars: secretKey ? secretKey.substring(0, 4) + '...' : 'undefined'
    });
    
    if (!secretKey) {
      console.error('포트원 V2 API 시크릿 키가 설정되지 않았습니다.');
      return NextResponse.json(
        { success: false, message: '포트원 V2 API 시크릿 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }
    
    // 결제 정보 조회
    const apiUrl = `https://api.portone.io/payments/${paymentId}`;
    console.log('API 요청 URL:', apiUrl);
    
    // 테스트 계정 사용시
    const isTest = process.env.NODE_ENV === 'development' || process.env.IS_TEST === 'true';
    
    // 인증 헤더 형식: PortOne <SECRET_KEY>
    const headers = {
      'Authorization': `PortOne ${secretKey}`,
      'Content-Type': 'application/json',
    };
    
    if (isTest) {
      console.log('테스트 모드 활성화: 테스트 헤더 사용');
      // 테스트용 설정을 추가할 수 있음
    }
    
    console.log('요청 헤더 구조:', Object.keys(headers).join(', '));
    
    try {
      const paymentResponse = await fetch(apiUrl, { headers });

      console.log('결제 정보 조회 요청 상태:', {
        status: paymentResponse.status,
        ok: paymentResponse.ok,
        statusText: paymentResponse.statusText,
        url: paymentResponse.url
      });
      
      if (!paymentResponse.ok) {
        let paymentError;
        try {
          const errorText = await paymentResponse.text();
          try {
            // JSON 형식인지 확인
            paymentError = JSON.parse(errorText);
            console.error('결제 정보 조회 실패 (JSON):', paymentError);
          } catch (e) {
            // 텍스트 형식 응답
            paymentError = errorText;
            console.error('결제 정보 조회 실패 (텍스트):', errorText);
          }
        } catch (e) {
          // 응답 처리 실패
          paymentError = '응답을 읽을 수 없음';
          console.error('결제 정보 조회 응답 처리 실패:', e);
        }

        return NextResponse.json(
          { 
            success: false, 
            message: `결제 정보 조회에 실패했습니다. 상태코드: ${paymentResponse.status}`,
            error: paymentError
          },
          { status: 500 }
        );
      }
      
      const paymentData = await paymentResponse.json();
      console.log('결제 정보 조회 성공:', paymentData);
      
      // 결제 정보 구조 변경에 따른 검증 로직 수정
      const payment = paymentData.payment || paymentData;
      
      // 3. 결제 정보 검증 - V2 응답 구조 적용
      // orderId 검증 (V2에서는 payment.order.id 또는 payment.orderId 형태로 제공)
      const responseOrderId = payment.order?.id || payment.orderId;
      if (responseOrderId !== orderId) {
        console.error('주문 ID 불일치:', { expected: orderId, actual: responseOrderId });
        return NextResponse.json(
          { success: false, message: '주문 ID가 일치하지 않습니다.' },
          { status: 400 }
        );
      }
      
      // 금액 검증 (V2에서는 payment.amount 또는 payment.totalAmount로 제공)
      const responseAmount = payment.amount || payment.totalAmount;
      if (parseInt(responseAmount) !== parseInt(amount)) {
        console.error('결제 금액 불일치:', { expected: amount, actual: responseAmount });
        return NextResponse.json(
          { success: false, message: '결제 금액이 일치하지 않습니다.' },
          { status: 400 }
        );
      }
      
      // 결제 상태 확인 (V2에서는 status 값이 변경됨)
      const paymentStatus = payment.status;
      if (paymentStatus !== 'PAID' && paymentStatus !== 'COMPLETE' && paymentStatus !== 'CONFIRMED') {
        console.error('결제 상태 불일치:', { status: paymentStatus });
        return NextResponse.json(
          { success: false, message: `결제가 완료되지 않았습니다. 현재 상태: ${paymentStatus}` },
          { status: 400 }
        );
      }
      
      // 성공 응답
      return NextResponse.json({
        success: true,
        message: '결제가 성공적으로 검증되었습니다.',
        data: {
          paymentId,
          orderId,
          amount,
          status: paymentStatus
        }
      });
    } catch (error) {
      console.error('결제 검증 처리 중 오류 발생:', error);
      return NextResponse.json(
        { success: false, message: `결제 검증 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('결제 검증 처리 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, message: `결제 검증 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 