'use client';

import { useState } from 'react';
import { createClientBrowser } from '@/utils/supabase';
import Image from 'next/image';

export default function SocialLogin() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleSocialLogin = async (provider: 'google') => {
    try {
      setLoading(provider);
      setError(null);
      
      const supabase = createClientBrowser();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      
      // OAuth 리다이렉트는 자동으로 처리됩니다
      // data.url이 있으면 해당 URL로 리다이렉트
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('소셜 로그인 오류:', err);
      setError(err.message || '로그인 중 오류가 발생했습니다.');
      setLoading(null);
    }
  };
  
  return (
    <div className="mt-4 space-y-3">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-3">
          {error}
        </div>
      )}
      
      <button
        type="button"
        onClick={() => handleSocialLogin('google')}
        disabled={loading === 'google'}
        className="w-full flex items-center justify-center gap-3 bg-white border border-[var(--neutral-300)] p-2 rounded-md hover:bg-gray-50 transition-all disabled:opacity-50"
      >
        <div className="w-5 h-5 relative">
          <Image
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
        </div>
        <span>{loading === 'google' ? '처리 중...' : 'Google로 계속하기'}</span>
      </button>
    </div>
  );
} 