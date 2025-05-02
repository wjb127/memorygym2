'use client';

import { useState, ReactNode } from 'react';

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabLayoutProps {
  tabs: TabItem[];
}

export default function TabLayout({ tabs }: TabLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');

  return (
    <div>
      {/* 탭 헤더 */}
      <div className="flex border-b-2 border-[var(--neutral-300)] mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-6 py-4 text-sm md:text-base font-medium border-b-2 transition-colors -mb-0.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-[var(--neutral-700)] hover:text-[var(--foreground)] hover:border-[var(--neutral-500)]'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div 
            key={tab.id} 
            className={`transition-opacity duration-300 ${activeTab === tab.id ? 'block opacity-100' : 'hidden opacity-0'}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
} 