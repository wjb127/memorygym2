'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClientBrowser } from '@/utils/supabase';

// 인증 컨텍스트 타입 정의
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 컨텍스트 프로바이더 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 초기 세션 로드 및 인증 상태 변화 감지
  useEffect(() => {
    const supabase = createClientBrowser();
    
    // 현재 세션 가져오기
    const getInitialSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('세션 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession();
    
    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );
    
    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // 로그아웃 함수
  const signOut = async () => {
    try {
      const supabase = createClientBrowser();
      
      // Supabase 세션 로그아웃
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('로그아웃 오류:', error);
        return;
      }
      
      // 상태 초기화
      setUser(null);
      setSession(null);
      
      // Supabase 프로젝트 ref 추출
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]?.split('https://')[1];
      
      // 모든 관련 쿠키 삭제 (path와 도메인 옵션 다양하게 시도)
      const cookieOptions = [
        { path: '/', domain: '' },
        { path: '/', domain: window.location.hostname }
      ];
      
      const cookiesToClear = [
        `sb-${projectRef}-auth-token`,
        `sb-access-token`,
        `sb-refresh-token`,
        `supabase-auth-token`,
        `__client-auth-token`,
        `__supabase_auth_token`
      ];
      
      // 모든 옵션 조합으로 쿠키 삭제 시도
      cookieOptions.forEach(option => {
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; ${option.path ? `path=${option.path};` : ''} ${option.domain ? `domain=${option.domain};` : ''} expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
        });
      });
      
      // 모든 로컬 스토리지 및 세션 스토리지 Supabase 관련 항목 삭제
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          localStorage.removeItem(key);
        }
      }
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          sessionStorage.removeItem(key);
        }
      }
      
      console.log('로그아웃 완료, 모든 세션 및 쿠키 제거됨');
      
      // 페이지 완전 새로고침을 통해 상태 초기화
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (err) {
      console.error('로그아웃 중 오류 발생:', err);
    }
  };
  
  // 세션 새로고침 함수
  const refreshSession = async () => {
    const supabase = createClientBrowser();
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
  };
  
  // 컨텍스트 값
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signOut,
    refreshSession,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다');
  }
  
  return context;
} 