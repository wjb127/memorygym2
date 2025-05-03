# 라이트너 상자 웹 애플리케이션

라이트너 상자 학습법을 웹 애플리케이션으로 구현한 프로젝트입니다. 
외국어 단어, 용어 등을 효율적으로 학습할 수 있는 시스템입니다.

## 주요 기능

- 5단계 라이트너 상자 시스템
- 매일 학습해야 할 카드 자동 추천
- 카드 관리 (추가, 삭제)
- 상자별 카드 관리
- 학습 결과 통계
- 사용자 피드백 기능 (슬랙 알림 포함)

## 기술 스택

- Next.js 15
- React 19
- Supabase (인증 및 데이터베이스)
- TypeScript
- Tailwind CSS
- Slack API (피드백 알림)

## 설치 및 실행 방법

1. 저장소 복제
```bash
git clone [저장소 URL]
cd memorygym2
```

2. 의존성 설치
```bash
npm install
```

3. Supabase 설정
   - [Supabase](https://supabase.com)에 가입하고 새 프로젝트 생성
   - 프로젝트 API 키와 URL 가져오기
   - `.env.local` 파일 생성 후 다음 내용 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Supabase 데이터베이스 스키마 설정
   - Supabase SQL 편집기에서 `src/db/supabase-schema.sql` 내용을 복사하여 실행
   - 피드백 기능을 위한 테이블 생성:
   ```sql
   CREATE TABLE feedback (
     id SERIAL PRIMARY KEY,
     content TEXT NOT NULL,
     email TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   
   -- 익명 사용자가 삽입만 가능하도록 설정
   ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Allow anonymous insert" ON feedback
     FOR INSERT WITH CHECK (true);
   
   -- 관리자만 조회 가능
   CREATE POLICY "Allow admin to select" ON feedback
     FOR SELECT USING (auth.role() = 'authenticated');
   ```

5. 슬랙 웹훅 설정 (피드백 알림 수신용)
   - [Slack API 페이지](https://api.slack.com/apps)에 접속
   - "Create New App" 클릭, "From scratch" 선택
   - 앱 이름과 워크스페이스 지정
   - 좌측 메뉴에서 "Incoming Webhooks" 선택
   - "Activate Incoming Webhooks" 스위치 켜기
   - "Add New Webhook to Workspace" 클릭
   - 피드백 알림을 받을 채널 선택
   - 생성된 웹훅 URL을 `.env.local` 파일에 추가:
   ```
   SLACK_WEBHOOK_URL=your-slack-webhook-url
   ```

6. 개발 서버 실행
```bash
npm run dev
```

7. 브라우저에서 `http://localhost:3000` 접속

## 라이트너 상자 학습법이란?

라이트너 상자는 1970년대 독일의 과학 저널리스트 Sebastian Leitner가 개발한 학습 시스템입니다. 
이 시스템은 간격 반복(spaced repetition) 원리에 기반하며, 다음과 같이 동작합니다:

1. 학습할 내용을 플래시카드에 적어 1번 상자에 넣습니다.
2. 카드를 하나씩 꺼내 답을 맞히면 다음 상자로 이동, 틀리면 1번 상자로 돌아갑니다.
3. 각 상자는 복습 주기가 다릅니다:
   - 1번 상자: 매일
   - 2번 상자: 3일마다
   - 3번 상자: 7일마다
   - 4번 상자: 14일마다
   - 5번 상자: 30일마다
4. 이 방식은 잘 알고 있는 정보는 덜 자주, 어려운 정보는 더 자주 복습하게 합니다.

## 피드백 기능 사용 방법

1. 웹사이트 우측 하단의 채팅 아이콘 버튼을 클릭합니다.
2. 피드백 내용을 입력하고 이메일(선택사항)을 입력합니다.
3. "피드백 보내기" 버튼을 클릭합니다.
4. 제출된 피드백은 Supabase 데이터베이스에 저장되고 지정된 슬랙 채널로 알림이 전송됩니다.

## 향후 계획

- 사용자 인증 기능 추가
- 개인별 학습 데이터 저장
- 학습 통계 및 분석 기능 강화
- 모바일 앱 지원
- 관리자 대시보드 개발 (피드백 관리 포함)

## 라이센스

MIT
