import { getToken } from "next-auth/jwt";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateUserPassword } from '@/utils/supabase-client';

// 디버그 로그 함수
function logDebug(message: string, data?: any) {
  console.log(`[비밀번호 변경 API] ${message}`, data ? JSON.stringify(data) : '');
}

export async function POST(request: NextRequest) {
  try {
    logDebug('비밀번호 변경 요청 시작');
    
    // Next Auth 토큰 확인
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      logDebug('인증 실패: 토큰 없음');
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    logDebug('인증된 사용자', { email: token.email, sub: token.sub });
    
    // 요청 본문에서 비밀번호 추출
    const body = await request.json();
    const { password } = body;
    
    if (!password || password.length < 8) {
      logDebug('유효성 검사 실패: 비밀번호 길이 부족', { passwordLength: password?.length });
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }
    
    logDebug('비밀번호 유효성 검사 통과');
    
    // 사용자 ID 확인
    const userId = token.sub;
    if (!userId) {
      logDebug('사용자 ID 없음');
      return NextResponse.json(
        { error: '사용자 식별 정보가 없습니다.' },
        { status: 400 }
      );
    }
    
    try {
      // Supabase를 통해 비밀번호 업데이트
      logDebug('비밀번호 업데이트 시도', { userId });
      const result = await updateUserPassword(userId, password);
      
      if (result.error) {
        logDebug('비밀번호 업데이트 실패', { error: result.error });
        return NextResponse.json(
          { error: result.error.message || '비밀번호 변경 실패' },
          { status: 500 }
        );
      }
      
      logDebug('비밀번호 업데이트 성공');
      
      // 성공 응답
      return NextResponse.json({
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.'
      });
    } catch (updateError: any) {
      logDebug('비밀번호 업데이트 중 예외 발생', { error: updateError.message });
      return NextResponse.json(
        { error: updateError.message || '비밀번호 변경 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[비밀번호 변경 API] 치명적 오류:', error);
    return NextResponse.json(
      { error: '비밀번호 변경 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 