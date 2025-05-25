'use client';

import { useState, useEffect } from 'react';
import { Subject } from '../utils/types';
import { getAllSubjects } from '../utils/leitner';
import { SAMPLE_SUBJECTS } from '../utils/sample-data';
import { useAuth } from '@/context/AuthProvider';
import { useCards } from '@/context/CardContext';

interface SubjectSelectorProps {
  selectedSubject: number | null;
  onSubjectChange: (subjectId: number | null) => void;
  includeAllOption?: boolean;
  label?: string;
}

export default function SubjectSelector({
  selectedSubject,
  onSubjectChange,
  includeAllOption = true,
  label = '과목'
}: SubjectSelectorProps) {
  const { user, getAuthHeaders } = useAuth();
  const { lastUpdated } = useCards(); // CardContext에서 lastUpdated 가져오기
  const [subjects, setSubjects] = useState<Subject[]>([]); // 초기값을 빈 배열로 설정
  const [loading, setLoading] = useState(true); // 초기 로딩을 true로 설정
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[SubjectSelector] 과목 로드 시작');
        
        const isLoggedIn = !!user;
        const authHeaders = isLoggedIn ? getAuthHeaders() : undefined;
        
        const data = await getAllSubjects(isLoggedIn, authHeaders);
        
        if (Array.isArray(data)) {
          // 중복 제거: ID 기준으로 유니크한 과목만 유지
          const uniqueSubjects = data.reduce((acc: Subject[], current: Subject) => {
            const existingIndex = acc.findIndex((subject: Subject) => subject.id === current.id);
            if (existingIndex === -1) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          setSubjects(uniqueSubjects);
          console.log(`[SubjectSelector] 과목 ${uniqueSubjects.length}개 로드 성공 (중복 제거됨)`);
          
          // 샘플 데이터만 있는지 확인
          const hasOnlySampleData = uniqueSubjects.every((subject: Subject) => subject.id < 0);
          setUsingSampleData(hasOnlySampleData);
          
          // 로그인된 사용자인데 과목이 없는 경우
          if (isLoggedIn && uniqueSubjects.length === 0) {
            setError('과목이 없습니다. 새 과목을 추가해보세요.');
          }
        } else {
          console.warn('[SubjectSelector] API에서 유효한 과목 데이터를 받지 못함');
          if (isLoggedIn) {
            setError('과목 목록을 불러올 수 없습니다.');
            setSubjects([]);
            setUsingSampleData(false);
          } else {
            setSubjects(SAMPLE_SUBJECTS);
            setUsingSampleData(true);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[SubjectSelector] API 로드 실패:', errorMessage);
        
        const isLoggedIn = !!user;
        
        if (isLoggedIn) {
          // 로그인된 사용자에게는 오류 메시지 표시
          setError(errorMessage);
          setSubjects([]);
          setUsingSampleData(false);
        } else {
          // 비로그인 사용자에게는 샘플 데이터 제공
          setSubjects(SAMPLE_SUBJECTS);
          setUsingSampleData(true);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [user]); // lastUpdated 의존성 제거 - 수동 새로고침으로 대체

  // 샘플 과목인지 확인하는 함수
  const isSampleSubject = (id: number) => id < 0;

  const handleRefresh = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const isLoggedIn = !!user;
      const authHeaders = isLoggedIn ? getAuthHeaders() : undefined;
      
      // 캐시 무효화를 위한 헤더 추가
      const refreshHeaders = {
        ...authHeaders,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      
      const data = await getAllSubjects(isLoggedIn, refreshHeaders);
      
      if (Array.isArray(data)) {
        const uniqueSubjects = data.reduce((acc: Subject[], current: Subject) => {
          const existingIndex = acc.findIndex((subject: Subject) => subject.id === current.id);
          if (existingIndex === -1) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setSubjects(uniqueSubjects);
        const hasOnlySampleData = uniqueSubjects.every((subject: Subject) => subject.id < 0);
        setUsingSampleData(hasOnlySampleData);
        
        if (isLoggedIn && uniqueSubjects.length === 0) {
          setError('과목이 없습니다. 새 과목을 추가해보세요.');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="subject-selector" className="block text-sm font-medium text-[var(--neutral-700)]">
          {label}
        </label>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1 text-[var(--neutral-600)] hover:text-[var(--primary)] transition-colors disabled:opacity-50"
          title="과목 목록 새로고침"
        >
          <svg 
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </div>
      {usingSampleData && (
        <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600">
            💡 체험 모드: 샘플 과목으로 학습을 체험해보세요! (수정/삭제 불가)
          </p>
        </div>
      )}
      <select
        id="subject-selector"
        value={selectedSubject === null ? '' : selectedSubject}
        onChange={(e) => onSubjectChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full px-3 py-2 border border-[var(--neutral-300)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
        disabled={loading}
      >
        {includeAllOption && (
          <option value="">과목 선택</option>
        )}
        {subjects.map((subject) => {
          return (
            <option 
              key={subject.id} 
              value={subject.id}
              className={isSampleSubject(subject.id) ? 'bg-[var(--neutral-200)] italic' : ''}
            >
              {subject.name}
            </option>
          );
        })}
        {loading && <option disabled>로딩 중...</option>}
      </select>
      {error && (
        <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-800 mb-2">{error}</p>
          {user && (
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                // useEffect가 다시 실행되도록 강제로 상태 변경
                const loadSubjects = async () => {
                  try {
                    const isLoggedIn = !!user;
                    const authHeaders = isLoggedIn ? getAuthHeaders() : undefined;
                    const data = await getAllSubjects(isLoggedIn, authHeaders);
                    
                    if (Array.isArray(data)) {
                      const uniqueSubjects = data.reduce((acc: Subject[], current: Subject) => {
                        const existingIndex = acc.findIndex((subject: Subject) => subject.id === current.id);
                        if (existingIndex === -1) {
                          acc.push(current);
                        }
                        return acc;
                      }, []);
                      
                      setSubjects(uniqueSubjects);
                      const hasOnlySampleData = uniqueSubjects.every((subject: Subject) => subject.id < 0);
                      setUsingSampleData(hasOnlySampleData);
                      
                      if (isLoggedIn && uniqueSubjects.length === 0) {
                        setError('과목이 없습니다. 새 과목을 추가해보세요.');
                      }
                    }
                  } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    setError(errorMessage);
                  } finally {
                    setLoading(false);
                  }
                };
                loadSubjects();
              }}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors"
              disabled={loading}
            >
              {loading ? '재시도 중...' : '다시 시도'}
            </button>
          )}
        </div>
      )}
    </div>
  );
} 