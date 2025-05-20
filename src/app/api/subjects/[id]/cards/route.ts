import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

    // Next Auth 토큰 확인
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      console.error(`[API] 인증 오류: 토큰이 없음`);
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 확인
    const url = new URL(request.url);
    const boxParam = url.searchParams.get('box');
    console.log(`[API] 요청 파라미터: subjectId=${subjectId}, box=${boxParam || '전체'}, userId=${token.sub}`);
    
    // 기본 필터: 과목 ID 및 사용자 ID로 필터링
    let queryFilter = `subject_id=eq.${subjectId}&user_id=eq.${token.sub}`;
    
    // 상자 필터링이 있는 경우 추가
    if (boxParam) {
      const boxNumber = parseInt(boxParam);
      if (!isNaN(boxNumber)) {
        queryFilter += `&box_number=eq.${boxNumber}`;
      }
    }

    // Supabase REST API를 통해 카드 목록 조회
    const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?${queryFilter}&select=*&order=created_at.desc`;
    console.log(`[API] Supabase API 호출: ${apiUrl}`);
    
    const response = await fetch(
      apiUrl,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      console.error(`[API] 카드 목록 조회 오류: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "카드 목록 조회 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const cards = await response.json();
    console.log(`[API] 카드 목록 조회 성공: ${cards.length}개 카드 반환`);
    return NextResponse.json({ data: cards });
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

    // Next Auth 토큰 확인
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      console.error(`[API] 인증 오류: 토큰이 없음`);
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

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
    
    // Supabase REST API를 통해 카드 추가
    const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards`;
    console.log(`[API] Supabase API 호출 (카드 추가): ${apiUrl}`);
    
    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          front,
          back,
          subject_id: subjectId,
          user_id: token.sub,
          box_number: 1, // 새 카드는 1번 상자에서 시작
          created_at: now,
          last_reviewed: now,
          next_review: now
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] 카드 추가 오류: ${response.status} ${response.statusText}`);
      console.error(`[API] 카드 추가 오류 응답:`, errorText);
      return NextResponse.json(
        { error: "카드 추가 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const newCard = Array.isArray(data) && data.length > 0 ? data[0] : null;

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