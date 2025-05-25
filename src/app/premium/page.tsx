import { redirect } from 'next/navigation';
import Link from 'next/link';
import PremiumContent from '../../components/PremiumContent';

export default function PremiumPage() {
  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          💪 암기훈련소 프리미엄
        </h1>
        <p className="mt-2 text-[var(--neutral-700)]">더 효과적인 학습을 위한 고급 기능</p>
      </header>
      
      <div className="bg-[var(--neutral-100)] rounded-xl shadow-lg p-4 md:p-6 flex-grow border border-[var(--neutral-300)]">
        <PremiumContent />
      </div>
      
      <footer className="mt-8 text-center">
        <Link href="/" className="text-[var(--primary)] hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </footer>
    </main>
  );
} 