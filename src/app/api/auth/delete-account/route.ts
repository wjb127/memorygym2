import { getToken } from "next-auth/jwt";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 디버그 로그 함수
function logDebug(message: string, data?: any) {
  console.log(`[계정 삭제 API] ${message}`, data ? JSON.stringify(data) : '');
}

export async function POST(request: NextRequest) {
  try {
    logDebug('계정 삭제 요청 시작');
    
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
    
    // 요청 본문에서 비밀번호 추출 (보안 확인용)
    const body = await request.json();
    const { password } = body;
    
    if (!password) {
      logDebug('비밀번호 누락');
      return NextResponse.json(
        { error: '계정 삭제를 확인하려면 비밀번호가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 사용자 ID 확인
    const userId = token.sub;
    if (!userId) {
      logDebug('사용자 ID 없음');
      return NextResponse.json(
        { error: '사용자 식별 정보가 없습니다.' },
        { status: 400 }
      );
    }
    
    // 이메일 확인
    const email = token.email;
    if (!email) {
      logDebug('이메일 정보 없음');
      return NextResponse.json(
        { error: '사용자 이메일 정보가 없습니다.' },
        { status: 400 }
      );
    }
    
    try {
      // 서비스 키를 사용한 계정 삭제 시도
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) {
        logDebug('서비스 키 없음, 계정 삭제 불가');
        return NextResponse.json(
          { error: '서버 구성 오류: 관리자 권한이 설정되지 않았습니다.' },
          { status: 500 }
        );
      }
      
      // 1. 먼저 비밀번호 검증
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      
      logDebug('비밀번호 검증 시도');
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: email as string,
        password
      });
      
      if (signInError) {
        logDebug('비밀번호 검증 실패', { error: signInError });
        return NextResponse.json(
          { error: '비밀번호가 올바르지 않습니다.' },
          { status: 400 }
        );
      }
      
      // 2. 관리자 권한으로 Supabase 클라이언트 생성
      logDebug('관리자 권한으로 Supabase 클라이언트 생성');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        logDebug('Supabase URL이 설정되지 않음');
        return NextResponse.json(
          { error: '서버 구성 오류: Supabase URL이 설정되지 않았습니다.' },
          { status: 500 }
        );
      }
      
      const supabaseAdmin = createClient(
        supabaseUrl,
        serviceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      // 사용자 존재 여부 확인
      logDebug('사용자 존재 여부 확인');
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
        userId
      );
      
      if (userError) {
        logDebug('사용자 조회 오류', { error: userError });
        return NextResponse.json(
          { error: '사용자 정보를 조회할 수 없습니다.', details: userError.message },
          { status: 500 }
        );
      }
      
      if (!userData.user) {
        logDebug('사용자를 찾을 수 없음', { userId });
        return NextResponse.json(
          { error: '삭제할 사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      logDebug('사용자 확인됨', { userId: userData.user.id, email: userData.user.email });
      
      // 3. 사용자 관련 데이터 삭제 (필요한 테이블에 맞게 수정)
      // 참고: 외래 키 제약 조건으로 인한 오류를 방지하기 위해 사용자 데이터를 먼저 삭제
      logDebug('사용자 데이터 삭제 시도');
      try {
        // 1. flashcards 테이블에서 사용자 데이터 삭제
        const { error: deleteFlashcardsError } = await supabaseAdmin
          .from('flashcards')
          .delete()
          .eq('user_id', userId);
          
        if (deleteFlashcardsError) {
          logDebug('사용자 flashcards 데이터 삭제 오류', { error: deleteFlashcardsError });
          // 오류 로깅만 하고 계속 진행 (비치명적 오류)
        } else {
          logDebug('사용자 flashcards 데이터 삭제 성공');
        }
        
        // 2. subjects 테이블에서 사용자 데이터 삭제
        const { error: deleteSubjectsError } = await supabaseAdmin
          .from('subjects')
          .delete()
          .eq('user_id', userId);
          
        if (deleteSubjectsError) {
          logDebug('사용자 subjects 데이터 삭제 오류', { error: deleteSubjectsError });
        } else {
          logDebug('사용자 subjects 데이터 삭제 성공');
        }
        
        // 3. profiles 테이블에서 사용자 데이터 삭제
        const { error: deleteProfileError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', userId);
          
        if (deleteProfileError) {
          logDebug('사용자 profile 데이터 삭제 오류', { error: deleteProfileError });
        } else {
          logDebug('사용자 profile 데이터 삭제 성공');
        }
        
      } catch (dataDeleteError: any) {
        logDebug('사용자 데이터 삭제 중 오류', { error: dataDeleteError.message });
        // 오류 로깅만 하고 계속 진행 (비치명적 오류)
      }
      
      // 4. 사용자 계정 삭제
      logDebug('사용자 계정 삭제 시도');
      
      try {
        // 서비스 역할 키를 이용한 사용자 삭제 시도
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
          userId
        );
        
        if (deleteError) {
          logDebug('계정 삭제 실패', { error: deleteError });
          
          // 오류 세부 정보 확인
          const errorDetails = {
            message: deleteError.message,
            name: deleteError.name,
            status: (deleteError as any).status,
            code: (deleteError as any).code,
          };
          
          logDebug('상세 오류 정보', errorDetails);
          
          // 다른 방식으로 시도 (직접 SQL 사용)
          logDebug('대체 방법으로 사용자 삭제 시도');
          
          try {
            // 사용자 ID를 UUID 형식으로 변환하여 RPC 함수 호출
            const { data: deleteData, error: sqlDeleteError } = await supabaseAdmin.rpc(
              'delete_user_manually',
              { user_id_param: userId }
            );
            
            if (sqlDeleteError) {
              logDebug('대체 삭제 방법도 실패', { error: sqlDeleteError });
              
              // 함수가 없는 경우 (RPC 함수를 아직 생성하지 않은 경우)
              if (sqlDeleteError.message.includes('function') && sqlDeleteError.message.includes('does not exist')) {
                logDebug('delete_user_manually 함수가 없음, 기본 오류 반환');
                return NextResponse.json(
                  { 
                    error: '계정 삭제 실패', 
                    details: {
                      message: '계정 삭제 기능에 문제가 있습니다. 관리자에게 문의하세요.',
                      technical: errorDetails
                    }
                  },
                  { status: 500 }
                );
              }
              
              return NextResponse.json(
                { 
                  error: '계정 삭제 실패', 
                  details: {
                    primary: errorDetails,
                    secondary: sqlDeleteError.message
                  }
                },
                { status: 500 }
              );
            }
            
            logDebug('대체 방법으로 사용자 삭제 성공', { result: deleteData });
          } catch (rpcError: any) {
            logDebug('RPC 호출 중 예외 발생', { error: rpcError.message });
            return NextResponse.json(
              { 
                error: '계정 삭제 실패', 
                details: {
                  primary: errorDetails,
                  rpc: rpcError.message
                }
              },
              { status: 500 }
            );
          }
        }
      } catch (deleteError: any) {
        logDebug('계정 삭제 중 예외 발생', { 
          error: deleteError.message,
          stack: deleteError.stack
        });
        
        return NextResponse.json(
          { 
            error: '계정 삭제 처리 중 오류가 발생했습니다.',
            details: deleteError.message
          },
          { status: 500 }
        );
      }
      
      logDebug('계정 삭제 성공');
      
      // 성공 응답
      return NextResponse.json({
        success: true,
        message: '계정이 성공적으로 삭제되었습니다.'
      });
    } catch (error: any) {
      console.error('[계정 삭제 API] 치명적 오류:', error);
      return NextResponse.json(
        { 
          error: '계정 삭제 처리 중 오류가 발생했습니다.',
          details: error.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[계정 삭제 API] 치명적 오류:', error);
    return NextResponse.json(
      { 
        error: '계정 삭제 처리 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    );
  }
} 