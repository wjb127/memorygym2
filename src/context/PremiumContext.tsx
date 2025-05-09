'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/utils/supabase';

// 프리미엄 플랜 타입 정의
export type PremiumPlan = {
  id: number;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_subjects: number; // -1은 무제한
  max_cards_per_subject: number; // -1은 무제한
};

// 프리미엄 컨텍스트 타입 정의
type PremiumContextType = {
  isPremium: boolean;
  premiumUntil: Date | null;
  currentPlan: PremiumPlan | null;
  isLoading: boolean;
  canAddSubject: boolean;
  canAddCard: (subjectId: number) => Promise<boolean>;
  getSubjectCardCount: (subjectId: number) => Promise<number>;
  refreshPremiumStatus: () => Promise<void>;
  totalSubjectsCount: number;
};

// 기본 무료 플랜
const FREE_PLAN: PremiumPlan = {
  id: 1,
  name: '무료',
  description: '기본 무료 플랜',
  price_monthly: 0,
  price_yearly: 0,
  max_subjects: 1,
  max_cards_per_subject: 100
};

// 기본값으로 컨텍스트 생성
const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// 컨텍스트 프로바이더 컴포넌트
export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PremiumPlan | null>(FREE_PLAN);
  const [isLoading, setIsLoading] = useState(true);
  const [totalSubjectsCount, setTotalSubjectsCount] = useState(0);
  
  // 사용자의 프리미엄 상태 로드
  const loadPremiumStatus = async () => {
    if (!user) {
      setIsPremium(false);
      setPremiumUntil(null);
      setCurrentPlan(FREE_PLAN);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 프로필 정보 가져오기
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium, premium_until')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('프로필 정보 로드 오류:', profileError);
        setIsPremium(false);
        setPremiumUntil(null);
        setCurrentPlan(FREE_PLAN);
      } else {
        // 프리미엄 상태 설정
        const isPremiumUser = profileData?.is_premium || false;
        const premiumUntilDate = profileData?.premium_until ? new Date(profileData.premium_until) : null;
        
        // 만료된 프리미엄 상태 확인
        const isExpired = premiumUntilDate ? new Date() > premiumUntilDate : true;
        
        setIsPremium(isPremiumUser && !isExpired);
        setPremiumUntil(isExpired ? null : premiumUntilDate);
        
        // 현재 플랜 정보 가져오기 (프리미엄이면 프리미엄 플랜, 아니면 무료 플랜)
        if (isPremiumUser && !isExpired) {
          const { data: planData } = await supabase
            .from('premium_plans')
            .select('*')
            .eq('name', '프리미엄')
            .single();
          
          setCurrentPlan(planData || FREE_PLAN);
        } else {
          setCurrentPlan(FREE_PLAN);
        }
      }
      
      // 사용자의 과목 수 가져오기
      const { count, error: countError } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (countError) {
        console.error('과목 수 로드 오류:', countError);
        setTotalSubjectsCount(0);
      } else {
        setTotalSubjectsCount(count || 0);
      }
    } catch (error) {
      console.error('프리미엄 상태 로드 오류:', error);
      setIsPremium(false);
      setPremiumUntil(null);
      setCurrentPlan(FREE_PLAN);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 사용자 변경 시 프리미엄 상태 로드
  useEffect(() => {
    loadPremiumStatus();
  }, [user]);
  
  // 새 과목을 추가할 수 있는지 확인
  const canAddSubject = isPremium || 
    (currentPlan !== null && totalSubjectsCount < currentPlan.max_subjects);
  
  // 특정 과목에 새 카드를 추가할 수 있는지 확인
  const canAddCard = async (subjectId: number) => {
    if (isPremium) return true;
    
    try {
      // 해당 과목의 카드 수 확인
      const cardCount = await getSubjectCardCount(subjectId);
      return cardCount < (currentPlan?.max_cards_per_subject || 100);
    } catch (error) {
      console.error('카드 추가 가능 여부 확인 오류:', error);
      return false;
    }
  };
  
  // 특정 과목의 카드 수 가져오기
  const getSubjectCardCount = async (subjectId: number): Promise<number> => {
    if (!user) return 0;
    
    try {
      const { count, error } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('subject_id', subjectId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('과목 카드 수 로드 오류:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('과목 카드 수 로드 예외:', error);
      return 0;
    }
  };
  
  // 프리미엄 상태 새로고침
  const refreshPremiumStatus = async () => {
    await loadPremiumStatus();
  };
  
  // 컨텍스트 값
  const value: PremiumContextType = {
    isPremium,
    premiumUntil,
    currentPlan,
    isLoading,
    canAddSubject,
    canAddCard,
    getSubjectCardCount,
    refreshPremiumStatus,
    totalSubjectsCount
  };
  
  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

// 커스텀 훅
export function usePremium() {
  const context = useContext(PremiumContext);
  
  if (context === undefined) {
    throw new Error('usePremium은 PremiumProvider 내부에서만 사용할 수 있습니다');
  }
  
  return context;
} 