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
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Auth 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [Supabase Auth] 인증 상태 변경:', { event, session: !!session, user: session?.user?.email });
        
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
        } else {
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

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
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