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

    // Capacitor 환경에서 URL 이벤트 처리
    const setupCapacitorUrlListener = async () => {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { App } = await import('@capacitor/app');
        
        console.log('📱 [Capacitor] URL 리스너 설정');
        
        App.addListener('appUrlOpen', (event) => {
          console.log('📱 [Capacitor] URL 이벤트 수신:', event.url);
          
          // OAuth 콜백 URL 처리 (커스텀 스키마)
          if (event.url.includes('auth/callback')) {
            console.log('🔐 [Capacitor] OAuth 콜백 URL 감지 (커스텀 스키마)');
            handleOAuthCallback(event.url);
            
            // 앱 내 브라우저 닫기
            import('@capacitor/browser').then(({ Browser }) => {
              Browser.close();
              console.log('🔄 [Browser] 앱 내 브라우저 닫기');
            });
          }
          // Vercel 웹사이트 리디렉션 처리
          else if (event.url.includes('memorygym2.vercel.app') && 
                   (event.url.includes('#access_token') || event.url.includes('?access_token'))) {
            console.log('🔐 [Capacitor] OAuth 콜백 URL 감지 (웹 리디렉션)');
            handleOAuthCallback(event.url);
            
            // 앱 내 브라우저 닫기
            import('@capacitor/browser').then(({ Browser }) => {
              Browser.close();
              console.log('🔄 [Browser] 앱 내 브라우저 닫기');
            });
          }
        });
      }
    };

    // OAuth 콜백 처리 함수
    const handleOAuthCallback = (url: string) => {
      try {
        console.log('🔗 [Capacitor] OAuth 콜백 처리 시작:', url);
        
        // URL에서 fragment 또는 query 파라미터 추출
        const urlObj = new URL(url);
        let searchParams: URLSearchParams;
        
        // fragment (#) 또는 query (?) 파라미터 확인
        if (urlObj.hash) {
          const fragment = urlObj.hash.substring(1); // # 제거
          searchParams = new URLSearchParams(fragment);
          console.log('🔗 [Capacitor] Fragment에서 파라미터 추출:', fragment);
        } else {
          searchParams = new URLSearchParams(urlObj.search);
          console.log('🔗 [Capacitor] Query에서 파라미터 추출:', urlObj.search);
        }
        
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const tokenType = searchParams.get('token_type');
        const expiresIn = searchParams.get('expires_in');
        
        console.log('🔑 [Capacitor] 토큰 정보:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          tokenType,
          expiresIn
        });
        
        if (accessToken) {
          console.log('🔗 [Capacitor] 토큰 발견, 세션 설정 중...');
          
          // 토큰을 사용하여 세션 설정
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          }).then(({ data, error }) => {
            if (error) {
              console.error('❌ [Capacitor] 세션 설정 오류:', error);
              setLoading(false);
            } else if (data.session) {
              console.log('✅ [Capacitor] 세션 설정 성공:', data.session.user?.email);
              setSession(data.session);
              setUser(data.session.user);
              setLoading(false);
            }
          });
        } else {
          console.warn('⚠️ [Capacitor] 토큰을 찾을 수 없음');
          setLoading(false);
        }
      } catch (urlError) {
        console.error('❌ [Capacitor] URL 파싱 오류:', urlError);
        setLoading(false);
      }
    };

    setupCapacitorUrlListener();

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
      
      // 모바일 환경 감지
      const isCapacitor = typeof window !== 'undefined' && 
                         (window as any).Capacitor !== undefined;
      
      console.log('📱 [Supabase Auth] 환경 감지:', { 
        isCapacitor, 
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
      });
      
      if (isCapacitor) {
        // Capacitor 환경에서는 iframe을 사용하여 앱 내에서 OAuth 처리
        console.log('📱 [Supabase Auth] Capacitor 환경 - iframe 사용');
        
        // OAuth URL 생성
        const redirectTo = 'com.memorygym.flashcards://auth/callback';
        console.log('📱 [Supabase Auth] Capacitor 환경 - 커스텀 스키마 사용:', redirectTo);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (error) {
          console.error('❌ [Supabase Auth] OAuth URL 생성 오류:', error);
          throw error;
        }

        if (data.url) {
          console.log('🌐 [Supabase Auth] OAuth URL 생성 성공, 현재 WebView에서 처리:', data.url);
          
          // 현재 WebView에서 직접 OAuth URL로 이동
          window.location.href = data.url;
          
          console.log('✅ [Supabase Auth] OAuth 페이지로 리디렉션');
        }
      } else {
        // 웹 환경에서는 기존 방식 사용
        let redirectTo = `${window.location.origin}`;
        
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (error) {
          console.error('❌ [Supabase Auth] 구글 로그인 오류:', error);
          throw error;
        }
        
        console.log('✅ [Supabase Auth] OAuth 요청 성공 - 리디렉션 대기 중');
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