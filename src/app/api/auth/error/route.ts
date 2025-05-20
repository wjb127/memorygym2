import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  
  console.log('[Auth Error API] 인증 오류 발생:', error);
  
  let errorMessage = '인증 중 오류가 발생했습니다.';
  
  switch (error) {
    case 'CredentialsSignin':
      errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      break;
    case 'OAuthAccountNotLinked':
      errorMessage = '이미 다른 방법으로 가입한 이메일입니다. 다른 로그인 방법을 사용해주세요.';
      break;
    case 'OAuthSignin':
    case 'OAuthCallback':
      errorMessage = '소셜 로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
      break;
  }
  
  return NextResponse.json({ error: errorMessage }, { status: 401 });
} 