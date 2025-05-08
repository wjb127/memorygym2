'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface LegalPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function LegalPageLayout({ children, title, description }: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            💪 암기훈련소
          </Link>
          
          <Link href="/" className="px-3 py-1 text-sm bg-[var(--neutral-200)] hover:bg-[var(--neutral-300)] rounded-md transition-colors">
            홈으로 돌아가기
          </Link>
        </div>
        
        {description && <p className="text-center mt-2 text-[var(--neutral-700)]">{description}</p>}
      </header>
      
      <div className="bg-[var(--neutral-100)] rounded-xl shadow-lg p-4 md:p-6 flex-grow border border-[var(--neutral-300)]">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 pb-4 border-b border-[var(--neutral-300)]">{title}</h1>
        <div className="prose prose-neutral max-w-none">
          {children}
        </div>
      </div>
      
      <footer className="mt-8 text-center text-sm text-[var(--neutral-700)]">
        <p>💪 암기훈련소 - 매일 훈련하는 두뇌는 더 강해집니다</p>
        
        <div className="mt-6 pt-4 border-t border-[var(--neutral-300)]">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Link href="/terms" className="hover:underline text-xs">이용약관</Link>
            <span className="text-xs">|</span>
            <Link href="/privacy" className="hover:underline text-xs">개인정보 처리방침</Link>
            <span className="text-xs">|</span>
            <Link href="/refund-policy" className="hover:underline text-xs">환불 정책</Link>
            <span className="text-xs">|</span>
            <Link href="/service" className="hover:underline text-xs">서비스 안내</Link>
          </div>
          
          <div className="text-xs text-[var(--neutral-700)] space-y-1">
            <p>(주)메모리짐 | 대표: 홍길동 | 사업자등록번호: 123-45-67890</p>
            <p>통신판매업신고: 제2023-서울강남-1234호 | 주소: 서울특별시 강남구 테헤란로 123, 4층</p>
            <p>고객센터: 02-123-4567 | 이메일: contact@memorygym.co.kr</p>
            <p>© 2023 MemoryGym Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
} 