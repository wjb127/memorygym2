import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

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
    const { imp_uid, merchant_uid, amount, user_id } = await request.json();

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
      // 구독 기간 계산
      const now = new Date();
      const startDate = now.toISOString();
      
      // 구독 종료일 계산 (상품명에 따라 월간 또는 연간 구독 설정)
      const endDate = new Date(now);
      if (paymentData.name.includes('월간') || paymentData.name.includes('Monthly')) {
        // 월간 구독 (1개월 추가)
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (paymentData.name.includes('연간') || paymentData.name.includes('Yearly')) {
        // 연간 구독 (1년 추가)
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        // 기본값은 1개월
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      // 결제 정보 저장
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          payment_id: imp_uid,
          merchant_uid: merchant_uid,
          user_id: user_id, // 사용자 ID
          amount: amount,
          status: paymentData.status,
          payment_data: paymentData,
        });
        
      if (paymentError) {
        console.error('결제 정보 저장 오류:', paymentError);
      }
      
      // 구독 정보 저장
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user_id,
          plan_type: paymentData.name.includes('월간') ? 'monthly' : 'yearly',
          start_date: startDate,
          end_date: endDate.toISOString(),
          status: 'active',
          payment_id: imp_uid,
        });
        
      if (subscriptionError) {
        console.error('구독 정보 저장 오류:', subscriptionError);
      }
      
      // 사용자 테이블에 프리미엄 상태 업데이트
      const { error: userError } = await supabase
        .from('users')
        .update({
          is_premium: true,
          premium_until: endDate.toISOString(),
        })
        .eq('id', user_id);
        
      if (userError) {
        console.error('사용자 정보 업데이트 오류:', userError);
      }

      // 성공 응답
      return NextResponse.json({
        success: true,
        message: '결제가 성공적으로 완료되었습니다.',
        data: {
          payment: paymentData,
          subscription: {
            start_date: startDate,
            end_date: endDate.toISOString(),
          }
        }
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