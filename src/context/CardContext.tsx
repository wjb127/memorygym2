'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CardContextType {
  lastUpdated: number;
  refreshCards: () => void;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export function CardProvider({ children }: { children: ReactNode }) {
  // 마지막 업데이트 시간 상태 (타임스탬프)
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  
  // 카드 목록 새로고침 함수
  const refreshCards = useCallback(() => {
    const newTimestamp = Date.now();
    console.log(`[CardContext] refreshCards 호출됨: ${new Date(newTimestamp).toLocaleTimeString()}`);
    console.log(`[CardContext] 이전 lastUpdated: ${new Date(lastUpdated).toLocaleTimeString()}`);
    setLastUpdated(newTimestamp);
  }, [lastUpdated]);
  
  return (
    <CardContext.Provider value={{ lastUpdated, refreshCards }}>
      {children}
    </CardContext.Provider>
  );
}

// 컨텍스트 사용을 위한 커스텀 훅
export function useCards() {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
} 