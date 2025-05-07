'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import StudySession from "../components/StudySession";
import AddCardForm from "../components/AddCardForm";
import BoxManager from "../components/BoxManager";
import SubjectManager from "../components/SubjectManager";
import TabLayout from "../components/TabLayout";
import FeedbackButton from "../components/FeedbackButton";
import { createClientBrowser } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  // 새로고침 핸들러
  const handleCardAdded = () => {
    // 카드가 추가된 후 페이지 새로고침
    router.refresh();
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut();
      
      // 페이지 새로고침 및 홈으로 리다이렉트
      router.refresh();
      
      // 브라우저 캐시 초기화를 위한 강제 새로고침
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
    }
  };

  // 탭 구성
  const tabs = [
    {
      id: 'study',
      label: <><span className="hidden sm:inline">암기훈련</span><span className="sm:hidden">암기</span></>,
      content: <StudySession />
    },
    {
      id: 'add',
      label: <><span className="hidden sm:inline">카드추가</span><span className="sm:hidden">추가</span></>,
      content: <AddCardForm onCardAdded={handleCardAdded} />
    },
    {
      id: 'manage',
      label: <><span className="hidden sm:inline">카드관리</span><span className="sm:hidden">관리</span></>,
      content: <BoxManager />
    },
    {
      id: 'subjects',
      label: <><span className="hidden sm:inline">과목관리</span><span className="sm:hidden">과목</span></>,
      content: <SubjectManager />
    }
  ];

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            💪 암기훈련소
          </h1>
          
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="text-sm text-[var(--neutral-500)]">로딩 중...</div>
            ) : user ? (
              <>
                <span className="text-sm text-[var(--neutral-700)]">{user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm bg-[var(--neutral-200)] hover:bg-[var(--neutral-300)] rounded-md transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1 text-sm bg-[var(--neutral-200)] hover:bg-[var(--neutral-300)] rounded-md transition-colors">
                  로그인
                </Link>
                <Link href="/signup" className="px-3 py-1 text-sm bg-[var(--primary)] text-white hover:bg-opacity-90 rounded-md transition-colors">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
        
        <p className="text-center mt-2 text-[var(--neutral-700)]">당신의 두뇌를 위한 최고의 트레이닝</p>
      </header>
      
      <div className="bg-[var(--neutral-100)] rounded-xl shadow-lg p-4 md:p-6 flex-grow border border-[var(--neutral-300)]">
        <TabLayout tabs={tabs} />
      </div>
      
      <footer className="mt-8 text-center text-sm text-[var(--neutral-700)]">
        <p>💪 암기훈련소 - 매일 훈련하는 두뇌는 더 강해집니다</p>
        <p className="mt-2">
          <Link href="/premium" className="text-[var(--primary)] hover:underline">프리미엄으로 업그레이드 →</Link>
        </p>
      </footer>

      {/* 피드백 버튼 */}
      <FeedbackButton />
    </main>
  );
}
