'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface PaymentButtonProps {
  productName: string;
  amount: number;
  customerName?: string;
}

export default function PaymentButton({ productName, amount, customerName = '사용자' }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isImpLoaded, setIsImpLoaded] = useState(false);

  // 아임포트 스크립트 로드 확인
  useEffect(() => {
    const checkImpLoaded = setInterval(() => {
      // @ts-ignore
      if (window.IMP) {
        setIsImpLoaded(true);
        clearInterval(checkImpLoaded);
        console.log('아임포트 SDK 로드 완료');
        // @ts-ignore
        window.IMP.init(process.env.NEXT_PUBLIC_IAMPORT_MERCHANT_ID);
      }
    }, 500);

    return () => clearInterval(checkImpLoaded);
  }, []);

  const handlePayment = () => {
    if (!isImpLoaded) {
      alert('결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 로딩 상태 설정
    setIsLoading(true);

    // 주문번호 생성 (고유한 ID 생성)
    const merchantUid = `order_${uuidv4()}`;
    console.log('주문 ID 생성:', merchantUid);

    try {
      // @ts-ignore
      const IMP = window.IMP;
      console.log('가맹점 ID:', process.env.NEXT_PUBLIC_IAMPORT_MERCHANT_ID);

      // 이니시스 테스트 모드로 변경 (테스트 상점아이디 명시)
      const pgProvider = 'inicis.INIpayTest';
      console.log('PG사 코드:', pgProvider);

      // 결제 데이터 구성
      const paymentData = {
        pg: pgProvider, // 이니시스 테스트 코드
        pay_method: 'card', // 결제 수단
        merchant_uid: merchantUid, // 주문번호
        name: productName, // 주문명
        amount: amount, // 결제금액
        buyer_name: customerName, // 구매자 이름
        buyer_tel: '010-0000-0000', // 구매자 전화번호 (필수)
        buyer_email: 'buyer@example.com', // 구매자 이메일 (필수)
        m_redirect_url: `${window.location.origin}/payments/complete`, // 모바일 결제 후 리디렉션 URL
        display: {
          card_quota: [0], // 일시불만 활성화
        },
      };
      
      console.log('결제 요청 데이터:', JSON.stringify(paymentData));

      // 결제 창 호출
      IMP.request_pay(paymentData, function(response: any) {
        console.log('결제 응답:', response);
        
        // 로딩 상태 해제
        setIsLoading(false);
        
        const { success, error_msg, imp_uid, merchant_uid } = response;

        if (success) {
          // 결제 성공 처리
          console.log('결제 성공:', imp_uid);
          
          // 서버에 결제 검증 요청
          fetch('/api/payment', {
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
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert('결제가 성공적으로 완료되었습니다.');
              window.location.href = '/payments/complete';
            } else {
              alert(`결제 검증 실패: ${data.message}`);
            }
          })
          .catch(err => {
            console.error('결제 검증 오류:', err);
            alert('결제 검증 중 오류가 발생했습니다.');
          });
        } else {
          // 결제 실패 처리
          console.error('결제 실패:', error_msg);
          alert(`결제 실패: ${error_msg}`);
        }
      });
    } catch (error) {
      console.error('결제 모듈 실행 오류:', error);
      alert('결제 모듈 실행 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !isImpLoaded}
      className="w-full py-3 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
    >
      {isLoading ? '결제 처리 중...' : 
       !isImpLoaded ? '결제 모듈 로딩 중...' : 
       `${productName} 결제하기 (${amount.toLocaleString()}원)`}
    </button>
  );
} 