import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { password } = requestData;
    
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: err.message || '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 