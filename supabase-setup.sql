-- 기존 트리거와 함수 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 기존 테이블 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS flashcards;
DROP TABLE IF EXISTS review_intervals;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS profiles;

-- 사용자 프로필 테이블 (auth.users와 연결)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 과목 테이블
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 복습 간격 테이블
CREATE TABLE review_intervals (
  box_number INTEGER PRIMARY KEY,
  interval_days INTEGER NOT NULL
);

-- 플래시카드 테이블
CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  box_number INTEGER DEFAULT 1,
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  next_review TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_admin_card BOOLEAN DEFAULT FALSE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 기존 정책 삭제
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 볼 수 있음" ON profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 수정할 수 있음" ON profiles;
DROP POLICY IF EXISTS "사용자는 자신이 만든 과목만 볼 수 있음" ON subjects;
DROP POLICY IF EXISTS "사용자는 자신이 만든 과목만 수정할 수 있음" ON subjects;
DROP POLICY IF EXISTS "사용자는 자신이 만든 과목만 삭제할 수 있음" ON subjects;
DROP POLICY IF EXISTS "사용자는 과목을 생성할 수 있음" ON subjects;
DROP POLICY IF EXISTS "사용자는 자신이 만든 카드와 관리자 카드를 볼 수 있음" ON flashcards;
DROP POLICY IF EXISTS "사용자는 자신이 만든 카드만 수정할 수 있음" ON flashcards;
DROP POLICY IF EXISTS "사용자는 자신이 만든 카드만 삭제할 수 있음" ON flashcards;
DROP POLICY IF EXISTS "사용자는 카드를 생성할 수 있음" ON flashcards;

-- RLS(Row Level Security) 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- profiles 테이블 정책
CREATE POLICY "사용자는 자신의 프로필만 볼 수 있음" ON profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "사용자는 자신의 프로필만 수정할 수 있음" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- subjects 테이블 정책
CREATE POLICY "사용자는 자신이 만든 과목만 볼 수 있음" ON subjects
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "사용자는 자신이 만든 과목만 수정할 수 있음" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "사용자는 자신이 만든 과목만 삭제할 수 있음" ON subjects
  FOR DELETE USING (auth.uid() = user_id);
  
CREATE POLICY "사용자는 과목을 생성할 수 있음" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- flashcards 테이블 정책
CREATE POLICY "사용자는 자신이 만든 카드와 관리자 카드를 볼 수 있음" ON flashcards
  FOR SELECT USING (auth.uid() = user_id OR is_admin_card = true);
  
CREATE POLICY "사용자는 자신이 만든 카드만 수정할 수 있음" ON flashcards
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "사용자는 자신이 만든 카드만 삭제할 수 있음" ON flashcards
  FOR DELETE USING (auth.uid() = user_id);
  
CREATE POLICY "사용자는 카드를 생성할 수 있음" ON flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자 프로필 트리거 설정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 초기 데이터 삽입 (기존 데이터 삭제 후)
DELETE FROM review_intervals;
INSERT INTO review_intervals (box_number, interval_days) VALUES
  (1, 1),
  (2, 3),
  (3, 7),
  (4, 14),
  (5, 30); 