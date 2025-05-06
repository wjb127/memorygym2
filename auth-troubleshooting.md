# 인증 문제 해결 가이드

## 1. 환경 변수 확인

`.env.local` 파일에 다음 환경 변수가 올바르게 설정되어 있는지 확인하세요:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Supabase 프로젝트 URL과 anon key는 Supabase 대시보드의 `Settings > API` 메뉴에서 확인할 수 있습니다.

## 2. Supabase 인증 설정 확인

1. [Supabase 대시보드](https://app.supabase.com)에 로그인합니다.
2. 프로젝트를 선택한 후 `Authentication > Providers` 메뉴로 이동합니다.
3. Email 제공자가 활성화되어 있는지 확인합니다.
4. Google 제공자가 활성화되어 있는지, 그리고 클라이언트 ID와 비밀키가 올바르게 설정되어 있는지 확인합니다.

## 3. URL 설정 확인

1. `Authentication > URL Configuration` 메뉴로 이동합니다.
2. Site URL이 `http://localhost:3000`(개발 환경) 또는 실제 배포 URL로 설정되어 있는지 확인합니다.
3. Redirect URLs에 `http://localhost:3000/auth/callback`(개발 환경) 또는 실제 배포 URL + `/auth/callback`이 추가되어 있는지 확인합니다.

## 4. 브라우저 쿠키 및 캐시 확인

1. 브라우저의 개발자 도구를 열고 `Application` 탭으로 이동합니다.
2. `Cookies` 섹션에서 Supabase 관련 쿠키가 있는지 확인합니다.
3. 문제가 지속되면 브라우저 캐시와 쿠키를 삭제한 후 다시 시도해보세요.

## 5. 구글 OAuth 설정 확인

1. [Google Cloud Console](https://console.cloud.google.com/)에 로그인합니다.
2. 프로젝트를 선택한 후 `APIs & Services > Credentials` 메뉴로 이동합니다.
3. OAuth 클라이언트 ID를 확인하고 다음 설정이 올바른지 확인합니다:
   - 승인된 JavaScript 출처: `http://localhost:3000` 또는 실제 배포 URL
   - 승인된 리디렉션 URI: `https://your-project-id.supabase.co/auth/v1/callback`

## 6. 코드 확인

1. `src/utils/supabase.ts`와 `src/utils/supabase-server.ts` 파일이 올바르게 설정되어 있는지 확인합니다.
2. `src/app/auth/callback/route.ts` 파일이 올바르게 설정되어 있는지 확인합니다.
3. `src/middleware.ts` 파일이 올바르게 설정되어 있는지 확인합니다.

## 7. 로그 확인

1. 브라우저 콘솔에서 오류 메시지를 확인합니다.
2. 서버 로그에서 오류 메시지를 확인합니다.

## 8. 일반적인 오류 및 해결 방법

### "Invalid login credentials" 오류

- 이메일과 비밀번호가 올바른지 확인하세요.
- 계정이 존재하는지 확인하세요.

### "Email not confirmed" 오류

- 이메일 확인 링크를 클릭했는지 확인하세요.
- Supabase 대시보드에서 사용자 계정 상태를 확인하세요.

### "next/headers" 관련 오류

- 서버와 클라이언트 코드가 올바르게 분리되어 있는지 확인하세요.
- `cookies()` 함수는 서버 컴포넌트에서만 사용할 수 있습니다.

### 구글 로그인 리다이렉트 오류

- Google Cloud Console에서 OAuth 클라이언트 ID 설정을 확인하세요.
- Supabase 대시보드에서 Google 제공자 설정을 확인하세요. 