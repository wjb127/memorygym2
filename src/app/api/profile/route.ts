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

    // 실제 구현에서는 데이터베이스에서 프로필 정보를 가져와야 합니다
    // 현재는 테스트용 더미 데이터 반환
    return NextResponse.json({
      id: token.id,
      email: token.email,
      name: token.name,
      is_premium: false,
      premium_until: null,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("프로필 정보 가져오기 오류:", error);
    return NextResponse.json(
      { error: "프로필 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 