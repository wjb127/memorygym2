'use client';

import { useState, useEffect, Suspense, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';

// 검색 파라미터를 사용하는 컴포넌트
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeoutMessage, setTimeoutMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '/';
  const callbackUrl = searchParams.get('callbackUrl') || redirectedFrom;
  const errorParam = searchParams.get('error');
  const timeoutParam = searchParams.get('timeout');
  const { status } = useSession();
  
  // URL 파라미터로 전달된 오류 처리
  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case 'CredentialsSignin':
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
          break;
        case 'OAuthAccountNotLinked':
          setError('이미 다른 방법으로 가입한 이메일입니다. 다른 로그인 방법을 사용해주세요.');
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
          setError('소셜 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
          break;
        default:
          setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
    
    // 세션 타임아웃 체크
    if (timeoutParam === 'true') {
      setTimeoutMessage('장시간 활동이 없어 보안을 위해 자동 로그아웃되었습니다. 다시 로그인해 주세요.');
    }
  }, [errorParam, timeoutParam]);
  
  // 에러 메시지 초기화
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // 타임아웃 메시지 초기화
  useEffect(() => {
    if (timeoutMessage) {
      const timer = setTimeout(() => setTimeoutMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [timeoutMessage]);
  
  // 이미 로그인된 상태인지 확인
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl || '/');
    }
  }, [status, router, callbackUrl]);
  
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Next Auth 로그인 시도 (Supabase 로그인은 서버 측에서 처리됨)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl || '/',
      });
      
      if (result?.error) {
        setError(result.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }
      
      // 로그인 성공 후 리디렉션
      router.refresh();
      router.push(callbackUrl || '/');
    } catch (err: any) {
      console.error('로그인 오류:', err);
      setError(err.message || '로그인 중 오류가 발생했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signIn('google', { 
        redirectTo: callbackUrl
      });
    } catch (error) {
      console.error('구글 로그인 오류:', error);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md border border-[var(--neutral-300)]">
        <div className="text-center">
          <Link href="/" className="inline-block mb-4 text-[var(--neutral-700)] hover:text-[var(--primary)]">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="mt-2 text-[var(--neutral-700)]">암기훈련소에 다시 오신 것을 환영합니다!</p>
        </div>
        
        {timeoutMessage && (
          <div className="bg-amber-50 text-amber-700 p-3 rounded-md text-sm border border-amber-200">
            <div className="flex items-start">
              <span className="mr-2 text-lg">⏰</span>
              <span>{timeoutMessage}</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--neutral-700)]">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              className="mt-1 block w-full rounded-md border border-[var(--neutral-300)] p-2"
              placeholder="이메일 주소"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--neutral-700)]">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={handlePasswordChange}
              className="mt-1 block w-full rounded-md border border-[var(--neutral-300)] p-2"
              placeholder="비밀번호"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[var(--primary)] border-[var(--neutral-300)]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--neutral-700)]">
                로그인 상태 유지
              </label>
            </div>
            
            <div className="text-sm">
              <Link href="/reset-password" className="text-[var(--primary)] hover:underline">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white p-2 rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
        
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--neutral-300)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[var(--neutral-700)]">또는</span>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[var(--neutral-300)] p-2 rounded-md hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width={20}
                height={20}
              />
              <span>{loading ? '처리 중...' : 'Google로 계속하기'}</span>
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm">
            <p>
              계정이 없으신가요?{' '}
              <Link href="/signup" className="text-[var(--primary)] hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 메인 로그인 페이지 컴포넌트
export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md border border-[var(--neutral-300)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold">로그인</h1>
            <p className="mt-2 text-[var(--neutral-700)]">로딩 중...</p>
          </div>
          <div className="flex justify-center my-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-r-transparent"></div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 