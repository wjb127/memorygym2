'use client';

import { useState } from 'react';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const toggleFeedback = () => {
    setIsOpen(!isOpen);
    // 폼을 닫을 때 상태 초기화
    if (isOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFeedback('');
    setEmail('');
    setSubmitStatus(null);
    setSubmitMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setSubmitStatus('error');
      setSubmitMessage('피드백 내용을 입력해주세요.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      
      // API 엔드포인트를 통해 피드백 전송
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: feedback,
          email: email || null
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '피드백 제출 중 오류가 발생했습니다.');
      }
      
      setSubmitStatus('success');
      setSubmitMessage('피드백이 성공적으로 전송되었습니다. 감사합니다!');
      
      // 성공 후 3초 뒤에 폼 닫기
      setTimeout(() => {
        resetForm();
        setIsOpen(false);
      }, 3000);
      
    } catch (error) {
      console.error('피드백 제출 오류:', error);
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : '피드백 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 피드백 버튼 */}
      <button
        onClick={toggleFeedback}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
          isOpen ? 'bg-[var(--neutral-700)] rotate-45' : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
        }`}
        aria-label="피드백 보내기"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* 피드백 모달 */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-[var(--neutral-300)] overflow-hidden">
          <div className="bg-[var(--primary)] text-white py-3 px-4">
            <h3 className="font-medium">피드백 보내기</h3>
            <p className="text-xs opacity-90">서비스 개선에 도움이 됩니다</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-3">
              <label htmlFor="feedback" className="block text-sm font-medium mb-1 text-[var(--neutral-700)]">
                피드백 내용
              </label>
              <textarea
                id="feedback"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--neutral-300)] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="의견이나 개선사항을 자유롭게 작성해주세요."
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-[var(--neutral-700)]">
                이메일 (선택사항)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--neutral-300)] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="회신이 필요하시면 이메일을 남겨주세요."
              />
            </div>
            
            {submitStatus && (
              <div 
                className={`p-3 rounded-md mb-4 text-sm ${
                  submitStatus === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-100' 
                    : 'bg-red-50 text-red-800 border border-red-100'
                }`}
              >
                {submitMessage}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-colors ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? '제출 중...' : '피드백 보내기'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 