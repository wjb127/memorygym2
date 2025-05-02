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
      label: '암기훈련',
      content: <StudySession />
    },
    {
      id: 'add',
      label: '카드추가',
      content: <AddCardForm onCardAdded={handleCardAdded} />
    },
    {
      id: 'manage',
      label: '카드관리',
      content: <BoxManager />
    }
  ];

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
        메모리짐
      </h1>
      
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 flex-grow">
        <TabLayout tabs={tabs} />
      </div>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; 2023 메모리짐 - 효율적인 기억 훈련을 위한 앱</p>
      </footer>
    </main>
  );
}
