import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// IP별 요청 횟수를 추적할 저장소
const ipStore: Record<string, { count: number; lastReset: number }> = {};

// 기본 설정: 1분당 3회 요청 제한
const MAX_REQUESTS = 3;       // 최대 요청 횟수
const WINDOW_SIZE = 60 * 1000; // 시간 창 (1분)

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

// Next.js 미들웨어 설정
export const middleware = rateLimit;

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: ['/api/feedback/:path*'],
}; 