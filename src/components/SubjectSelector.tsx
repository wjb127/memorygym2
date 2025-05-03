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

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getAllSubjects();
        setSubjects(data);
      } catch (error) {
        console.error('과목 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

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
          <option value="">모든 과목</option>
        )}
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
        {loading && <option disabled>로딩 중...</option>}
        {!loading && subjects.length === 0 && <option disabled>등록된 과목이 없습니다</option>}
      </select>
    </div>
  );
} 