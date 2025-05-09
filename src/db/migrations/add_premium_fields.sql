-- 사용자 프로필 테이블에 프리미엄 상태 필드 추가
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

-- 프리미엄 플랜 테이블 생성
CREATE TABLE IF NOT EXISTS public.premium_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER NOT NULL,
  max_subjects INTEGER NOT NULL,
  max_cards_per_subject INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 플랜 데이터 추가
INSERT INTO public.premium_plans (name, description, price_monthly, price_yearly, max_subjects, max_cards_per_subject)
VALUES
  ('무료', '기본 무료 플랜', 0, 0, 1, 100),
  ('프리미엄', '무제한 플래시카드와 고급 기능', 9900, 99000, -1, -1); 