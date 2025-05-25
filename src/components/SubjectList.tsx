'use client';

import { useState, useEffect } from 'react';
import { getAllSubjects, updateSubject, deleteSubject } from '../utils/leitner';
import type { Subject } from '../utils/types';
import { useAuth } from '@/context/AuthProvider';
import { useCards } from '@/context/CardContext';

interface SubjectListProps {
  onSubjectSelect?: (subjectId: number) => void;
  selectedSubjectId?: number;
}

export default function SubjectList({ onSubjectSelect, selectedSubjectId }: SubjectListProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, session, getAuthHeaders } = useAuth();
  const isAuthenticated = !!user && !!session;
  const { refreshCards } = useCards();
  
  // 수정 폼 상태
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // 샘플 과목인지 확인하는 함수
  const isSampleSubject = (subjectId: number): boolean => subjectId < 0;
  
  // 과목 목록 불러오기
  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const isLoggedIn = !!user;
      const authHeaders = isLoggedIn ? getAuthHeaders() : undefined;
      
      console.log('[SubjectList] 과목 로드 시작:', {
        isLoggedIn,
        hasAuthHeaders: !!authHeaders,
        headerKeys: authHeaders ? Object.keys(authHeaders) : []
      });
      
      const data = await getAllSubjects(isLoggedIn, authHeaders);
      
      // 중복 제거: ID 기준으로 유니크한 과목만 유지
      const uniqueSubjects = (data || []).reduce((acc: Subject[], current: Subject) => {
        const existingIndex = acc.findIndex(s => s.id === current.id);
        if (existingIndex === -1) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      console.log('[SubjectList] 과목 로드 완료:', uniqueSubjects.length + '개');
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('과목 로드 실패:', error);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadSubjects();
  }, [user]); // user 상태가 변경될 때마다 다시 로드
  
  // 수정 모드 시작
  const handleEditClick = (subject: Subject) => {
    // 샘플 과목은 수정 불가
    if (isSampleSubject(subject.id)) {
      setError('샘플 과목은 수정할 수 없습니다.');
      return;
    }
    
    setEditingSubject(subject);
    setEditName(subject.name);
    setEditDescription(subject.description || '');
  };
  
  // 수정 취소
  const handleCancelEdit = () => {
    setEditingSubject(null);
    setEditName('');
    setEditDescription('');
  };
  
  // 과목 수정 제출
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSubject) return;
    if (!editName.trim()) {
      setError('과목 이름을 입력해주세요.');
      return;
    }
    
    // 샘플 과목은 수정 불가 (추가 안전장치)
    if (isSampleSubject(editingSubject.id)) {
      setError('샘플 과목은 수정할 수 없습니다.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const authHeaders = getAuthHeaders();
      
      const updatedSubject = await updateSubject(editingSubject.id, {
        name: editName,
        description: editDescription
      }, authHeaders);
      
      if (updatedSubject) {
        // 과목 목록 업데이트
        setSubjects(subjects.map(s => 
          s.id === editingSubject.id ? updatedSubject : s
        ));
        setEditingSubject(null); // 수정 모드 종료
        
        // 카드 상태 업데이트 (컨텍스트 통해 다른 컴포넌트에 알림)
        refreshCards();
      } else {
        setError('과목 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('과목 수정 오류:', err);
      setError('과목을 수정하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 삭제 버튼 클릭
  const handleDeleteClick = (subject: Subject) => {
    // 샘플 과목은 삭제 불가
    if (isSampleSubject(subject.id)) {
      setError('샘플 과목은 삭제할 수 없습니다.');
      return;
    }
    
    setDeleteConfirmId(subject.id);
  };
  
  // 삭제 확인
  const handleConfirmDelete = async (subjectId: number) => {
    // 샘플 과목은 삭제 불가 (추가 안전장치)
    if (isSampleSubject(subjectId)) {
      setError('샘플 과목은 삭제할 수 없습니다.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const authHeaders = getAuthHeaders();
      
      const success = await deleteSubject(subjectId, authHeaders);
      
      if (success) {
        // 과목 목록에서 삭제
        setSubjects(subjects.filter(s => s.id !== subjectId));
        setDeleteConfirmId(null); // 삭제 확인 모드 종료
        
        // 카드 상태 업데이트 (컨텍스트 통해 다른 컴포넌트에 알림)
        refreshCards();
      } else {
        setError('과목 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('과목 삭제 오류:', err);
      setError('과목을 삭제하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--primary)] border-r-transparent mb-2"></div>
        <p>과목 목록을 불러오는 중...</p>
      </div>
    );
  }
  
  // 과목이 없는 경우
  if (subjects.length === 0) {
    return (
      <div className="bg-[var(--neutral-100)] rounded-lg border border-[var(--neutral-300)] p-6 shadow-sm mb-6 text-center">
        <p className="text-lg mb-4">아직 과목이 없습니다.</p>
        <p className="text-[var(--neutral-600)]">위 폼을 통해 새 과목을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--neutral-100)] rounded-lg border border-[var(--neutral-300)] p-6 shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-4">과목 관리</h3>
      
      {error && (
        <div className="p-4 mb-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            닫기
          </button>
        </div>
      )}
      
      <ul className="space-y-4">
        {subjects.map(subject => {
          const isEditable = !isSampleSubject(subject.id);
          
          return (
            <li 
              key={subject.id}
              className={`rounded-lg border p-4 ${
                isSampleSubject(subject.id) 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white border-[var(--neutral-300)]'
              }`}
            >
              {editingSubject?.id === subject.id ? (
                // 수정 폼 (샘플 과목은 여기 들어올 수 없음)
                <form onSubmit={handleSubmitEdit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">과목 이름</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--neutral-300)] rounded-md"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">설명 (선택사항)</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-[var(--neutral-300)] rounded-md"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1 border border-[var(--neutral-300)] rounded-md text-sm hover:bg-[var(--neutral-200)]"
                      disabled={isSubmitting}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[var(--primary)] text-white rounded-md text-sm hover:bg-[var(--primary-hover)]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </form>
              ) : deleteConfirmId === subject.id ? (
                // 삭제 확인 (샘플 과목은 여기 들어올 수 없음)
                <div>
                  <p className="font-medium mb-3">
                    <span className="text-red-500">⚠️</span> "{subject.name}" 과목을 삭제하시겠습니까?
                  </p>
                  <p className="text-sm text-[var(--neutral-600)] mb-3">
                    이 과목에 있는 모든 카드도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1 border border-[var(--neutral-300)] rounded-md text-sm hover:bg-[var(--neutral-200)]"
                      disabled={isSubmitting}
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(subject.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 표시 모드
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium text-lg">
                        {subject.name}
                        {isSampleSubject(subject.id) && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            샘플
                          </span>
                        )}
                      </h4>
                    </div>
                    
                    {subject.description && (
                      <p className="text-[var(--neutral-600)] text-sm mb-2">
                        {subject.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-[var(--neutral-600)]">
                      <span>ID: {subject.id}</span>
                      {subject.created_at && (
                        <span>생성일: {new Date(subject.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  {isEditable && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditClick(subject)}
                        className="px-3 py-1 text-sm border border-[var(--primary)] text-[var(--primary)] rounded-md hover:bg-[var(--primary)] hover:text-white transition-colors"
                        disabled={isSubmitting}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteClick(subject)}
                        className="px-3 py-1 text-sm border border-red-600 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors"
                        disabled={isSubmitting}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
} 