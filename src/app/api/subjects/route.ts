import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SAMPLE_SUBJECTS } from '@/utils/sample-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = request.headers.get('authorization');
    
    // 세션 상태 로깅
    console.log('[GET /api/subjects] 인증 상태:', {
      hasAuthHeader: !!authHeader,
      authHeaderType: authHeader?.startsWith('Bearer ') ? 'Bearer' : 'Invalid'
    });

    // 로그인하지 않은 사용자에게는 샘플 데이터 제공
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[GET /api/subjects] 비로그인 사용자에게 샘플 데이터 제공');
      return NextResponse.json({ data: SAMPLE_SUBJECTS });
    }

    const token = authHeader.substring(7);
    
    // Supabase JWT 토큰 검증
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('[GET /api/subjects] 토큰 검증 실패, 샘플 데이터 제공');
      return NextResponse.json({ data: SAMPLE_SUBJECTS });
    }

    const userId = user.id;

    try {
      // Supabase REST API를 통해 과목 목록 조회
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects?user_id=eq.${userId}&select=*&order=created_at.desc`,
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
      
      // 로그인된 사용자에게는 실제 과목만 반환 (샘플 제외)
      console.log('[GET /api/subjects] 로그인 사용자에게 실제 과목만 반환:', subjects.length + '개');
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
    console.log('[POST /api/subjects] 과목 생성 요청 시작');
    
    const body = await request.json();
    const { name, description } = body;
    
    console.log('[POST /api/subjects] 요청 데이터:', {
      name: name || '없음',
      description: description || '없음',
      bodyKeys: Object.keys(body)
    });
    
    if (!name?.trim()) {
      console.log('[POST /api/subjects] 과목 이름 누락');
      return NextResponse.json(
        { error: '과목 이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = request.headers.get('authorization');
    console.log('[POST /api/subjects] 인증 헤더 확인:', {
      hasAuthHeader: !!authHeader,
      headerStart: authHeader?.substring(0, 20) + '...'
    });
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[POST /api/subjects] 인증 헤더 누락 또는 잘못된 형식');
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('[POST /api/subjects] JWT 토큰 길이:', token.length);
    
    // Supabase JWT 토큰 검증
    console.log('[POST /api/subjects] Supabase 토큰 검증 시작');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('[POST /api/subjects] 토큰 검증 실패:', {
        error: error?.message || '없음',
        hasUser: !!user
      });
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    const userId = user.id;
    console.log('[POST /api/subjects] 사용자 인증 성공:', {
      userId: userId,
      userEmail: user.email
    });

    try {
      // Supabase REST API를 통해 과목 추가
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('[POST /api/subjects] Supabase 환경변수 확인:', {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        urlLength: supabaseUrl?.length || 0
      });
      
      const postData = {
        name,
        description: description || null,
        user_id: userId,
        created_at: new Date().toISOString()
      };
      
      console.log('[POST /api/subjects] DB 삽입 데이터:', postData);
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/subjects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey || '',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(postData)
        }
      );

      console.log('[POST /api/subjects] Supabase API 응답 상태:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[POST /api/subjects] Supabase API 오류 세부사항:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        return NextResponse.json(
          { error: '과목 추가 중 오류가 발생했습니다.' },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('[POST /api/subjects] Supabase API 응답 데이터:', data);
      
      const newSubject = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (!newSubject) {
        console.log('[POST /api/subjects] 응답에서 새 과목 데이터를 찾을 수 없음');
        return NextResponse.json(
          { error: '과목 추가 결과를 찾을 수 없습니다.' },
          { status: 500 }
        );
      }

      console.log('[POST /api/subjects] 과목 생성 성공:', {
        id: newSubject.id,
        name: newSubject.name
      });

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