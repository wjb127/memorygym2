'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCardsByBox, updateCardBox } from '../utils/leitner';
import { FlashQuiz as FlashQuizType, BOX_NAMES } from '../utils/types';
import FlashQuiz from './FlashQuiz';
import SubjectSelector from './SubjectSelector';
import { useCards } from '@/context/CardContext';
import { registerUpdateBoxCountsFunction } from './QuizManagement';

// 상자 번호에 따른 이모지 반환 함수
const getBoxEmoji = (boxNumber: number): string => {
  const emojis = ['🔄', '🏋️‍♂️', '💪', '🧠', '🏆', '🎯'];
  return emojis[boxNumber] || '📦';
};

export default function StudySession() {
  const [quizzes, setQuizzes] = useState<FlashQuizType[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [studyStarted, setStudyStarted] = useState(false);
  // 각 훈련소별 퀴즈 수를 추적하는 상태 추가
  const [boxCounts, setBoxCounts] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  
  // 카드 상태 변경 감지를 위한 컨텍스트 사용
  const { lastUpdated } = useCards();

  // 훈련소 번호나 과목이 변경되거나 학습이 재시작될 때 퀴즈 새로 로드
  useEffect(() => {
    if (studyStarted && selectedBox !== null) {
      loadQuizzesByBox(selectedBox, selectedSubject);
    }
  }, [selectedBox, selectedSubject, studyStarted]);

  // 훈련소별 퀴즈 수 업데이트 함수
  const updateBoxCounts = useCallback(async () => {
    try {
      console.log('[StudySession] 훈련소별 퀴즈 수 업데이트 시작');
      
      const counts: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      
      // 각 훈련소의 퀴즈 개수 가져오기
      for (let box = 1; box <= 5; box++) {
        try {
          console.log(`[StudySession] ${box}번 훈련소 퀴즈 수 조회 중...`);
          const boxQuizzes = await getCardsByBox(box, selectedSubject || undefined);
          counts[box] = Array.isArray(boxQuizzes) ? boxQuizzes.length : 0;
          console.log(`[StudySession] ${box}번 훈련소 퀴즈 수: ${counts[box]}개`);
        } catch (boxError) {
          console.error(`[StudySession] ${box}번 훈련소 퀴즈 수 조회 오류:`, boxError);
          // 오류가 발생해도 다음 훈련소 처리 계속 진행
          counts[box] = 0;
        }
      }
      
      console.log('[StudySession] 훈련소별 퀴즈 수 업데이트 완료:', counts);
      setBoxCounts(counts);
    } catch (error) {
      console.error('[StudySession] 훈련소별 퀴즈 수 업데이트 오류:', error);
      // 오류 발생 시 기존 상태 유지
    }
  }, [selectedSubject]);

  // 컴포넌트 마운트 시 updateBoxCounts 함수 등록
  useEffect(() => {
    registerUpdateBoxCountsFunction(updateBoxCounts);
  }, [updateBoxCounts]);

  // 과목이 변경되거나 카드 상태가 변경될 때마다 훈련소별 퀴즈 수 업데이트
  useEffect(() => {
    updateBoxCounts();
  }, [updateBoxCounts, lastUpdated]);

  // 특정 훈련소의 퀴즈 로드 (과목별 필터링 지원)
  const loadQuizzesByBox = async (boxNumber: number, subjectId: number | null) => {
    try {
      setLoading(true);
      console.log(`[StudySession] ${boxNumber}번 훈련소 퀴즈 로드 시작, 과목 ID: ${subjectId || '전체'}`);
      
      const boxQuizzes = await getCardsByBox(boxNumber, subjectId || undefined);
      
      if (!Array.isArray(boxQuizzes)) {
        console.error(`[StudySession] ${boxNumber}번 훈련소 퀴즈 로드 실패: 배열이 아닌 값 반환됨`);
        setQuizzes([]);
        setCompleted(true);
        return;
      }
      
      console.log(`[StudySession] ${boxNumber}번 훈련소 퀴즈 ${boxQuizzes.length}개 로드됨`);
      setQuizzes(boxQuizzes);
      setCurrentQuizIndex(0);
      setCompleted(boxQuizzes.length === 0);
      setStats({ correct: 0, incorrect: 0 });
    } catch (error) {
      console.error(`[StudySession] ${boxNumber}번 훈련소 퀴즈 로드 오류:`, error);
      // 오류 발생 시 빈 배열로 설정
      setQuizzes([]);
      setCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (quizId: number, isCorrect: boolean) => {
    try {
      const updatedCard = await updateCardBox(quizId, isCorrect);
      
      // 통계 업데이트
      setStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1)
      }));
      
      // 현재 퀴즈의 box_number 업데이트
      if (updatedCard) {
        setQuizzes(prevQuizzes => 
          prevQuizzes.map(quiz => 
            quiz.id === quizId ? { ...quiz, box_number: updatedCard.box_number } : quiz
          )
        );
      }
      
      // 다음 퀴즈 또는 완료로 이동
      if (currentQuizIndex < quizzes.length - 1) {
        setCurrentQuizIndex(prevIndex => prevIndex + 1);
      } else {
        setCompleted(true);
      }

      // 카드 상자 변경 후 훈련소별 퀴즈 수 업데이트
      updateBoxCounts();
    } catch (error) {
      console.error('답변 처리 오류:', error);
    }
  };

  const resetStudy = () => {
    setSelectedBox(null);
    setQuizzes([]);
    setCurrentQuizIndex(0);
    setCompleted(false);
    setStats({ correct: 0, incorrect: 0 });
    setStudyStarted(false);
  };

  const startTraining = (boxNumber: number) => {
    setSelectedBox(boxNumber);
    setStudyStarted(true);
  };

  // 과목 변경 핸들러
  const handleSubjectChange = (subjectId: number | null) => {
    setSelectedSubject(subjectId);
    
    // 이미 학습이 시작된 경우, 새로운 과목의 퀴즈를 로드
    if (studyStarted && selectedBox !== null) {
      loadQuizzesByBox(selectedBox, subjectId);
    }
  };

  if (!studyStarted) {
    return (
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          💪 두뇌 훈련하기
        </h2>
        
        <SubjectSelector
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
          label="학습할 과목 선택"
        />
        
        {selectedSubject !== null && (
          <div className="bg-[var(--neutral-100)] p-6 rounded-lg border border-[var(--neutral-300)] shadow-sm mb-6">
            <h3 className="text-lg font-medium mb-4">훈련소를 선택하세요</h3>
            
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((boxNum) => (
                <button
                  key={boxNum}
                  onClick={() => startTraining(boxNum)}
                  className="w-full py-3 px-4 flex items-center justify-between rounded-lg border border-[var(--neutral-300)] hover:border-[var(--primary)] hover:bg-[var(--neutral-200)] transition-colors shadow-sm"
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{getBoxEmoji(boxNum)}</span>
                    <div>
                      <div className="font-medium">{boxNum}단계 훈련소</div>
                      <div className="text-sm text-[var(--neutral-700)]">{BOX_NAMES[boxNum as keyof typeof BOX_NAMES]}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-[var(--neutral-200)] rounded-full text-sm font-medium text-[var(--neutral-700)]">
                      {boxCounts[boxNum]} 퀴즈
                    </span>
                    <span className="ml-2 text-[var(--neutral-700)]">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {selectedSubject === null && (
          <div className="bg-[var(--neutral-100)] p-6 rounded-lg border border-[var(--neutral-300)] shadow-sm my-6 text-center">
            <p className="text-lg text-[var(--neutral-700)]">
              학습을 시작하려면 먼저 과목을 선택해주세요.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-r-transparent"></div>
        <p className="mt-4 text-[var(--neutral-700)]">운동 세션 준비 중...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          {getBoxEmoji(selectedBox || 0)} {selectedBox}단계 훈련소 완료!
        </h2>
        
        {quizzes.length > 0 ? (
          <div className="mb-8">
            <p className="text-lg mb-4">트레이닝 결과:</p>
            
            <div className="flex justify-center gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex flex-col items-center">
                <span className="text-green-600 text-2xl font-bold">{stats.correct}</span>
                <span className="text-green-600 text-sm">정확히 기억</span>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex flex-col items-center">
                <span className="text-red-600 text-2xl font-bold">{stats.incorrect}</span>
                <span className="text-red-600 text-sm">더 연습 필요</span>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-[var(--neutral-700)] mb-2">정확도</p>
              <div className="h-4 bg-[var(--neutral-200)] rounded-full overflow-hidden w-full max-w-xs mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" 
                  style={{ width: `${Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)}%` }}
                ></div>
              </div>
              <p className="mt-2 font-bold">
                {Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)}%
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 mb-8 bg-[var(--neutral-200)] rounded-lg inline-block">
            <p className="text-lg">
              {selectedSubject 
                ? `선택한 과목의 ${selectedBox}단계 훈련소에는 퀴즈가 없습니다.`
                : `${selectedBox}단계 훈련소에는 퀴즈가 없습니다.`}
            </p>
            <p className="text-sm mt-2 text-[var(--neutral-700)]">
              '퀴즈추가' 탭에서 새로운 퀴즈를 추가해보세요!
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => {
              if (selectedBox !== null) {
                // 같은 훈련소 다시 공부
                loadQuizzesByBox(selectedBox, selectedSubject);
              }
            }}
            className="px-4 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors shadow-md"
          >
            🔄 다시 도전하기
          </button>
          <button
            onClick={resetStudy}
            className="px-4 py-3 bg-[var(--neutral-700)] text-white rounded-lg hover:bg-[var(--neutral-900)] transition-colors"
          >
            ↩️ 다른 세트 선택하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={resetStudy}
          className="px-3 py-2 text-sm border border-[var(--neutral-300)] rounded-lg hover:bg-[var(--neutral-200)] transition-colors"
        >
          ← 다시 선택하기
        </button>
        
        <div className="text-center">
          <span className="font-medium">
            {getBoxEmoji(selectedBox || 0)} {selectedBox}단계 훈련소
          </span>
          <div className="text-xs mt-1 text-[var(--neutral-700)]">
            {selectedSubject ? `과목 필터링 적용됨` : `과목 선택`}
          </div>
        </div>
        
        <div className="text-sm text-[var(--neutral-700)]">
          {currentQuizIndex + 1} / {quizzes.length}
        </div>
      </div>
      
      <div className="bg-[var(--neutral-100)] rounded-lg border border-[var(--neutral-300)] p-6 shadow-md">
        {quizzes[currentQuizIndex] && (
          <FlashQuiz 
            quiz={quizzes[currentQuizIndex]} 
            onAnswer={handleAnswer}
          />
        )}
      </div>
    </div>
  );
}