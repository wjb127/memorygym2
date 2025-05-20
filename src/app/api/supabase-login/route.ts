import { signInWithEmail } from '@/utils/supabase-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }
    
    console.log(`[Supabase 로그인 시도] 이메일: ${email}`);
    
    const { data, error } = await signInWithEmail(email, password);
    
    if (error || !data) {
      console.error('[Supabase 로그인 실패]', error?.message || '사용자 데이터 없음');
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
    
    console.log('[Supabase 로그인 성공] 사용자:', data.user?.email);
    
    // 사용자 이름 기본값 설정
    const userName = data.user?.user_metadata?.name || 
                   (data.user?.email ? data.user.email.split('@')[0] : '사용자');
    
    return NextResponse.json({
      user: {
        id: data.user?.id || '',
        email: data.user?.email || '',
        name: userName
      },
      session: {
        accessToken: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || '',
        expiresAt: data.session?.expires_at || 0
      }
    });
  } catch (error: any) {
    console.error('[Supabase 로그인 API 오류]', error.message);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 