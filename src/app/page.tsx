'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import StudySession from "../components/StudySession";
import QuizManagement from "../components/QuizManagement";
import SubjectManager from "../components/SubjectManager";
import TabLayout from "../components/TabLayout";
import FeedbackButton from "../components/FeedbackButton";
import { useAuth } from "@/context/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { user, session, loading, signOut } = useAuth();
  const [sessionCheckAttempts, setSessionCheckAttempts] = useState(0);
  const isLoading = loading;
  const isAuthenticated = !!user && !!session;

  console.log("🏠 [메인 페이지] 세션 상태:", {
    isLoading,
    isAuthenticated,
    hasSession: !!session,
    hasUser: !!user,
    userEmail: user?.email,
    attempts: sessionCheckAttempts
  });

  // 세션 동기화 문제 해결을 위한 강제 체크
  useEffect(() => {
    // Supabase Auth는 자동으로 세션을 관리하므로 별도 동기화 불필요
    console.log('🔄 [메인 페이지] Supabase Auth 상태 초기화 완료');
  }, []);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      console.log("🚪 [메인 페이지] 로그아웃 시도");
      await signOut();
      console.log("✅ [메인 페이지] 로그아웃 성공");
      router.push('/');
    } catch (error) {
      console.error('💥 [메인 페이지] 로그아웃 처리 중 오류:', error);
      // 오류 발생 시 수동으로 홈페이지로 리디렉션
      window.location.href = '/';
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
      id: 'quizManagement',
      label: <><span className="hidden sm:inline">퀴즈관리</span><span className="sm:hidden">퀴즈</span></>,
      content: <QuizManagement />
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
          
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-[var(--neutral-500)]">세션 확인 중...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[var(--neutral-700)]">
                  안녕하세요, {user.user_metadata?.full_name || user.email}님!
                </span>
                <Link href="/profile" className="px-3 py-1 text-sm bg-[var(--secondary)] hover:bg-opacity-90 rounded-md transition-colors text-white">
                  내 계정
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm bg-[var(--neutral-200)] hover:bg-[var(--neutral-300)] rounded-md transition-colors"
                >
                  로그아웃
                </button>
              </div>
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
        {/* 프리미엄 링크 임시 숨김 (추후 앱 출시 시 광고 수익 모델로 전환 예정) */}
        {/* <p className="mt-2">
          <Link href="/premium" className="text-[var(--primary)] hover:underline">프리미엄으로 업그레이드 →</Link>
        </p> */}
        
        <div className="mt-6 pt-4 border-t border-[var(--neutral-300)]">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Link href="/terms" className="hover:underline text-xs">이용약관</Link>
            <span className="text-xs">|</span>
            <Link href="/privacy" className="hover:underline text-xs">개인정보 처리방침</Link>
            <span className="text-xs">|</span>
            <Link href="/refund-policy" className="hover:underline text-xs">환불 정책</Link>
            <span className="text-xs">|</span>
            <Link href="/service" className="hover:underline text-xs">서비스 안내</Link>
          </div>
          
          <div className="text-xs text-[var(--neutral-700)] space-y-1">
            <p>앱돌이공장 | 대표: 위승빈 | 사업자등록번호: 850-06-03291</p>
            <p>통신판매업신고: 제2025-서울마포-0692호 | 주소: 서울특별시 월드컵북로44길 72</p>
            <p>고객센터: 010-5056-8463 | 이메일: wjb127@naver.com</p>
            <p>© 2025 앱돌이공장 All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 피드백 버튼 */}
      <FeedbackButton />
    </main>
  );
}
