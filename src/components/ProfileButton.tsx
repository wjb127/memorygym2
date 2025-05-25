'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';

export default function ProfileButton() {
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 바깥쪽 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 로딩 중이거나 로그인되지 않은 경우는 표시하지 않음
  if (loading || !user) {
    return null;
  }

  // 첫 글자 추출하여 프로필 이니셜 생성
  const getInitials = () => {
    const name = user.user_metadata?.full_name || user.user_metadata?.name;
    if (name && name.trim() !== '') {
      return name.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
        aria-label="프로필 메뉴"
      >
        {getInitials()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[var(--neutral-100)] rounded-lg shadow-lg py-1 z-10 border border-[var(--neutral-300)]">
          <div className="px-4 py-2 border-b border-[var(--neutral-300)]">
            <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.user_metadata?.name || '사용자'}</p>
            <p className="text-xs text-[var(--neutral-700)] truncate">{user.email}</p>
          </div>
          
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm hover:bg-[var(--neutral-200)] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            계정 관리
          </Link>
          
          {/* 프리미엄 링크 임시 숨김 (추후 앱 출시 시 광고 수익 모델로 전환 예정) */}
          {/* <Link
            href="/premium"
            className="block px-4 py-2 text-sm hover:bg-[var(--neutral-200)] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            프리미엄 변경
          </Link> */}
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[var(--neutral-200)] transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
} 