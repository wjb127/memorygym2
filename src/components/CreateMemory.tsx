'use client';

import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function CreateMemory() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      alert('제목과 내용을 모두 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      
      // 현재 로그인한 사용자 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('로그인이 필요합니다');
      }

      // Supabase에 데이터 삽입하기
      const { error } = await supabase
        .from('memories')
        .insert({
          title,
          content,
          user_id: user.id,
        });

      if (error) throw error;
      
      alert('메모리가 성공적으로 저장되었습니다!');
      // 폼 초기화
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('메모리 저장 오류:', error);
      alert('메모리 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">새 기억 추가하기</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            제목
          </label>
          <input
            id="title"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium">
            내용
          </label>
          <textarea
            id="content"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
} 