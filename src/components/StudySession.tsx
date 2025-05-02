'use client';

import { useState, useEffect } from 'react';
import { getCardsByBox, updateCardBox } from '../utils/leitner';
import { FlashCard as FlashCardType, BOX_NAMES } from '../utils/types';
import FlashCard from './FlashCard';

// 상자 번호에 따른 이모지 반환 함수
const getBoxEmoji = (boxNumber: number): string => {
  const emojis = ['🔄', '🏋️‍♂️', '💪', '🧠', '🏆', '🎯'];
  return emojis[boxNumber] || '📦';
};

export default function StudySession() {
  const [cards, setCards] = useState<FlashCardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [studyStarted, setStudyStarted] = useState(false);

  // 상자 번호가 변경되거나 학습이 재시작될 때 카드 새로 로드
  useEffect(() => {
    if (studyStarted && selectedBox !== null) {
      loadCardsByBox(selectedBox);
    }
  }, [selectedBox, studyStarted]);

  // 특정 상자의 카드 로드
  const loadCardsByBox = async (boxNumber: number) => {
    try {
      setLoading(true);
      const boxCards = await getCardsByBox(boxNumber);
      setCards(boxCards);
      setCurrentCardIndex(0);
      setCompleted(boxCards.length === 0);
      setStats({ correct: 0, incorrect: 0 });
    } catch (error) {
      console.error(`${boxNumber}번 상자 카드 로드 오류:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (cardId: number, isCorrect: boolean) => {
    try {
      await updateCardBox(cardId, isCorrect);
      
      // 통계 업데이트
      setStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1)
      }));
      
      // 짧은 딜레이 후 다음 카드로 이동
      setTimeout(() => {
        if (currentCardIndex < cards.length - 1) {
          setCurrentCardIndex(prevIndex => prevIndex + 1);
        } else {
          setCompleted(true);
        }
      }, 1500); // 1.5초 딜레이로 결과를 볼 수 있는 시간 제공
    } catch (error) {
      console.error('답변 처리 오류:', error);
    }
  };

  const resetStudy = () => {
    setCards([]);
    setCurrentCardIndex(0);
    setCompleted(false);
    setStats({ correct: 0, incorrect: 0 });
    setSelectedBox(null);
    setStudyStarted(false);
  };

  // 학습 시작 전 상자 선택 화면
  if (!studyStarted) {
    return (
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          🏋️‍♂️ 오늘의 두뇌 트레이닝
        </h2>
        
        <div className="space-y-6">
          <p className="text-center text-[var(--neutral-700)] mb-4">
            어떤 강도로 두뇌를 단련하시겠습니까?
          </p>
          
          <div className="flex flex-col space-y-3">
            {[1, 2, 3, 4, 5].map((boxNum) => (
              <button
                key={boxNum}
                className={`px-4 py-3 border rounded-lg text-left transition-colors ${
                  selectedBox === boxNum
                    ? 'bg-[var(--primary)] bg-opacity-10 border-[var(--primary)] text-[var(--foreground)]'
                    : 'border-[var(--neutral-300)] hover:bg-[var(--neutral-200)]'
                }`}
                onClick={() => setSelectedBox(boxNum)}
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getBoxEmoji(boxNum)}</span>
                  <div>
                    <span className="font-medium">상자 {boxNum}: {BOX_NAMES[boxNum as keyof typeof BOX_NAMES]}</span>
                    <p className="text-xs text-[var(--neutral-700)] mt-1">
                      {boxNum === 1 ? '신규 학습 카드 - 처음 배우는 내용' : 
                       boxNum === 2 ? '자주 복습해야 하는 카드' : 
                       boxNum === 3 ? '익숙해진 카드' : 
                       boxNum === 4 ? '거의 암기된 카드' : 
                       '완전히 암기된 카드'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <button
            className="mt-6 w-full py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            onClick={() => selectedBox && setStudyStarted(true)}
            disabled={selectedBox === null}
          >
            💪 트레이닝 시작
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-r-transparent"></div>
        <p className="mt-4 text-[var(--neutral-700)]">운동 세션 준비 중...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          {getBoxEmoji(selectedBox || 0)} 트레이닝 완료!
        </h2>
        
        {cards.length > 0 ? (
          <div className="mb-8">
            <p className="text-lg mb-4">트레이닝 결과:</p>
            
            <div className="flex justify-center gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex flex-col items-center">
                <span className="text-green-600 text-2xl font-bold">{stats.correct}</span>
                <span className="text-green-600 text-sm">정확히 기억</span>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex flex-col items-center">
                <span className="text-red-600 text-2xl font-bold">{stats.incorrect}</span>
                <span className="text-red-600 text-sm">더 연습 필요</span>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-[var(--neutral-700)] mb-2">정확도</p>
              <div className="h-4 bg-[var(--neutral-200)] rounded-full overflow-hidden w-full max-w-xs mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" 
                  style={{ width: `${Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)}%` }}
                ></div>
              </div>
              <p className="mt-2 font-bold">
                {Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)}%
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 mb-8 bg-[var(--neutral-200)] rounded-lg inline-block">
            <p className="text-lg">
              상자 {selectedBox}에는 카드가 없습니다.
            </p>
            <p className="text-sm mt-2 text-[var(--neutral-700)]">
              '카드추가' 탭에서 새로운 카드를 추가해보세요!
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => {
              if (selectedBox !== null) {
                // 같은 상자 다시 공부
                loadCardsByBox(selectedBox);
              }
            }}
            className="px-4 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors shadow-md"
          >
            🔄 다시 도전하기
          </button>
          <button
            onClick={resetStudy}
            className="px-4 py-3 bg-[var(--neutral-700)] text-white rounded-lg hover:bg-[var(--neutral-900)] transition-colors"
          >
            ↩️ 다른 세트 선택하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-center bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          {getBoxEmoji(selectedBox || 0)} 상자 {selectedBox} 두뇌 트레이닝
        </h2>
        
        <div className="flex justify-between items-center mt-2 mb-4">
          <span className="text-sm text-[var(--neutral-700)]">진행도</span>
          <span className="text-sm font-medium">{currentCardIndex + 1} / {cards.length}</span>
        </div>
        
        <div className="w-full bg-[var(--neutral-200)] h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-full rounded-full transition-all"
            style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {cards.length > 0 && (
        <div className="mb-6">
          <FlashCard
            key={cards[currentCardIndex].id}
            card={cards[currentCardIndex]}
            onAnswer={handleAnswer}
          />
        </div>
      )}
      
      <div className="mt-6 p-4 bg-[var(--neutral-200)] rounded-lg text-sm text-[var(--neutral-700)]">
        <p className="font-medium mb-1">📝 트레이닝 지침</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>보이는 문제를 보고 정답을 입력하세요</li>
          <li>대소문자는 구분하지 않습니다</li>
          <li>철자와 순서가 정확하면 정답으로 인정됩니다</li>
        </ul>
      </div>
      
      <button
        onClick={resetStudy}
        className="mt-6 w-full px-4 py-3 bg-[var(--neutral-700)] text-white rounded-lg hover:bg-[var(--neutral-900)] transition-colors"
      >
        ⏹️ 트레이닝 중단하기
      </button>
    </div>
  );
}