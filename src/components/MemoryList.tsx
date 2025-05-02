'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

type Memory = {
  id: number;
  created_at: string;
  title: string;
  content: string;
  user_id: string;
};

export default function MemoryList() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemories();
  }, []);

  async function getMemories() {
    try {
      setLoading(true);
      
      // Supabase에서 데이터 가져오기 (memories 테이블이 있다고 가정)
      // 실제 테이블명은 Supabase 설정에 맞게 변경해야 합니다
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setMemories(data);
      }
    } catch (error) {
      console.error('메모리 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  return (
    <div className="space-y-4 w-full max-w-4xl">
      <h2 className="text-xl font-bold">내 기억 목록</h2>
      
      {memories.length === 0 ? (
        <p className="text-gray-500">저장된 기억이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((memory) => (
            <div key={memory.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="font-medium">{memory.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{memory.content}</p>
              <p className="text-xs text-gray-400 mt-4">
                {new Date(memory.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 