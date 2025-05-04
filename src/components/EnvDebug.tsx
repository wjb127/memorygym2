'use client';

import { useState } from 'react';

export default function EnvDebug() {
  const [showDebug, setShowDebug] = useState(false);

  const envVars = {
    // PortOne V2 환경변수
    NEXT_PUBLIC_PORTONE_STORE_ID: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '설정되지 않음',
    NEXT_PUBLIC_PORTONE_CHANNEL_KEY: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ? 
      `${process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY.substring(0, 8)}...` : '설정되지 않음',
    PORTONE_V2_API_SECRET_PREFIX: process.env.PORTONE_V2_API_SECRET ? 
      `${process.env.PORTONE_V2_API_SECRET.substring(0, 8)}...` : '설정되지 않음',
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