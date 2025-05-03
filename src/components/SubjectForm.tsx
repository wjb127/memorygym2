'use client';

import { useState } from 'react';
import { addSubject } from '../utils/leitner';

interface SubjectFormProps {
  onSubjectAdded?: () => void;
}

export default function SubjectForm({ onSubjectAdded }: SubjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setSubmitStatus(null);
    setSubmitMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setSubmitStatus('error');
      setSubmitMessage('과목 이름을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      const result = await addSubject(name, description);
      
      if (result) {
        setSubmitStatus('success');
        setSubmitMessage('과목이 성공적으로 추가되었습니다!');
        setName('');
        setDescription('');
        
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
    <div className="bg-[var(--neutral-100)] p-6 rounded-lg border border-[var(--neutral-300)] shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-4">새 과목 추가</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject-name" className="block text-sm font-medium mb-2">
            과목 이름
          </label>
          <input
            type="text"
            id="subject-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--neutral-300)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
            placeholder="예: 영어, 수학, 프로그래밍 등"
          />
        </div>
        
        <div>
          <label htmlFor="subject-description" className="block text-sm font-medium mb-2">
            과목 설명 (선택사항)
          </label>
          <textarea
            id="subject-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-[var(--neutral-300)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
            placeholder="과목에 대한 간략한 설명을 입력하세요."
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

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-sm border border-[var(--neutral-300)] rounded-lg shadow-sm text-[var(--neutral-700)] bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] focus:outline-none transition-colors"
          >
            초기화
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '처리 중...' : '과목 추가'}
          </button>
        </div>
      </form>
    </div>
  );
} 