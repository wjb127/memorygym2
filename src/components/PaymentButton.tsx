'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

// 향후 npm 설치 필요: npm install @portone/browser-sdk
// 현재는 CDN으로 로드하는 방식 사용
// import PortOne from "@portone/browser-sdk/v2";

interface PaymentButtonProps {
  productName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
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

export default function PaymentButton({ 
  productName, 
  amount, 
  customerName = '고객',
  customerEmail = 'customer@example.com',
  customerMobile = '01012345678'
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkLoaded, setSdkLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'IDLE'
  });
  const router = useRouter();
  
  // 모바일 환경 감지
  const [isMobile, setIsMobile] = useState(false);
  
  // 포트원 V2 SDK 로드 및 환경 감지
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent);
    };
    
    setIsMobile(checkMobile());
    
    // 솔페이 감지
    const isShinhanApp = /ShinhanPayment|ShinhanSolPay/i.test(navigator.userAgent);
    if (isShinhanApp) {
      console.log('신한 솔페이 인앱 브라우저 감지됨');
    }
    
    // PortOne이 이미 로드되었는지 확인
    if (window.PortOne) {
      console.log('포트원 SDK가 이미 로드되어 있음');
      setSdkLoaded(true);
      return;
    }
    
    // 포트원 SDK 로드
    console.log('포트원 SDK 로딩 시작...');
    const script = document.createElement('script');
    script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
    script.async = true;
    script.onload = () => {
      console.log('포트원 SDK 로드 완료');
      console.log('window.PortOne 존재 여부:', !!window.PortOne);
      setSdkLoaded(true);
    };
    script.onerror = (error) => {
      console.error('포트원 SDK 로드 실패:', error);
    };
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // SDK 로드 상태 모니터링
  useEffect(() => {
    console.log('SDK 로드 상태 변경:', isSdkLoaded);
    if (isSdkLoaded) {
      // SDK 로드 후 초기 상태 확인
      console.log('SDK 초기화 확인:', {
        'window.PortOne 존재': !!window.PortOne,
        '스토어 ID': process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
        '채널 키': process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ? '설정됨' : '미설정'
      });
    }
  }, [isSdkLoaded]);

  // 고유한 ID 생성 함수
  const generatePaymentId = () => {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, "0"))
      .join("");
  };

  // 결제 처리 함수
  const handlePayment = useCallback(async () => {
    console.log('결제 처리 시작');
    console.log('SDK 로드 상태:', isSdkLoaded);
    console.log('window.PortOne 존재 여부:', !!window.PortOne);
    console.log('고객 정보:', { 이름: customerName, 이메일: customerEmail, 휴대폰: customerMobile });
    
    if (!window.PortOne) {
      console.error('window.PortOne이 존재하지 않습니다. SDK가 제대로 로드되지 않았습니다.');
      alert('결제 모듈이 아직 로드되지 않았습니다. 페이지를 새로고침 한 후 다시 시도해주세요.');
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
      console.log('채널 키:', channelKey ? '설정됨' : '미설정');
      
      if (!storeId || !channelKey) {
        throw new Error('포트원 설정 정보가 없습니다. 환경변수를 확인해주세요.');
      }
      
      // 명시적 콜백 URL 설정 (모바일 환경에서 중요)
      const completeUrl = `${window.location.origin}/payments/complete`;
      const successUrl = `${window.location.origin}/premium/success`;
      
      // 모바일 환경 정보를 결제 요청에 추가
      console.log(`환경에 따른 리디렉션 URL: ${isMobile ? completeUrl : successUrl}`);
      
      // 결제 요청 데이터 준비
      const paymentData: any = {
        storeId: storeId,
        channelKey: channelKey,
        paymentId: paymentId,
        orderName: productName,
        totalAmount: amount,
        currency: 'KRW',
        payMethod: 'CARD', // 카드 결제
        customer: {
          name: customerName || '구매자',
          email: customerEmail,
          phoneNumber: customerMobile || '01012345678'
        },
        redirectUrl: isMobile ? completeUrl : successUrl,
        taxFreeAmount: 0, // 면세 금액
        variantKey: 'DEFAULT', // 기본 결제창 스타일
        
        // 신한 솔페이 지원을 위한 추가 설정
        appScheme: isMobile ? 'memorygym://' : undefined,
        display: {
          card: {
            installment: {
              discount: {
                maximumInstallmentPlan: 12
              }
            }
          }
        },
        
        bypass: {
          // 신한카드 솔페이를 위한 설정
          shinhan_card: {
            use_direct_signal: 'Y', // 3DS 다이렉트 시그널 사용
            popup_mode: isMobile ? 'M' : 'N' // 모바일 환경에서는 M(모바일) 모드 사용
          }
        }
      };
      
      // 모바일 환경에서 추가 설정
      if (isMobile) {
        paymentData.redirectUrl = completeUrl;
        paymentData.m_redirect_url = completeUrl; // 구 v1 호환성
        paymentData.display = { card: { cardShowDesc: false } }; // 카드 선택 화면 간소화
      }
      
      // 결제 요청 데이터 로깅
      console.log('결제 요청 데이터:', paymentData);
      console.log('구매자 정보:', paymentData.customer);
      
      try {
        // KG이니시스 결제 요청
        console.log('PortOne.requestPayment 호출 직전');
        const payment = await PortOne.requestPayment(paymentData);
        console.log('PortOne.requestPayment 호출 완료');
        
        // 모바일 환경에서는 requestPayment 이후 리디렉션 처리
        if (isMobile) {
          console.log('모바일 환경에서 리디렉션 처리 대기 중...');
          // 모바일에서는 리디렉션되므로 여기 이후 코드는 실행되지 않음
          return;
        }
        
        console.log('결제 응답:', payment);
        console.log('결제 응답 구조 확인:', {
          전체: typeof payment,
          paymentId: payment.paymentId,
          orderId: payment.orderId || (payment.order && payment.order.id) || payment.orderName,
          amount: payment.amount || payment.totalAmount,
          status: payment.status
        });
        
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
              orderId: payment.orderId || payment.paymentId,
              amount: payment.amount || payment.totalAmount
            });
            
            // 필수 필드 확인 및 기본값 설정
            const requestPaymentId = payment.paymentId;
            const requestOrderId = payment.orderId || payment.paymentId; // orderId가 없으면 paymentId 사용
            const requestAmount = payment.amount?.total || payment.amount?.paid || payment.amount || payment.totalAmount; // 여러 필드 체크
            
            // 필수 필드 누락 확인
            if (!requestPaymentId) {
              console.error('paymentId가 없습니다:', payment);
              setPaymentStatus({
                status: 'FAILED',
                message: '결제 검증에 필요한 정보가 누락되었습니다: paymentId'
              });
              return;
            }
            
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: requestPaymentId,
                orderId: requestOrderId,
                amount: requestAmount || amount // 없으면 props에서 받은 값 사용
              }),
            });
    
            if (!verifyResponse.ok) {
              const errorText = await verifyResponse.text();
              
              // 각 항목 개별적으로 로깅
              console.error('결제 검증 API 오류');
              console.error('- 상태 코드:', verifyResponse.status);
              console.error('- 상태 메시지:', verifyResponse.statusText);
              console.error('- 응답 내용:', errorText || '응답 내용 없음');
              
              let errorMessage = `결제 검증 실패: ${verifyResponse.status}`;
              try {
                // 응답이 JSON 형식인지 확인
                const errorJson = JSON.parse(errorText);
                if (errorJson && errorJson.message) {
                  errorMessage += ` - ${errorJson.message}`;
                } else {
                  errorMessage += errorText ? ` - ${errorText}` : '';
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
            // 각 항목 개별적으로 로깅
            console.error('결제 검증 중 오류 발생');
            
            if (error instanceof Error) {
              console.error('- 오류 이름:', error.name);
              console.error('- 오류 메시지:', error.message);
              console.error('- 스택 트레이스:', error.stack);
            } else {
              console.error('- 오류 내용:', String(error));
            }
            
            setPaymentStatus({
              status: 'FAILED',
              message: error instanceof Error 
                ? `결제 검증 중 오류: ${error.message}` 
                : '결제 검증 중 알 수 없는 오류가 발생했습니다.'
            });
          }
        }
      } catch (paymentError) {
        console.error('PortOne.requestPayment 호출 중 오류 발생:', paymentError);
        setPaymentStatus({
          status: 'FAILED',
          message: paymentError instanceof Error 
            ? `결제창 호출 중 오류: ${paymentError.message}` 
            : '결제창 호출 중 알 수 없는 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      // 각 항목 개별적으로 로깅
      console.error('결제 모듈 실행 오류');
      
      if (error instanceof Error) {
        console.error('- 오류 이름:', error.name);
        console.error('- 오류 메시지:', error.message);
        console.error('- 스택 트레이스:', error.stack);
      } else {
        console.error('- 오류 내용:', String(error));
      }
      
      setPaymentStatus({
        status: 'FAILED',
        message: error instanceof Error 
          ? `결제 요청 중 오류: ${error.message}` 
          : '결제 중 알 수 없는 오류가 발생했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [productName, amount, customerName, customerEmail, customerMobile, isMobile, router]);

  const getButtonText = () => {
    switch (paymentStatus.status) {
      case 'PENDING':
        return '결제 처리 중...';
      case 'PAID':
        return '결제 완료';
      case 'FAILED':
        return '다시 시도하기';
      default:
        return `${amount.toLocaleString()}원 결제하기`;
    }
  };

  return (
    <div className="mt-10">
      {paymentStatus.status === 'FAILED' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{paymentStatus.message}</p>
        </div>
      )}
      
      <button
        onClick={handlePayment}
        disabled={isLoading || paymentStatus.status === 'PAID'}
        className={`w-full py-3 rounded-lg transition-colors text-white ${
          isLoading || paymentStatus.status === 'PAID'
            ? 'bg-[var(--primary-disabled)] cursor-not-allowed'
            : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            로딩 중...
          </span>
        ) : (
          getButtonText()
        )}
      </button>
      
      {isMobile && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          모바일 환경에서는 결제 후 자동으로 결과 페이지로 이동합니다.
        </p>
      )}
      
      {!isSdkLoaded && (
        <p className="mt-2 text-xs text-red-500 text-center">
          결제 모듈 로딩 중... 이 메시지가 계속 표시되면 페이지를 새로고침해 주세요.
        </p>
      )}
    </div>
  );
} 