'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCardsByBox, updateCardBox, deleteCard } from '../utils/leitner';
import { FlashCard, BOX_NAMES } from '../utils/types';

export default function BoxManager() {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBox, setSelectedBox] = useState<number>(1);
  const [cardToDelete, setCardToDelete] = useState<FlashCard | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const boxCards = await getCardsByBox(selectedBox);
      setCards(boxCards);
    } catch (error) {
      console.error(`카드 로드 오류 (상자 ${selectedBox}):`, error);
    } finally {
      setLoading(false);
    }
  }, [selectedBox]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleBoxChange = (boxNumber: number) => {
    setSelectedBox(boxNumber);
  };

  const handleMoveCard = async (cardId: number, targetBox: number) => {
    try {
      // 서버에 카드 이동 요청
      await updateCardBox(cardId, targetBox === selectedBox + 1); // true면 승급, false면 하향
      
      // UI 업데이트 - 카드 제거
      setCards(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      console.error('카드 이동 오류:', error);
    }
  };

  const openDeleteModal = (card: FlashCard) => {
    setCardToDelete(card);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;
    
    try {
      await deleteCard(cardToDelete.id);
      setCards(prev => prev.filter(card => card.id !== cardToDelete.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('카드 삭제 오류:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">카드 관리</h2>
      
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((boxNum) => (
            <button
              key={boxNum}
              className={`py-2 px-4 text-sm rounded-md transition-colors ${
                selectedBox === boxNum
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => handleBoxChange(boxNum)}
            >
              {boxNum}. {BOX_NAMES[boxNum as keyof typeof BOX_NAMES]}
            </button>
          ))}
        </div>
        
        <p className="text-sm text-center text-gray-600 mb-2">
          현재 상자 {selectedBox}: {BOX_NAMES[selectedBox as keyof typeof BOX_NAMES]}
          {cards.length > 0 ? ` (${cards.length}장)` : ' (비어 있음)'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : cards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          이 상자에는 카드가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div 
              key={card.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex justify-between mb-2">
                <div className="font-medium">{card.front}</div>
                <div className="text-gray-500">{card.back}</div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">
                  {new Date(card.last_reviewed || Date.now()).toLocaleDateString()}
                </div>
                
                <div className="flex space-x-2">
                  {selectedBox < 5 && (
                    <button
                      onClick={() => handleMoveCard(card.id, selectedBox + 1)}
                      className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100"
                    >
                      상자 {selectedBox + 1}로 승급
                    </button>
                  )}
                  
                  {selectedBox > 1 && (
                    <button
                      onClick={() => handleMoveCard(card.id, selectedBox - 1)}
                      className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded border border-orange-200 hover:bg-orange-100"
                    >
                      상자 {selectedBox - 1}로 하향
                    </button>
                  )}
                  
                  <button
                    onClick={() => openDeleteModal(card)}
                    className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium mb-4">카드 삭제 확인</h3>
            
            <div className="mb-6">
              <p className="mb-2">정말 이 카드를 삭제하시겠습니까?</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div><span className="font-medium">앞면:</span> {cardToDelete?.front}</div>
                <div><span className="font-medium">뒷면:</span> {cardToDelete?.back}</div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 