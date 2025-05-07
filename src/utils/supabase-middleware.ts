import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  // 응답 객체 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabase 클라이언트 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean }) {
          // 응답 헤더에 쿠키 설정
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          // 응답 헤더에서 쿠키 삭제
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // 세션 갱신
  await supabase.auth.getUser();

  return response;
} 