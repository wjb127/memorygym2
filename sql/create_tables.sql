-- 결제 정보 테이블
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id TEXT NOT NULL,
  merchant_uid TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  payment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 구독 정보 테이블
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_type TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 사용자 테이블에 프리미엄 상태 필드 추가
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

-- 행 수준 보안 정책 설정
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 결제 테이블 정책: 사용자는 자신의 결제 정보만 볼 수 있음
CREATE POLICY "Users can view their own payments" 
ON public.payments FOR SELECT 
USING (auth.uid() = user_id);

-- 구독 테이블 정책: 사용자는 자신의 구독 정보만 볼 수 있음
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- 관리자는 모든 데이터 접근 가능 (관리자 롤 기준)
CREATE POLICY "Admins can do anything with payments" 
ON public.payments 
USING (auth.jwt() ? 'admin'::text);

CREATE POLICY "Admins can do anything with subscriptions" 
ON public.subscriptions 
USING (auth.jwt() ? 'admin'::text); 