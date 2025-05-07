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
  
  // 디버깅 로그
  console.log(`[미들웨어] 경로 접근: ${pathname}`);
  
  // 세션 갱신만 수행하고 페이지 내부에서 인증 처리
  return await updateSession(request);
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    // 모든 경로에 대해 미들웨어 실행
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 