# Supabase 설정 가이드

이 문서는 암기훈련소 프로젝트를 위한 Supabase 설정 가이드입니다.

## 1. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://app.supabase.com)에 로그인합니다.
2. `New Project` 버튼을 클릭하여 새 프로젝트를 생성합니다.
3. 프로젝트 이름, 비밀번호, 지역을 설정합니다.
4. 프로젝트가 생성되면 대시보드에서 `Settings > API` 메뉴로 이동하여 `Project URL`과 `anon` 키를 확인합니다.

## 2. 환경 변수 설정

1. 프로젝트 루트 디렉토리에 `.env.local` 파일을 생성합니다.
2. 다음 내용을 추가합니다:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. 데이터베이스 설정

1. Supabase 대시보드에서 `SQL Editor` 메뉴로 이동합니다.
2. `New Query` 버튼을 클릭하여 새 SQL 쿼리를 생성합니다.
3. 프로젝트에 포함된 `supabase-setup.sql` 파일의 내용을 복사하여 붙여넣습니다.
4. `Run` 버튼을 클릭하여 쿼리를 실행합니다.

이 SQL 스크립트는 다음 작업을 수행합니다:
- 기존 테이블, 트리거, 함수가 있다면 삭제
- 필요한 테이블 생성 (profiles, subjects, flashcards, review_intervals)
- RLS(Row Level Security) 정책 설정
- 사용자 생성 시 프로필 자동 생성을 위한 트리거 설정
- 초기 데이터 삽입

## 4. 인증 설정

1. Supabase 대시보드에서 `Authentication > Providers` 메뉴로 이동합니다.
2. Email 인증 설정:
   - Email 제공자를 활성화합니다.
   - 이메일 확인 여부를 설정합니다 (권장: 활성화).

3. Google OAuth 설정:
   - [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트를 생성합니다.
   - `APIs & Services > Credentials` 메뉴에서 OAuth 클라이언트 ID를 생성합니다.
   - 승인된 리디렉션 URI에 `https://your-supabase-project-url/auth/v1/callback`을 추가합니다.
   - 생성된 클라이언트 ID와 비밀키를 Supabase의 Google 제공자 설정에 입력합니다.

4. Site URL 및 Redirect URLs 설정:
   - Site URL: `http://localhost:3000` (개발 환경) 또는 실제 배포 URL
   - Redirect URLs: `http://localhost:3000/auth/callback` (개발 환경) 또는 실제 배포 URL + `/auth/callback`

## 5. 코드 구조 및 수정 사항

### 서버와 클라이언트 코드 분리

Next.js 13 이상에서는 서버 컴포넌트와 클라이언트 컴포넌트를 명확히 구분해야 합니다. 특히 `next/headers`와 같은 서버 전용 API는 클라이언트 컴포넌트에서 직접 사용할 수 없습니다.

1. **클라이언트 코드 (src/utils/supabase.ts)**
   - 브라우저에서 실행되는 Supabase 클라이언트 설정
   - `createClientBrowser` 함수 제공
   - 클라이언트 컴포넌트에서 사용

2. **서버 코드 (src/utils/supabase-server.ts)**
   - 서버에서 실행되는 Supabase 클라이언트 설정
   - `createClientServer` 및 `createSupabaseServerActionClient` 함수 제공
   - 서버 컴포넌트와 서버 액션에서만 사용
   - `'use server'` 지시문 포함

3. **OAuth 콜백 처리 (src/app/auth/callback/route.ts)**
   - `createRouteHandlerClient`에 cookies 함수를 직접 전달

### 사용 예시

```tsx
// 클라이언트 컴포넌트에서
'use client';
import { createClientBrowser } from '@/utils/supabase';

function ClientComponent() {
  const handleAction = async () => {
    const supabase = createClientBrowser();
    // 클라이언트 작업 수행
  };
}

// 서버 컴포넌트에서
import { createClientServer } from '@/utils/supabase-server';

async function ServerComponent() {
  const supabase = createClientServer();
  // 서버 작업 수행
}
```

## 6. 테스트

1. 애플리케이션을 실행합니다:
```bash
npm run dev
```

2. 회원가입, 로그인, 소셜 로그인 기능을 테스트합니다.
3. 인증 상태에 따른 보호된 라우트 접근 제한을 확인합니다.

## 7. 문제 해결

- 인증 관련 오류가 발생하면 브라우저 콘솔과 서버 로그를 확인하세요.
- Supabase 대시보드의 `Authentication > Users` 메뉴에서 사용자 계정 상태를 확인할 수 있습니다.
- 소셜 로그인 문제는 OAuth 제공자 설정과 리디렉션 URL을 다시 확인하세요.
- "next/headers" 관련 오류가 발생하면 서버/클라이언트 코드 분리가 제대로 되었는지 확인하세요. 