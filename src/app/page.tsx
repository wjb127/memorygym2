'use client';

import { useRouter } from 'next/navigation';
import StudySession from "../components/StudySession";
import AddCardForm from "../components/AddCardForm";
import BoxManager from "../components/BoxManager";
import TabLayout from "../components/TabLayout";

export default function Home() {
  const router = useRouter();

  // 새로고침 핸들러
  const handleCardAdded = () => {
    // 카드가 추가된 후 페이지 새로고침
    router.refresh();
  };

  // 탭 구성
  const tabs = [
    {
      id: 'study',
      label: <><span className="hidden sm:inline">🏋️‍♂️ 암기</span><span className="sm:hidden">🏋️‍♂️</span></>,
      content: <StudySession />
    },
    {
      id: 'add',
      label: <><span className="hidden sm:inline">🧠 추가</span><span className="sm:hidden">🧠</span></>,
      content: <AddCardForm onCardAdded={handleCardAdded} />
    },
    {
      id: 'manage',
      label: <><span className="hidden sm:inline">📊 관리</span><span className="sm:hidden">📊</span></>,
      content: <BoxManager />
    }
  ];

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          💪 메모리짐
        </h1>
        <p className="mt-2 text-[var(--neutral-700)]">당신의 두뇌를 위한 최고의 트레이닝</p>
      </header>
      
      <div className="bg-[var(--neutral-100)] rounded-xl shadow-lg p-4 md:p-6 flex-grow border border-[var(--neutral-300)]">
        <TabLayout tabs={tabs} />
      </div>
      
      <footer className="mt-8 text-center text-sm text-[var(--neutral-700)]">
        <p>💪 메모리짐 - 매일 훈련하는 두뇌는 더 강해집니다</p>
      </footer>
    </main>
  );
}
