'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// 로딩 컴포넌트
function LoadingUI() {
  return (
    <div className="flex justify-center my-8">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-r-transparent"></div>
    </div>
  );
}

// 실제 결제 완료 컴포넌트
function PaymentCompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'fail' | 'processing'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // URL 파라미터에서 결제 정보 가져오기
    const impUid = searchParams.get('imp_uid');
    const merchantUid = searchParams.get('merchant_uid');
    const success = searchParams.get('success');
    const errorMsg = searchParams.get('error_msg');
    
    // 결제 실패 처리
    if (success === 'false') {
      setPaymentStatus('fail');
      setErrorMessage(errorMsg || '결제 처리 중 오류가 발생했습니다.');
      return;
    }
    
    // 필수 파라미터 확인
    if (!impUid || !merchantUid) {
      setPaymentStatus('fail');
      setErrorMessage('결제 정보가 올바르지 않습니다.');
      return;
    }
    
    // 결제 검증 요청
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imp_uid: impUid,
            merchant_uid: merchantUid,
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          setPaymentStatus('success');
        } else {
          setPaymentStatus('fail');
          setErrorMessage(result.message || '결제 검증에 실패했습니다.');
        }
      } catch (error) {
        console.error('결제 검증 오류:', error);
        setPaymentStatus('fail');
        setErrorMessage('결제 검증 중 오류가 발생했습니다.');
      }
    };
    
    verifyPayment();
  }, [searchParams]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">
        {paymentStatus === 'processing' && '결제 확인 중...'}
        {paymentStatus === 'success' && '결제가 완료되었습니다! 🎉'}
        {paymentStatus === 'fail' && '결제에 실패했습니다 😢'}
      </h1>
      
      {paymentStatus === 'processing' && (
        <div className="flex justify-center my-8">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-r-transparent"></div>
        </div>
      )}
      
      {paymentStatus === 'success' && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <p className="text-[var(--neutral-700)]">
            결제가 성공적으로 완료되었습니다. 프리미엄 기능을 즉시 이용하실 수 있습니다.
          </p>
        </div>
      )}
      
      {paymentStatus === 'fail' && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">✕</span>
          </div>
          <p className="text-red-600 mb-2">결제에 실패했습니다.</p>
          <p className="text-[var(--neutral-700)]">{errorMessage}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/"
          className="px-4 py-3 bg-[var(--neutral-700)] text-white rounded-lg hover:bg-[var(--neutral-900)] transition-colors text-center"
        >
          홈으로 돌아가기
        </Link>
        
        {paymentStatus === 'fail' && (
          <Link
            href="/premium"
            className="px-4 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors text-center"
          >
            다시 시도하기
          </Link>
        )}
        
        {paymentStatus === 'success' && (
          <button
            onClick={() => router.push('/')}
            className="px-4 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
          >
            학습 시작하기
          </button>
        )}
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function PaymentCompletePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
      <div className="bg-[var(--neutral-100)] rounded-xl shadow-lg p-8 max-w-md w-full border border-[var(--neutral-300)]">
        <Suspense fallback={<LoadingUI />}>
          <PaymentCompleteContent />
        </Suspense>
      </div>
    </main>
  );
} 