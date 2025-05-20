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

    // 오늘 날짜 (ISO 형식)
    const today = new Date().toISOString().split('T')[0];

    // Supabase REST API를 통해 오늘 학습할 카드 조회
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?subject_id=eq.${subjectId}&user_id=eq.${token.sub}&or=(next_review.lte.${today},next_review.is.null)&select=*&order=box_number.asc,last_reviewed.asc`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      console.error("오늘의 카드 조회 오류:", response.statusText);
      return NextResponse.json(
        { error: "오늘의 카드 조회 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const cards = await response.json();
    return NextResponse.json({ data: cards });
  } catch (error) {
    console.error("오늘의 카드 조회 처리 중 오류:", error);
    return NextResponse.json(
      { error: "오늘의 카드 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 