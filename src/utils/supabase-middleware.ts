import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  // 응답 객체 생성
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabase project ref 추출하여 쿠키 이름 동적 생성
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]?.split('https://')[1];
  const authCookieName = `sb-${projectRef}-auth-token`;
  
  console.log(`[미들웨어] 동적 쿠키 이름: ${authCookieName}`);
  console.log(`[미들웨어] 쿠키 존재 여부: ${!!request.cookies.get(authCookieName)}`);

  // Supabase 클라이언트 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // 인증 토큰 쿠키인 경우 동적 이름 사용
          if (name === 'sb-auth-token') {
            return request.cookies.get(authCookieName)?.value;
          }
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