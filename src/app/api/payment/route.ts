import { NextResponse } from 'next/server';

// 아임포트 엑세스 토큰 발급 함수
async function getIamportToken() {
  const response = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imp_key: process.env.IAMPORT_API_KEY,
      imp_secret: process.env.IAMPORT_API_SECRET,
    }),
  });

  const { response: { access_token } } = await response.json();
  return access_token;
}

// 결제 정보 조회 함수
async function getPaymentData(impUid: string, accessToken: string) {
  const response = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const { response: paymentData } = await response.json();
  return paymentData;
}

// 결제 검증 API 라우트
export async function POST(request: Request) {
  try {
    const { imp_uid, merchant_uid, amount } = await request.json();

    // 필수 파라미터 검증
    if (!imp_uid || !merchant_uid) {
      return NextResponse.json({ 
        success: false, 
        message: '필수 파라미터가 누락되었습니다.' 
      }, { status: 400 });
    }

    // 아임포트 토큰 발급
    const accessToken = await getIamportToken();
    
    // 결제 정보 조회
    const paymentData = await getPaymentData(imp_uid, accessToken);
    
    // 결제 검증: 결제 금액과 주문 금액이 일치하는지 확인
    if (paymentData.amount === amount) {
      // TODO: 데이터베이스에 결제 정보 저장
      // const { data, error } = await supabase
      //   .from('payments')
      //   .insert({
      //     payment_id: imp_uid,
      //     merchant_uid: merchant_uid,
      //     amount: amount,
      //     status: paymentData.status,
      //     payment_data: paymentData,
      //   });

      // 성공 응답
      return NextResponse.json({
        success: true,
        message: '결제가 성공적으로 완료되었습니다.',
        data: paymentData
      });
    } else {
      // 결제 금액 불일치 - 위조된 결제
      return NextResponse.json({
        success: false,
        message: '결제 금액이 일치하지 않습니다.',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('결제 검증 오류:', error);
    return NextResponse.json({
      success: false,
      message: '결제 검증 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 