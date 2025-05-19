# 암기훈련소 (MemoryTrainingCenter)

두뇌 운동을 위한 플래시퀴즈 학습 애플리케이션입니다. 라이트너 박스 시스템을 기반으로 효율적인 기억 훈련을 도와줍니다.

## 주요 기능

- 라이트너 박스 시스템을 이용한 체계적인 학습
- 과목별 퀴즈 관리
- 플래시퀴즈 추가, 수정, 삭제
- 학습 상태 추적
- 다양한 과목 지원
- 사용자별 학습 진도 관리 (준비 중)

## 기술 스택

- Next.js 15.3
- React 19
- Tailwind CSS 4
- Supabase (데이터베이스 및 백엔드)

## 설치 및 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/wjb127/memorygym2.git
cd memorygym2
```

2. 의존성 패키지 설치
```bash
npm install
```

3. 환경 변수 설정
   - `.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가합니다:
   ```
   # Supabase 설정
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 확인
```
http://localhost:3000
```

## Supabase 설정 방법

### 1. Supabase 계정 및 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정을 생성하거나 로그인합니다.
2. 새 프로젝트를 생성합니다.
3. 프로젝트가 생성되면 대시보드에서 프로젝트 URL과 API 키를 확인할 수 있습니다.

### 2. 데이터베이스 테이블 생성

Supabase 대시보드의 SQL 에디터에서 다음 SQL 쿼리를 실행하여 필요한 테이블을 생성합니다:

```sql
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

-- 플래시퀴즈 테이블 생성
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

-- 사용자별 퀴즈 테이블 생성 (사용자 인증 기능 확장 시 사용)
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
```

### 3. 환경 변수 설정

1. Supabase 대시보드에서 프로젝트 URL과 anon key를 확인합니다:
   - 프로젝트 세팅 > API 메뉴로 이동
   - URL과 `anon` `public` 항목의 API 키를 복사

2. 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. 애플리케이션을 재시작하면 Supabase 연결이 활성화됩니다.

### 4. 개발 환경에서 더미 데이터 사용

환경 변수 설정이 되어 있지 않거나 Supabase 연결이 불가능한 경우, 앱은 자동으로 더미 데이터를 사용합니다. 이는 로컬 개발 환경에서 Supabase 없이도 앱을 테스트할 수 있게 해줍니다.

### 5. 데이터베이스 스키마

현재 애플리케이션에서 사용하는 테이블은 다음과 같습니다:

- **subjects**: 과목 정보를 저장하는 테이블
- **flashcards**: 플래시퀴즈 정보를 저장하는 테이블
- **review_intervals**: 각 라이트너 박스 별 복습 간격을 저장하는 테이블
- **user_cards**: 사용자별 학습 진도를 저장하는 테이블 (사용자 인증 기능 구현 후 활성화 예정)

## 문제 해결

1. **과목 로드 오류**가 발생할 경우:
   - Supabase 연결 설정을 확인하세요.
   - SQL 쿼리가 모두 성공적으로 실행되었는지 확인하세요.
   - Supabase 콘솔에서 테이블이 제대로 생성되었는지 확인하세요.

2. **인증 오류**가 발생할 경우:
   - API 키가 올바르게 설정되었는지 확인하세요.
   - RLS 정책이 제대로 설정되었는지 확인하세요.

3. **테이블 삭제 오류**가 발생할 경우:
   - 테이블 간 의존성이 있을 수 있습니다.
   - `DROP TABLE IF EXISTS table_name CASCADE;` 명령을 사용하여 의존성 있는 테이블도 함께 삭제하세요.

## 기여 방법

1. 이 저장소를 포크합니다.
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경 사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## Vercel 배포 시 Supabase 설정

### Supabase 데이터베이스 설정

1. Supabase 콘솔에서 SQL 편집기로 이동합니다.
2. `create_feedback_table.sql` 파일의 내용을 복사하여 실행합니다. 이 작업은 다음을 수행합니다:
   - `feedback` 테이블이 없는 경우 테이블을 생성합니다.
   - `create_feedback_table()` 함수를 만들어 API에서 사용할 수 있게 합니다.
   - 익명 사용자가 피드백을 제출할 수 있도록 RLS(Row Level Security) 정책을 설정합니다.

### Vercel 환경 변수 설정

Vercel 프로젝트 설정에서 다음 환경 변수를 설정해야 합니다:

1. `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 익명 키
3. `SLACK_WEBHOOK_URL` - 피드백 알림을 받을 슬랙 웹훅 URL
4. 다른 모든 환경 변수 - `.env.local`에서 Vercel로 복사

## 문제 해결

### 피드백 제출 오류

"Supabase 에러: {}" 오류가 발생하는 경우 다음을 확인하세요:

1. Supabase 프로젝트가 활성 상태인지 확인합니다.
2. Vercel에 설정된 환경 변수가 올바른지 확인합니다.
3. `feedback` 테이블이 Supabase에 생성되었는지 확인합니다.
4. RLS 정책이 익명 사용자의 INSERT를 허용하는지 확인합니다.

### 슬랙 알림 오류

"슬랙 알림 전송 실패" 오류가 발생하는 경우:

1. Vercel 설정에서 `SLACK_WEBHOOK_URL` 환경 변수가 올바르게 설정되었는지 확인합니다.
2. 슬랙 웹훅 URL이 유효한지 확인합니다. 필요한 경우 슬랙 앱 설정에서 새 웹훅을 생성합니다.
