'use client';

import { useState, useEffect } from 'react';
import { Subject } from '../utils/types';
import { getAllSubjects } from '../utils/leitner';

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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllSubjects();
        
        if (Array.isArray(data)) {
          setSubjects(data);
        } else {
          setSubjects([]);
          setError('과목 데이터 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('과목 로드 오류:', err);
        setError('과목을 불러오는 중 오류가 발생했습니다.');
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  // 기본 과목이 없는 경우 기본 과목 추가
  const subjectsToDisplay = subjects.length > 0 
    ? subjects 
    : [{ id: 1, created_at: new Date().toISOString(), name: '기본 과목', description: '시스템 기본 과목' }];

  // 샘플 과목인지 확인하는 함수
  const isSampleSubject = (id: number) => id < 0;

  return (
    <div className="mb-4">
      <label htmlFor="subject-selector" className="block text-sm font-medium mb-2 text-[var(--neutral-700)]">
        {label}
      </label>
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
        {subjectsToDisplay.map((subject) => (
          <option 
            key={subject.id} 
            value={subject.id}
            className={isSampleSubject(subject.id) ? 'bg-[var(--neutral-200)] italic' : ''}
          >
            {subject.name}
          </option>
        ))}
        {loading && <option disabled>로딩 중...</option>}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 