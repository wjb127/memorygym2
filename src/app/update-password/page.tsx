'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase-browser';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // 페이지 로드 시 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setMessage({ 
          type: 'error', 
          text: '인증 세션이 유효하지 않습니다. 비밀번호 재설정 링크를 다시 요청해주세요.' 
        });
      } else {
        setIsAuthenticated(true);
      }
    };
    
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' });
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
      setMessage({ 
        type: 'success', 
        text: '비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.' 
      });
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('비밀번호 업데이트 오류:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || '비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.' 
      });
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
          <h1 className="text-2xl font-bold">비밀번호 변경</h1>
          <p className="mt-2 text-[var(--neutral-700)]">새로운 비밀번호를 입력해주세요.</p>
        </div>
        
        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-600 border border-green-200' 
              : 'bg-red-50 text-red-500 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
        
        {isAuthenticated && (
          <form onSubmit={handleUpdatePassword} className="mt-8 space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--neutral-700)]">
                새 비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[var(--neutral-300)] p-2"
                placeholder="8자 이상의 새 비밀번호"
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
                placeholder="비밀번호 다시 입력"
                minLength={8}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] text-white p-2 rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? '처리 중...' : '비밀번호 변경하기'}
              </button>
            </div>
          </form>
        )}
        
        {!isAuthenticated && !message && (
          <div className="mt-6 text-center">
            <p className="text-[var(--neutral-700)]">인증 세션 확인 중...</p>
          </div>
        )}
        
        <div className="mt-4 text-center text-sm">
          <p>
            <Link href="/login" className="text-[var(--primary)] hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 