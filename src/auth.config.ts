import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { signInWithEmail } from "@/utils/supabase-client";

// 테스트용 백업 계정(실제 로그인이 불가능할 경우 사용)
const TEST_USERS = [
  {
    id: "user-test-1",
    email: "wjb127@naver.com",
    password: "Simon1793@", 
    name: "테스트 계정"
  }
];

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    // 세션 만료 시간을 2시간으로 설정 (7200초)
    maxAge: 2 * 60 * 60,
    strategy: "jwt",
    updateAge: 15 * 60, // 15분마다 세션 업데이트
  },
  callbacks: {
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        
        // 토큰에 만료 시간이 있는 경우 표시만 하고 세션 만료는 NextAuth가 자동 처리
        // (session.expires는 NextAuth가 자동으로 설정함)
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    authorized({ auth, request }) {
      // 서버 컴포넌트에서 인증 필요한 페이지에 접근할 때 사용
      const isLoggedIn = !!auth?.user;
      const isApiRoute = request.nextUrl.pathname.startsWith('/api');
      
      if (isApiRoute) {
        // API 라우트는 인증 필요
        return isLoggedIn;
      }
      
      // 기타 페이지는 모두 접근 가능
      return true;
    },
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "이메일/비밀번호",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("인증 실패: 필수 정보 누락");
          return null;
        }

        try {
          // Supabase 클라이언트를 통한 로그인
          const result = await signInWithEmail(
            credentials.email as string, 
            credentials.password as string
          );
          
          if (result.error || !result.data?.user) {
            console.log("Supabase 인증 실패:", result.error?.message || "사용자 데이터 없음");
            
            // Supabase 로그인 실패 시 테스트 계정 확인 (개발 환경에서만 사용)
            if (process.env.NODE_ENV === 'development') {
              const testUser = TEST_USERS.find(
                user => user.email === credentials.email && user.password === credentials.password
              );
              
              if (testUser) {
                console.log("테스트 계정으로 인증 성공:", testUser.email);
                return {
                  id: testUser.id,
                  email: testUser.email,
                  name: testUser.name,
                };
              }
            }
            
            return null;
          }
          
          const user = result.data.user;
          console.log("Supabase 인증 성공:", user.email || '이메일 없음');
          
          // Next Auth에서 사용할 사용자 객체 반환
          return {
            id: user.id || '',
            email: user.email || '',
            name: user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '사용자'),
          };
        } catch (error: any) {
          console.error("인증 처리 중 오류:", error.message || '알 수 없는 오류');
          return null;
        }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig; 