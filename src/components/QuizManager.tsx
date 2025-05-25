'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCardsByBox, updateCardBox, deleteCard, updateCard, getAllCards, searchCards } from '../utils/leitner';
import { FlashQuiz, BOX_NAMES } from '../utils/types';
import SubjectSelector from './SubjectSelector';
import { useCards } from '@/context/CardContext';
import { useAuth } from '@/context/AuthProvider';

// 상자 번호에 따른 이모지 반환 함수
const getBoxEmoji = (boxNumber: number): string => {
  const emojis = ['🔄', '🏋️‍♂️', '💪', '🧠', '🏆', '🎯'];
  return emojis[boxNumber] || '📦';
};

export default function QuizManager() {
  const [quizzes, setQuizzes] = useState<FlashQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBox, setSelectedBox] = useState<number | 'all' | null>(1);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<FlashQuiz | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<FlashQuiz | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ front: '', back: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [totalQuizzes, setTotalQuizzes] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  
  // 퀴즈 상태 관리 컨텍스트 사용
  const { lastUpdated, refreshCards } = useCards();
  const { user, getAuthHeaders } = useAuth();

  const loadQuizzes = useCallback(async () => {
    if (selectedBox === null) return;
    
    setLoading(true);
    try {
      console.log(`[QuizManager] 퀴즈 로딩 시작: ${selectedBox === 'all' ? '전체' : selectedBox}번 훈련소, 과목 ID: ${selectedSubject || '전체'}`);
      console.log(`[QuizManager] 사용자 로그인 상태: ${!!user}, 이메일: ${user?.email}`);
      
      const authHeaders = user ? getAuthHeaders() : undefined;
      console.log(`[QuizManager] 인증 헤더:`, authHeaders ? '있음' : '없음');
      
      if (selectedBox === 'all') {
        // 모든 퀴즈 로드
        console.log(`[QuizManager] getAllCards 호출 중...`);
        const allQuizzes = await getAllCards(selectedSubject || undefined, authHeaders);
        console.log(`[QuizManager] getAllCards 결과:`, { length: allQuizzes.length, isArray: Array.isArray(allQuizzes) });
        console.log(`[QuizManager] 전체 퀴즈 로드 완료: ${allQuizzes.length}개`);
        setQuizzes(allQuizzes);
      } else {
        // 특정 훈련소의 퀴즈만 로드
        console.log(`[QuizManager] getCardsByBox(${selectedBox}, ${selectedSubject || undefined}) 호출 중...`);
        const boxQuizzes = await getCardsByBox(selectedBox as number, selectedSubject || undefined, authHeaders);
        console.log(`[QuizManager] getCardsByBox 결과:`, { length: boxQuizzes.length, isArray: Array.isArray(boxQuizzes) });
        console.log(`[QuizManager] ${selectedBox}번 훈련소 퀴즈 로드 완료: ${boxQuizzes.length}개`);
        setQuizzes(boxQuizzes);
      }
    } catch (error) {
      console.error('[QuizManager] 퀴즈 로딩 오류:', error);
      // 오류 발생 시 빈 배열로 설정
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBox, selectedSubject, user, getAuthHeaders]);

  const updateTotalQuizzes = useCallback(async () => {
    try {
      console.log(`[QuizManager] 훈련소별 퀴즈 수 업데이트 시작, 과목 ID: ${selectedSubject || '전체'}`);
      
      const counts: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      
      const authHeaders = user ? getAuthHeaders() : undefined;
      
      // 모든 훈련소의 퀴즈 개수를 병렬로 가져오기
      const promises = Array.from({ length: 5 }, (_, i) => i + 1).map(async (box) => {
        try {
          console.log(`[QuizManager] ${box}번 훈련소 퀴즈 수 조회 요청 중...`);
          const boxQuizzes = await getCardsByBox(box, selectedSubject || undefined, authHeaders);
          
          // 결과가 배열인지 확인
          if (!Array.isArray(boxQuizzes)) {
            console.error(`[QuizManager] ${box}번 훈련소 퀴즈 수 조회 결과가 배열이 아님`);
            return { box, count: 0 };
          }
          
          console.log(`[QuizManager] ${box}번 훈련소 퀴즈 수: ${boxQuizzes.length}개`);
          return { box, count: boxQuizzes.length };
        } catch (boxError) {
          console.error(`[QuizManager] ${box}번 훈련소 퀴즈 수 조회 오류:`, boxError);
          return { box, count: 0 };
        }
      });
      
      // 모든 요청이 완료될 때까지 기다림 (최대 5초)
      const results = await Promise.allSettled(promises);
      
      // 결과 처리
      results.forEach((result, index) => {
        const boxNumber = index + 1;
        if (result.status === 'fulfilled') {
          counts[result.value.box] = result.value.count;
        } else {
          console.error(`[QuizManager] ${boxNumber}번 훈련소 퀴즈 수 조회 실패:`, result.reason);
          counts[boxNumber] = 0;
        }
      });
      
      console.log(`[QuizManager] 훈련소별 퀴즈 수 업데이트 완료:`, counts);
      setTotalQuizzes(counts);
    } catch (error) {
      console.error('[QuizManager] 퀴즈 개수 업데이트 오류:', error);
      // 오류 발생 시 기존 값 유지
    }
  }, [selectedSubject, user, getAuthHeaders]);

  useEffect(() => {
    // 검색 모드가 아닐 때만 퀴즈 로드
    if (!isSearching) {
      loadQuizzes();
    }
  }, [loadQuizzes, isSearching]);

  useEffect(() => {
    updateTotalQuizzes();
  }, [updateTotalQuizzes]);
  
  // lastUpdated가 변경될 때마다 퀴즈 목록과 개수 새로고침
  useEffect(() => {
    console.log('[QuizManager] lastUpdated 변경 감지:', new Date(lastUpdated).toLocaleTimeString());
    if (!isSearching) {
      loadQuizzes();
    }
    updateTotalQuizzes();
  }, [lastUpdated, loadQuizzes, updateTotalQuizzes, isSearching]);

  const handleBoxChange = (boxNumber: number | 'all' | null) => {
    setSelectedBox(boxNumber);
    setSearchTerm('');
    setIsSearching(false);
  };

  const handleSubjectChange = (subjectId: number | null) => {
    setSelectedSubject(subjectId);
  };

  const handleMoveQuiz = async (quizId: number, targetBox: number) => {
    try {
      const authHeaders = user ? getAuthHeaders() : undefined;
      
      // 서버에 퀴즈 이동 요청
      const currentBox = typeof selectedBox === 'number' ? selectedBox : 0;
      await updateCardBox(quizId, targetBox === currentBox + 1, authHeaders); // true면 승급, false면 하향
      
      // UI 업데이트 - 퀴즈 제거 또는 훈련소 번호 업데이트
      if (selectedBox === 'all' || isSearching) {
        // 전체 보기 모드 또는 검색 모드에서는 퀴즈의 훈련소 번호만 업데이트
        setQuizzes(prev => 
          prev.map(quiz => 
            quiz.id === quizId 
              ? { ...quiz, box_number: targetBox } 
              : quiz
          )
        );
      } else {
        // 특정 훈련소 보기 모드에서는 퀴즈 제거
        setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      }
      
      // 다른 컴포넌트에 퀴즈 상태 변경 알림
      refreshCards();
      
      // 전체 퀴즈 개수 업데이트
      await updateTotalQuizzes();
    } catch (error) {
      console.error('퀴즈 이동 오류:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      // 검색어가 비어있으면 원래 상태로 돌아감
      setIsSearching(false);
      loadQuizzes();
      return;
    }
    
    try {
      setLoading(true);
      setIsSearching(true);
      
      const authHeaders = user ? getAuthHeaders() : undefined;
      
      // 검색 실행
      const searchResults = await searchCards(searchTerm, selectedSubject || undefined, authHeaders);
      setQuizzes(searchResults);
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

  const openDeleteModal = (quiz: FlashQuiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    
    try {
      const authHeaders = user ? getAuthHeaders() : undefined;
      
      await deleteCard(quizToDelete.id, authHeaders);
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizToDelete.id));
      setShowDeleteModal(false);
      
      // 다른 컴포넌트에 퀴즈 상태 변경 알림
      refreshCards();
      
      // 전체 퀴즈 개수 업데이트
      await updateTotalQuizzes();
    } catch (error) {
      console.error('퀴즈 삭제 오류:', error);
    }
  };

  const openEditModal = (quiz: FlashQuiz) => {
    setQuizToEdit(quiz);
    setEditFormData({ front: quiz.front, back: quiz.back });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const confirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizToEdit) return;
    
    try {
      const authHeaders = user ? getAuthHeaders() : undefined;
      
      // 수정된 데이터로 퀴즈 업데이트
      const updatedQuiz = {
        ...quizToEdit,
        front: editFormData.front,
        back: editFormData.back
      };
      
      // leitner.ts에서 가져온 updateCard 함수 사용
      await updateCard(updatedQuiz, authHeaders);
      
      // UI 업데이트
      setQuizzes(prev => 
        prev.map(quiz => 
          quiz.id === quizToEdit.id 
            ? { ...quiz, front: editFormData.front, back: editFormData.back } 
            : quiz
        )
      );
      
      setShowEditModal(false);
      
      // 다른 컴포넌트에 퀴즈 상태 변경 알림
      refreshCards();
      
      // 전체 퀴즈 개수 업데이트
      await updateTotalQuizzes();
    } catch (error) {
      console.error('퀴즈 수정 오류:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
        📊 퀴즈 관리 대시보드
      </h2>
      
      {/* 검색 기능 */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="문제 또는 정답 검색"
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
      
      {/* 훈련소 선택 버튼 */}
      <div className="flex flex-col space-y-4 mb-6">
        <SubjectSelector
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
          includeAllOption={true}
          label="과목 선택"
        />
        
        <div className="bg-[var(--neutral-100)] p-4 rounded-lg border border-[var(--neutral-300)] shadow-sm">
          <p className="text-sm font-medium mb-3">🧠 훈련소 선택</p>
          <div className="flex overflow-x-auto pb-2 space-x-2">
            {Array.from({length: 5}, (_, i) => i + 1).map(boxNumber => (
              <button
                key={boxNumber}
                onClick={() => handleBoxChange(boxNumber)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg shadow-sm focus:outline-none ${
                  selectedBox === boxNumber
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-white border border-[var(--neutral-300)] hover:bg-[var(--neutral-100)]'
                }`}
              >
                <span className="font-medium">{boxNumber}단계 훈련소</span>
                <span className="ml-2 px-2 py-0.5 bg-opacity-20 rounded text-sm">
                  {totalQuizzes[boxNumber] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 훈련소 선택 결과 */}
      <div className="mb-6">
        <p className="text-sm text-center text-[var(--neutral-700)] mb-2">
          {isSearching 
            ? `검색 결과: "${searchTerm}" (${quizzes.length}개)` 
            : selectedBox === 'all' 
              ? `전체 퀴즈 (${quizzes.length}개)` 
              : selectedBox === null 
                ? '훈련소를 선택하세요' 
                : `${selectedBox}단계 훈련소: ${BOX_NAMES[selectedBox as keyof typeof BOX_NAMES]} ${quizzes.length > 0 ? `(${quizzes.length}개)` : '(비어 있음)'}`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--primary)] border-r-transparent"></div>
          <p className="mt-2">로딩 중...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-8 text-[var(--neutral-700)]">
          {isSearching 
            ? '검색 결과가 없습니다. 다른 키워드로 검색해보세요.' 
            : selectedBox === 'all' 
              ? '퀴즈가 없습니다. 퀴즈를 추가해보세요!' 
              : selectedBox === null 
                ? '훈련소를 선택하세요' 
                : '이 훈련소에는 퀴즈가 없습니다.'}
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div 
              key={quiz.id}
              className="border border-[var(--neutral-300)] bg-[var(--neutral-100)] rounded-lg p-4 hover:border-[var(--primary)] transition-colors shadow-sm hover:shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
                <div className="font-medium">{quiz.back}</div>
                <div className="text-[var(--neutral-700)]">{quiz.front}</div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
                <div className="text-xs text-[var(--neutral-700)] flex items-center">
                  {(selectedBox === 'all' || isSearching) && 
                    <span className="mr-2 px-2 py-1 bg-[var(--neutral-200)] rounded-full text-xs">
                      {getBoxEmoji(quiz.box_number)} {quiz.box_number}단계 훈련소
                    </span>
                  }
                  <span>마지막 학습: {new Date(quiz.last_reviewed || Date.now()).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openEditModal(quiz)}
                    className="text-xs px-3 py-1.5 bg-[var(--secondary)] bg-opacity-20 text-[var(--foreground)] font-medium rounded-md border border-[var(--secondary)] border-opacity-30 hover:bg-opacity-30"
                  >
                    ✏️ 수정
                  </button>
                  
                  {quiz.box_number < 5 && (
                    <button
                      onClick={() => handleMoveQuiz(quiz.id, quiz.box_number + 1)}
                      className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200 hover:bg-green-100"
                    >
                      ⬆️ {quiz.box_number + 1}단계 훈련소로
                    </button>
                  )}
                  
                  {quiz.box_number > 1 && (
                    <button
                      onClick={() => handleMoveQuiz(quiz.id, 1)}
                      className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-md border border-red-200 hover:bg-red-100"
                    >
                      ⬇️ 1단계 훈련소로
                    </button>
                  )}
                  
                  <button
                    onClick={() => openDeleteModal(quiz)}
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
            <h3 className="text-lg font-bold mb-4 text-[var(--primary)]">퀴즈 삭제 확인</h3>
            
            <div className="mb-6">
              <p className="mb-2">정말 이 퀴즈를 삭제하시겠습니까?</p>
              <div className="bg-[var(--neutral-200)] p-4 rounded-lg text-sm">
                <div><span className="font-medium">문제:</span> {quizToDelete?.back}</div>
                <div><span className="font-medium">정답:</span> {quizToDelete?.front}</div>
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
            <h3 className="text-lg font-bold mb-4 text-[var(--secondary)]">퀴즈 수정</h3>
            
            <form onSubmit={confirmEdit} className="space-y-4">
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