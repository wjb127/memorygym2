'use client';

import { useState } from 'react';
import { addCard } from '../utils/leitner';

interface AddCardFormProps {
  onCardAdded: () => void;
}

export default function AddCardForm({ onCardAdded }: AddCardFormProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!front || !back) {
      alert('단어와 뜻을 모두 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      const newCard = await addCard(front, back);
      
      if (newCard) {
        setFront('');
        setBack('');
        onCardAdded();
        alert('새 카드가 추가되었습니다!');
      }
    } catch (error) {
      console.error('카드 추가 오류:', error);
      alert('카드 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">새 카드 추가하기</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="front" className="block text-sm font-medium text-gray-700">
            단어 (사용자가 입력할 정답)
          </label>
          <input
            id="front"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="예: Hello"
            required
          />
          <p className="mt-1 text-xs text-gray-500">정답 확인 시 대소문자는 구분하지 않으며, 앞뒤 공백은 무시됩니다.</p>
        </div>
        
        <div>
          <label htmlFor="back" className="block text-sm font-medium text-gray-700">
            뜻 (화면에 표시되는 내용)
          </label>
          <input
            id="back"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="예: 안녕하세요"
            required
          />
          <p className="mt-1 text-xs text-gray-500">학습 시 화면에 보여질 단어의 뜻입니다.</p>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? '추가 중...' : '카드 추가하기'}
          </button>
        </div>
      </form>
    </div>
  );
} 