'use client';

import { useState, useRef, useEffect } from 'react';
import { parseExcelFile, isValidExcelFile, getErrorMessage } from '../utils/excelParser';
import { addCard, getAllSubjects } from '../utils/leitner';
import SubjectSelector from './SubjectSelector';
import { Subject } from '../utils/types';
import * as XLSX from 'xlsx';
import { usePremium } from '@/context/PremiumContext';
import { useCards } from '@/context/CardContext';

interface ExcelUploaderProps {
  onCardsAdded?: () => void;
}

export default function ExcelUploader({ onCardsAdded }: ExcelUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'preview' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(1); // 기본값 1
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 프리미엄 상태 확인
  const { isPremium, currentPlan, canAddCard, getSubjectCardCount } = usePremium();
  const [canAddCardToSubject, setCanAddCardToSubject] = useState(true);
  const [cardCount, setCardCount] = useState(0);
  
  // 카드 상태 관리 컨텍스트 사용
  const { refreshCards } = useCards();
  
  // 과목 목록 로드
  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const subjectsData = await getAllSubjects();
        setSubjects(subjectsData);
      } catch (error) {
        console.error('과목 불러오기 오류:', error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    
    loadSubjects();
  }, []);
  
  // 과목 이름으로 과목 ID 찾기
  const findSubjectIdByName = (name: string): number | null => {
    const foundSubject = subjects.find(
      subject => subject.name.toLowerCase() === name.toLowerCase()
    );
    return foundSubject ? foundSubject.id : null;
  };
  
  // 과목 ID로 과목 이름 찾기
  const findSubjectNameById = (id: number): string => {
    const foundSubject = subjects.find(subject => subject.id === id);
    return foundSubject ? foundSubject.name : `과목 ID: ${id}`;
  };
  
  // 선택한 과목이 변경될 때마다 카드 추가 가능 여부 확인
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
    setFile(null);
    setPreviewData([]);
    setStatus('idle');
    setMessage('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!isValidExcelFile(selectedFile)) {
      setStatus('error');
      setMessage('지원하지 않는 파일 형식입니다. .xlsx, .xls, .csv 파일만 업로드 가능합니다.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setStatus('idle');
    setMessage('');
    
    try {
      const { cards, errors } = await parseExcelFile(selectedFile);
      
      if (errors.length > 0) {
        setStatus('error');
        setMessage(`파일 처리 중 ${errors.length}개의 오류가 발생했습니다.\n${errors.join('\n')}`);
      }
      
      if (cards.length > 0) {
        setPreviewData(cards);
        setStatus('preview');
        setMessage(`${cards.length}개의 카드를 찾았습니다. 업로드 버튼을 클릭하여 추가하세요.`);
      } else {
        setStatus('error');
        setMessage('파일에서 유효한 카드 데이터를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('파일 처리 오류:', error);
      setStatus('error');
      setMessage(getErrorMessage(error));
    }
  };
  
  const handleUpload = async () => {
    if (!previewData.length) return;
    
    // 무료 회원의 경우 카드 추가 가능 개수 확인
    if (!isPremium && selectedSubject) {
      const maxAllowed = currentPlan?.max_cards_per_subject || 100;
      if (cardCount + previewData.length > maxAllowed) {
        setStatus('error');
        setMessage(`무료 회원은 과목당 최대 ${maxAllowed}개의 카드만 추가할 수 있습니다. 현재 ${cardCount}개가 있으므로 ${maxAllowed - cardCount}개만 추가할 수 있습니다. 프리미엄으로 업그레이드하세요.`);
        return;
      }
    }
    
    // 카드 추가 가능 여부 확인
    if (!canAddCardToSubject) {
      setStatus('error');
      setMessage(`이 과목에는 더 이상 카드를 추가할 수 없습니다. 무료 회원은 과목당 최대 ${currentPlan?.max_cards_per_subject || 100}개의 카드만 추가할 수 있습니다. 프리미엄으로 업그레이드하세요.`);
      return;
    }
    
    setIsUploading(true);
    setStatus('uploading');
    setProgress(0);
    
    try {
      const total = previewData.length;
      let success = 0;
      let failures = 0;
      
      for (let i = 0; i < total; i++) {
        const card = previewData[i];
        let subjectId = card.subject_id;
        
        // subject_id가 없고 subject_name이 있으면 이름으로 ID 찾기
        if (!subjectId && card.subject_name) {
          subjectId = findSubjectIdByName(card.subject_name);
        }
        
        // subject_id가 여전히 없으면 기본 선택된 과목 사용
        subjectId = subjectId || selectedSubject;
        
        if (!subjectId) {
          console.error('과목 ID를 찾을 수 없음:', card);
          failures++;
          continue;
        }
        
        try {
          await addCard(card.front, card.back, subjectId);
          success++;
        } catch (error) {
          console.error('카드 추가 오류:', error);
          failures++;
        }
        
        // 진행 상황 업데이트
        const newProgress = Math.round(((i + 1) / total) * 100);
        setProgress(newProgress);
      }
      
      // 카드 카운트 업데이트
      if (selectedSubject) {
        const newCount = await getSubjectCardCount(selectedSubject);
        setCardCount(newCount);
        const canAdd = await canAddCard(selectedSubject);
        setCanAddCardToSubject(canAdd);
      }
      
      if (failures === 0) {
        setStatus('success');
        setMessage(`${success}개의 카드가 성공적으로 추가되었습니다!`);
      } else {
        setStatus('error');
        setMessage(`${success}개의 카드가 추가되었으며, ${failures}개의 카드가 실패했습니다.`);
      }
      
      // 카드 상태 업데이트 (다른 컴포넌트에 알림)
      if (success > 0) {
        console.log('[ExcelUploader] 카드 추가 성공, refreshCards 호출');
        refreshCards();
      }
      
      if (onCardsAdded) {
        onCardsAdded();
      }
      
      // 업로드 성공 후 폼 리셋
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (error) {
      console.error('업로드 오류:', error);
      setStatus('error');
      setMessage('카드 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubjectChange = async (subjectId: number | null) => {
    setSelectedSubject(subjectId);
    
    if (subjectId) {
      const count = await getSubjectCardCount(subjectId);
      setCardCount(count);
      const canAdd = await canAddCard(subjectId);
      setCanAddCardToSubject(canAdd);
    }
  };
  
  const getSubjectDisplay = (card: any): string => {
    if (card.subject_name) {
      return card.subject_name;
    }
    if (card.subject_id) {
      return findSubjectNameById(card.subject_id);
    }
    return findSubjectNameById(selectedSubject || 1);
  };
  
  return (
    <div className="bg-[var(--neutral-100)] p-6 rounded-lg border border-[var(--neutral-300)] shadow-sm">
      <h3 className="text-lg font-semibold mb-4">📊 엑셀 파일로 카드 추가</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="excel-file" className="block text-sm font-medium mb-2">
            엑셀 파일 선택 (.xlsx, .xls, .csv)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="excel-file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-[var(--neutral-300)] rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[var(--primary)] file:text-white hover:file:bg-[var(--primary-hover)] transition-colors"
            disabled={isUploading || !canAddCardToSubject}
          />
        </div>
        
        <SubjectSelector
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
          includeAllOption={false}
          label="카드를 추가할 기본 과목 (엑셀 파일에 과목 이름이 없는 경우 사용됨)"
        />
        
        {!isPremium && selectedSubject && (
          <div className="mt-4 p-3 bg-[var(--neutral-200)] rounded-md text-sm">
            <p className="font-medium">무료 플랜 제한</p>
            <p className="mt-1 text-[var(--neutral-700)]">
              현재 {cardCount}/{currentPlan?.max_cards_per_subject || 100} 카드를 사용 중입니다.
              {!canAddCardToSubject && ' 더 이상 카드를 추가할 수 없습니다. 프리미엄으로 업그레이드하세요.'}
            </p>
          </div>
        )}
        
        {status === 'preview' && previewData.length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-2">미리보기 (처음 5개)</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-[var(--neutral-300)]">
                <thead>
                  <tr className="bg-[var(--neutral-200)]">
                    <th className="py-2 px-3 text-left text-xs font-medium text-[var(--neutral-700)]">번호</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-[var(--neutral-700)]">정답 (앞면)</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-[var(--neutral-700)]">문제 (뒷면)</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-[var(--neutral-700)]">과목</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((card, index) => (
                    <tr key={index} className="border-t border-[var(--neutral-300)]">
                      <td className="py-2 px-3 text-sm">{index + 1}</td>
                      <td className="py-2 px-3 text-sm">{card.front}</td>
                      <td className="py-2 px-3 text-sm">{card.back}</td>
                      <td className="py-2 px-3 text-sm">{getSubjectDisplay(card)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 5 && (
              <p className="mt-2 text-sm text-[var(--neutral-600)]">
                외 {previewData.length - 5}개의 카드가 더 있습니다.
              </p>
            )}
          </div>
        )}
        
        {status === 'uploading' && (
          <div className="w-full bg-[var(--neutral-200)] rounded-full h-2.5">
            <div 
              className="bg-[var(--primary)] h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
            <p className="mt-2 text-sm text-[var(--neutral-700)]">
              업로드 중... {progress}%
            </p>
          </div>
        )}
        
        {message && (
          <div 
            className={`p-4 rounded-lg ${
              status === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : status === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex items-start">
              <span className="mr-2 text-lg mt-0.5">
                {status === 'success' ? '✅' : status === 'error' ? '❌' : 'ℹ️'}
              </span>
              <div>
                {message.split('\n').map((line, i) => (
                  <p key={i} className="text-sm">{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-sm border border-[var(--neutral-300)] rounded-lg shadow-sm text-[var(--neutral-700)] bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] focus:outline-none transition-colors"
            disabled={isUploading || !canAddCardToSubject}
          >
            초기화
          </button>
          
          {status === 'preview' && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !canAddCardToSubject || previewData.length === 0}
              className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-colors ${
                (isUploading || !canAddCardToSubject || previewData.length === 0) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? '업로드 중...' : `${previewData.length}개 카드 추가하기`}
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-6 border-t border-[var(--neutral-300)] pt-4">
        <h4 className="text-sm font-medium mb-2">엑셀 파일 형식 안내</h4>
        <ul className="list-disc list-inside text-sm text-[var(--neutral-700)] space-y-1">
          <li>첫 번째 열: 정답 (front)</li>
          <li>두 번째 열: 문제 (back)</li>
          <li>세 번째 열: 과목 이름 (선택사항, 없으면 위에서 선택한 과목으로 설정)</li>
          <li>첫 번째 행은 헤더로 간주되어 무시됩니다</li>
        </ul>
        <a 
          href="/templates/flashcards_template.xlsx" 
          download
          className="mt-3 inline-block text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
        >
          📄 엑셀 템플릿 다운로드
        </a>
      </div>
    </div>
  );
} 