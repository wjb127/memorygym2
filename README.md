# 라이트너 상자 웹 애플리케이션

라이트너 상자 학습법을 웹 애플리케이션으로 구현한 프로젝트입니다. 
외국어 단어, 용어 등을 효율적으로 학습할 수 있는 시스템입니다.

## 주요 기능

- 5단계 라이트너 상자 시스템
- 매일 학습해야 할 카드 자동 추천
- 카드 관리 (추가, 삭제)
- 상자별 카드 관리
- 학습 결과 통계

## 기술 스택

- Next.js 15
- React 19
- Supabase (인증 및 데이터베이스)
- TypeScript
- Tailwind CSS

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

5. 개발 서버 실행
```bash
npm run dev
```

6. 브라우저에서 `http://localhost:3000` 접속

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

## 향후 계획

- 사용자 인증 기능 추가
- 개인별 학습 데이터 저장
- 학습 통계 및 분석 기능 강화
- 모바일 앱 지원

## 라이센스

MIT
