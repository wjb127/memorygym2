'use client';

import { useState, useEffect } from 'react';
import { getTodaysCards, getCardsByBox, updateCardBox } from '../utils/leitner';
import { FlashCard as FlashCardType, BOX_NAMES } from '../utils/types';
import FlashCard from './FlashCard';

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

  // 오늘의 학습 카드 로드 (기존 방식)
  const loadTodaysCards = async () => {
    try {
      setLoading(true);
      const todaysCards = await getTodaysCards();
      setCards(todaysCards);
      setCurrentCardIndex(0);
      setCompleted(todaysCards.length === 0);
      setStats({ correct: 0, incorrect: 0 });
      setStudyStarted(true);
    } catch (error) {
      console.error('카드 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 특정 상자의 카드 로드 (새로운 방식)
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
      
      // 약간의 딜레이 후 다음 카드로 이동
      setTimeout(() => {
        if (currentCardIndex < cards.length - 1) {
          setCurrentCardIndex(prevIndex => prevIndex + 1);
        } else {
          setCompleted(true);
        }
      }, 1000);
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
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">학습 모드 선택</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">상자 선택하여 학습</h3>
            <div className="flex flex-col space-y-3">
              {[1, 2, 3, 4, 5].map((boxNum) => (
                <button
                  key={boxNum}
                  className={`px-4 py-3 border rounded-lg text-left transition-colors ${
                    selectedBox === boxNum
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBox(boxNum)}
                >
                  <span className="font-medium">상자 {boxNum}: {BOX_NAMES[boxNum as keyof typeof BOX_NAMES]}</span>
                </button>
              ))}
            </div>
            
            <button
              className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => selectedBox && setStudyStarted(true)}
              disabled={selectedBox === null}
            >
              선택한 상자로 학습 시작
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-3">오늘의 학습</h3>
            <p className="text-sm text-gray-600 mb-4">
              오늘 복습할 모든 카드를 학습합니다. 다양한 상자의 카드가 포함될 수 있습니다.
            </p>
            <button
              className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={loadTodaysCards}
            >
              오늘의 학습 시작
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {selectedBox ? `상자 ${selectedBox} 학습 완료!` : '오늘의 학습 완료!'}
        </h2>
        
        {cards.length > 0 ? (
          <div className="mb-8">
            <p className="text-lg mb-2">학습 결과:</p>
            <div className="flex justify-center space-x-8">
              <div className="text-green-500">맞춘 개수: {stats.correct}</div>
              <div className="text-red-500">틀린 개수: {stats.incorrect}</div>
            </div>
            <p className="mt-4 text-gray-600">
              정확도: {Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)}%
            </p>
          </div>
        ) : (
          <p className="text-lg mb-8">
            {selectedBox ? `상자 ${selectedBox}에는 카드가 없습니다.` : '오늘 학습할 카드가 없습니다.'}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => {
              if (selectedBox !== null) {
                // 같은 상자 다시 공부
                loadCardsByBox(selectedBox);
              } else {
                // 오늘의 학습 다시 로드
                loadTodaysCards();
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            다시 학습하기
          </button>
          <button
            onClick={resetStudy}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            다른 상자 선택하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-center">
          {selectedBox ? `상자 ${selectedBox} 학습` : '오늘의 학습'}
        </h2>
        <p className="text-sm text-gray-600 text-center">
          {currentCardIndex + 1} / {cards.length}
        </p>
        <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all"
            style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {cards.length > 0 && (
        <FlashCard
          card={cards[currentCardIndex]}
          onAnswer={handleAnswer}
        />
      )}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>보이는 뜻을 보고 단어를 입력하세요.</p>
        <p>대소문자는 구분하지 않으며, 철자와 순서만 정확하면 정답으로 인정됩니다.</p>
      </div>
      
      <button
        onClick={resetStudy}
        className="mt-6 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        학습 중단하기
      </button>
    </div>
  );
}