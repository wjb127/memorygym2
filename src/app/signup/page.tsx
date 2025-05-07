'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientBrowser } from '@/utils/supabase';
import SocialLogin from '../../components/SocialLogin';

// 회원가입 폼 컴포넌트
function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  
  // 에러 메시지 초기화
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 검증
    if (!email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    
    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 비밀번호 길이 검증
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClientBrowser();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      // 회원가입 성공
      setSuccess('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('회원가입 오류:', err);
      
      // 이미 가입된 이메일인 경우
      if (err.message?.includes('already registered')) {
        setError('이미 가입된 이메일 주소입니다. 로그인을 시도해보세요.');
      } else {
        setError(err.message || '회원가입 중 오류가 발생했습니다.');
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
          <h1 className="text-2xl font-bold">회원가입</h1>
          <p className="mt-2 text-[var(--neutral-700)]">암기훈련소에 오신 것을 환영합니다!</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
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
              placeholder="비밀번호 (8자 이상)"
              minLength={8}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--neutral-700)]">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-[var(--neutral-300)] p-2"
              placeholder="비밀번호 확인"
              minLength={8}
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white p-2 rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? '처리 중...' : '회원가입'}
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
          
          <SocialLogin />
          
          <div className="mt-6 text-center text-sm">
            <p>
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-[var(--primary)] hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 메인 회원가입 페이지 컴포넌트
export default function SignUp() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md border border-[var(--neutral-300)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold">회원가입</h1>
            <p className="mt-2 text-[var(--neutral-700)]">로딩 중...</p>
          </div>
          <div className="flex justify-center my-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-r-transparent"></div>
          </div>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
} 