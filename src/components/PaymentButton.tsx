'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface PaymentButtonProps {
  productName: string;
  amount: number;
  customerName?: string;
}

export default function PaymentButton({ productName, amount, customerName = '사용자' }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = () => {
    // 로딩 상태 설정
    setIsLoading(true);

    // 주문번호 생성 (고유한 ID 생성)
    const merchantUid = `order_${uuidv4()}`;

    // 아임포트 결제 관련 코드는 클라이언트 사이드에서만 실행되어야 합니다
    // window 객체가 있을 때만 실행
    if (typeof window !== 'undefined') {
      // @ts-ignore - 타입스크립트 에러 방지
      const { IMP } = window;
      if (!IMP) {
        alert('아임포트 라이브러리가 로드되지 않았습니다.');
        setIsLoading(false);
        return;
      }

      // 가맹점 식별코드 초기화
      const merchantId = process.env.NEXT_PUBLIC_IAMPORT_MERCHANT_ID;
      console.log('가맹점 식별코드:', merchantId); // 디버깅용 로그
      IMP.init(merchantId);

      // 결제 데이터 구성
      const pg = 'nice';  // PG사 코드만 설정 (MID 제외)
      console.log('PG사 설정:', pg); // 디버깅용 로그
      
      const paymentData = {
        pg: pg, // PG사 (나이스페이먼츠)
        pay_method: 'card', // 결제 수단
        merchant_uid: merchantUid, // 주문번호
        name: productName, // 주문명
        amount: amount, // 결제금액
        buyer_name: customerName, // 구매자 이름
        buyer_tel: '', // 구매자 전화번호
        buyer_email: '', // 구매자 이메일
        m_redirect_url: `${window.location.origin}/payments/complete`, // 모바일 결제 후 리디렉션 URL
        // 서비스별 커스텀 데이터
        custom_data: {
          user_id: sessionStorage.getItem('user_id') || 'guest',
        },
      };
      
      console.log('결제 데이터:', paymentData); // 디버깅용 로그

      // 결제 창 호출
      IMP.request_pay(paymentData, async function(response: any) {
        // 결제 후 처리
        const { success, error_msg, imp_uid, merchant_uid } = response;

        if (success) {
          // 서버에 결제 검증 요청
          try {
            const verifyResponse = await fetch('/api/payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imp_uid: imp_uid,
                merchant_uid: merchant_uid,
                amount: amount,
                user_id: sessionStorage.getItem('user_id') || 'guest',
              }),
            });

            const result = await verifyResponse.json();

            if (result.success) {
              // 결제 성공 처리
              alert('결제가 성공적으로 완료되었습니다.');
              // TODO: 성공 페이지로 리디렉션 또는 추가 처리
            } else {
              // 결제 실패 처리
              alert(`결제 검증 실패: ${result.message}`);
              // TODO: 실패 처리
            }
          } catch (error) {
            console.error('결제 검증 오류:', error);
            alert('결제 검증 중 오류가 발생했습니다.');
          }
        } else {
          // 결제 실패 처리
          alert(`결제 실패: ${error_msg}`);
        }

        // 로딩 상태 해제
        setIsLoading(false);
      });
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full py-3 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
    >
      {isLoading ? '결제 처리 중...' : `${productName} 결제하기 (${amount.toLocaleString()}원)`}
    </button>
  );
} 