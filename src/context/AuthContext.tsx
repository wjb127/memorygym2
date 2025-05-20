'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

// 인증 컨텍스트 타입 정의
export type AuthContextType = {
  user: Session['user'] | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 컨텍스트 프로바이더 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(status === "loading");
  const [user, setUser] = useState<Session['user'] | null>(null);
  
  // 세션 상태가 변경될 때마다 사용자 정보 업데이트
  useEffect(() => {
    setIsLoading(status === "loading");
    
    if (status === "authenticated" && session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session, status]);
  
  // 로그아웃 함수
  const signOut = async () => {
    try {
      await nextAuthSignOut({ callbackUrl: '/' });
    } catch (err) {
      console.error('로그아웃 중 오류 발생:', err);
    }
  };
  
  // 컨텍스트 값
  const value: AuthContextType = {
    user,
    isLoading,
    signOut,
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