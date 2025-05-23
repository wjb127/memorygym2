import { getToken } from "next-auth/jwt";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/utils/supabase-client';

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
    
    // 요청 본문에서 데이터 추출
    const body = await request.json();
    const { password, currentPassword, email: requestEmail } = body;
    
    if (!password || password.length < 8) {
      logDebug('유효성 검사 실패: 비밀번호 길이 부족', { passwordLength: password?.length });
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }
    
    logDebug('비밀번호 유효성 검사 통과');
    
    // 사용자 이메일 확인 (토큰과 요청 본문에서 모두 확인)
    const email = token.email || requestEmail;
    if (!email) {
      logDebug('사용자 이메일 없음');
      return NextResponse.json(
        { error: '사용자 이메일 정보가 없습니다.' },
        { status: 400 }
      );
    }
    
    try {
      // 서비스 키를 사용한 비밀번호 변경 시도 (우선적으로 시도)
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        logDebug('서비스 키를 사용한 비밀번호 변경 시도');
        
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          serviceKey,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );
        
        // 사용자 ID가 없으면 이메일로 사용자 조회
        let userId = token.sub;
        if (!userId && email) {
          logDebug('이메일로 사용자 조회', { email });
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
            filter: { email }
          });
          
          if (userError || !userData || userData.users.length === 0) {
            logDebug('사용자 조회 실패', { error: userError });
            return NextResponse.json(
              { error: '사용자를 찾을 수 없습니다.' },
              { status: 404 }
            );
          }
          
          userId = userData.users[0].id;
          logDebug('사용자 ID 조회 성공', { userId });
        }
        
        if (!userId) {
          logDebug('사용자 ID를 확인할 수 없음');
          return NextResponse.json(
            { error: '사용자 식별 정보가 없습니다.' },
            { status: 400 }
          );
        }
        
        // 관리자 권한으로 비밀번호 변경
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password }
        );
        
        if (error) {
          logDebug('관리자 권한으로 비밀번호 변경 실패', { error });
          return NextResponse.json(
            { error: error.message || '비밀번호 변경 실패' },
            { status: 500 }
          );
        }
        
        logDebug('관리자 권한으로 비밀번호 변경 성공');
      } 
      // 서비스 키가 없는 경우 현재 비밀번호를 확인한 후 변경
      else {
        logDebug('현재 비밀번호 확인 후 변경 시도 (서비스 키 없음)');
        
        if (!currentPassword) {
          logDebug('현재 비밀번호 누락');
          return NextResponse.json(
            { error: '현재 비밀번호가 필요합니다.' },
            { status: 400 }
          );
        }
        
        if (!email) {
          logDebug('이메일 정보 없음');
          return NextResponse.json(
            { error: '이메일 정보가 필요합니다.' },
            { status: 400 }
          );
        }
        
        // 현재 비밀번호로 로그인 시도하여 검증
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email as string,
          password: currentPassword
        });
        
        if (signInError) {
          logDebug('현재 비밀번호 검증 실패', { error: signInError });
          return NextResponse.json(
            { error: '현재 비밀번호가 올바르지 않습니다.' },
            { status: 400 }
          );
        }
        
        // 비밀번호 변경
        const { error: updateError } = await supabase.auth.updateUser({
          password
        });
        
        if (updateError) {
          logDebug('비밀번호 변경 실패', { error: updateError });
          return NextResponse.json(
            { error: updateError.message || '비밀번호 변경 실패' },
            { status: 500 }
          );
        }
        
        // 로그아웃 처리
        await supabase.auth.signOut();
        
        logDebug('일반 방식으로 비밀번호 변경 성공');
      }
      
      logDebug('비밀번호 변경 성공');
      
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

// Supabase 관리자 클라이언트 생성 함수
function createClient(url: string, key: string, options = {}) {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key, options);
} 