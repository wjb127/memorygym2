import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateUser } from "@/utils/auth-helpers";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 (서버용 - Service Role Key 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role Key 사용 (RLS 우회)
);

console.log('🔑 [Subjects Cards API] Supabase 클라이언트 설정:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
});

// 과목별 카드 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    console.log(`[API] GET /api/subjects/${id}/cards 요청 처리 시작`);
    
    const subjectId = parseInt(id);
    
    if (isNaN(subjectId)) {
      console.error(`[API] 과목 ID 파싱 오류: ${id}는 유효한 숫자가 아님`);
      return NextResponse.json(
        { error: "유효한 과목 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Supabase 인증 확인
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      console.error(`[API] 인증 오류: ${authResult.error}`);
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: authResult.status }
      );
    }

    const user = authResult.user!;

    // 쿼리 파라미터 확인
    const url = new URL(request.url);
    const boxParam = url.searchParams.get('box');
    console.log(`[API] 요청 파라미터: subjectId=${subjectId}, box=${boxParam || '전체'}, userId=${user.id}`);
    
    // Supabase Client를 사용하여 카드 목록 조회
    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // 상자 필터링이 있는 경우 추가
    if (boxParam) {
      const boxNumber = parseInt(boxParam);
      if (!isNaN(boxNumber)) {
        query = query.eq('box_number', boxNumber);
        console.log(`[API] 박스 필터링 적용: ${boxNumber}`);
      }
    }

    const { data: cards, error } = await query;

    if (error) {
      console.error(`[API] 카드 목록 조회 오류:`, error);
      return NextResponse.json(
        { error: "카드 목록 조회 중 오류가 발생했습니다.", details: error.message },
        { status: 500 }
      );
    }

    console.log(`[API] 카드 목록 조회 성공: ${cards?.length || 0}개 카드 반환`);
    console.log(`[API] 카드 샘플:`, cards?.slice(0, 2)); // 처음 2개 카드만 로그
    return NextResponse.json({ data: cards || [] });
  } catch (error) {
    console.error("[API] 카드 목록 조회 처리 중 오류:", error);
    return NextResponse.json(
      { error: "카드 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 카드 추가 API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    console.log(`[API] POST /api/subjects/${id}/cards 요청 처리 시작`);
    
    const subjectId = parseInt(id);
    
    if (isNaN(subjectId)) {
      console.error(`[API] 과목 ID 파싱 오류: ${id}는 유효한 숫자가 아님`);
      return NextResponse.json(
        { error: "유효한 과목 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Supabase 인증 확인
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      console.error(`[API] 인증 오류: ${authResult.error}`);
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: authResult.status }
      );
    }

    const user = authResult.user!;

    // 요청 본문 파싱
    const body = await request.json();
    const { front, back } = body;
    console.log(`[API] 카드 추가 요청: front="${front}", back="${back}", subjectId=${subjectId}`);
    
    if (!front?.trim() || !back?.trim()) {
      console.error(`[API] 카드 추가 유효성 검사 실패: 앞면 또는 뒷면 내용 누락`);
      return NextResponse.json(
        { error: "앞면과 뒷면 내용을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 현재 시간 생성
    const now = new Date().toISOString();
    
    // Supabase Client를 사용하여 카드 추가
    const { data: newCards, error } = await supabase
      .from('flashcards')
      .insert({
        front,
        back,
        subject_id: subjectId,
        user_id: user.id,
        box_number: 1, // 새 카드는 1번 상자에서 시작
        created_at: now,
        last_reviewed: now,
        next_review: now
      })
      .select();

    if (error) {
      console.error(`[API] 카드 추가 오류:`, error);
      return NextResponse.json(
        { error: "카드 추가 중 오류가 발생했습니다.", details: error.message },
        { status: 500 }
      );
    }

    const newCard = newCards && newCards.length > 0 ? newCards[0] : null;

    if (!newCard) {
      console.error(`[API] 카드 추가 결과 없음: 응답은 성공했지만 카드 데이터가 없음`);
      return NextResponse.json(
        { error: "카드 추가 결과를 찾을 수 없습니다." },
        { status: 500 }
      );
    }

    console.log(`[API] 카드 추가 성공: ID=${newCard.id}`);
    return NextResponse.json({ data: newCard });
  } catch (error) {
    console.error("[API] 카드 추가 처리 중 오류:", error);
    return NextResponse.json(
      { error: "카드 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 