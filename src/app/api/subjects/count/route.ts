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
    
    // 비로그인 사용자에게는 0개 과목 반환
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        count: 0
      });
    }

    const token = authHeader.substring(7);
    
    // Supabase JWT 토큰 검증
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    // 토큰 검증 실패 시에도 0개 과목 반환
    if (error || !user) {
      console.log('[GET /api/subjects/count] 토큰 검증 실패, 0개 과목 반환');
      return NextResponse.json({
        count: 0
      });
    }

    // Supabase REST API를 통해 과목 수 조회
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects?user_id=eq.${user.id}&select=id`,
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
      return NextResponse.json({
        count: 0
      });
    }

    const subjects = await response.json();
    const count = Array.isArray(subjects) ? subjects.length : 0;

    return NextResponse.json({
      count: count
    });
  } catch (error) {
    console.error("과목 수 가져오기 오류:", error);
    // 오류 발생 시에도 0개 과목 반환
    return NextResponse.json({
      count: 0
    });
  }
} 