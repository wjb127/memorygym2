'use client';

import { useState, FormEvent, KeyboardEvent, useEffect } from 'react';
import { FlashCard as FlashCardType, BOX_COLORS } from '../utils/types';

interface FlashCardProps {
  card: FlashCardType;
  onAnswer: (cardId: number, isCorrect: boolean) => void;
}

export default function FlashCard({ card, onAnswer }: FlashCardProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answered, setAnswered] = useState(false);

  // 컴포넌트가 마운트될 때와 card가 변경될 때마다 상태 초기화
  useEffect(() => {
    // 상태 초기화
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setAnswered(false);
    
    // 포커스 설정 (약간의 딜레이 후)
    const timer = setTimeout(() => {
      const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputEl) inputEl.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [card.id]); // card.id가 변경될 때마다 실행

  const checkAnswer = (e: FormEvent) => {
    e.preventDefault();
    
    if (answered) return;
    
    // 대소문자 구분 없이 정답 확인, 앞뒤 공백 제거
    const correctAnswer = card.front.trim().toLowerCase();
    const submittedAnswer = userAnswer.trim().toLowerCase();
    
    // 정답 판정 (대소문자 구분 없이 내용만 비교)
    const result = correctAnswer === submittedAnswer;
    
    setIsCorrect(result);
    setShowResult(true);
    setAnswered(true);
    
    // 결과 처리 - 딜레이 없이 바로 처리
    onAnswer(card.id, result);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <div 
      className={`relative w-full h-64 rounded-xl shadow-md ${BOX_COLORS[card.box_number as keyof typeof BOX_COLORS]} border-2 p-6 ${answered ? 'opacity-90' : ''}`}
    >
      <div className="absolute top-2 right-2 text-xs text-gray-500">
        상자 #{card.box_number}
      </div>
      
      <div className="flex flex-col h-full">
        <div className="text-2xl font-bold text-center mb-6">{card.back}</div>
        
        <form onSubmit={checkAnswer} className="mt-auto">
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${
                showResult
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="정답을 입력하세요"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={answered}
              autoFocus
            />
            
            {!answered && (
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                정답 확인
              </button>
            )}
            
            {showResult && (
              <div className={`text-center font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '정답입니다!' : `틀렸습니다. 정답은 '${card.front}'입니다.`}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 