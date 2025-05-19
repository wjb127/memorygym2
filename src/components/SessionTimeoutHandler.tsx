'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const INACTIVITY_WARNING_TIME = 15 * 60 * 1000; // 15분
const FINAL_TIMEOUT_TIME = 5 * 60 * 1000; // 추가 5분

export default function SessionTimeoutHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(FINAL_TIMEOUT_TIME / 1000);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 활동 감지 시 호출될 함수
  const resetTimers = useCallback(() => {
    // 이미 활성화된 타이머가 있으면 제거
    if (warningTimer) clearTimeout(warningTimer);
    if (logoutTimer) clearTimeout(logoutTimer);
    
    // 경고창이 표시 중이었다면 닫기
    if (showWarning) {
      setShowWarning(false);
    }
    
    // 인증된 상태일 때만 타이머 설정
    if (status === 'authenticated' && session) {
      // 비활동 감지 타이머 설정
      const newWarningTimer = setTimeout(() => {
        setShowWarning(true);
        startLogoutCountdown();
      }, INACTIVITY_WARNING_TIME);
      
      setWarningTimer(newWarningTimer);
    }
  }, [warningTimer, logoutTimer, showWarning, status, session]);
  
  // 로그아웃 카운트다운 시작
  const startLogoutCountdown = useCallback(() => {
    setSecondsLeft(FINAL_TIMEOUT_TIME / 1000);
    
    // 1초마다 카운트다운
    const countdownInterval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // 최종 로그아웃 타이머 설정
    const newLogoutTimer = setTimeout(() => {
      console.log('세션 타임아웃: 자동 로그아웃');
      // 로그아웃 실행
      signOut({ redirect: false }).then(() => {
        router.push('/login?timeout=true');
      });
    }, FINAL_TIMEOUT_TIME);
    
    setLogoutTimer(newLogoutTimer);
    
    return () => {
      clearInterval(countdownInterval);
      if (newLogoutTimer) clearTimeout(newLogoutTimer);
    };
  }, [router]);
  
  // 세션 연장 처리
  const extendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);
  
  // 컴포넌트 마운트 시 이벤트 리스너 설정
  useEffect(() => {
    // 로그인 상태일 때만 타이머 설정
    if (status === 'authenticated' && session) {
      // 사용자 활동 이벤트 리스너
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      // 디바운싱을 위한 변수 (짧은 시간에 여러 이벤트가 발생해도 한 번만 호출)
      let debounceTimer: NodeJS.Timeout | null = null;
      
      const handleUserActivity = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
          resetTimers();
        }, 300);
      };
      
      // 이벤트 리스너 등록
      events.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });
      
      // 초기 타이머 설정
      resetTimers();
      
      // 클린업 함수
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleUserActivity);
        });
        
        if (debounceTimer) clearTimeout(debounceTimer);
        if (warningTimer) clearTimeout(warningTimer);
        if (logoutTimer) clearTimeout(logoutTimer);
      };
    }
  }, [resetTimers, status, session, warningTimer, logoutTimer]);
  
  // 세션이 없으면 아무것도 렌더링하지 않음
  if (status !== 'authenticated' || !session) {
    return null;
  }
  
  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-[var(--primary)]">세션 만료 예정</h3>
            
            <div className="mb-6">
              <p className="mb-4">장시간 활동이 없어 {Math.floor(secondsLeft / 60)}분 {secondsLeft % 60}초 후에 자동 로그아웃됩니다.</p>
              <p>계속 사용하시겠습니까?</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  signOut({ redirect: false }).then(() => {
                    router.push('/login');
                  });
                }}
                className="px-4 py-2 border border-[var(--neutral-300)] rounded-lg bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] transition-colors"
              >
                로그아웃
              </button>
              <button
                onClick={extendSession}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                세션 유지하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 