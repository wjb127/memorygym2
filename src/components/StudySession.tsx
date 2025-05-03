'use client';

import { useState, useEffect } from 'react';
import { getCardsByBox, updateCardBox } from '../utils/leitner';
import { FlashCard as FlashCardType, BOX_NAMES } from '../utils/types';
import FlashCard from './FlashCard';
import SubjectSelector from './SubjectSelector';

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
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [studyStarted, setStudyStarted] = useState(false);

  // 상자 번호나 과목이 변경되거나 학습이 재시작될 때 카드 새로 로드
  useEffect(() => {
    if (studyStarted && selectedBox !== null) {
      loadCardsByBox(selectedBox, selectedSubject);
    }
  }, [selectedBox, selectedSubject, studyStarted]);

  // 특정 상자의 카드 로드 (과목별 필터링 지원)
  const loadCardsByBox = async (boxNumber: number, subjectId: number | null) => {
    try {
      setLoading(true);
      const boxCards = await getCardsByBox(boxNumber, subjectId || undefined);
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
      
      // 다음 카드 또는 완료로 이동
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prevIndex => prevIndex + 1);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error('답변 처리 오류:', error);
    }
  };

  const resetStudy = () => {
    setSelectedBox(null);
    setCards([]);
    setCurrentCardIndex(0);
    setCompleted(false);
    setStats({ correct: 0, incorrect: 0 });
    setStudyStarted(false);
  };

  const startTraining = (boxNumber: number) => {
    setSelectedBox(boxNumber);
    setStudyStarted(true);
  };

  // 과목 변경 핸들러
  const handleSubjectChange = (subjectId: number | null) => {
    setSelectedSubject(subjectId);
    
    // 이미 학습이 시작된 경우, 새로운 과목의 카드를 로드
    if (studyStarted && selectedBox !== null) {
      loadCardsByBox(selectedBox, subjectId);
    }
  };

  if (!studyStarted) {
    return (
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          💪 두뇌 훈련하기
        </h2>
        
        <SubjectSelector
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
          label="학습할 과목 선택"
        />
        
        <div className="bg-[var(--neutral-100)] p-6 rounded-lg border border-[var(--neutral-300)] shadow-sm mb-6">
          <h3 className="text-lg font-medium mb-4">상자를 선택하세요</h3>
          
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((boxNum) => (
              <button
                key={boxNum}
                onClick={() => startTraining(boxNum)}
                className="w-full py-3 px-4 flex items-center justify-between rounded-lg border border-[var(--neutral-300)] hover:border-[var(--primary)] hover:bg-[var(--neutral-200)] transition-colors shadow-sm"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getBoxEmoji(boxNum)}</span>
                  <div>
                    <div className="font-medium">상자 {boxNum}</div>
                    <div className="text-sm text-[var(--neutral-700)]">{BOX_NAMES[boxNum as keyof typeof BOX_NAMES]}</div>
                  </div>
                </div>
                <span className="text-[var(--neutral-700)]">→</span>
              </button>
            ))}
          </div>
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
              {selectedSubject 
                ? `선택한 과목의 상자 ${selectedBox}에는 카드가 없습니다.`
                : `상자 ${selectedBox}에는 카드가 없습니다.`}
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
                loadCardsByBox(selectedBox, selectedSubject);
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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={resetStudy}
          className="px-3 py-2 text-sm border border-[var(--neutral-300)] rounded-lg hover:bg-[var(--neutral-200)] transition-colors"
        >
          ← 다시 선택하기
        </button>
        
        <div className="text-center">
          <span className="font-medium">
            {getBoxEmoji(selectedBox || 0)} 상자 {selectedBox}
          </span>
          <div className="text-xs mt-1 text-[var(--neutral-700)]">
            {selectedSubject ? `과목 필터링 적용됨` : `모든 과목`}
          </div>
        </div>
        
        <div className="text-sm text-[var(--neutral-700)]">
          {currentCardIndex + 1} / {cards.length}
        </div>
      </div>
      
      <div className="bg-[var(--neutral-100)] rounded-lg border border-[var(--neutral-300)] p-6 shadow-md">
        {cards[currentCardIndex] && (
          <FlashCard 
            card={cards[currentCardIndex]} 
            onAnswer={handleAnswer}
          />
        )}
      </div>
    </div>
  );
}