-- 기존 테이블이 있으면 삭제 (개발 용도로만 사용)
-- CASCADE 옵션을 사용하여 의존성 있는 테이블도 함께 삭제합니다
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS review_intervals CASCADE;
DROP TABLE IF EXISTS user_cards CASCADE;

-- 과목 테이블 생성
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  description TEXT
);

-- 복습 간격 테이블 생성
CREATE TABLE review_intervals (
  box_number INTEGER PRIMARY KEY,
  interval_days INTEGER NOT NULL
);

-- 플래시카드 테이블 생성
CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  box_number INTEGER NOT NULL DEFAULT 1,
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  next_review TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_admin_card BOOLEAN DEFAULT TRUE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE
);

-- 사용자별 카드 테이블 생성 (이미 존재했던 테이블 재생성)
CREATE TABLE user_cards (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL,
  card_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
  box_number INTEGER NOT NULL DEFAULT 1,
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  next_review TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 외래 키 제약 조건 추가
ALTER TABLE flashcards
  ADD CONSTRAINT fk_flashcards_subject 
  FOREIGN KEY (subject_id) 
  REFERENCES subjects(id) 
  ON DELETE CASCADE;

-- 인덱스 추가
CREATE INDEX idx_flashcards_subject_id ON flashcards(subject_id);
CREATE INDEX idx_flashcards_box_number ON flashcards(box_number);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON user_cards(card_id);

-- 기본 복습 간격 데이터 추가
INSERT INTO review_intervals (box_number, interval_days) VALUES
  (1, 1),   -- 박스 1: 매일
  (2, 3),   -- 박스 2: 3일마다
  (3, 7),   -- 박스 3: 1주일마다
  (4, 14),  -- 박스 4: 2주마다
  (5, 30);  -- 박스 5: 한달마다

-- 기본 과목 데이터 추가
INSERT INTO subjects (name, description) VALUES
  ('영어', '영어 단어와 문장 학습'),
  ('컴퓨터 과학', '프로그래밍과 컴퓨터 과학 용어'),
  ('생물학', '생물학 개념과 용어');

-- RLS(Row Level Security) 정책 설정
-- 모든 사용자가 데이터를 읽고 쓸 수 있도록 설정
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_intervals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 subjects 테이블에 접근 가능" 
  ON subjects FOR ALL 
  USING (true);

CREATE POLICY "모든 사용자가 flashcards 테이블에 접근 가능" 
  ON flashcards FOR ALL 
  USING (true);

CREATE POLICY "모든 사용자가 review_intervals 테이블에 접근 가능" 
  ON review_intervals FOR ALL 
  USING (true);

CREATE POLICY "사용자가 자신의 user_cards 항목에만 접근 가능"
  ON user_cards FOR ALL
  USING (auth.uid() = user_id);

-- 테이블 권한 설정
GRANT ALL ON subjects TO anon, authenticated;
GRANT ALL ON flashcards TO anon, authenticated;
GRANT ALL ON review_intervals TO anon, authenticated;
GRANT ALL ON user_cards TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 