'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';

// 디버그 로그 함수
function logDebug(message: string, data?: any) {
  console.log(`[비밀번호 변경 페이지] ${message}`, data ? JSON.stringify(data) : '');
}

export default function UpdatePasswordPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Supabase Auth에서는 구글 로그인만 사용하므로 비밀번호 변경 불가
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            비밀번호 변경
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정 보안을 위해 비밀번호를 변경하세요
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Google 계정 사용 중
            </h3>
            
            <p className="text-gray-600 mb-6">
              현재 Google 계정으로 로그인하여 사용 중입니다. 
              비밀번호 변경은 Google 계정 설정에서 가능합니다.
            </p>
            
            <div className="space-y-3">
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 inline-block text-center"
              >
                Google 계정 보안 설정
              </a>
              
              <button
                onClick={() => signOut()}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                로그아웃
              </button>
              
              <Link
                href="/"
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center block"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 