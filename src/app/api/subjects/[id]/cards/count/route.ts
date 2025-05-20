import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from '@/utils/supabase-client';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // params를 비동기적으로 처리
    const params = await Promise.resolve(context.params);
    
    // 과목 ID 확인
    const subjectId = params.id;
    if (!subjectId) {
      return NextResponse.json(
        { error: "과목 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Next Auth 토큰 확인
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    // Supabase에서 해당 과목의 카드 수 쿼리
    const { count, error } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', subjectId);
    
    if (error) {
      console.error("카드 수 쿼리 오류:", error);
      return NextResponse.json(
        { error: "카드 수를 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: count || 0,
      subject_id: subjectId
    });
  } catch (error) {
    console.error("카드 수 가져오기 오류:", error);
    return NextResponse.json(
      { error: "카드 수를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 