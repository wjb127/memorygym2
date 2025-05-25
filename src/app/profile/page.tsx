'use client';

import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, session, loading, signOut, deleteAccount } = useAuth();
  const router = useRouter();
  const isAuthenticated = !!user && !!session;

  // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated || !user) {
    return null; // useEffect에서 이미 리디렉션 처리
  }

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = prompt('계정을 삭제하려면 "계정삭제"를 입력하세요:');
    
    if (confirmText !== '계정삭제') {
      alert('정확히 "계정삭제"를 입력해주세요.');
      return;
    }

    const finalConfirm = confirm(
      `정말로 계정을 삭제하시겠습니까?\n\n삭제될 데이터:\n• 모든 학습 기록\n• 생성한 모든 과목과 퀴즈\n• 플래시카드 데이터\n• 프리미엄 구독 정보\n• 계정 정보 및 설정\n\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!finalConfirm) {
      return;
    }

    try {
      await deleteAccount();
      alert('계정이 성공적으로 삭제되었습니다.');
      router.push('/');
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      alert('계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            내 계정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정 정보를 확인하고 관리하세요
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md">
                {user.user_metadata?.full_name || user.user_metadata?.name || '설정되지 않음'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                로그인 제공자
              </label>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md">
                {user.app_metadata?.provider || 'Google'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                최근 로그인
              </label>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md text-sm">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ko-KR') : '정보 없음'}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              로그아웃
            </button>
            
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-800 text-white py-2 px-4 rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 border-2 border-red-600"
            >
              ⚠️ 계정 삭제
            </button>
            
            <Link
              href="/"
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center block"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 