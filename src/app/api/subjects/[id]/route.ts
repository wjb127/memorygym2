import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    
    // ID 확인
    if (!id) {
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

    // Supabase REST API를 통한 과목 조회
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects?id=eq.${id}&select=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "과목 조회 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const subjects = await response.json();
    
    if (!subjects || subjects.length === 0) {
      return NextResponse.json(
        { error: "과목을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자 권한 확인
    const subject = subjects[0];
    if (subject.user_id !== token.sub) {
      return NextResponse.json(
        { error: "이 과목에 대한 접근 권한이 없습니다." },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: subject });
  } catch (error) {
    console.error("과목 조회 처리 중 오류:", error);
    return NextResponse.json(
      { error: "과목 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 과목 업데이트 (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: '유효한 과목 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Next Auth 토큰으로 인증 확인
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const updateData = await request.json();
    
    // 업데이트할 필드 검증
    if (!updateData || (!updateData.name && !updateData.description && !updateData.color)) {
      return NextResponse.json(
        { error: '업데이트할 데이터가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 업데이트할 데이터 준비
    const dataToUpdate: any = {};
    if (updateData.name) dataToUpdate.name = updateData.name;
    if (updateData.description) dataToUpdate.description = updateData.description;
    if (updateData.color) dataToUpdate.color = updateData.color;
    
    // Supabase REST API로 과목 업데이트
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dataToUpdate)
      }
    );

    if (!response.ok) {
      console.error('[API] 과목 업데이트 오류:', response.statusText);
      return NextResponse.json(
        { error: '과목 업데이트 중 오류가 발생했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 업데이트된 과목이 없는 경우
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '과목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 첫 번째 결과를 사용
    const updatedSubject = data[0];

    return NextResponse.json({ 
      data: updatedSubject,
      message: '과목이 성공적으로 업데이트되었습니다.' 
    });
  } catch (error) {
    console.error('[API] 과목 업데이트 처리 중 오류:', error);
    return NextResponse.json(
      { error: '과목 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 과목 삭제 (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    
    // ID 확인
    if (!id) {
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

    // 현재 과목 확인 (사용자 권한 확인)
    const subjectResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects?id=eq.${id}&select=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );
    
    if (!subjectResponse.ok) {
      return NextResponse.json(
        { error: "과목 조회 중 오류가 발생했습니다." },
        { status: subjectResponse.status }
      );
    }
    
    const subjects = await subjectResponse.json();
    
    if (!subjects || subjects.length === 0) {
      return NextResponse.json(
        { error: "과목을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 사용자 권한 확인
    const subject = subjects[0];
    if (subject.user_id !== token.sub) {
      return NextResponse.json(
        { error: "이 과목에 대한 접근 권한이 없습니다." },
        { status: 403 }
      );
    }

    // Supabase REST API로 과목 삭제
    const deleteResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );
    
    if (!deleteResponse.ok) {
      return NextResponse.json(
        { error: "과목 삭제 중 오류가 발생했습니다." },
        { status: deleteResponse.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "과목이 성공적으로 삭제되었습니다."
    });
  } catch (error) {
    console.error("과목 삭제 처리 중 오류:", error);
    return NextResponse.json(
      { error: "과목 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 