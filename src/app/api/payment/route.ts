import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase-client';

// 포트원 V2 API를 통한 결제 정보 조회 함수
async function getPortOnePaymentData(paymentId: string) {
  try {
    const secretKey = process.env.PORTONE_V2_API_SECRET;
    
    if (!secretKey) {
      throw new Error('포트원 V2 API 시크릿 키가 설정되지 않았습니다.');
    }
    
    const url = `https://api.portone.io/payments/${paymentId}`;
    console.log('PortOne V2 API 호출:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `PortOne ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`포트원 API 응답 오류: ${errorData.message || response.statusText}`);
    }
    
    const paymentData = await response.json();
    return paymentData;
  } catch (error) {
    console.error('포트원 결제 정보 조회 오류:', error);
    throw error;
  }
}

// 결제 검증 API 라우트
export async function POST(request: Request) {
  try {
    const { paymentId, merchant_uid, amount, user_id } = await request.json();

    // 필수 파라미터 검증
    if (!paymentId) {
      return NextResponse.json({ 
        success: false, 
        message: '필수 파라미터가 누락되었습니다.' 
      }, { status: 400 });
    }

    // 포트원 V2 API로 결제 정보 조회
    const paymentData = await getPortOnePaymentData(paymentId);
    
    // 결제 검증: 결제 금액과 주문 금액이 일치하는지 확인
    if (!amount || paymentData.totalAmount === amount) {
      // 구독 기간 계산
      const now = new Date();
      const startDate = now.toISOString();
      
      // 구독 종료일 계산 (상품명에 따라 월간 또는 연간 구독 설정)
      const endDate = new Date(now);
      const orderName = paymentData.orderName || '';
      
      if (orderName.includes('월간') || orderName.includes('Monthly')) {
        // 월간 구독 (1개월 추가)
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (orderName.includes('연간') || orderName.includes('Yearly')) {
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
          payment_id: paymentId,
          merchant_uid: merchant_uid || paymentId,
          user_id: user_id, // 사용자 ID
          amount: paymentData.totalAmount,
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
          plan_type: orderName.includes('월간') ? 'monthly' : 'yearly',
          start_date: startDate,
          end_date: endDate.toISOString(),
          status: 'active',
          payment_id: paymentId,
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