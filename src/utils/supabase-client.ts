import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서비스 역할 키를 사용하는 관리자 클라이언트 (서버 측에서만 사용)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

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

// 비밀번호 업데이트 함수 (클라이언트 측에서 사용)
export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    console.log(`[Supabase Client] 비밀번호 업데이트 시도 - 사용자 ID: ${userId}`);
    
    // 클라이언트 측에서는 현재 로그인된 사용자의 비밀번호만 변경 가능
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('[Supabase Client] 비밀번호 업데이트 실패:', error);
      return { data: null, error };
    }
    
    console.log('[Supabase Client] 비밀번호 업데이트 성공');
    return { data, error: null };
  } catch (error: any) {
    console.error('[Supabase Client] 비밀번호 업데이트 예외:', error.message);
    return { 
      data: null, 
      error: { 
        message: error.message || '비밀번호 업데이트 중 오류가 발생했습니다.' 
      } 
    };
  }
}

// 관리자 권한으로 비밀번호 업데이트 (서버 측에서만 사용)
export async function updateUserPasswordAdmin(userId: string, newPassword: string) {
  try {
    console.log(`[Supabase Admin] 관리자 권한으로 비밀번호 업데이트 시도 - 사용자 ID: ${userId}`);
    
    if (!supabaseAdmin) {
      console.error('[Supabase Admin] 서비스 역할 키가 설정되지 않았습니다.');
      return { 
        data: null, 
        error: { message: '서버 구성 오류: 관리자 권한이 설정되지 않았습니다.' } 
      };
    }
    
    // 서비스 역할 키를 사용하여 사용자 비밀번호 변경
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );
    
    if (error) {
      console.error('[Supabase Admin] 비밀번호 업데이트 실패:', error);
      return { data: null, error };
    }
    
    console.log('[Supabase Admin] 비밀번호 업데이트 성공');
    return { data, error: null };
  } catch (error: any) {
    console.error('[Supabase Admin] 비밀번호 업데이트 예외:', error.message);
    return { 
      data: null, 
      error: { 
        message: error.message || '관리자 권한으로 비밀번호 업데이트 중 오류가 발생했습니다.' 
      } 
    };
  }
}