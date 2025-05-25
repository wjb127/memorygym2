'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미 로그인된 경우 홈으로 리디렉션
  useEffect(() => {
    if (user && !loading) {
      console.log('✅ [회원가입 페이지] 이미 로그인됨, 홈으로 이동');
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🚀 [회원가입 페이지] 구글 회원가입 시도');
      
      await signInWithGoogle();
      
      // 로그인 성공 시 자동으로 useAuth에서 상태 업데이트됨
      console.log('✅ [회원가입 페이지] 구글 회원가입 성공');
    } catch (error: any) {
      console.error('❌ [회원가입 페이지] 구글 회원가입 오류:', error);
      setError(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--neutral-600)]">로그인 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-[var(--neutral-300)]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent mb-2">
              💪 암기훈련소
            </h1>
            <p className="text-[var(--neutral-600)]">구글 계정으로 간편하게 시작하세요</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-white border border-[var(--neutral-300)] rounded-lg hover:bg-[var(--neutral-50)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mr-3"></div>
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isLoading ? '가입 중...' : 'Google로 시작하기'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--neutral-600)]">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">
                로그인
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-[var(--neutral-600)] hover:text-[var(--primary)] transition-colors text-sm"
            >
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-[var(--neutral-600)]">
          <p>회원가입하면 <Link href="/terms" className="text-[var(--primary)] hover:underline">이용약관</Link> 및 <Link href="/privacy" className="text-[var(--primary)] hover:underline">개인정보 처리방침</Link>에 동의하는 것으로 간주됩니다.</p>
        </div>
      </div>
    </main>
  );
} 