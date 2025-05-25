import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from '@/utils/supabase-client';
import { authenticateUser } from "@/utils/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    
    // 과목 ID 확인
    const subjectId = id;
    if (!subjectId) {
      return NextResponse.json(
        { error: "과목 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Supabase 인증 확인
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: authResult.status }
      );
    }

    const user = authResult.user!;

    // Supabase에서 해당 과목의 카드 수 쿼리 (사용자 ID 필터링 추가)
    const { count, error } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', subjectId)
      .eq('user_id', user.id);
    
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