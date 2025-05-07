'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 환경 변수에서 Supabase URL과 API 키를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Supabase project ref 추출하여 쿠키 이름 동적 생성
const projectRef = supabaseUrl?.split('.')[0]?.split('https://')[1];
const authCookieName = `sb-${projectRef}-auth-token`;

// 서버 컴포넌트에서 사용할 Supabase 클라이언트 (세션 관리 없음)
export async function createClientServer() {
  return createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      }
    }
  );
}

// 서버 액션에서 사용할 Supabase 클라이언트
export async function createSupabaseServerActionClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // 인증 토큰 쿠키인 경우 동적 이름 사용
          if (name === 'sb-auth-token') {
            return cookieStore.get(authCookieName)?.value;
          }
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// 서버 컴포넌트에서 사용할 Supabase 클라이언트 (세션 관리 포함)
export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // 인증 토큰 쿠키인 경우 동적 이름 사용
          if (name === 'sb-auth-token') {
            console.log(`[서버] 동적 쿠키 이름 사용: ${authCookieName}`);
            return cookieStore.get(authCookieName)?.value;
          }
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // 서버 컴포넌트에서는 쿠키 설정이 제한됨
            console.log(`[서버] 쿠키 설정 시도: ${name}`);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // 서버 컴포넌트에서는 쿠키 삭제가 제한됨
            console.log(`[서버] 쿠키 삭제 시도: ${name}`);
          }
        },
      },
    }
  );
} 