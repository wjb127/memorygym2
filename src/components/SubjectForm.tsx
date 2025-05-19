'use client';

import { useState } from 'react';
import { addSubject } from '../utils/leitner';
import { usePremium } from '@/context/PremiumContext';
import { useAuth } from '@/context/AuthContext';

interface SubjectFormProps {
  onSubjectAdded?: () => void;
}

export default function SubjectForm({ onSubjectAdded }: SubjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  
  // 프리미엄 상태 확인
  const { canAddSubject, isPremium, currentPlan, totalSubjectsCount } = usePremium();
  const { user } = useAuth();

  const resetForm = () => {
    setName('');
    setDescription('');
    setSubmitStatus(null);
    setSubmitMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setSubmitStatus('error');
      setSubmitMessage('과목을 추가하려면 로그인이 필요합니다.');
      return;
    }

    if (!name.trim()) {
      setSubmitStatus('error');
      setSubmitMessage('과목 이름을 입력해주세요.');
      return;
    }
    
    // 과목 추가 가능 여부 확인
    if (!canAddSubject) {
      setSubmitStatus('error');
      setSubmitMessage(`무료 회원은 최대 ${currentPlan?.max_subjects || 1}개의 과목만 생성할 수 있습니다. 프리미엄으로 업그레이드하세요.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      const result = await addSubject(name, description);
      
      setSubmitStatus('success');
      setSubmitMessage('과목이 성공적으로 추가되었습니다!');
      setName('');
      setDescription('');
      
      if (onSubjectAdded) {
        onSubjectAdded();
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : '과목 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--neutral-100)] rounded-lg border border-[var(--neutral-300)] p-6 shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-4">새 과목 추가</h3>
      
      {!isPremium && (
        <div className="mb-4 p-3 bg-[var(--neutral-200)] rounded-md text-sm">
          <p className="font-medium">무료 플랜 제한</p>
          <p className="mt-1 text-[var(--neutral-700)]">
            현재 {totalSubjectsCount}/{currentPlan?.max_subjects || 1} 과목을 사용 중입니다.
            {!canAddSubject && ' 더 이상 과목을 추가할 수 없습니다. 프리미엄으로 업그레이드하세요.'}
          </p>
        </div>
      )}
      
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
            disabled={!canAddSubject || isSubmitting}
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
            disabled={!canAddSubject || isSubmitting}
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
            disabled={!canAddSubject || isSubmitting}
            className={`px-4 py-2 rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-colors ${
              (!canAddSubject || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '⏳ 처리 중...' : '📚 과목 추가'}
          </button>
        </div>
      </form>
    </div>
  );
} 