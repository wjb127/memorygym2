import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증이 필요한 경로들
const protectedPaths = ['/admin', '/dashboard'];

// 공개 경로들 (인증 불필요)
const publicPaths = [
  '/', 
  '/login', 
  '/signup', 
  '/api/cards', 
  '/api/subjects',
  '/terms',
  '/privacy',
  '/refund-policy',
  '/service'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log(`[Middleware] 요청 경로: ${pathname}`);
  
  // 정적 리소스는 통과
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // 공개 경로는 모두 허용
  if (publicPaths.includes(pathname) || pathname.startsWith('/api/')) {
    console.log(`[Middleware] 공개 경로 접근: ${pathname}`);
    return NextResponse.next();
  }
  
  // 보호된 경로 체크 (현재는 없음)
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    console.log(`[Middleware] 보호된 경로 접근 시도: ${pathname}`);
    // 향후 관리자 페이지 등에서 사용할 수 있음
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청 경로에 매치:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 