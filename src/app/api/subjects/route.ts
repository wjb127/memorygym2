import { getToken } from "next-auth/jwt";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Next Auth 토큰 확인
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // 세션 상태 로깅
    console.log('[GET /api/subjects] 세션 상태:', {
      hasToken: !!token,
      userId: token?.sub,
      userEmail: token?.email
    });

    // 미들웨어에서 이미 세션 확인을 했으므로, 여기서는 간단하게 처리
    if (!token) {
      console.log('[GET /api/subjects] 토큰 없음, 미들웨어 처리 의존');
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    try {
      // Supabase REST API를 통해 과목 목록 조회
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects?user_id=eq.${token.sub}&select=*&order=created_at.desc`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!response.ok) {
        console.error('[GET /api/subjects] Supabase API 오류:', response.statusText);
        return NextResponse.json(
          { error: '과목 목록 조회 중 오류가 발생했습니다.' },
          { status: response.status }
        );
      }

      const subjects = await response.json();
      return NextResponse.json({ data: subjects });
    } catch (dbError) {
      console.error('[GET /api/subjects] DB 조회 오류:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[GET /api/subjects] 처리 중 오류:', error);
    return NextResponse.json(
      { error: '과목 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    
    if (!name?.trim()) {
      return NextResponse.json(
        { error: '과목 이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Next Auth 토큰 확인
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // 세션 상태 로깅
    console.log('[POST /api/subjects] 세션 상태:', {
      hasToken: !!token,
      userId: token?.sub,
      userEmail: token?.email
    });
    
    if (!token) {
      console.log('[POST /api/subjects] 세션 없음, 과목 추가 불가');
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    try {
      // Supabase REST API를 통해 과목 추가
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            name,
            description: description || null,
            user_id: token.sub,
            created_at: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        console.error('[POST /api/subjects] Supabase API 오류:', response.statusText);
        return NextResponse.json(
          { error: '과목 추가 중 오류가 발생했습니다.' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const newSubject = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (!newSubject) {
        return NextResponse.json(
          { error: '과목 추가 결과를 찾을 수 없습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: newSubject });
    } catch (dbError) {
      console.error('[POST /api/subjects] DB 추가 오류:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 추가 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[POST /api/subjects] 처리 중 오류:', error);
    return NextResponse.json(
      { error: '과목 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 