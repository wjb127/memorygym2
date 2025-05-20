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

    // Supabase REST API를 통해 과목 수 조회
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects?user_id=eq.${token.sub}&select=id`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      console.error("[GET /api/subjects/count] Supabase API 오류:", response.statusText);
      return NextResponse.json(
        { error: "과목 수 조회 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const subjects = await response.json();
    const count = Array.isArray(subjects) ? subjects.length : 0;

    return NextResponse.json({
      count: count
    });
  } catch (error) {
    console.error("과목 수 가져오기 오류:", error);
    return NextResponse.json(
      { error: "과목 수를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 