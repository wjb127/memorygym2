import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';
    const redirectedFrom = requestUrl.searchParams.get('redirectedFrom');
    
    // 리다이렉트 대상 URL 결정
    const redirectTo = redirectedFrom || next || '/';
    
    console.log(`[인증 콜백] 요청 URL: ${request.url}`);
    console.log(`[인증 콜백] 코드 존재: ${!!code}, 리다이렉트 대상: ${redirectTo}`);
    
    if (code) {
      // Supabase 클라이언트 생성
      const supabase = await createClient();
      
      // OAuth 코드를 세션으로 교환
      console.log('[인증 콜백] 코드 교환 시작');
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('[인증 콜백] 코드 교환 오류:', exchangeError);
        return NextResponse.redirect(new URL('/login?error=exchange_error', request.url));
      }
      
      console.log('[인증 콜백] 코드 교환 성공');
      
      // 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[인증 콜백] 세션 확인 오류:', sessionError);
        return NextResponse.redirect(new URL('/login?error=session_error', request.url));
      }
      
      if (!session) {
        console.error('[인증 콜백] 세션이 없습니다.');
        return NextResponse.redirect(new URL('/login?error=no_session', request.url));
      }
      
      console.log('[인증 콜백] 세션 확인 성공, 사용자:', session.user.email);
      
      // 세션 쿠키 설정 확인 - 쿠키 로깅 제거 (린터 오류 방지)
      console.log('[인증 콜백] 세션 쿠키 설정 완료');
      
      // 리다이렉트할 URL 생성
      const finalUrl = new URL(redirectTo, requestUrl.origin);
      
      // 인증 성공 파라미터 추가 (로그인 페이지에서 세션 확인용)
      if (redirectTo.startsWith('/login')) {
        finalUrl.searchParams.set('auth_success', 'true');
      }
      
      console.log(`[인증 콜백] 최종 리다이렉트 URL: ${finalUrl.toString()}`);
      
      // 세션 정보를 포함한 응답 생성
      return NextResponse.redirect(finalUrl);
    } else {
      console.error('[인증 콜백] 인증 코드가 없습니다.');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }
  } catch (error) {
    console.error('[인증 콜백] 처리 중 오류:', error);
    // 오류 발생 시 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
  }
} 