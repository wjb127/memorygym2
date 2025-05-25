'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';

const INACTIVITY_WARNING_TIME = 105 * 60 * 1000; // 1시간 45분
const FINAL_TIMEOUT_TIME = 15 * 60 * 1000; // 추가 15분

export default function SessionTimeoutHandler() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // 활동 감지 함수
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setCountdown(15);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
  }, [showWarning]);

  // 자동 로그아웃
  const handleAutoLogout = useCallback(async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('자동 로그아웃 오류:', error);
    }
  }, [signOut, router]);

  // 경고 표시
  const showTimeoutWarning = useCallback(() => {
    setShowWarning(true);
    setCountdown(15);
    
    // 카운트다운 시작
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleAutoLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleAutoLogout]);

  // 타이머 설정
  const setInactivityTimer = useCallback(() => {
    // 기존 타이머 클리어
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (finalTimerRef.current) clearTimeout(finalTimerRef.current);

    // 경고 타이머 설정
    warningTimerRef.current = setTimeout(() => {
      showTimeoutWarning();
    }, INACTIVITY_WARNING_TIME);
  }, [showTimeoutWarning]);

  // 세션 연장
  const extendSession = useCallback(() => {
    updateActivity();
    setInactivityTimer();
  }, [updateActivity, setInactivityTimer]);

  useEffect(() => {
    // 로그인된 사용자에게만 적용
    if (!user) return;

    // 활동 이벤트 리스너
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // 초기 타이머 설정
    setInactivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (finalTimerRef.current) clearTimeout(finalTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [user, updateActivity, setInactivityTimer]);

  // 로그인하지 않은 경우 렌더링하지 않음
  if (!user) return null;

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                세션 만료 경고
              </h3>
              <p className="text-gray-600 mb-4">
                비활성 상태가 지속되어 {countdown}초 후에 자동으로 로그아웃됩니다.
              </p>
              <div className="space-y-3">
                <button
                  onClick={extendSession}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  세션 연장
                </button>
                <button
                  onClick={handleAutoLogout}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  지금 로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 