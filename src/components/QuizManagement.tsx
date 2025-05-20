'use client';

import { useState, useEffect } from 'react';
import AddCardForm from './AddCardForm';
import QuizManager from './QuizManager';
import { useCards } from '@/context/CardContext';

// StudySession 컴포넌트에서 updateBoxCounts 함수 가져오기
let globalUpdateBoxCounts: (() => void) | undefined;

export function registerUpdateBoxCountsFunction(updateBoxCounts: () => void) {
  globalUpdateBoxCounts = updateBoxCounts;
  console.log('[QuizManagement] updateBoxCounts 함수가 등록되었습니다');
}

export default function QuizManagement() {
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const { refreshCards } = useCards();

  // 퀴즈 추가 후 콜백
  const handleCardAdded = () => {
    refreshCards();
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-[var(--neutral-300)]">
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 ${
            activeTab === 'add'
              ? 'border-b-2 border-[var(--primary)] text-[var(--primary)] font-medium'
              : 'text-[var(--neutral-700)] hover:text-[var(--neutral-900)]'
          } transition-colors`}
        >
          퀴즈 추가
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 ${
            activeTab === 'manage'
              ? 'border-b-2 border-[var(--primary)] text-[var(--primary)] font-medium'
              : 'text-[var(--neutral-700)] hover:text-[var(--neutral-900)]'
          } transition-colors`}
        >
          퀴즈 관리
        </button>
      </div>

      <div className="pt-2">
        {activeTab === 'add' ? (
          <AddCardForm 
            onCardAdded={handleCardAdded} 
            updateBoxCounts={globalUpdateBoxCounts}
          />
        ) : (
          <QuizManager />
        )}
      </div>
    </div>
  );
} 