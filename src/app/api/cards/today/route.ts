import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
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
    
    // 현재 날짜 가져오기
    const today = new Date().toISOString();
    
    // Supabase REST API를 통해 오늘 학습할 카드 조회
    // next_review가 현재 시간보다 이전인 카드들 가져오기
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?user_id=eq.${token.sub}&or=(next_review.lte.${today},next_review.is.null)&select=*&order=box_number.asc,last_reviewed.asc`,
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
    return NextResponse.json({
      data: cards,
      count: cards.length
    });
  } catch (error) {
    console.error("오늘의 카드 정보 가져오기 오류:", error);
    return NextResponse.json(
      { error: "오늘의 카드 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 