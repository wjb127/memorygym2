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

  // 상자 번호에 따른 이모지 반환 함수
  const getBoxEmoji = (boxNumber: number): string => {
    const emojis = ['🔄', '🏋️‍♂️', '💪', '🧠', '🏆', '🎯'];
    return emojis[boxNumber] || '📦';
  };

  return (
    <div 
      className={`relative w-full rounded-xl shadow-lg p-6 ${
        answered 
          ? isCorrect 
            ? 'bg-green-50 border-2 border-green-200' 
            : 'bg-red-50 border-2 border-red-200'
          : 'bg-[var(--neutral-100)] border-2 border-[var(--neutral-300)]'
      } transition-all duration-300`}
    >
      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-[var(--neutral-200)] text-xs flex items-center shadow-sm">
        <span className="mr-1">{getBoxEmoji(card.box_number)}</span>
        <span>상자 {card.box_number}</span>
      </div>
      
      <div className="flex flex-col">
        <div className="mt-6 mb-8 text-2xl font-bold text-center p-4 bg-[var(--neutral-200)] rounded-lg shadow-inner">
          {card.back}
        </div>
        
        <form onSubmit={checkAnswer} className="mt-auto">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <input
                type="text"
                className={`w-full px-4 py-3 border-2 rounded-lg ${
                  showResult
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : 'border-[var(--neutral-300)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]'
                } outline-none transition-colors`}
                placeholder="정답을 입력하세요"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={answered}
                autoFocus
              />
              {!showResult && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-500)]">
                  Enter ⏎
                </div>
              )}
            </div>
            
            {!answered && (
              <button
                type="submit"
                className="w-full py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors shadow-md"
              >
                💪 정답 확인
              </button>
            )}
            
            {showResult && (
              <div className={`p-3 rounded-lg text-center font-medium ${
                isCorrect 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {isCorrect ? (
                  <div className="flex items-center justify-center">
                    <span className="text-xl mr-2">🎯</span>
                    <span>정답입니다!</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center">
                      <span className="text-xl mr-2">❌</span>
                      <span>틀렸습니다.</span>
                    </div>
                    <div className="mt-1">
                      정답은 <span className="font-bold">{card.front}</span> 입니다.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 