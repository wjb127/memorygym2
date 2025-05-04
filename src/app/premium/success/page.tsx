'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  useEffect(() => {
    // 결제 완료 후 분석이나 상태 업데이트를 수행할 수 있음
    console.log('결제 완료 페이지 로드됨');
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">결제가 완료되었습니다!</h1>
        <p className="text-gray-600 mb-8">
          암기훈련소 프리미엄 서비스 이용이 가능합니다. 
          더 많은 기능과 향상된 학습 경험을 즐겨보세요.
        </p>
        
        <div className="space-y-4">
          <Link href="/" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300">
            홈으로 돌아가기
          </Link>
          <Link href="/study" className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition duration-300">
            학습 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
} 