import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 직접 로그인 함수
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('로그인 오류:', error.message || '알 수 없는 오류');
    return { data: null, error: { message: error.message || '로그인 처리 중 오류가 발생했습니다.' } };
  }
}

// 회원가입 함수
export async function signUpWithEmail(email: string, password: string, name?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('회원가입 오류:', error.message);
    return { data: null, error };
  }
}

// 로그아웃 함수
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    return { error: null };
  } catch (error: any) {
    console.error('로그아웃 오류:', error.message);
    return { error };
  }
}

// 현재 사용자 세션 가져오기
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    return { session, error: null };
  } catch (error: any) {
    console.error('세션 조회 오류:', error.message);
    return { session: null, error };
  }
}

// 사용자 정보 가져오기
export async function getUserProfile() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return { user, error: null };
  } catch (error: any) {
    console.error('사용자 정보 조회 오류:', error.message);
    return { user: null, error };
  }
}