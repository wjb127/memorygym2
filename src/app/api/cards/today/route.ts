import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateUser } from '@/utils/auth-helpers';

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
    
    // 오늘 날짜 설정
    const today = new Date().toISOString().split('T')[0];
    
    // Supabase REST API를 통해 오늘 복습할 카드 조회
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?user_id=eq.${user.id}&next_review=lte.${today}T23:59:59&select=*&order=next_review.asc`,
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
        { error: "오늘의 카드 조회 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const cards = await response.json();
    
    return NextResponse.json({ 
      data: cards || [] 
    });
  } catch (error) {
    console.error("오늘의 카드 조회 처리 오류:", error);
    return NextResponse.json(
      { error: "오늘의 카드 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 