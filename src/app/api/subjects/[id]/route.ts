import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // params를 비동기적으로 처리
    const params = await Promise.resolve(context.params);
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 과목 ID입니다.' },
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

    // Supabase REST API를 통한 과목 조회
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subjects?id=eq.${id}&select=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        }
      }
    );

    if (!response.ok) {
      console.error('[API] 과목 조회 오류:', response.statusText);
      return NextResponse.json(
        { error: '과목 조회 중 오류가 발생했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '과목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 첫 번째 결과 사용
    const subject = data[0];

    return NextResponse.json({ data: subject });
  } catch (error) {
    console.error('[API] 과목 조회 처리 중 오류:', error);
    return NextResponse.json(
      { error: '과목 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 과목 업데이트 (PUT)
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // params를 비동기적으로 처리
    const params = await Promise.resolve(context.params);
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 과목 ID입니다.' },
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
  context: { params: { id: string } }
) {
  try {
    // params를 비동기적으로 처리
    const params = await Promise.resolve(context.params);
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 과목 ID입니다.' },
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

    // Supabase REST API로 과목 삭제
    const response = await fetch(
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

    if (!response.ok) {
      console.error('[API] 과목 삭제 오류:', response.statusText);
      return NextResponse.json(
        { error: '과목 삭제 중 오류가 발생했습니다.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: '과목이 성공적으로 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('[API] 과목 삭제 처리 중 오류:', error);
    return NextResponse.json(
      { error: '과목 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 