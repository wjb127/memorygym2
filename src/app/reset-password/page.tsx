'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase-browser';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: '유효한 이메일 주소를 입력해주세요.' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      const supabase = createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });
      
      if (error) throw error;
      
      setMessage({ 
        type: 'success', 
        text: '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.' 
      });
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md border border-[var(--neutral-300)]">
        <div className="text-center">
          <Link href="/login" className="inline-block mb-4 text-[var(--neutral-700)] hover:text-[var(--primary)]">
            ← 로그인으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
          <p className="mt-2 text-[var(--neutral-700)]">이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
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
        
        <form onSubmit={handleResetPassword} className="mt-8 space-y-6" role="form">
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
              placeholder="가입 시 사용한 이메일 주소"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white p-2 rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? '처리 중...' : '비밀번호 재설정 링크 받기'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p>
            비밀번호가 기억나셨나요?{' '}
            <Link href="/login" className="text-[var(--primary)] hover:underline">
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 