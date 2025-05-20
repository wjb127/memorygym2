import { auth } from "./auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요 없는 공개 경로 설정
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/reset-password',
  '/api/auth/',
  '/api/webhook/',
  '/_next/',
  '/favicon.ico',
  '/public/'
];

// 인증이 필요한 경로 설정
const PROTECTED_PATHS = [
  '/api/profile',
  '/api/subjects',
  '/api/cards',
  '/api/premium',
  '/premium'
];

export async function middleware(request: NextRequest) {
  try {
    const currentPath = request.nextUrl.pathname;
    console.log('[Middleware] 요청 경로:', currentPath);
    
    // 인증 확인이 필요한 경로인지 확인
    const isPublicPath = PUBLIC_PATHS.some(path => currentPath.startsWith(path));
    
    // 공개 경로이면서 API가 아닌 경우 인증 없이 통과
    if (isPublicPath && !currentPath.startsWith('/api/')) {
      console.log('[Middleware] 공개 경로 접근:', currentPath);
      return NextResponse.next();
    }
    
    // 보호된 경로 또는 API 요청인 경우 세션 확인
    const isProtectedPath = PROTECTED_PATHS.some(path => currentPath.startsWith(path));
    
    if (isProtectedPath || currentPath.startsWith('/api/')) {
      console.log('[Middleware] 보호된 경로 또는 API 요청:', currentPath);
      
      // Next Auth 세션 확인은 auth 설정의 authorized 콜백에서 처리됨
      // 미들웨어에서는 세션 토큰만 검증하고 통과시킴
      const authHeader = request.headers.get('authorization');
      const cookieHeader = request.headers.get('cookie');
      
      // API 요청인데 인증 헤더나 쿠키가 없는 경우
      if (currentPath.startsWith('/api/') && !authHeader && !cookieHeader) {
        console.log('[Middleware] API 요청 인증 정보 없음');
        return NextResponse.json(
          { error: '로그인이 필요합니다.' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] 오류:', error);
    
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: '미들웨어 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 