import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    
    const subjectId = id;
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

    // 쿼리 파라미터 확인
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    if (!query.trim()) {
      return NextResponse.json(
        { error: "검색어가 필요합니다." },
        { status: 400 }
      );
    }

    // 검색 필터 구성
    const searchFilter = `or=(front.ilike.${encodeURIComponent(`%${query}%`)},back.ilike.${encodeURIComponent(`%${query}%`)})`;

    // Supabase REST API를 통해 카드 검색
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?subject_id=eq.${subjectId}&user_id=eq.${token.sub}&${searchFilter}&select=*&order=created_at.desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "카드 검색 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const cards = await response.json();
    return NextResponse.json({ data: cards });
  } catch (error) {
    console.error("카드 검색 처리 중 오류:", error);
    return NextResponse.json(
      { error: "카드 검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 