# 암기훈련소 회원관리 시스템

Next.js와 Supabase Auth를 이용한 회원관리 시스템 구현 가이드입니다.

## 구현된 기능

1. **이메일/비밀번호 회원가입 및 로그인**
   - 이메일 주소와 비밀번호로 회원가입
   - 이메일 주소와 비밀번호로 로그인
   - 비밀번호 재설정 (링크 제공)

2. **소셜 로그인**
   - Google 계정으로 로그인

3. **인증 상태 관리**
   - Context API를 통한 전역 인증 상태 관리
   - 사용자 정보 및 세션 정보 접근 가능

4. **보호된 라우트**
   - 미들웨어를 통한 인증 상태 확인
   - 인증되지 않은 사용자의 보호된 페이지 접근 제한

5. **인증 콜백 처리**
   - OAuth 인증 후 콜백 처리
   - 세션 설정 및 리다이렉트

## 파일 구조

```
src/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts     # OAuth 콜백 처리
│   ├── login/
│   │   └── page.tsx         # 로그인 페이지
│   ├── signup/
│   │   └── page.tsx         # 회원가입 페이지
│   └── layout.tsx           # 루트 레이아웃 (AuthProvider 포함)
├── components/
│   └── SocialLogin.tsx      # 소셜 로그인 컴포넌트
├── context/
│   └── AuthContext.tsx      # 인증 상태 관리 컨텍스트
├── middleware.ts            # 보호된 라우트 설정
└── utils/
    └── supabase.ts          # Supabase 클라이언트 설정
```

## 설치 및 설정

1. **필요한 패키지 설치**

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

2. **환경 변수 설정**

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Supabase 프로젝트 설정**

- Supabase 프로젝트 생성
- Authentication > Providers에서 Email 및 Google 로그인 활성화
- Site URL 및 Redirect URLs 설정 (http://localhost:3000, http://localhost:3000/auth/callback)

## 사용 방법

### 인증 상태 확인

```tsx
'use client';

import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, session, isLoading, signOut } = useAuth();
  
  if (isLoading) {
    return <div>로딩 중...</div>;
  }
  
  if (!user) {
    return <div>로그인이 필요합니다</div>;
  }
  
  return (
    <div>
      <h1>안녕하세요, {user.email}님!</h1>
      <button onClick={signOut}>로그아웃</button>
    </div>
  );
}
```

### 보호된 컴포넌트 생성

미들웨어에서 자동으로 처리되지만, 추가적인 보호가 필요한 경우:

```tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedComponent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return <div>로딩 중...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  return <div>보호된 컨텐츠</div>;
}
```

## 추가 개발 사항

1. **프로필 관리**
   - 사용자 프로필 정보 수정 기능
   - 프로필 이미지 업로드

2. **이메일 인증**
   - 이메일 인증 프로세스 개선
   - 인증 상태에 따른 기능 제한

3. **소셜 로그인 확장**
   - 추가 소셜 로그인 제공업체 지원 (Apple, Facebook, GitHub 등)

4. **보안 강화**
   - 비밀번호 정책 강화
   - 2단계 인증 (2FA) 지원 