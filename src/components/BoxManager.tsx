'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCardsByBox, updateCardBox, deleteCard, updateCard, getAllCards, searchCards } from '../utils/leitner';
import { FlashCard, BOX_NAMES } from '../utils/types';

// 상자 번호에 따른 이모지 반환 함수
const getBoxEmoji = (boxNumber: number): string => {
  const emojis = ['🔄', '🏋️‍♂️', '💪', '🧠', '🏆', '🎯'];
  return emojis[boxNumber] || '📦';
};

export default function BoxManager() {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBox, setSelectedBox] = useState<number | 'all'>(1);
  const [cardToDelete, setCardToDelete] = useState<FlashCard | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<FlashCard | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ front: '', back: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      if (selectedBox === 'all') {
        // 모든 카드 로드
        const allCards = await getAllCards();
        setCards(allCards);
      } else {
        // 특정 상자의 카드만 로드
        const boxCards = await getCardsByBox(selectedBox as number);
        setCards(boxCards);
      }
    } catch (error) {
      console.error(`카드 로드 오류 (${selectedBox === 'all' ? '전체' : `상자 ${selectedBox}`}):`, error);
    } finally {
      setLoading(false);
    }
  }, [selectedBox]);

  useEffect(() => {
    // 검색 모드가 아닐 때만 카드 로드
    if (!isSearching) {
      loadCards();
    }
  }, [loadCards, isSearching]);

  const handleBoxChange = (boxNumber: number | 'all') => {
    setSelectedBox(boxNumber);
    setSearchTerm('');
    setIsSearching(false);
  };

  const handleMoveCard = async (cardId: number, targetBox: number) => {
    try {
      // 서버에 카드 이동 요청
      const currentBox = typeof selectedBox === 'number' ? selectedBox : 0;
      await updateCardBox(cardId, targetBox === currentBox + 1); // true면 승급, false면 하향
      
      // UI 업데이트 - 카드 제거 또는 상자 번호 업데이트
      if (selectedBox === 'all' || isSearching) {
        // 전체 보기 모드 또는 검색 모드에서는 카드의 상자 번호만 업데이트
        setCards(prev => 
          prev.map(card => 
            card.id === cardId 
              ? { ...card, box_number: targetBox } 
              : card
          )
        );
      } else {
        // 특정 상자 보기 모드에서는 카드 제거
        setCards(prev => prev.filter(card => card.id !== cardId));
      }
    } catch (error) {
      console.error('카드 이동 오류:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      // 검색어가 비어있으면 원래 상태로 돌아감
      setIsSearching(false);
      loadCards();
      return;
    }
    
    try {
      setLoading(true);
      setIsSearching(true);
      
      // 검색 실행
      const searchResults = await searchCards(searchTerm);
      setCards(searchResults);
    } catch (error) {
      console.error('검색 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
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

  const openEditModal = (card: FlashCard) => {
    setCardToEdit(card);
    setEditFormData({ front: card.front, back: card.back });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const confirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardToEdit) return;
    
    try {
      // 수정된 데이터로 카드 업데이트
      const updatedCard = {
        ...cardToEdit,
        front: editFormData.front,
        back: editFormData.back
      };
      
      // leitner.ts에서 가져온 updateCard 함수 사용
      await updateCard(updatedCard);
      
      // UI 업데이트
      setCards(prev => 
        prev.map(card => 
          card.id === cardToEdit.id 
            ? { ...card, front: editFormData.front, back: editFormData.back } 
            : card
        )
      );
      
      setShowEditModal(false);
    } catch (error) {
      console.error('카드 수정 오류:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
        📊 카드 관리 대시보드
      </h2>
      
      {/* 검색 기능 */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="정답 또는 문제 검색"
            className="flex-1 px-4 py-3 border border-[var(--neutral-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors shadow-md"
          >
            🔍 검색
          </button>
          {isSearching && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-3 py-2 border border-[var(--neutral-300)] text-[var(--neutral-700)] rounded-lg hover:bg-[var(--neutral-200)] transition-colors"
            >
              ↩️ 초기화
            </button>
          )}
        </form>
      </div>
      
      {/* 상자 선택 버튼 */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center gap-2 mb-4">
          <button
            className={`py-2 px-4 rounded-lg transition-colors ${
              selectedBox === 'all' && !isSearching
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'bg-[var(--neutral-200)] hover:bg-[var(--neutral-300)] text-[var(--foreground)]'
            }`}
            onClick={() => handleBoxChange('all')}
            disabled={isSearching}
          >
            🔄 전체 카드
          </button>
          
          {[1, 2, 3, 4, 5].map((boxNum) => (
            <button
              key={boxNum}
              className={`py-2 px-4 rounded-lg transition-colors ${
                selectedBox === boxNum && !isSearching
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'bg-[var(--neutral-200)] hover:bg-[var(--neutral-300)] text-[var(--foreground)]'
              }`}
              onClick={() => handleBoxChange(boxNum)}
              disabled={isSearching}
            >
              {getBoxEmoji(boxNum)} {boxNum}. {BOX_NAMES[boxNum as keyof typeof BOX_NAMES]}
            </button>
          ))}
        </div>
        
        <p className="text-sm text-center text-[var(--neutral-700)] mb-2">
          {isSearching 
            ? `검색 결과: "${searchTerm}" (${cards.length}장)` 
            : selectedBox === 'all' 
              ? `전체 카드 (${cards.length}장)` 
              : `상자 ${selectedBox}: ${BOX_NAMES[selectedBox as keyof typeof BOX_NAMES]} ${cards.length > 0 ? `(${cards.length}장)` : '(비어 있음)'}`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--primary)] border-r-transparent"></div>
          <p className="mt-2">로딩 중...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-8 text-[var(--neutral-700)]">
          {isSearching 
            ? '검색 결과가 없습니다. 다른 키워드로 검색해보세요.' 
            : selectedBox === 'all' 
              ? '카드가 없습니다. 카드를 추가해보세요!' 
              : '이 상자에는 카드가 없습니다.'}
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div 
              key={card.id}
              className="border border-[var(--neutral-300)] bg-[var(--neutral-100)] rounded-lg p-4 hover:border-[var(--primary)] transition-colors shadow-sm hover:shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
                <div className="font-medium">{card.front}</div>
                <div className="text-[var(--neutral-700)]">{card.back}</div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
                <div className="text-xs text-[var(--neutral-700)] flex items-center">
                  {(selectedBox === 'all' || isSearching) && 
                    <span className="mr-2 px-2 py-1 bg-[var(--neutral-200)] rounded-full text-xs">
                      {getBoxEmoji(card.box_number)} 상자 {card.box_number}
                    </span>
                  }
                  <span>마지막 학습: {new Date(card.last_reviewed || Date.now()).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openEditModal(card)}
                    className="text-xs px-3 py-1.5 bg-[var(--secondary)] bg-opacity-20 text-[var(--foreground)] font-medium rounded-md border border-[var(--secondary)] border-opacity-30 hover:bg-opacity-30"
                  >
                    ✏️ 수정
                  </button>
                  
                  {card.box_number < 5 && (
                    <button
                      onClick={() => handleMoveCard(card.id, card.box_number + 1)}
                      className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200 hover:bg-green-100"
                    >
                      ⬆️ 상자 {card.box_number + 1}로
                    </button>
                  )}
                  
                  {card.box_number > 1 && (
                    <button
                      onClick={() => handleMoveCard(card.id, card.box_number - 1)}
                      className="text-xs px-3 py-1.5 bg-orange-50 text-orange-700 rounded-md border border-orange-200 hover:bg-orange-100"
                    >
                      ⬇️ 상자 {card.box_number - 1}로
                    </button>
                  )}
                  
                  <button
                    onClick={() => openDeleteModal(card)}
                    className="text-xs px-3 py-1.5 bg-[var(--primary)] bg-opacity-20 text-[var(--foreground)] font-medium rounded-md border border-[var(--primary)] border-opacity-30 hover:bg-opacity-30"
                  >
                    🗑️ 삭제
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
          <div className="bg-[var(--neutral-100)] rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-[var(--primary)]">카드 삭제 확인</h3>
            
            <div className="mb-6">
              <p className="mb-2">정말 이 카드를 삭제하시겠습니까?</p>
              <div className="bg-[var(--neutral-200)] p-4 rounded-lg text-sm">
                <div><span className="font-medium">정답:</span> {cardToDelete?.front}</div>
                <div><span className="font-medium">문제:</span> {cardToDelete?.back}</div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-[var(--neutral-300)] rounded-lg bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--neutral-100)] rounded-lg p-6 max-w-sm mx-4 w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-[var(--secondary)]">카드 수정</h3>
            
            <form onSubmit={confirmEdit} className="space-y-4">
              <div>
                <label htmlFor="front" className="block text-sm font-medium mb-1">
                  정답
                </label>
                <input
                  type="text"
                  id="front"
                  name="front"
                  value={editFormData.front}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-[var(--neutral-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="back" className="block text-sm font-medium mb-1">
                  문제
                </label>
                <input
                  type="text"
                  id="back"
                  name="back"
                  value={editFormData.back}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-[var(--neutral-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[var(--neutral-300)] rounded-lg bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--secondary)] text-white rounded-lg hover:bg-[var(--secondary)] hover:brightness-95 transition-colors"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 