'use client';

import { useState } from 'react';

export default function EnvDebug() {
  const [showDebug, setShowDebug] = useState(false);

  const envVars = {
    NEXT_PUBLIC_IAMPORT_MERCHANT_ID: process.env.NEXT_PUBLIC_IAMPORT_MERCHANT_ID,
    // 보안을 위해 API 키와 시크릿 키는 전체가 아닌 일부만 표시합니다
    IAMPORT_API_KEY_PREFIX: process.env.IAMPORT_API_KEY ? 
      `${process.env.IAMPORT_API_KEY.substring(0, 4)}...` : '설정되지 않음',
    IAMPORT_API_SECRET_PREFIX: process.env.IAMPORT_API_SECRET ? 
      `${process.env.IAMPORT_API_SECRET.substring(0, 4)}...` : '설정되지 않음',
  };

  return (
    <div className="mt-4 text-sm">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        {showDebug ? '디버그 정보 숨기기' : '환경변수 확인'}
      </button>
      
      {showDebug && (
        <div className="mt-2 p-3 bg-gray-100 rounded border border-gray-300 overflow-auto text-left">
          <h3 className="font-medium mb-2">환경변수 정보:</h3>
          <pre className="text-xs">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 