'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signInWithEmail, signOut as supabaseSignOut } from '@/utils/supabase-client';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 테스트 사용자
const TEST_USER = {
  id: "user-test-1",
  email: "wjb127@naver.com",
  name: "테스트 계정"
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 페이지 로드시 저장된 세션 확인
  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('✅ [Auth] 저장된 세션 복원:', userData.email);
      } catch (error) {
        console.error('❌ [Auth] 세션 복원 오류:', error);
        localStorage.removeItem('auth-user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔑 [Auth] 로그인 시도:', email);

      // 테스트 계정 확인
      if (email === TEST_USER.email && password === 'Simon1793@') {
        console.log('🧪 [Auth] 테스트 계정 로그인 성공');
        setUser(TEST_USER);
        localStorage.setItem('auth-user', JSON.stringify(TEST_USER));
        return true;
      }

      // Supabase 로그인 시도
      const result = await signInWithEmail(email, password);
      
      if (result.error || !result.data?.user) {
        console.error('❌ [Auth] Supabase 로그인 실패:', result.error?.message);
        return false;
      }

      const supabaseUser = result.data.user;
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0]
      };

      console.log('✅ [Auth] Supabase 로그인 성공:', userData.email);
      setUser(userData);
      localStorage.setItem('auth-user', JSON.stringify(userData));
      return true;

    } catch (error) {
      console.error('❌ [Auth] 로그인 오류:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 [Auth] 로그아웃 시도');
      
      // Supabase 로그아웃 (테스트 계정이 아닌 경우)
      if (user && user.id !== TEST_USER.id) {
        await supabaseSignOut();
      }
      
      setUser(null);
      localStorage.removeItem('auth-user');
      console.log('✅ [Auth] 로그아웃 완료');
    } catch (error) {
      console.error('❌ [Auth] 로그아웃 오류:', error);
      // 오류가 있어도 로컬 상태는 정리
      setUser(null);
      localStorage.removeItem('auth-user');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  console.log('🏠 [Auth Context] 상태:', {
    hasUser: !!user,
    loading,
    isAuthenticated: !!user,
    userEmail: user?.email
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 