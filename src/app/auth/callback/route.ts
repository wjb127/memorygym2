import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';
    
    if (code) {
      // Supabase 클라이언트 생성
      const supabase = createRouteHandlerClient({ cookies });
      
      // OAuth 코드를 세션으로 교환
      await supabase.auth.exchangeCodeForSession(code);
      
      // 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      // 세션이 성공적으로 생성되었는지 확인
      if (session) {
        console.log('인증 성공: 사용자 로그인 완료');
      } else {
        console.error('인증 실패: 세션을 생성하지 못했습니다.');
      }
    }
    
    // 리다이렉트 (next 파라미터가 있으면 해당 URL로, 없으면 홈페이지로)
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error('인증 콜백 처리 중 오류:', error);
    // 오류 발생 시 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
  }
} 