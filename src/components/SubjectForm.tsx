'use client';

import { useState } from 'react';
import { addSubject } from '../utils/leitner';
import { useAuth } from '@/context/AuthProvider';
import { useCards } from '@/context/CardContext';

interface SubjectFormProps {
  onSubjectAdded?: () => void;
}

export default function SubjectForm({ onSubjectAdded }: SubjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  
  const { user, session, getAuthHeaders } = useAuth();
  const isAuthenticated = !!user && !!session;
  // 카드 상태 관리 컨텍스트 사용
  const { refreshCards } = useCards();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      setSubmitStatus('error');
      setSubmitMessage('과목을 추가하려면 로그인이 필요합니다.');
      return;
    }

    if (!name.trim()) {
      setSubmitStatus('error');
      setSubmitMessage('과목 이름을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      // 인증 헤더 가져오기
      const authHeaders = getAuthHeaders();

      const result = await addSubject(name, description, authHeaders);
      
      if (result) {
        setSubmitStatus('success');
        setSubmitMessage('과목이 성공적으로 추가되었습니다!');
        setName('');
        setDescription('');
        
        // 카드 상태 업데이트 (컨텍스트 통해 다른 컴포넌트에 알림)
        refreshCards();
        
        if (onSubjectAdded) {
          onSubjectAdded();
        }
      } else {
        setSubmitStatus('error');
        setSubmitMessage('과목 추가 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('과목 추가 오류:', error);
      setSubmitStatus('error');
      setSubmitMessage('과목 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--neutral-100)] rounded-lg border border-[var(--neutral-300)] p-6 shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-4">새 과목 추가</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            과목 이름
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--neutral-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
            placeholder="예: 영어 단어, 한국사, 프로그래밍 등"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            설명 (선택사항)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-[var(--neutral-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
            placeholder="과목에 대한 간단한 설명을 입력하세요"
            disabled={isSubmitting}
          />
        </div>
        
        {submitStatus && (
          <div 
            className={`p-4 rounded-lg ${
              submitStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2 text-lg">
                {submitStatus === 'success' ? '✅' : '❌'}
              </span>
              <p>{submitMessage}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '⏳ 처리 중...' : '📚 과목 추가'}
          </button>
        </div>
      </form>
    </div>
  );
} 