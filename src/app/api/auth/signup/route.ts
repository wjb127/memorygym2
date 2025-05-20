import { NextResponse } from "next/server";
import { signUpWithEmail } from "@/utils/supabase-client";

// 새 사용자를 저장하기 위한 임시 데이터 저장소
// 실제 구현에서는 데이터베이스를 사용해야 합니다
let USERS: { id: string; email: string; password: string; name?: string }[] = [];

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // Supabase에 회원가입 요청
    const { data, error } = await signUpWithEmail(email, password, name);

    if (error) {
      // 이미 가입된 이메일인 경우
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return NextResponse.json(
          { error: "이미 가입된 이메일 주소입니다." },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || "회원가입 처리 중 오류가 발생했습니다." },
        { status: 400 }
      );
    }

    console.log(`사용자 등록 완료: ${email}`);

    return NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      user: {
        id: data?.user?.id || '',
        email: data?.user?.email || '',
        name: data?.user?.user_metadata?.name || name || email.split('@')[0]
      }
    });
  } catch (error: any) {
    console.error("회원가입 처리 중 오류:", error);
    return NextResponse.json(
      { error: "회원가입 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 