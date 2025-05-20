'use client';

import { useState, useEffect } from 'react';
import { getAllSubjects, updateSubject, deleteSubject } from '../utils/leitner';
import { Subject } from '../utils/types';
import { useAuth } from '@/context/AuthContext';

export default function SubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  // 수정 폼 상태
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // 과목 목록 불러오기
  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);
  
  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('과목 목록 로드 오류:', err);
      setError('과목 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 수정 모드 시작
  const handleEditClick = (subject: Subject) => {
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
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedSubject = await updateSubject(editingSubject.id, {
        name: editName,
        description: editDescription
      });
      
      if (updatedSubject) {
        // 과목 목록 업데이트
        setSubjects(subjects.map(s => 
          s.id === editingSubject.id ? updatedSubject : s
        ));
        setEditingSubject(null); // 수정 모드 종료
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
  
  // 삭제 확인
  const handleConfirmDelete = async (subjectId: number) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const success = await deleteSubject(subjectId);
      
      if (success) {
        // 과목 목록에서 삭제
        setSubjects(subjects.filter(s => s.id !== subjectId));
        setDeleteConfirmId(null); // 삭제 확인 모드 종료
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
        </div>
      )}
      
      <ul className="space-y-4">
        {subjects.map(subject => (
          <li 
            key={subject.id}
            className="bg-white rounded-lg border border-[var(--neutral-300)] p-4"
          >
            {editingSubject?.id === subject.id ? (
              // 수정 폼
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
              // 삭제 확인
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
              // 일반 표시
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium">{subject.name}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(subject)}
                      className="px-2 py-1 text-sm text-[var(--neutral-700)] hover:bg-[var(--neutral-200)] rounded"
                      title="수정"
                    >
                      ✏️ 수정
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(subject.id)}
                      className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      title="삭제"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
                {subject.description && (
                  <p className="mt-2 text-sm text-[var(--neutral-600)]">{subject.description}</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 