'use client';

import { useState } from 'react';
import { addCard } from '../utils/leitner';
import SubjectSelector from './SubjectSelector';
import ExcelUploader from './ExcelUploader';

interface AddCardFormProps {
  onCardAdded?: () => void;
}

export default function AddCardForm({ onCardAdded }: AddCardFormProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [inputMode, setInputMode] = useState<'single' | 'bulk' | 'excel'>('single');
  const [selectedSubject, setSelectedSubject] = useState<number | null>(1); // 기본값은 1번 과목

  const resetForm = () => {
    setFront('');
    setBack('');
    setBulkText('');
    setSubmitStatus(null);
    setSubmitMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'bulk') {
      await handleBulkSubmit();
      return;
    }

    if (inputMode === 'excel') {
      // 엑셀 모드에서는 ExcelUploader 컴포넌트에서 처리합니다
      return;
    }

    if (!front.trim() || !back.trim()) {
      setSubmitStatus('error');
      setSubmitMessage('앞면과 뒷면을 모두 입력해주세요.');
      return;
    }

    if (selectedSubject === null) {
      setSubmitStatus('error');
      setSubmitMessage('과목을 선택해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      await addCard(front, back, selectedSubject);
      
      setSubmitStatus('success');
      setSubmitMessage('카드가 성공적으로 추가되었습니다!');
      setFront('');
      setBack('');
      
      if (onCardAdded) {
        onCardAdded();
      }
    } catch (error) {
      console.error('카드 추가 오류:', error);
      setSubmitStatus('error');
      setSubmitMessage('카드 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    const lines = bulkText.trim().split('\n');
    const cards = [];
    const errors = [];

    if (selectedSubject === null) {
      setSubmitStatus('error');
      setSubmitMessage('과목을 선택해주세요.');
      return;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        errors.push(`${i + 1}번째 줄: 올바른 형식이 아닙니다. (정답, 문제)`);
        continue;
      }

      cards.push({ front: parts[0], back: parts[1] });
    }

    if (errors.length > 0) {
      setSubmitStatus('error');
      setSubmitMessage(`오류가 있습니다:\n${errors.join('\n')}`);
      return;
    }

    if (cards.length === 0) {
      setSubmitStatus('error');
      setSubmitMessage('추가할 카드가 없습니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      for (const card of cards) {
        await addCard(card.front, card.back, selectedSubject);
      }
      
      setSubmitStatus('success');
      setSubmitMessage(`${cards.length}개의 카드가 성공적으로 추가되었습니다!`);
      setBulkText('');
      
      if (onCardAdded) {
        onCardAdded();
      }
    } catch (error) {
      console.error('대량 카드 추가 오류:', error);
      setSubmitStatus('error');
      setSubmitMessage('카드 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 과목 변경 핸들러
  const handleSubjectChange = (subjectId: number | null) => {
    setSelectedSubject(subjectId);
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
        🧠 두뇌 운동 카드 추가
      </h2>
      
      <div className="mb-6 flex justify-center">
        <div className="flex flex-wrap rounded-lg overflow-hidden border border-[var(--neutral-300)] shadow-sm">
          <button
            type="button"
            onClick={() => setInputMode('single')}
            className={`px-4 py-2.5 text-sm font-medium ${inputMode === 'single' 
              ? 'bg-[var(--primary)] text-white shadow-sm' 
              : 'bg-[var(--neutral-100)] text-[var(--neutral-700)] hover:bg-[var(--neutral-200)]'} transition-colors`}
          >
            🧩 단일 카드
          </button>
          <button
            type="button"
            onClick={() => setInputMode('bulk')}
            className={`px-4 py-2.5 text-sm font-medium ${inputMode === 'bulk' 
              ? 'bg-[var(--primary)] text-white shadow-sm' 
              : 'bg-[var(--neutral-100)] text-[var(--neutral-700)] hover:bg-[var(--neutral-200)]'} transition-colors`}
          >
            📚 대량 카드
          </button>
          <button
            type="button"
            onClick={() => setInputMode('excel')}
            className={`px-4 py-2.5 text-sm font-medium ${inputMode === 'excel' 
              ? 'bg-[var(--primary)] text-white shadow-sm' 
              : 'bg-[var(--neutral-100)] text-[var(--neutral-700)] hover:bg-[var(--neutral-200)]'} transition-colors`}
          >
            📊 엑셀 업로드
          </button>
        </div>
      </div>

      {inputMode === 'excel' ? (
        <ExcelUploader onCardsAdded={onCardAdded} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <SubjectSelector
            selectedSubject={selectedSubject}
            onSubjectChange={handleSubjectChange}
            includeAllOption={false}
            label="카드를 추가할 과목"
          />
          
          {inputMode === 'single' ? (
            <>
              <div className="bg-[var(--neutral-100)] p-6 rounded-lg border border-[var(--neutral-300)] shadow-sm">
                <div className="mb-4">
                  <label htmlFor="front" className="block text-sm font-medium mb-2">
                    💡 정답 (예: 단어)
                  </label>
                  <input
                    type="text"
                    id="front"
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--neutral-300)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    placeholder="정답이 되는 단어나 내용을 입력하세요"
                  />
                </div>
                
                <div>
                  <label htmlFor="back" className="block text-sm font-medium mb-2">
                    ❓ 문제 (예: 설명)
                  </label>
                  <input
                    type="text"
                    id="back"
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--neutral-300)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    placeholder="문제가 되는 설명이나 힌트를 입력하세요"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[var(--neutral-100)] p-6 rounded-lg border border-[var(--neutral-300)] shadow-sm">
              <label htmlFor="bulkText" className="block text-sm font-medium mb-2">
                📚 대량 카드 (정답, 문제 형식)
              </label>
              <textarea
                id="bulkText"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-[var(--neutral-300)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="각 줄마다 한 개의 카드를 추가합니다. 형식: 정답, 문제
예시:
apple, 사과는 영어로?
book, 책은 영어로?
computer, 컴퓨터는 영어로?"
              />
              <p className="mt-2 text-sm text-[var(--neutral-700)]">
                각 줄에 하나의 카드를 정답과 문제를 쉼표로 구분하여 입력하세요.
              </p>
            </div>
          )}

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
                <div>
                  {submitMessage.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-3 text-sm border border-[var(--neutral-300)] rounded-lg shadow-sm text-[var(--neutral-700)] bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] focus:outline-none transition-colors"
            >
              🔄 초기화
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-3 text-sm font-medium rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '⏳ 처리 중...' : inputMode === 'bulk' ? '📚 여러 카드 추가' : '💪 카드 추가'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 