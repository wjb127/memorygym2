'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 토큰 만료 모니터링
  useEffect(() => {
    if (!session?.expires_at) return;

    const checkTokenExpiry = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at!;
      const timeUntilExpiry = expiresAt - now;
      
      console.log('⏰ [토큰 모니터링]', {
        현재시간: new Date().toISOString(),
        만료시간: new Date(expiresAt * 1000).toISOString(),
        남은시간_초: timeUntilExpiry,
        남은시간_분: Math.floor(timeUntilExpiry / 60),
        userEmail: user?.email
      });

      if (timeUntilExpiry <= 300) { // 5분 이하 남았을 때 경고
        console.warn('⚠️ [토큰 모니터링] 토큰이 곧 만료됩니다!', {
          남은시간_초: timeUntilExpiry,
          userEmail: user?.email
        });
      }

      if (timeUntilExpiry <= 0) {
        console.error('❌ [토큰 모니터링] 토큰이 만료되었습니다!', {
          userEmail: user?.email
        });
      }
    };

    // 즉시 체크
    checkTokenExpiry();

    // 30초마다 체크
    const interval = setInterval(checkTokenExpiry, 30000);

    return () => clearInterval(interval);
  }, [session?.expires_at, user?.email]);

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      console.log('🚀 [Supabase Auth] 초기 세션 확인 시작');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('🔍 [Supabase Auth] 초기 세션 결과:', {
        hasSession: !!session,
        hasError: !!error,
        userEmail: session?.user?.email,
        expires_at: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A',
        access_token_length: session?.access_token?.length || 0
      });
      
      if (error) {
        console.error('❌ [Supabase Auth] 초기 세션 확인 오류:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Auth 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [Supabase Auth] 인증 상태 변경:', { 
          event, 
          session: !!session, 
          user: session?.user?.email,
          expires_at: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A',
          access_token_length: session?.access_token?.length || 0
        });
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 [Supabase Auth] SIGNED_OUT 이벤트 처리');
          setSession(null);
          setUser(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN') {
          console.log('👋 [Supabase Auth] SIGNED_IN 이벤트 처리');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 [Supabase Auth] TOKEN_REFRESHED 이벤트 처리');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

        } else {
          console.log(`🔄 [Supabase Auth] ${event} 이벤트 처리`);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('🚀 [Supabase Auth] 구글 로그인 시도');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });

      if (error) {
        console.error('❌ [Supabase Auth] 구글 로그인 오류:', error);
        throw error;
      }
    } catch (error) {
      console.error('💥 [Supabase Auth] 로그인 처리 중 오류:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 [Supabase Auth] 로그아웃 시도');
      console.log('🔍 [Supabase Auth] 현재 세션:', !!session);
      console.log('🔍 [Supabase Auth] 현재 사용자:', user?.email);
      
      // 즉시 상태 초기화 (UI 반응성 향상)
      setSession(null);
      setUser(null);
      setLoading(false);
      console.log('🔄 [Supabase Auth] 클라이언트 상태 즉시 초기화');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [Supabase Auth] 로그아웃 오류:', error);
        throw error;
      }
      
      // 로컬 스토리지 정리 (혹시 남아있는 인증 관련 데이터 제거)
      try {
        localStorage.clear();
        sessionStorage.clear();
        // Supabase 관련 쿠키도 정리
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        console.log('🧹 [Supabase Auth] 로컬 스토리지 및 쿠키 정리 완료');
      } catch (storageError) {
        console.warn('⚠️ [Supabase Auth] 스토리지 정리 중 경고:', storageError);
      }
      
      console.log('✅ [Supabase Auth] 로그아웃 성공 - 상태 초기화 완료');
      
      // 확실한 상태 초기화를 위해 페이지 새로고침
      console.log('🔄 [Supabase Auth] 페이지 새로고침 시작');
      window.location.replace('/');
      
    } catch (error) {
      console.error('💥 [Supabase Auth] 로그아웃 처리 중 오류:', error);
      
      // 오류가 발생해도 강제로 상태 초기화
      setSession(null);
      setUser(null);
      setLoading(false);
      localStorage.clear();
      sessionStorage.clear();
      
      // 오류 발생 시에도 페이지 새로고침
      window.location.replace('/');
      
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      console.log('🗑️ [계정 삭제] 시작');
      
      if (!session?.access_token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '계정 삭제에 실패했습니다.');
      }

      console.log('✅ [계정 삭제] 성공');
      
      // 계정 삭제 후 상태 초기화
      setSession(null);
      setUser(null);
      setLoading(false);
      
      // 로컬 스토리지 정리
      localStorage.clear();
      sessionStorage.clear();
      
    } catch (error) {
      console.error('💥 [계정 삭제] 오류:', error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      console.log('🔄 [세션 갱신] 수동 갱신 시작');
      
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ [세션 갱신] 갱신 실패:', error);
        throw error;
      }
      
      if (session) {
        console.log('✅ [세션 갱신] 갱신 성공:', {
          userEmail: session.user?.email,
          expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A'
        });
        setSession(session);
        setUser(session.user);
      } else {
        console.warn('⚠️ [세션 갱신] 갱신 후 세션이 없음');
      }
      
    } catch (error) {
      console.error('💥 [세션 갱신] 갱신 중 오류:', error);
      throw error;
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    console.log('🔑 [AuthProvider] getAuthHeaders 호출:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      userEmail: user?.email,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A'
    });

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      console.warn('⚠️ [AuthProvider] 세션 또는 액세스 토큰이 없습니다!');
    }

    return headers;
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    deleteAccount,
    refreshSession,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 