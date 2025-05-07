import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase-middleware';

// IP별 요청 횟수를 추적할 저장소
const ipStore: Record<string, { count: number; lastReset: number }> = {};

// 기본 설정: 1분당 3회 요청 제한
const MAX_REQUESTS = 3;       // 최대 요청 횟수
const WINDOW_SIZE = 60 * 1000; // 시간 창 (1분)

// 보호된 라우트 목록
const protectedRoutes = [
  '/premium',
  '/payments',
];

// 인증이 필요하지 않은 라우트 목록
const authRoutes = [
  '/login',
  '/signup',
  '/reset-password',
];

/**
 * 속도 제한을 적용할 미들웨어 함수
 * @param request 
 * @returns 
 */
async function rateLimit(request: NextRequest) {
  // 피드백 API 경로에만 적용
  if (!request.nextUrl.pathname.startsWith('/api/feedback')) {
    return NextResponse.next();
  }

  // IP 주소 가져오기 (X-Forwarded-For 헤더 사용)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown-ip';
  const now = Date.now();

  // IP별 추적 데이터 초기화
  if (!ipStore[ip]) {
    ipStore[ip] = { count: 0, lastReset: now };
  }

  // 시간 창이 지나면 카운터 리셋
  if (now - ipStore[ip].lastReset > WINDOW_SIZE) {
    ipStore[ip] = { count: 0, lastReset: now };
  }

  // 요청 횟수 증가
  ipStore[ip].count += 1;

  // 요청 제한 초과 확인
  if (ipStore[ip].count > MAX_REQUESTS) {
    // 제한 초과 시 429 Too Many Requests 응답
    return new NextResponse(
      JSON.stringify({
        error: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.'
      }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60' // 60초 후 재시도 가능
        }
      }
    );
  }

  // 헤더에 남은 요청 수 정보 추가
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
  response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - ipStore[ip].count).toString());
  response.headers.set('X-RateLimit-Reset', (ipStore[ip].lastReset + WINDOW_SIZE).toString());
  
  return response;
}

export async function middleware(request: NextRequest) {
  // 현재 경로 확인
  const { pathname } = request.nextUrl;
  
  // 인증이 필요한 페이지에 접근하려는 경우
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // 인증 관련 페이지에 접근하려는 경우
  const isAuthRoute = authRoutes.some(route => pathname === route);
  
  // 세션 갱신
  const response = await updateSession(request);
  
  // 세션 확인이 필요한 경우에만 추가 처리
  if (isProtectedRoute || isAuthRoute) {
    // 쿠키 디버깅 로그
    console.log(`[미들웨어] 경로: ${pathname}`);
    console.log(`[미들웨어] 요청 쿠키:`, Object.fromEntries(request.cookies.getAll().map(cookie => [cookie.name, cookie.value.substring(0, 10) + '...'])));
    
    // 세션 확인을 위한 Supabase 클라이언트는 이미 updateSession에서 생성되었음
    // 이제 응답에 설정된 쿠키를 확인하여 세션 여부 판단
    const supabaseCookie = response.cookies.get('sb-access-token') || response.cookies.get('sb-refresh-token');
    const hasSession = !!supabaseCookie;
    
    console.log(`[미들웨어] 세션 확인 결과: ${hasSession ? '세션 있음' : '세션 없음'}`);
    
    // 세션이 있으면 로그인 상태로 간주
    if (hasSession) {
      // 이미 로그인한 상태에서 인증 페이지에 접근하는 경우 -> 홈페이지로 리다이렉트
      if (isAuthRoute) {
        console.log(`[미들웨어] 인증 경로 ${pathname}에 접근 시도, 로그인됨. 홈으로 리다이렉트`);
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      return response;
    }
    
    // 인증이 필요한 페이지인데 로그인이 안 된 경우 -> 로그인 페이지로 리다이렉트
    if (isProtectedRoute) {
      console.log(`[미들웨어] 보호된 경로 ${pathname}에 접근 시도, 로그인 안됨. 로그인으로 리다이렉트`);
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // 그 외의 경우 일반 응답 반환
  return response;
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    // 모든 경로에 대해 미들웨어 실행
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 