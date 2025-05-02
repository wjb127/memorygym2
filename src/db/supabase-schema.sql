-- 플래시카드 테이블
CREATE TABLE flashcards (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  front TEXT NOT NULL, -- 단어 (뒷면)
  back TEXT NOT NULL,  -- 뜻 (앞면)
  box_number INTEGER DEFAULT 1, -- 라이트너 상자 번호 (1~5)
  last_reviewed TIMESTAMPTZ DEFAULT NOW(), -- 마지막 학습 일시
  next_review TIMESTAMPTZ DEFAULT NOW(), -- 다음 학습 예정 일시
  is_admin_card BOOLEAN DEFAULT TRUE -- 관리자 카드 여부 (true: 관리자 카드, false: 사용자 카드)
);

-- 사용자별 카드 상자 테이블 (향후 사용)
CREATE TABLE user_cards (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  card_id BIGINT REFERENCES flashcards(id),
  box_number INTEGER DEFAULT 1,
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  next_review TIMESTAMPTZ DEFAULT NOW()
);

-- 박스별 복습 주기 설정 테이블
CREATE TABLE review_intervals (
  box_number INTEGER PRIMARY KEY,
  interval_days INTEGER NOT NULL -- 각 박스별 복습 주기 (일 단위)
);

-- 박스별 복습 주기 초기 데이터
INSERT INTO review_intervals (box_number, interval_days) VALUES
  (1, 1),   -- 1번 상자: 매일
  (2, 3),   -- 2번 상자: 3일마다
  (3, 7),   -- 3번 상자: 일주일마다
  (4, 14),  -- 4번 상자: 2주마다
  (5, 30);  -- 5번 상자: 한 달마다

-- 관리자 카드 샘플 데이터 추가
INSERT INTO flashcards (front, back, box_number, is_admin_card) VALUES
  ('Hello', '안녕하세요', 1, true),
  ('Goodbye', '안녕히 가세요', 1, true),
  ('Thank you', '감사합니다', 1, true),
  ('Sorry', '죄송합니다', 1, true),
  ('Yes', '네', 1, true); 