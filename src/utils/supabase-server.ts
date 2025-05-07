'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 환경 변수에서 Supabase URL과 API 키를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// 서버 컴포넌트에서 사용할 Supabase 클라이언트 (세션 관리 없음)
export const createClientServer = () => 
  createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      }
    }
  );

// 서버 액션에서 사용할 Supabase 클라이언트
export const createSupabaseServerActionClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
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
};

// 서버 컴포넌트에서 사용할 Supabase 클라이언트 (세션 관리 포함)
export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // 서버 컴포넌트에서는 쿠키 설정이 제한됨
            console.log(`[서버] 쿠키 설정 시도: ${name} - 미들웨어에서 처리됨`);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // 서버 컴포넌트에서는 쿠키 삭제가 제한됨
            console.log(`[서버] 쿠키 삭제 시도: ${name} - 미들웨어에서 처리됨`);
          }
        },
      },
    }
  );
} 