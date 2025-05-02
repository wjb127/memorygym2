'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCardsByBox, deleteCard } from '../utils/leitner';
import { FlashCard as FlashCardType, BOX_NAMES, BOX_COLORS } from '../utils/types';

export default function BoxManager() {
  const [selectedBox, setSelectedBox] = useState(1);
  const [cards, setCards] = useState<FlashCardType[]>([]);
  const [loading, setLoading] = useState(true);

  // useCallback을 사용하여 loadCards 함수를 메모이제이션
  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const boxCards = await getCardsByBox(selectedBox);
      setCards(boxCards);
    } catch (error) {
      console.error('카드 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBox]); // selectedBox가 변경될 때만 함수가 다시 생성됨

  useEffect(() => {
    loadCards();
  }, [loadCards]); // 이제 loadCards 함수를 종속성으로 추가

  const handleDeleteCard = async (cardId: number) => {
    if (confirm('정말로 이 카드를 삭제하시겠습니까?')) {
      try {
        const success = await deleteCard(cardId);
        if (success) {
          setCards(cards.filter(card => card.id !== cardId));
          alert('카드가 삭제되었습니다.');
        }
      } catch (error) {
        console.error('카드 삭제 오류:', error);
        alert('카드 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">카드 상자 관리</h2>
      
      <div className="mb-6">
        <label htmlFor="boxSelect" className="block text-sm font-medium text-gray-700 mb-2">
          상자 선택
        </label>
        <select
          id="boxSelect"
          value={selectedBox}
          onChange={(e) => setSelectedBox(Number(e.target.value))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {[1, 2, 3, 4, 5].map((boxNum) => (
            <option key={boxNum} value={boxNum}>
              상자 {boxNum}: {BOX_NAMES[boxNum as keyof typeof BOX_NAMES]}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="text-center py-4">로딩 중...</div>
      ) : (
        <div>
          <h3 className="font-medium mb-3">
            총 {cards.length}개의 카드
          </h3>
          
          {cards.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              이 상자에는 카드가 없습니다.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cards.map((card) => (
                <div 
                  key={card.id} 
                  className={`border-l-4 ${BOX_COLORS[card.box_number as keyof typeof BOX_COLORS]} rounded-lg p-4 flex justify-between items-center bg-white shadow-sm`}
                >
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{card.front}</span>
                      <span className="text-gray-400 text-sm">→</span>
                      <span className="text-gray-600">{card.back}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      마지막 학습: {new Date(card.last_reviewed).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      다음 학습: {new Date(card.next_review).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="ml-4 text-red-500 hover:text-red-700 p-1"
                    aria-label="카드 삭제"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 