'use client';

import { useState } from 'react';
import { addCard } from '../utils/leitner';

interface AddCardFormProps {
  onCardAdded?: () => void;
}

export default function AddCardForm({ onCardAdded }: AddCardFormProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);

  const resetForm = () => {
    setFront('');
    setBack('');
    setBulkText('');
    setSubmitStatus(null);
    setSubmitMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBulkMode) {
      await handleBulkSubmit();
      return;
    }

    if (!front.trim() || !back.trim()) {
      setSubmitStatus('error');
      setSubmitMessage('앞면과 뒷면을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      await addCard(front, back);
      
      setSubmitStatus('success');
      setSubmitMessage('카드가 성공적으로 추가되었습니다!');
      setFront('');
      setBack('');
      
      if (onCardAdded) {
        onCardAdded();
      }
    } catch (error) {
      console.error('카드 추가 오류:', error);
      setSubmitStatus('error');
      setSubmitMessage('카드 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    const lines = bulkText.trim().split('\n');
    const cards = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        errors.push(`${i + 1}번째 줄: 올바른 형식이 아닙니다. (정답, 문제)`);
        continue;
      }

      cards.push({ front: parts[0], back: parts[1] });
    }

    if (errors.length > 0) {
      setSubmitStatus('error');
      setSubmitMessage(`오류가 있습니다:\n${errors.join('\n')}`);
      return;
    }

    if (cards.length === 0) {
      setSubmitStatus('error');
      setSubmitMessage('추가할 카드가 없습니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      for (const card of cards) {
        await addCard(card.front, card.back);
      }
      
      setSubmitStatus('success');
      setSubmitMessage(`${cards.length}개의 카드가 성공적으로 추가되었습니다!`);
      setBulkText('');
      
      if (onCardAdded) {
        onCardAdded();
      }
    } catch (error) {
      console.error('대량 카드 추가 오류:', error);
      setSubmitStatus('error');
      setSubmitMessage('카드 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">암기 카드 추가</h2>
      
      <div className="mb-4 flex justify-center">
        <div className="flex rounded-md overflow-hidden border">
          <button
            type="button"
            onClick={() => setIsBulkMode(false)}
            className={`px-4 py-2 text-sm font-medium ${!isBulkMode 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            단일 카드 추가
          </button>
          <button
            type="button"
            onClick={() => setIsBulkMode(true)}
            className={`px-4 py-2 text-sm font-medium ${isBulkMode 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            대량 카드 추가
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isBulkMode ? (
          <>
            <div>
              <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-1">
                정답 (예: 단어)
              </label>
              <input
                type="text"
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="정답이 되는 단어나 내용을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-1">
                문제 (예: 설명)
              </label>
              <input
                type="text"
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="문제가 되는 설명이나 힌트를 입력하세요"
              />
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="bulkText" className="block text-sm font-medium text-gray-700 mb-1">
              대량 카드 (정답, 문제 형식)
            </label>
            <textarea
              id="bulkText"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="각 줄마다 한 개의 카드를 추가합니다. 형식: 정답, 문제
예시:
apple, 사과는 영어로?
book, 책은 영어로?
computer, 컴퓨터는 영어로?"
            />
            <p className="mt-1 text-sm text-gray-500">
              각 줄에 하나의 카드를 정답과 문제를 쉼표로 구분하여 입력하세요.
            </p>
          </div>
        )}

        {submitStatus && (
          <div 
            className={`p-3 rounded-md ${
              submitStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {submitMessage.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            초기화
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '처리 중...' : isBulkMode ? '여러 카드 추가' : '카드 추가'}
          </button>
        </div>
      </form>
    </div>
  );
} 