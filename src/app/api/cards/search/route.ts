import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateUser } from "@/utils/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    // Supabase 인증 확인
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: authResult.status }
      );
    }

    const user = authResult.user!;
    
    // URL 파라미터 확인
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q") || "";
    
    if (!searchQuery.trim()) {
      return NextResponse.json({
        data: [],
        count: 0
      });
    }
    
    // Supabase REST API를 통해 카드 검색
    // ILIKE 연산자로 대소문자 구분 없이 검색 (PostgreSQL)
    const queryFilter = `user_id=eq.${user.id}&or=(front.ilike.%${encodeURIComponent(searchQuery)}%,back.ilike.%${encodeURIComponent(searchQuery)}%)`;
    
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
      console.error("카드 검색 오류:", response.statusText);
      return NextResponse.json(
        { error: "카드 검색 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const cards = await response.json();
    return NextResponse.json({
      data: cards,
      count: cards.length
    });
  } catch (error) {
    console.error("카드 검색 오류:", error);
    return NextResponse.json(
      { error: "카드 검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 