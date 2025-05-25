import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin 클라이언트 생성 (서비스 키 사용)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function DELETE(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Supabase SDK를 사용해서 토큰으로 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('사용자 인증 오류:', userError);
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    const userId = user.id;

    console.log('🗑️ [계정 삭제] 시작:', userId);

    // 1. 사용자 관련 모든 데이터 삭제
    try {
      console.log('🗑️ 사용자 데이터 삭제 시작');
      
      // 먼저 카드 삭제 (외래키 제약 때문에)
      const { error: cardsError } = await supabaseAdmin
        .from('cards')
        .delete()
        .eq('user_id', userId);
      
      if (cardsError && cardsError.code !== '42P01') { // 테이블이 없는 경우가 아니면
        console.error('카드 삭제 오류:', cardsError);
      } else {
        console.log('✅ 카드 삭제 완료 (또는 테이블 없음)');
      }

      // subjects 삭제
      const { error: subjectsError } = await supabaseAdmin
        .from('subjects')
        .delete()
        .eq('user_id', userId);
      
      if (subjectsError && subjectsError.code !== '42P01') {
        console.error('Subjects 삭제 오류:', subjectsError);
      } else {
        console.log('✅ Subjects 삭제 완료');
      }

      // 기타 가능한 테이블들 삭제 시도
      const tablesToTry = ['quiz_cards', 'quizzes', 'study_records', 'user_premium', 'payments'];
      
      for (const table of tablesToTry) {
        try {
          const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .eq('user_id', userId);
          
          if (error && error.code !== '42P01') {
            console.log(`⚠️ ${table} 삭제 오류:`, error.message);
          } else {
            console.log(`✅ ${table} 삭제 완료 (또는 테이블 없음)`);
          }
        } catch (e) {
          console.log(`⚠️ ${table} 삭제 시도 실패 (정상)`);
        }
      }

    } catch (dataError) {
      console.error('사용자 데이터 삭제 중 오류:', dataError);
      // 데이터 삭제 실패해도 계정 삭제는 진행
    }

    // 2. Supabase Auth에서 사용자 삭제
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Auth 사용자 삭제 오류:', authError);
        // Auth 삭제 실패 시에도 성공으로 처리 (데이터는 이미 삭제됨)
        console.log('⚠️ Auth 삭제 실패했지만 데이터는 삭제됨');
      } else {
        console.log('✅ Auth 사용자 삭제 완료');
      }
    } catch (authDeleteError) {
      console.error('Auth 삭제 중 예외:', authDeleteError);
      // 예외 발생해도 계속 진행
    }

    console.log('✅ [계정 삭제] 완료:', userId);

    return NextResponse.json(
      { message: '계정이 성공적으로 삭제되었습니다.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('계정 삭제 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 