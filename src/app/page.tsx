'use client';

import Image from "next/image";
import StudySession from "../components/StudySession";
import AddCardForm from "../components/AddCardForm";
import BoxManager from "../components/BoxManager";

export default function Home() {
  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] items-center w-full max-w-6xl">
        <div className="flex items-center justify-between w-full">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={80}
            height={30}
            priority
          />
          <h1 className="text-3xl font-bold">라이트너 상자</h1>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <StudySession />
          </div>
          
          <div className="space-y-8">
            <AddCardForm onCardAdded={() => {
              // 카드가 추가되면 새로고침 (실제로는 상태 관리 라이브러리나 컨텍스트를 사용하는 것이 좋음)
              window.location.reload();
            }} />
            <BoxManager />
          </div>
        </div>

        <div className="border-t border-gray-200 w-full pt-8 mt-8">
          <p className="text-center text-sm text-gray-500">
            Next.js + Supabase로 구현한 라이트너 학습법 애플리케이션
          </p>
        </div>
      </main>
    </div>
  );
}
