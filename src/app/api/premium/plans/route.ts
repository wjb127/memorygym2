import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 프리미엄 플랜 데이터 (실제로는 데이터베이스에서 가져와야 함)
const PREMIUM_PLANS = [
  {
    id: 1,
    name: "무료",
    description: "기본 무료 플랜",
    price_monthly: 0,
    price_yearly: 0,
    max_subjects: 1,
    max_cards_per_subject: 100
  },
  {
    id: 2,
    name: "프리미엄",
    description: "프리미엄 플랜",
    price_monthly: 4900,
    price_yearly: 49000,
    max_subjects: -1, // 무제한
    max_cards_per_subject: -1 // 무제한
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planName = searchParams.get("name");
    
    if (planName) {
      // 특정 이름의 플랜 찾기
      const plan = PREMIUM_PLANS.find(p => p.name === planName);
      
      if (!plan) {
        return NextResponse.json(
          { error: "요청한 플랜을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      
      return NextResponse.json(plan);
    }
    
    // 모든 플랜 반환
    return NextResponse.json(PREMIUM_PLANS);
  } catch (error) {
    console.error("프리미엄 플랜 정보 가져오기 오류:", error);
    return NextResponse.json(
      { error: "프리미엄 플랜 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 