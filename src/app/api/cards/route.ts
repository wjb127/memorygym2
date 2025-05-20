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
    
    // URL 파라미터 확인
    const { searchParams } = new URL(request.url);
    const boxParam = searchParams.get("box");
    
    // 기본 필터: 사용자 ID로 필터링
    let queryFilter = `user_id=eq.${token.sub}`;
    
    // 상자 필터링이 있는 경우 추가
    if (boxParam) {
      const boxNumber = parseInt(boxParam, 10);
      if (!isNaN(boxNumber)) {
        queryFilter += `&box_number=eq.${boxNumber}`;
      }
    }
    
    // Supabase REST API를 통해 카드 목록 조회
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?${queryFilter}&select=*&order=created_at.desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      console.error("카드 목록 조회 오류:", response.statusText);
      return NextResponse.json(
        { error: "카드 목록 조회 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const cards = await response.json();
    return NextResponse.json({
      data: cards,
      count: cards.length
    });
  } catch (error) {
    console.error("카드 정보 가져오기 오류:", error);
    return NextResponse.json(
      { error: "카드 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 