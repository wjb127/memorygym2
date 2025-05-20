import { redirect } from 'next/navigation';
import Link from 'next/link';
import PremiumContent from '../../components/PremiumContent';
import { auth } from '@/auth';

export default async function PremiumPage() {
  // Next Auth 세션 가져오기
  const session = await auth();
  
  console.log('[프리미엄 페이지] 세션 확인:', {
    hasSession: !!session,
    userId: session?.user?.id
  });
  
  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session) {
    console.log('[프리미엄 페이지] 세션 없음, 로그인으로 리다이렉트');
    redirect('/login?redirectedFrom=/premium');
  }
  
  console.log('[프리미엄 페이지] 세션 확인 성공, 사용자:', session.user?.email);

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          💪 암기훈련소 프리미엄
        </h1>
        <p className="mt-2 text-[var(--neutral-700)]">더 효과적인 학습을 위한 고급 기능</p>
        <p className="mt-1 text-sm text-[var(--neutral-700)]">
          {session.user?.email || '사용자'} 님을 위한 프리미엄 서비스
        </p>
      </header>
      
      <div className="bg-[var(--neutral-100)] rounded-xl shadow-lg p-4 md:p-6 flex-grow border border-[var(--neutral-300)]">
        <PremiumContent user={session.user} />
      </div>
      
      <footer className="mt-8 text-center">
        <Link href="/" className="text-[var(--primary)] hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </footer>
    </main>
  );
} 