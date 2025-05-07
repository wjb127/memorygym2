import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PremiumContent from '../../components/PremiumContent';

export default async function PremiumPage() {
  const cookieStore = await cookies();
  
  // Supabase project ref 추출하여 쿠키 이름 동적 생성
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]?.split('https://')[1];
  const authCookieName = `sb-${projectRef}-auth-token`;
  
  console.log(`[프리미엄 페이지] 동적 쿠키 이름: ${authCookieName}`);
  console.log(`[프리미엄 페이지] 쿠키 존재 여부: ${!!cookieStore.get(authCookieName)}`);
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      cookies: { 
        get(key) {
          // 인증 토큰 쿠키인 경우 동적 이름 사용
          if (key === 'sb-auth-token') {
            return cookieStore.get(authCookieName)?.value;
          }
          return cookieStore.get(key)?.value;
        }
      } 
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session) {
    console.log('[프리미엄 페이지] 세션 없음, 로그인으로 리다이렉트');
    redirect('/login?redirectedFrom=/premium');
  }
  
  console.log('[프리미엄 페이지] 세션 확인 성공, 사용자:', session.user.email);

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          💪 암기훈련소 프리미엄
        </h1>
        <p className="mt-2 text-[var(--neutral-700)]">더 효과적인 학습을 위한 고급 기능</p>
        <p className="mt-1 text-sm text-[var(--neutral-700)]">
          {session.user.email} 님을 위한 프리미엄 서비스
        </p>
      </header>

      <div className="bg-[var(--neutral-100)] rounded-xl shadow-lg p-4 md:p-6 flex-grow border border-[var(--neutral-300)]">
        {/* 클라이언트 컴포넌트를 통해 프리미엄 콘텐츠 표시 */}
        <PremiumContent user={session.user} />
      </div>
      
      <footer className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block text-[var(--primary)] hover:underline"
        >
          ← 홈으로 돌아가기
        </Link>
      </footer>
    </main>
  );
} 