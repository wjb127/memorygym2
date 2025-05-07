'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase-browser';
import SocialLogin from '../../components/SocialLogin';

// 검색 파라미터를 사용하는 컴포넌트
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom');
  const errorParam = searchParams.get('error');
  const authSuccess = searchParams.get('auth_success');
  
  // URL 파라미터로 전달된 오류 처리
  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case 'auth_callback_error':
          setError('인증 과정에서 오류가 발생했습니다. 다시 시도해주세요.');
          break;
        case 'exchange_error':
          setError('소셜 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
          break;
        case 'session_error':
          setError('세션 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
          break;
        case 'no_session':
          setError('로그인 세션을 생성할 수 없습니다. 다른 방법으로 로그인해보세요.');
          break;
        case 'no_code':
          setError('인증 코드가 없습니다. 다시 로그인해주세요.');
          break;
        default:
          setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  }, [errorParam]);
  
  // 에러 메시지 초기화
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // 인증 성공 파라미터가 있으면 리다이렉트
  useEffect(() => {
    if (authSuccess === 'true') {
      console.log('인증 성공 파라미터 감지, 세션 확인 시도');
      checkAndRedirect();
    }
  }, [authSuccess]);
  
  // 이미 로그인된 상태인지 확인
  useEffect(() => {
    checkAndRedirect();
  }, []);
  
  const checkAndRedirect = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('이미 로그인된 상태, 리다이렉트');
        console.log('세션 사용자:', session.user.email);
        
        if (redirectedFrom) {
          router.push(redirectedFrom);
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      console.error('세션 확인 오류:', err);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      
      // 로그인 전 쿠키 확인
      console.log('로그인 전 쿠키:', document.cookie);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('로그인 성공, 리다이렉트 대상:', redirectedFrom || '/');
      console.log('사용자 정보:', data.user ? `ID: ${data.user.id}, 이메일: ${data.user.email}` : '사용자 정보 없음');
      
      // 세션 설정 확인
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('세션 설정 확인:', sessionData.session ? '세션 있음' : '세션 없음');
      
      // 로그인 후 쿠키 확인
      console.log('로그인 후 쿠키:', document.cookie);
      
      // 세션이 설정되도록 약간의 지연 추가
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 로그인 성공 시 리다이렉트
      if (redirectedFrom) {
        router.push(redirectedFrom);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      console.error('로그인 오류:', err);
      
      // 특정 오류 메시지 처리
      if (err.message?.includes('Invalid login')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('이메일 확인이 필요합니다. 이메일을 확인해주세요.');
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    } finally {
      setLoading(false);
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
          
          <SocialLogin redirectedFrom={redirectedFrom} />
          
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