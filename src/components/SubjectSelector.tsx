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
        
        // 타임아웃 설정으로 최대 3초만 기다림
        const timeoutPromise = new Promise<Subject[]>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 3000);
        });
        
        const isLoggedIn = !!user;
        const authHeaders = isLoggedIn ? getAuthHeaders() : undefined;
        const apiPromise = getAllSubjects(isLoggedIn, authHeaders);
        
        const data = await Promise.race([apiPromise, timeoutPromise]);
        
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
        } else {
          console.warn('[SubjectSelector] API에서 유효한 과목 데이터를 받지 못함 - 샘플 데이터 설정');
          setSubjects(SAMPLE_SUBJECTS);
          setUsingSampleData(true);
        }
      } catch (err) {
        console.log('[SubjectSelector] API 로드 실패 - 샘플 데이터 설정:', err);
        
        // 오류 발생시 샘플 데이터 설정
        setSubjects(SAMPLE_SUBJECTS);
        setUsingSampleData(true);
        setError(null); // 사용자에게는 오류 메시지를 보여주지 않음
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [user, lastUpdated]); // lastUpdated를 의존성에 추가

  // 샘플 과목인지 확인하는 함수
  const isSampleSubject = (id: number) => id < 0;

  return (
    <div className="mb-4">
      <label htmlFor="subject-selector" className="block text-sm font-medium mb-2 text-[var(--neutral-700)]">
        {label}
      </label>
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
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 