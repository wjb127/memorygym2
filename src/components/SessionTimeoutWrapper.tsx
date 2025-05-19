'use client';

import dynamic from 'next/dynamic';

// 클라이언트 사이드에서만 로드되도록 동적 임포트
const SessionTimeoutHandler = dynamic(() => import('./SessionTimeoutHandler'), {
  ssr: false, // 서버 사이드 렌더링 비활성화
});

export default function SessionTimeoutWrapper() {
  return <SessionTimeoutHandler />;
} 