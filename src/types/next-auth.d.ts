import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * 기본 세션에 사용자 ID를 추가하기 위한 인터페이스 확장
   */
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  /** JWT 토큰에 사용자 ID를 추가하기 위한 인터페이스 확장 */
  interface JWT {
    id: string
  }
} 