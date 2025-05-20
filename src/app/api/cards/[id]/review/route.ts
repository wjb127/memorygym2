import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 상자별 복습 간격 (일)
const REVIEW_INTERVALS = [
  { box_number: 1, interval_days: 1 },
  { box_number: 2, interval_days: 3 },
  { box_number: 3, interval_days: 7 },
  { box_number: 4, interval_days: 14 },
  { box_number: 5, interval_days: 30 }
];

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // params를 비동기적으로 처리
    const params = await Promise.resolve(context.params);
    
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
    const cardId = parseInt(params.id, 10);
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: "유효한 카드 ID가 필요합니다." },
        { status: 400 }
      );
    }
    
    // 요청 본문 파싱
    const { isCorrect } = await request.json();
    
    // Supabase REST API로 카드 조회
    const cardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?id=eq.${cardId}&select=*`,
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
        { error: "카드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 첫 번째 카드 사용
    const currentCard = cards[0];
    
    // 복습 결과에 따라 상자 번호 업데이트
    let newBoxNumber = currentCard.box_number;
    if (isCorrect) {
      newBoxNumber = Math.min(currentCard.box_number + 1, 5);
    } else {
      newBoxNumber = 1;
    }
    
    // 복습 간격 찾기
    const interval = REVIEW_INTERVALS.find(i => i.box_number === newBoxNumber);
    if (!interval) {
      return NextResponse.json(
        { error: "복습 간격 정보를 찾을 수 없습니다." },
        { status: 500 }
      );
    }
    
    // 다음 복습 일자 계산
    const now = new Date();
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval.interval_days);
    
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
        body: JSON.stringify({
          box_number: newBoxNumber,
          last_reviewed: now.toISOString(),
          next_review: nextReview.toISOString()
        })
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
    console.error("카드 복습 처리 오류:", error);
    return NextResponse.json(
      { error: "카드 복습 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 