'use client';

import { useState, useEffect } from 'react';
import { addCard, ensureDefaultSubject } from '../utils/leitner';
import SubjectSelector from './SubjectSelector';
import ExcelUploader from './ExcelUploader';
import { usePremium } from '@/context/PremiumContext';
import { useCards } from '@/context/CardContext';

interface AddCardFormProps {
  onCardAdded?: () => void;
  updateBoxCounts?: () => void;
}

export default function AddCardForm({ onCardAdded, updateBoxCounts }: AddCardFormProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [inputMode, setInputMode] = useState<'single' | 'bulk' | 'excel'>('single');
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null); // 초기값은 null로 설정
  
  // 프리미엄 상태 확인
  const { isPremium, currentPlan, canAddCard, getSubjectCardCount } = usePremium();
  const [canAddCardToSubject, setCanAddCardToSubject] = useState(true);
  const [cardCount, setCardCount] = useState(0);
  
  // 카드 상태 관리 컨텍스트 사용
  const { refreshCards } = useCards();
  
  // 컴포넌트 마운트 시 기본 과목 확인
  useEffect(() => {
    const initDefaultSubject = async () => {
      try {
        // 기본 과목 확인 및 선택
        const defaultSubjectId = await ensureDefaultSubject();
        if (defaultSubjectId) {
          console.log(`[AddCardForm] 기본 과목 설정: ID=${defaultSubjectId}`);
          setSelectedSubject(defaultSubjectId);
        }
      } catch (error) {
        console.error('[AddCardForm] 기본 과목 초기화 오류:', error);
      }
    };
    
    if (!selectedSubject) {
      initDefaultSubject();
    }
  }, []);
  
  // 선택한 과목이 변경되거나 카드가 추가될 때마다 카드 추가 가능 여부 확인
  useEffect(() => {
    const checkCardLimit = async () => {
      if (!selectedSubject) return;
      
      const count = await getSubjectCardCount(selectedSubject);
      setCardCount(count);
      
      const canAdd = await canAddCard(selectedSubject);
      setCanAddCardToSubject(canAdd);
    };
    
    checkCardLimit();
  }, [selectedSubject, canAddCard, getSubjectCardCount]);

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
    
    // 카드 추가 가능 여부 확인
    if (!canAddCardToSubject) {
      setSubmitStatus('error');
      setSubmitMessage(`이 과목에는 더 이상 퀴즈를 추가할 수 없습니다. 무료 회원은 과목당 최대 ${currentPlan?.max_cards_per_subject || 100}개의 퀴즈만 추가할 수 있습니다. 프리미엄으로 업그레이드하세요.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      console.log(`[AddCardForm] 퀴즈 추가 시작: ${front} / ${back}, 과목 ID: ${selectedSubject}`);
      const result = await addCard(front, back, selectedSubject);
      
      console.log(`[AddCardForm] 퀴즈 추가 성공:`, result);
      
      setSubmitStatus('success');
      setSubmitMessage('퀴즈가 성공적으로 추가되었습니다!');
      setFront('');
      setBack('');
      
      // 카드 상태 업데이트 (컨텍스트 통해 다른 컴포넌트에 알림)
      refreshCards();
      
      // 카드 카운트 업데이트
      if (selectedSubject) {
        const newCount = await getSubjectCardCount(selectedSubject);
        setCardCount(newCount);
        const canAdd = await canAddCard(selectedSubject);
        setCanAddCardToSubject(canAdd);
      }
      
      // 훈련소 카운트 업데이트 함수 호출
      if (updateBoxCounts) {
        updateBoxCounts();
      }
      
      if (onCardAdded) {
        onCardAdded();
      }
    } catch (error: any) {
      console.error('[AddCardForm] 퀴즈 추가 오류:', error);
      setSubmitStatus('error');
      
      // 오류 메시지 설정
      if (error.message) {
        setSubmitMessage(error.message);
      } else {
        setSubmitMessage('퀴즈 추가 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
      }
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
    
    // 카드 추가 가능 여부 확인
    if (!canAddCardToSubject) {
      setSubmitStatus('error');
      setSubmitMessage(`이 과목에는 더 이상 퀴즈를 추가할 수 없습니다. 무료 회원은 과목당 최대 ${currentPlan?.max_cards_per_subject || 100}개의 퀴즈만 추가할 수 있습니다. 프리미엄으로 업그레이드하세요.`);
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
      setSubmitMessage('추가할 퀴즈가 없습니다.');
      return;
    }
    
    // 무료 회원의 경우 카드 추가 가능 개수 확인
    if (!isPremium && selectedSubject) {
      const maxAllowed = currentPlan?.max_cards_per_subject || 100;
      if (cardCount + cards.length > maxAllowed) {
        setSubmitStatus('error');
        setSubmitMessage(`무료 회원은 과목당 최대 ${maxAllowed}개의 퀴즈만 추가할 수 있습니다. 현재 ${cardCount}개가 있으므로 ${maxAllowed - cardCount}개만 추가할 수 있습니다. 프리미엄으로 업그레이드하세요.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      console.log(`[AddCardForm] 대량 퀴즈 추가 시작: ${cards.length}개, 과목 ID: ${selectedSubject}`);
      
      let successCount = 0;
      let failCount = 0;
      const errorMessages = [];
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        try {
          console.log(`[AddCardForm] 퀴즈 추가 중 (${i+1}/${cards.length}): ${card.front} / ${card.back}`);
          const result = await addCard(card.front, card.back, selectedSubject);
          successCount++;
        } catch (cardError: any) {
          failCount++;
          const errorMsg = cardError.message || '알 수 없는 오류';
          errorMessages.push(`${i+1}번째 퀴즈: ${errorMsg}`);
          console.error(`[AddCardForm] 퀴즈 추가 오류 (${i+1}/${cards.length}):`, cardError);
          
          // 과목 관련 오류라면 모든 작업 중단
          if (errorMsg.includes('과목이 존재하지 않거나 접근할 수 없습니다')) {
            throw new Error(errorMsg);
          }
        }
      }
      
      console.log(`[AddCardForm] 대량 퀴즈 추가 완료: 성공=${successCount}, 실패=${failCount}`);
      
      // 성공한 카드가 하나라도 있으면 상태 업데이트
      if (successCount > 0) {
        // 카드 상태 업데이트 (컨텍스트 통해 다른 컴포넌트에 알림)
        refreshCards();
        
        // 훈련소 카운트 업데이트 함수 호출
        if (updateBoxCounts) {
          updateBoxCounts();
        }
      }
      
      // 오류가 있으면 오류 메시지 표시
      if (failCount > 0) {
        if (successCount > 0) {
          setSubmitStatus('success');
          setSubmitMessage(`${successCount}개의 퀴즈가 성공적으로 추가되었고, ${failCount}개의 퀴즈에서 오류가 발생했습니다:\n${errorMessages.join('\n')}`);
          setBulkText('');
        } else {
          setSubmitStatus('error');
          setSubmitMessage(`퀴즈 추가 중 오류가 발생했습니다:\n${errorMessages.join('\n')}`);
        }
      } else {
        setSubmitStatus('success');
        setSubmitMessage(`${successCount}개의 퀴즈가 성공적으로 추가되었습니다!`);
        setBulkText('');
      }
      
      // 카드 카운트 업데이트
      if (selectedSubject) {
        const newCount = await getSubjectCardCount(selectedSubject);
        setCardCount(newCount);
        const canAdd = await canAddCard(selectedSubject);
        setCanAddCardToSubject(canAdd);
      }
      
      if (onCardAdded && successCount > 0) {
        onCardAdded();
      }
    } catch (error: any) {
      console.error('[AddCardForm] 대량 퀴즈 추가 오류:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || '퀴즈 추가 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 과목 변경 핸들러
  const handleSubjectChange = async (subjectId: number | null) => {
    setSelectedSubject(subjectId);
    
    if (subjectId) {
      const count = await getSubjectCardCount(subjectId);
      setCardCount(count);
      const canAdd = await canAddCard(subjectId);
      setCanAddCardToSubject(canAdd);
    }
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
        🧠 두뇌 운동 퀴즈 추가
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
            🧩 단일 퀴즈
          </button>
          <button
            type="button"
            onClick={() => setInputMode('bulk')}
            className={`px-4 py-2.5 text-sm font-medium ${inputMode === 'bulk' 
              ? 'bg-[var(--primary)] text-white shadow-sm' 
              : 'bg-[var(--neutral-100)] text-[var(--neutral-700)] hover:bg-[var(--neutral-200)]'} transition-colors`}
          >
            📚 대량 퀴즈
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
            label="퀴즈를 추가할 과목"
          />
          
          {!isPremium && selectedSubject && (
            <div className="p-3 bg-[var(--neutral-200)] rounded-md text-sm">
              <p className="font-medium">무료 플랜 제한</p>
              <p className="mt-1 text-[var(--neutral-700)]">
                현재 {cardCount}/{currentPlan?.max_cards_per_subject || 100} 퀴즈를 사용 중입니다.
                {!canAddCardToSubject && ' 더 이상 퀴즈를 추가할 수 없습니다. 프리미엄으로 업그레이드하세요.'}
              </p>
            </div>
          )}
          
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
                    disabled={!canAddCardToSubject || isSubmitting}
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
                    disabled={!canAddCardToSubject || isSubmitting}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[var(--neutral-100)] p-6 rounded-lg border border-[var(--neutral-300)] shadow-sm">
              <label htmlFor="bulkText" className="block text-sm font-medium mb-2">
                📚 대량 퀴즈 (정답, 문제 형식)
              </label>
              <textarea
                id="bulkText"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-[var(--neutral-300)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="각 줄마다 한 개의 퀴즈를 추가합니다. 형식: 정답, 문제
예시:
apple, 사과는 영어로?
book, 책은 영어로?
computer, 컴퓨터는 영어로?"
                disabled={!canAddCardToSubject || isSubmitting}
              />
              <p className="mt-2 text-sm text-[var(--neutral-700)]">
                각 줄에 하나의 퀴즈를 정답과 문제를 쉼표로 구분하여 입력하세요.
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
              disabled={isSubmitting}
            >
              🔄 초기화
            </button>
            
            <button
              type="submit"
              disabled={!canAddCardToSubject || isSubmitting || !selectedSubject}
              className={`px-5 py-3 text-sm font-medium rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-colors ${
                (!canAddCardToSubject || isSubmitting || !selectedSubject) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '⏳ 처리 중...' : inputMode === 'bulk' ? '📚 여러 퀴즈 추가' : '💪 퀴즈 추가'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 