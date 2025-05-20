'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const INACTIVITY_WARNING_TIME = 105 * 60 * 1000; // 1시간 45분
const FINAL_TIMEOUT_TIME = 15 * 60 * 1000; // 추가 15분

export default function SessionTimeoutHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(FINAL_TIMEOUT_TIME / 1000);
  
  // 타이머를 ref로 관리하여 의존성 배열에 추가하지 않도록 함
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 로그아웃 카운트다운 시작
  const startLogoutCountdown = useCallback(() => {
    setSecondsLeft(FINAL_TIMEOUT_TIME / 1000);
    
    // 기존 인터벌 정리
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // 1초마다 카운트다운
    const countdownInterval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownIntervalRef.current = countdownInterval;
    
    // 최종 로그아웃 타이머 설정
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    
    const newLogoutTimer = setTimeout(() => {
      console.log('세션 타임아웃: 자동 로그아웃');
      // 로그아웃 실행
      signOut({ redirect: false }).then(() => {
        router.push('/login?timeout=true');
      });
    }, FINAL_TIMEOUT_TIME);
    
    logoutTimerRef.current = newLogoutTimer;
  }, [router]);
  
  // 활동 감지 시 호출될 함수
  const resetTimers = useCallback(() => {
    // 이미 활성화된 타이머가 있으면 제거
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
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
      
      warningTimerRef.current = newWarningTimer;
    }
  }, [showWarning, status, session, startLogoutCountdown]);
  
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
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
    }
  }, [resetTimers, status, session]);
  
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