'use client';

import { useState, useEffect } from 'react';
import { getAllSubjects } from '../utils/leitner';
import { Subject } from '../utils/types';
import SubjectForm from './SubjectForm';

export default function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSubjects();
      
      if (Array.isArray(data)) {
        setSubjects(data);
      } else {
        setError('과목 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('과목 로드 오류:', err);
      setError('과목을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubjectAdded = () => {
    // 과목이 추가되면 목록 새로고침
    loadSubjects();
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
        📚 과목 관리
      </h2>

      <SubjectForm onSubjectAdded={handleSubjectAdded} />

      <div className="bg-[var(--neutral-100)] rounded-lg border border-[var(--neutral-300)] p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">과목 목록</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
            <p className="mt-2 text-[var(--neutral-600)]">과목 로딩 중...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
            <p>{error}</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-8 text-[var(--neutral-600)]">
            <p>등록된 과목이 없습니다. 새 과목을 추가해보세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div 
                key={subject.id} 
                className="bg-white rounded-lg shadow-sm border border-[var(--neutral-300)] p-4"
              >
                <h4 className="font-medium text-[var(--neutral-900)]">{subject.name}</h4>
                {subject.description && (
                  <p className="mt-1 text-sm text-[var(--neutral-700)]">{subject.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 