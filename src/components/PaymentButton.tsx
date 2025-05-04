'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface PaymentButtonProps {
  productName: string;
  amount: number;
  customerName?: string;
}

interface PaymentStatus {
  status: 'IDLE' | 'PENDING' | 'PAID' | 'FAILED';
  message?: string;
}

export default function PaymentButton({ productName, amount, customerName = '사용자' }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkLoaded, setSdkLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'IDLE'
  });
  
  // 포트원 V2 SDK 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
    script.async = true;
    script.onload = () => {
      console.log('포트원 SDK 로드 완료');
      setSdkLoaded(true);
    };
    script.onerror = () => {
      console.error('포트원 SDK 로드 실패');
    };
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 고유한 ID 생성 함수
  const generateOrderId = () => {
    return `order_${uuidv4()}`;
  };

  const handlePayment = async () => {
    if (!isSdkLoaded) {
      alert('결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);
    setPaymentStatus({ status: 'PENDING' });
    
    const orderId = generateOrderId();
    console.log('주문 ID 생성:', orderId);
    
    try {
      // @ts-ignore - 전역 객체 타입 정의가 없을 수 있음
      const PortOne = window.PortOne;
      
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      
      console.log('상점 ID:', storeId);
      console.log('채널 키:', channelKey);
      
      if (!storeId || !channelKey) {
        throw new Error('포트원 설정 정보가 없습니다. 환경변수를 확인해주세요.');
      }
      
      // 결제 요청
      const payment = await PortOne.requestPayment({
        storeId: storeId,
        channelKey: channelKey,
        paymentId: orderId,
        orderName: productName,
        totalAmount: amount,
        currency: 'KRW',
        payMethod: 'CARD',
        customer: {
          name: customerName,
          phoneNumber: '010-0000-0000', // 실제 서비스에서는 사용자 정보를 활용
          email: 'buyer@example.com', // 실제 서비스에서는 사용자 정보를 활용
        },
        redirectUrl: `${window.location.origin}/payments/complete`,
      });
      
      console.log('결제 응답:', payment);
      
      // 결제 결과 처리
      if (payment.code !== undefined) {
        // 결제 실패
        setPaymentStatus({
          status: 'FAILED',
          message: payment.message || '결제 처리 중 오류가 발생했습니다.'
        });
        console.error('결제 실패:', payment.message);
        alert(`결제 실패: ${payment.message}`);
      } else {
        // 결제 성공 시 서버 검증
        try {
          const response = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId: payment.paymentId,
              orderId: orderId,
              amount: amount,
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setPaymentStatus({ status: 'PAID' });
              alert('결제가 성공적으로 완료되었습니다.');
              window.location.href = '/payments/complete';
            } else {
              setPaymentStatus({
                status: 'FAILED',
                message: result.message || '결제 검증에 실패했습니다.'
              });
              alert(`결제 검증 실패: ${result.message}`);
            }
          } else {
            throw new Error('서버 응답 오류');
          }
        } catch (error) {
          console.error('결제 검증 오류:', error);
          setPaymentStatus({
            status: 'FAILED',
            message: '결제 검증 중 오류가 발생했습니다.'
          });
          alert('결제 검증 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('결제 모듈 실행 오류:', error);
      setPaymentStatus({
        status: 'FAILED',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
      alert('결제 모듈 실행 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 결제 상태에 따른 버튼 텍스트
  const getButtonText = () => {
    if (isLoading) return '결제 처리 중...';
    if (!isSdkLoaded) return '결제 모듈 로딩 중...';
    return `${productName} 결제하기 (${amount.toLocaleString()}원)`;
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={isLoading || !isSdkLoaded}
        className="w-full py-3 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        {getButtonText()}
      </button>
      
      {paymentStatus.status === 'FAILED' && paymentStatus.message && (
        <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
          {paymentStatus.message}
        </div>
      )}
    </>
  );
} 