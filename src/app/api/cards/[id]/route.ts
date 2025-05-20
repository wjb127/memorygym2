import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    
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
    
    // 카드 ID 확인
    const cardId = parseInt(id, 10);
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: "유효한 카드 ID가 필요합니다." },
        { status: 400 }
      );
    }
    
    // 요청 본문 파싱
    const updates = await request.json();
    
    // 필수 필드 검증
    if (updates.front !== undefined && !updates.front.trim()) {
      return NextResponse.json(
        { error: "정답을 비워둘 수 없습니다." },
        { status: 400 }
      );
    }
    
    if (updates.back !== undefined && !updates.back.trim()) {
      return NextResponse.json(
        { error: "문제를 비워둘 수 없습니다." },
        { status: 400 }
      );
    }
    
    // 현재 카드 확인 (사용자 권한 확인)
    const cardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?id=eq.${cardId}&user_id=eq.${token.sub}&select=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );
    
    if (!cardResponse.ok) {
      console.error("카드 조회 오류:", cardResponse.statusText);
      return NextResponse.json(
        { error: "카드 조회 중 오류가 발생했습니다." },
        { status: cardResponse.status }
      );
    }
    
    const cards = await cardResponse.json();
    
    if (!cards || cards.length === 0) {
      return NextResponse.json(
        { error: "카드를 찾을 수 없거나 접근 권한이 없습니다." },
        { status: 404 }
      );
    }
    
    // 업데이트할 필드 준비 (요청에서 받은 필드만)
    const fieldsToUpdate: Record<string, any> = {};
    
    if (updates.front !== undefined) fieldsToUpdate.front = updates.front;
    if (updates.back !== undefined) fieldsToUpdate.back = updates.back;
    
    // Supabase REST API로 카드 업데이트
    const updateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?id=eq.${cardId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(fieldsToUpdate)
      }
    );
    
    if (!updateResponse.ok) {
      console.error("카드 업데이트 오류:", updateResponse.statusText);
      return NextResponse.json(
        { error: "카드 업데이트 중 오류가 발생했습니다." },
        { status: updateResponse.status }
      );
    }
    
    const updatedCards = await updateResponse.json();
    
    if (!updatedCards || updatedCards.length === 0) {
      return NextResponse.json(
        { error: "카드 업데이트 결과를 찾을 수 없습니다." },
        { status: 500 }
      );
    }
    
    // 첫 번째 결과 사용
    const updatedCard = updatedCards[0];
    
    return NextResponse.json({
      data: updatedCard,
      success: true
    });
  } catch (error) {
    console.error("카드 업데이트 처리 오류:", error);
    return NextResponse.json(
      { error: "카드 업데이트 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    
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
    
    // 카드 ID 확인
    const cardId = parseInt(id, 10);
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: "유효한 카드 ID가 필요합니다." },
        { status: 400 }
      );
    }
    
    // 현재 카드 확인 (사용자 권한 확인)
    const cardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?id=eq.${cardId}&user_id=eq.${token.sub}&select=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );
    
    if (!cardResponse.ok) {
      console.error("카드 조회 오류:", cardResponse.statusText);
      return NextResponse.json(
        { error: "카드 조회 중 오류가 발생했습니다." },
        { status: cardResponse.status }
      );
    }
    
    const cards = await cardResponse.json();
    
    if (!cards || cards.length === 0) {
      return NextResponse.json(
        { error: "카드를 찾을 수 없거나 접근 권한이 없습니다." },
        { status: 404 }
      );
    }
    
    // Supabase REST API로 카드 삭제
    const deleteResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?id=eq.${cardId}`,
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
      console.error("카드 삭제 오류:", deleteResponse.statusText);
      return NextResponse.json(
        { error: "카드 삭제 중 오류가 발생했습니다." },
        { status: deleteResponse.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "카드가 성공적으로 삭제되었습니다."
    });
  } catch (error) {
    console.error("카드 삭제 처리 오류:", error);
    return NextResponse.json(
      { error: "카드 삭제 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 