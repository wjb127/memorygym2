import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateUser } from '@/utils/auth-helpers';

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params를 await로 처리
    const { id } = await params;
    
    // 카드 ID 확인
    const cardId = parseInt(id, 10);
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: "유효한 카드 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Supabase 인증 확인
    const authResult = await authenticateUser(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: authResult.status }
      );
    }

    const user = authResult.user!;

    // 요청 본문 파싱
    const { isCorrect } = await request.json();
    
    if (typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { error: "정답 여부(isCorrect)가 필요합니다." },
        { status: 400 }
      );
    }

    // 현재 카드 정보 조회
    const cardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?id=eq.${cardId}&user_id=eq.${user.id}&select=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!cardResponse.ok) {
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

    const card = cards[0];

    // 상자 번호 계산 (라이트너 시스템)
    let newBoxNumber;
    if (isCorrect) {
      // 정답: 다음 상자로 이동 (최대 5번 상자)
      newBoxNumber = Math.min(card.box_number + 1, 5);
    } else {
      // 오답: 1번 상자로 돌아감
      newBoxNumber = 1;
    }

    // 다음 복습 날짜 계산
    const reviewIntervals = [1, 3, 7, 14, 30]; // 각 상자별 복습 간격 (일)
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + reviewIntervals[newBoxNumber - 1]);

    // 카드 업데이트
    const updateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?id=eq.${cardId}&user_id=eq.${user.id}`,
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
          last_reviewed: new Date().toISOString(),
          next_review: nextReviewDate.toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      return NextResponse.json(
        { error: "카드 업데이트 중 오류가 발생했습니다." },
        { status: updateResponse.status }
      );
    }

    const updatedCards = await updateResponse.json();
    const updatedCard = updatedCards[0];

    return NextResponse.json({
      data: updatedCard,
      success: true
    });
  } catch (error) {
    console.error("카드 리뷰 처리 오류:", error);
    return NextResponse.json(
      { error: "카드 리뷰 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 