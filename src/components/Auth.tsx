'use client';

import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      
      if (error) throw error;
      alert('로그인 링크가 이메일로 전송되었습니다!');
    } catch (error) {
      console.error('에러:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 w-full max-w-md">
      <h1 className="text-2xl font-bold">MemoryGym 로그인</h1>
      <p className="text-sm text-gray-600">이메일로 매직 링크를 받아 로그인하세요</p>
      
      <form onSubmit={handleLogin} className="space-y-4 w-full">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? '전송 중...' : '로그인 링크 받기'}
          </button>
        </div>
      </form>
    </div>
  );
} 