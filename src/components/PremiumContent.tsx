'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';

export default function PremiumContent() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  
  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-6 border border-purple-200">
      <div className="text-center">
        <div className="mb-4">
          <span className="text-4xl">👑</span>
        </div>
        
        <h2 className="text-2xl font-bold text-purple-800 mb-2">
          프리미엄으로 업그레이드
        </h2>
        
        <p className="text-purple-600 mb-6">
          더 많은 기능과 무제한 학습의 기회를 만나보세요!
        </p>
        
        <div className="space-y-3 mb-6 text-left">
          <div className="flex items-center">
            <span className="text-green-500 mr-3">✓</span>
            <span className="text-gray-700">무제한 과목 생성</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-3">✓</span>
            <span className="text-gray-700">무제한 카드 생성</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-3">✓</span>
            <span className="text-gray-700">고급 통계 분석</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-3">✓</span>
            <span className="text-gray-700">우선 고객지원</span>
          </div>
        </div>
        
        {isLoggedIn ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              {user?.email} 님을 위한 프리미엄 서비스
            </p>
            <button
              className="inline-block bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              onClick={() => alert('프리미엄 구매 기능은 준비 중입니다.')}
            >
              프리미엄 구매하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">프리미엄 기능을 사용하려면 먼저 로그인하세요</p>
            <Link
              href="/login"
              className="inline-block bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              로그인하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 