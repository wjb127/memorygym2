'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

// 향후 npm 설치 필요: npm install @portone/browser-sdk
// 현재는 CDN으로 로드하는 방식 사용
// import PortOne from "@portone/browser-sdk/v2";

interface PaymentButtonProps {
  productName: string;
  amount: number;
  customerName?: string;
}

interface PaymentStatus {
  status: 'IDLE' | 'PENDING' | 'PAID' | 'FAILED';
  message?: string;
}

// 전역 객체 타입 선언
declare global {
  interface Window {
    PortOne: any;
  }
}

export default function PaymentButton({ productName, amount, customerName = '사용자' }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkLoaded, setSdkLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'IDLE'
  });
  const router = useRouter();
  
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
  const generatePaymentId = () => {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, "0"))
      .join("");
  };

  const handlePayment = async () => {
    if (!isSdkLoaded) {
      alert('결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);
    setPaymentStatus({ status: 'PENDING' });
    
    // 고유한 결제 ID 생성
    const paymentId = generatePaymentId();
    console.log('결제 ID 생성:', paymentId);
    
    try {
      const PortOne = window.PortOne;
      
      // 환경변수에서 스토어 ID와 채널 키 가져오기
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      
      console.log('상점 ID:', storeId);
      console.log('채널 키:', channelKey);
      
      if (!storeId || !channelKey) {
        throw new Error('포트원 설정 정보가 없습니다. 환경변수를 확인해주세요.');
      }
      
      // 결제 요청 데이터 로깅
      console.log('결제 요청 데이터:', {
        storeId,
        channelKey,
        paymentId,
        orderName: productName,
        totalAmount: amount,
        currency: 'KRW',
        payMethod: 'CARD',
      });
      
      // KG이니시스 결제 요청
      const payment = await PortOne.requestPayment({
        storeId: storeId,
        channelKey: channelKey,
        paymentId: paymentId,
        orderName: productName,
        totalAmount: amount,
        currency: 'KRW',
        payMethod: 'CARD', // 카드 결제
        customer: {
          fullName: customerName,
          phoneNumber: '01012341234', // 고객 전화번호
          email: 'customer@example.com', // 고객 이메일
        },
        redirectUrl: `${window.location.origin}/premium/success`, // 모바일에서 결제 후 리디렉션될 URL
        taxFreeAmount: 0, // 면세 금액
        variantKey: 'DEFAULT', // 기본 결제창 스타일
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
          console.log('서버에 결제 검증 요청:', { 
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            amount: payment.amount
          });
          
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: payment.paymentId,
              orderId: payment.orderId,
              amount: payment.amount,
            }),
          });
  
          if (!verifyResponse.ok) {
            const errorText = await verifyResponse.text();
            console.error('결제 검증 API 오류:', { 
              status: verifyResponse.status, 
              statusText: verifyResponse.statusText,
              errorText: errorText || '응답 내용 없음'
            });
            
            let errorMessage = `결제 검증 실패: ${verifyResponse.status}`;
            try {
              // 응답이 JSON 형식인지 확인
              const errorJson = JSON.parse(errorText);
              if (errorJson && errorJson.message) {
                errorMessage += ` - ${errorJson.message}`;
              } else {
                errorMessage += ` - ${errorText}`;
              }
            } catch (e) {
              // JSON 파싱 실패시 텍스트 그대로 사용
              errorMessage += errorText ? ` - ${errorText}` : '';
            }
            
            setPaymentStatus({
              status: 'FAILED',
              message: errorMessage
            });
            return;
          }
  
          const verifyResult = await verifyResponse.json();
          console.log('결제 검증 결과:', verifyResult);
  
          if (verifyResult.success) {
            setPaymentStatus({ status: 'PAID' });
            alert('결제가 성공적으로 완료되었습니다.');
            router.push('/premium/success');
          } else {
            setPaymentStatus({
              status: 'FAILED',
              message: `결제 검증 실패: ${verifyResult.message}`
            });
            alert(`결제 검증 실패: ${verifyResult.message}`);
          }
        } catch (error) {
          console.error('결제 검증 중 오류 발생:', {
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : String(error),
            type: typeof error
          });
          
          setPaymentStatus({
            status: 'FAILED',
            message: error instanceof Error 
              ? `결제 검증 중 오류: ${error.message}` 
              : '결제 검증 중 알 수 없는 오류가 발생했습니다.'
          });
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
      
      {/* 결제 실패 시 메시지 표시 */}
      {paymentStatus.status === 'FAILED' && paymentStatus.message && (
        <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
          {paymentStatus.message}
        </div>
      )}

      {/* 결제 성공 시 대화상자 (모바일에서는 redirectUrl로 이동) */}
      {paymentStatus.status === 'PAID' && (
        <dialog open>
          <header className="p-4 bg-green-50">
            <h1 className="text-xl font-bold text-green-700">결제 성공</h1>
          </header>
          <div className="p-4">
            <p>결제가 성공적으로 완료되었습니다.</p>
          </div>
          <div className="p-4 flex justify-end">
            <button
              onClick={() => setPaymentStatus({ status: 'IDLE' })}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              닫기
            </button>
          </div>
        </dialog>
      )}
    </>
  );
} 