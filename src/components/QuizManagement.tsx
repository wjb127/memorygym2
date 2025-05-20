'use client';

import { useState } from 'react';
import AddCardForm from './AddCardForm';
import QuizManager from './QuizManager';
import { useCards } from '@/context/CardContext';

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
          <AddCardForm onCardAdded={handleCardAdded} />
        ) : (
          <QuizManager />
        )}
      </div>
    </div>
  );
} 