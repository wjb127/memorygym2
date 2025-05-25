import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = request.headers.get('authorization');
    
    // 비로그인 사용자에게는 기본 프로필 반환
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        id: null,
        email: null,
        name: 'Guest',
        provider: 'none',
        is_premium: false,
        premium_until: null,
        created_at: null,
        last_sign_in_at: null
      });
    }

    const token = authHeader.substring(7);
    
    // Supabase JWT 토큰 검증
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    // 토큰 검증 실패 시에도 기본 프로필 반환
    if (error || !user) {
      console.log('[GET /api/profile] 토큰 검증 실패, 기본 프로필 반환');
      return NextResponse.json({
        id: null,
        email: null,
        name: 'Guest',
        provider: 'none',
        is_premium: false,
        premium_until: null,
        created_at: null,
        last_sign_in_at: null
      });
    }

    // 사용자 프로필 정보 반환
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name || 'Unknown',
      provider: user.app_metadata?.provider || 'unknown',
      is_premium: false, // TODO: 실제 프리미엄 상태 조회
      premium_until: null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    });
  } catch (error) {
    console.error("프로필 정보 가져오기 오류:", error);
    // 오류 발생 시에도 기본 프로필 반환
    return NextResponse.json({
      id: null,
      email: null,
      name: 'Guest',
      provider: 'none',
      is_premium: false,
      premium_until: null,
      created_at: null,
      last_sign_in_at: null
    });
  }
} 