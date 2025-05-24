import { FlashQuiz, ReviewInterval, Subject } from './types';
import { 
  SAMPLE_SUBJECTS, 
  SAMPLE_CARDS, 
  getSampleCardsBySubject, 
  getSampleCardsByBox,
  isSampleSubject,
  isSampleCard
} from './sample-data';

// 샘플 카드 메모리 캐시 (세션 동안 추가된 샘플 카드 저장)
let SAMPLE_CARDS_CACHE: FlashQuiz[] = [...SAMPLE_CARDS];
let nextSampleCardId = -1000; // 새 샘플 카드 ID 시작점

// 메모리 캐시에서 샘플 카드 가져오기
function getCachedSampleCards(): FlashQuiz[] {
  return SAMPLE_CARDS_CACHE;
}

// 메모리 캐시에 새 샘플 카드 추가하기
function addCardToSampleCache(card: FlashQuiz): FlashQuiz {
  SAMPLE_CARDS_CACHE.push(card);
  return card;
}

// 캐시된 샘플 카드 중 특정 조건에 맞는 카드 가져오기
function getCachedSampleCardsBySubject(subjectId: number): FlashQuiz[] {
  return SAMPLE_CARDS_CACHE.filter(card => card.subject_id === subjectId);
}

// 캐시된 샘플 카드 중 특정 상자와 과목에 맞는 카드 가져오기
function getCachedSampleCardsByBox(boxNumber: number, subjectId?: number): FlashQuiz[] {
  let cards = SAMPLE_CARDS_CACHE.filter(card => card.box_number === boxNumber);
  
  if (subjectId !== undefined) {
    cards = cards.filter(card => card.subject_id === subjectId);
  }
  
  return cards;
}

// 더미 DB 클라이언트 - 필요한 경우에만 기본 응답 제공
const dummyDb = {
  from: (table: string) => ({
    select: () => ({
      single: () => Promise.resolve({ data: null, error: null }),
      eq: (field: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: null }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        })
      }),
      order: () => Promise.resolve({ data: [], error: null }),
      lte: () => ({
        order: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        })
      }),
      or: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
        order: () => Promise.resolve({ data: [], error: null })
      })
    }),
    insert: () => ({
      select: () => Promise.resolve({ data: [{}], error: null }),
      single: () => Promise.resolve({ data: {}, error: null })
    }),
    update: () => ({
      eq: () => ({
        select: () => Promise.resolve({ data: [{}], error: null })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  })
};

// 오류 로깅 헬퍼 함수
const logError = <T>(message: string, error: any, defaultReturn: T): T => {
  console.warn(`${message}:`, error);
  return defaultReturn;
};

// 모든 과목 가져오기
export async function getAllSubjects() {
  try {
    console.log('[getAllSubjects] API 호출 시작');
    
    // 네트워크 요청을 시도하되, 실패 시 바로 샘플 데이터 반환
    const response = await fetch('/api/subjects', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // 타임아웃 설정 (5초)
      signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
    });
    
    console.log(`[getAllSubjects] API 응답 상태: ${response.status}`);
    
    // 로그인 상태가 아니거나 오류 응답인 경우 샘플 과목 반환
    if (response.status === 404 || response.status === 401 || !response.ok) {
      console.log('[getAllSubjects] 로그인되지 않음 또는 API 오류 - 샘플 과목 반환');
      return SAMPLE_SUBJECTS;
    }
    
    const data = await response.json();
    
    if (response.ok && data && typeof data === 'object') {
      // 실제 과목 + 샘플 과목 함께 반환 (실제 과목이 먼저 나오도록)
      const apiSubjects = Array.isArray(data.data) ? data.data : [];
      console.log(`[getAllSubjects] API 과목 ${apiSubjects.length}개 + 샘플 과목 ${SAMPLE_SUBJECTS.length}개 반환`);
      
      // 합친 배열을 ID 기준으로 정렬 (음수 ID인 샘플 과목은 뒤로)
      return [...apiSubjects, ...SAMPLE_SUBJECTS].sort((a, b) => {
        // 샘플 과목(음수 ID)은 항상 실제 과목(양수 ID) 뒤에 오도록
        if (a.id < 0 && b.id > 0) return 1;
        if (a.id > 0 && b.id < 0) return -1;
        // 같은 종류끼리는 생성일 기준 정렬
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      console.warn('[getAllSubjects] API 응답 형식이 올바르지 않음 - 샘플 과목 반환');
      return SAMPLE_SUBJECTS;
    }
  } catch (error) {
    // 네트워크 오류, 타임아웃, CORS 오류 등 모든 예외 상황에서 샘플 데이터 반환
    console.warn('[getAllSubjects] 네트워크 요청 실패 - 샘플 과목으로 대체:', error);
    
    // 에러 타입별로 더 구체적인 로그
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('[getAllSubjects] 네트워크 연결 실패 또는 CORS 오류');
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('[getAllSubjects] 요청 타임아웃');
    }
    
    return SAMPLE_SUBJECTS;
  }
}

// 특정 ID의 과목 가져오기
export async function getSubjectById(subjectId: number) {
  // 샘플 과목인 경우 바로 반환
  if (isSampleSubject(subjectId)) {
    const sampleSubject = SAMPLE_SUBJECTS.find(subject => subject.id === subjectId);
    if (sampleSubject) {
      console.log(`[getSubjectById] 샘플 과목 반환: ${sampleSubject.name} (ID: ${subjectId})`);
      return sampleSubject;
    }
  }
  
  try {
    const response = await fetch(`/api/subjects/${subjectId}`, {
      credentials: 'include',
    });
    const data = await response.json();
    
    if (response.ok) {
      return data.data;
    } else {
      console.warn('과목 가져오기 오류:', data.error);
      return null;
    }
  } catch (error) {
    console.warn('과목 가져오기 예외:', error);
    return null;
  }
}

// 새 과목 추가하기
export async function addSubject(name: string, description?: string) {
  try {
    const response = await fetch('/api/subjects', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data.data;
    } else {
      console.warn('과목 추가 오류:', data.error);
      return null;
    }
  } catch (error) {
    console.warn('과목 추가 예외:', error);
    return null;
  }
}

// 모든 플래시카드 가져오기 (과목별 필터링 지원)
export async function getAllCards(subjectId?: number) {
  // 샘플 과목인 경우 캐시된 샘플 카드 반환
  if (subjectId !== undefined && isSampleSubject(subjectId)) {
    const sampleCards = getCachedSampleCardsBySubject(subjectId);
    console.log(`[getAllCards] 샘플 과목(ID: ${subjectId})의 샘플 카드 ${sampleCards.length}개 반환`);
    return sampleCards;
  }
  
  try {
    const url = subjectId 
      ? `/api/subjects/${subjectId}/cards` 
      : '/api/cards';
      
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    // 로그인 상태가 아니면 샘플 카드 반환 (404 또는 401 오류인 경우)
    if (response.status === 404 || response.status === 401) {
      if (subjectId) {
        // 특정 과목의 샘플 카드 반환
        const sampleCards = getCachedSampleCardsBySubject(subjectId);
        return sampleCards;
      } else {
        // 모든 샘플 카드 반환
        return SAMPLE_CARDS;
      }
    }
    
    const data = await response.json();
    
    if (response.ok) {
      return data.data || [];
    } else {
      console.warn('카드 가져오기 오류:', data.error);
      // API 오류 시 빈 배열 반환
      return [];
    }
  } catch (error) {
    return logError<FlashQuiz[]>('카드 가져오기 예외', error, []);
  }
}

// 상자별 카드 가져오기 (과목별 필터링 지원)
export async function getCardsByBox(boxNumber: number, subjectId?: number) {
  // 샘플 과목인 경우 캐시된 샘플 카드 반환
  if (subjectId !== undefined && isSampleSubject(subjectId)) {
    const sampleCards = getCachedSampleCardsByBox(boxNumber, subjectId);
    console.log(`[getCardsByBox] 샘플 과목(ID: ${subjectId})의 ${boxNumber}번 상자 샘플 카드 ${sampleCards.length}개 반환`);
    return sampleCards;
  }
  
  try {
    // 요청 URL 구성
    const url = subjectId 
      ? `/api/subjects/${subjectId}/cards?box=${boxNumber}` 
      : `/api/cards?box=${boxNumber}`;
    
    console.log(`[getCardsByBox] API 호출: ${url}`);
    
    // 네트워크 요청 전 약간의 지연 추가 (동시 요청 방지)
    await new Promise(resolve => setTimeout(resolve, Math.min(50 * boxNumber, 200)));
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      // 타임아웃 설정 (5초로 단축)
      signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
    });
    
    console.log(`[getCardsByBox] 응답 상태: ${response.status} ${response.statusText}`);
    
    // 로그인 상태가 아니면 샘플 카드 반환 (404 또는 401 오류인 경우)
    if (response.status === 404 || response.status === 401) {
      const sampleCards = getCachedSampleCardsByBox(boxNumber, subjectId);
      console.log(`[getCardsByBox] 인증 실패 - ${boxNumber}번 상자 샘플 카드 ${sampleCards.length}개 반환`);
      return sampleCards;
    }
    
    if (!response.ok) {
      let errorDetail = '';
      
      try {
        // 에러 응답 본문 추출 시도
        const errorText = await response.text();
        errorDetail = errorText || `HTTP 상태 코드: ${response.status}`;
      } catch (parseError) {
        errorDetail = `응답 본문 파싱 실패, HTTP 상태 코드: ${response.status}`;
      }
      
      console.warn(`[getCardsByBox] ${boxNumber}번 상자 카드 가져오기 오류:`, {
        status: response.status,
        statusText: response.statusText,
        errorDetail
      });
      
      // 404 오류 처리 (존재하지 않는 API 경로)
      if (response.status === 404) {
        console.warn(`[getCardsByBox] API 경로를 찾을 수 없음: ${url}. 샘플 카드 반환`);
        return getCachedSampleCardsByBox(boxNumber, subjectId);
      }
      
      throw new Error(`API 요청 실패 (${response.status}): ${errorDetail}`);
    }
    
    // 응답 데이터 파싱
    const data = await response.json();
    
    // 응답 구조 확인
    if (!data || typeof data !== 'object') {
      console.warn(`[getCardsByBox] 유효하지 않은 응답 형식:`, data);
      return getCachedSampleCardsByBox(boxNumber, subjectId);
    }
    
    // 응답에 data 필드가 있는지 확인
    const cards = data.data || [];
    
    if (!Array.isArray(cards)) {
      console.warn(`[getCardsByBox] 응답의 data 필드가 배열이 아님:`, cards);
      return getCachedSampleCardsByBox(boxNumber, subjectId);
    }
    
    console.log(`[getCardsByBox] 카드 ${cards.length}개 로드됨`);
    return cards;
  } catch (error) {
    // 에러의 상세 정보를 추출
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 일반적인 네트워크 오류는 경고 레벨로만 출력
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn(`[getCardsByBox] 네트워크 연결 실패 - ${boxNumber}번 상자 샘플 카드로 대체`);
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn(`[getCardsByBox] 요청 타임아웃 - ${boxNumber}번 상자 샘플 카드로 대체`);
    } else {
      // 기타 오류만 상세 로그 출력
      console.warn(`[getCardsByBox] ${boxNumber}번 상자 카드 가져오기 예외: ${errorMessage}`);
    }
    
    // 어떤 오류든 발생하면 샘플 카드 반환
    return getCachedSampleCardsByBox(boxNumber, subjectId);
  }
}

// 오늘 학습할 카드 가져오기 (과목별 필터링 지원)
export async function getTodaysCards(subjectId?: number) {
  try {
    const today = new Date().toISOString();
    const url = subjectId 
      ? `/api/subjects/${subjectId}/cards/today` 
      : '/api/cards/today';
      
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data.data || [];
    } else {
      console.warn('오늘의 카드 가져오기 오류:', data.error);
      return [];
    }
  } catch (error) {
    return logError<FlashQuiz[]>('오늘의 카드 가져오기 예외', error, []);
  }
}

// 기본 과목 확인 및 생성
export async function ensureDefaultSubject(): Promise<number | null> {
  console.log('[ensureDefaultSubject] 기본 과목 확인 중...');
  
  try {
    // 먼저 기존 과목 목록을 가져오기
    const subjects = await getAllSubjects();
    
    // 과목이 하나라도 있으면 첫 번째 과목의 ID 반환
    if (subjects && subjects.length > 0) {
      const firstSubject = subjects[0];
      console.log(`[ensureDefaultSubject] 기존 과목 사용: ID=${firstSubject.id}, 이름=${firstSubject.name}`);
      return firstSubject.id;
    }
    
    // 과목이 없으면 기본 과목 생성
    console.log('[ensureDefaultSubject] 과목이 없습니다. 기본 과목을 생성합니다.');
    const newSubject = await addSubject('기본 과목', '자동으로 생성된 기본 과목입니다.');
    
    if (newSubject) {
      console.log(`[ensureDefaultSubject] 기본 과목 생성 성공: ID=${newSubject.id}, 이름=${newSubject.name}`);
      return newSubject.id;
    } else {
      console.warn('[ensureDefaultSubject] 기본 과목 생성 실패');
      return null;
    }
  } catch (error) {
    console.warn('[ensureDefaultSubject] 과목 확인/생성 중 오류:', error);
    return null;
  }
}

// 새 카드 추가하기 (과목 지정 가능)
export async function addCard(front: string, back: string, subjectId: number = 1) {
  // 샘플 과목이면 로컬에서 카드 추가 처리
  if (isSampleSubject(subjectId)) {
    try {
      console.log(`[addCard] 샘플 과목(ID: ${subjectId})에 카드 추가: ${front} / ${back}`);
      
      // 현재 시간
      const now = new Date().toISOString();
      
      // 로컬 메모리에 새 카드 추가 (실제 서버에는 저장되지 않음)
      const newCard: FlashQuiz = {
        id: nextSampleCardId--,
        front,
        back,
        box_number: 1, // 새 카드는 항상 1번 상자에서 시작
        subject_id: subjectId,
        user_id: 'sample',
        created_at: now,
        last_reviewed: now,
        next_review: now
      };
      
      // 메모리 캐시에 추가
      addCardToSampleCache(newCard);
      
      console.log(`[addCard] 샘플 카드 추가 성공: ID=${newCard.id}`);
      return newCard;
    } catch (localError) {
      console.warn('[addCard] 샘플 카드 추가 오류:', localError);
      return null;
    }
  }
  
  try {
    // ID가 1인 과목이 대상이고, 과목이 없는 경우 기본 과목을 생성
    if (subjectId === 1) {
      const defaultSubjectId = await ensureDefaultSubject();
      
      // 기본 과목 생성에 성공했고 ID가 다른 경우, 새 ID를 사용
      if (defaultSubjectId && defaultSubjectId !== 1) {
        console.log(`[addCard] 실제 기본 과목 ID로 변경: ${defaultSubjectId}`);
        subjectId = defaultSubjectId;
      }
    }
    
    console.log(`[addCard] 카드 추가 API 호출: /api/subjects/${subjectId}/cards`);
    
    const response = await fetch(`/api/subjects/${subjectId}/cards`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ front, back }),
    });
    
    let errorDetail = '';
    let errorMessage = '';
    
    if (!response.ok) {
      try {
        // 에러 응답 본문 추출 시도
        const errorResponseText = await response.text();
        let errorResponse;
        
        try {
          // JSON 파싱 시도
          errorResponse = JSON.parse(errorResponseText);
          errorMessage = errorResponse.error || '알 수 없는 오류';
          
          // 데이터베이스 오류 정보 추출
          if (errorResponse.message && errorResponse.message.includes('violates foreign key constraint')) {
            errorMessage = '과목이 존재하지 않거나 접근할 수 없습니다. 과목을 먼저 생성해주세요.';
          } else if (errorResponse.message) {
            errorMessage = errorResponse.message;
          }
        } catch {
          // JSON 파싱 실패시 텍스트 그대로 사용
          errorDetail = errorResponseText;
          errorMessage = '카드 추가 중 오류가 발생했습니다';
        }
      } catch (parseError) {
        errorDetail = `응답 본문 파싱 실패, HTTP 상태 코드: ${response.status}`;
        errorMessage = '카드 추가 중 오류가 발생했습니다';
      }
      
      console.warn('[addCard] 카드 추가 API 오류:', {
        status: response.status,
        statusText: response.statusText,
        detail: errorDetail,
        message: errorMessage
      });
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (data.data) {
      console.log('[addCard] 카드 추가 성공:', data.data);
      return data.data;
    } else {
      console.warn('[addCard] 카드 추가 실패: 응답에 유효한 데이터가 없음');
      throw new Error('카드 추가 결과 데이터가 없습니다');
    }
  } catch (error) {
    console.warn('[addCard] 카드 추가 예외:', error);
    throw error; // 오류를 상위로 전파하여 UI에서 적절하게 처리할 수 있게 함
  }
}

// 카드 업데이트하기 (상자 이동)
export async function updateCardBox(cardId: number, isCorrect: boolean) {
  // 샘플 카드인 경우 메모리 캐시에서 업데이트
  if (isSampleCard(cardId)) {
    console.log(`[updateCardBox] 샘플 카드(ID: ${cardId}) 이동 시뮬레이션, 정답 여부: ${isCorrect}`);
    
    // 메모리 캐시에서 해당 카드 찾기
    const cardIndex = SAMPLE_CARDS_CACHE.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      // 카드를 직접 수정
      const card = SAMPLE_CARDS_CACHE[cardIndex];
      
      // 상자 번호 업데이트
      if (isCorrect) {
        // 승급: 최대 상자 번호는 5
        card.box_number = Math.min(card.box_number + 1, 5);
      } else {
        // 강등: 1번 상자로
        card.box_number = 1;
      }
      
      // 현재 시간 업데이트
      card.last_reviewed = new Date().toISOString();
      
      console.log(`[updateCardBox] 샘플 카드 이동 완료: 상자 ${card.box_number}로 이동`);
      
      // 업데이트된 카드 반환
      return { ...card };
    }
    return null;
  }
  
  try {
    console.log(`[updateCardBox] 카드 업데이트 API 호출: /api/cards/${cardId}/review`);
    
    const response = await fetch(`/api/cards/${cardId}/review`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isCorrect }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn('[updateCardBox] 카드 업데이트 API 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return null;
    }
    
    const data = await response.json();
    
    if (data.data) {
      console.log('[updateCardBox] 카드 업데이트 성공:', data.data);
      return data.data;
    } else {
      console.warn('[updateCardBox] 카드 업데이트 실패: 응답에 유효한 데이터가 없음');
      return null;
    }
  } catch (error) {
    console.warn('[updateCardBox] 카드 업데이트 예외:', error);
    return null;
  }
}

// 카드 삭제하기
export async function deleteCard(cardId: number) {
  // 샘플 카드인 경우 메모리 캐시에서 삭제
  if (isSampleCard(cardId)) {
    console.log(`[deleteCard] 샘플 카드(ID: ${cardId}) 삭제 시뮬레이션`);
    
    // 삭제 전 카드 인덱스 찾기
    const cardIndex = SAMPLE_CARDS_CACHE.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      // 메모리 캐시에서 카드 삭제
      SAMPLE_CARDS_CACHE.splice(cardIndex, 1);
      console.log(`[deleteCard] 샘플 카드 삭제 완료: ID=${cardId}`);
      return true;
    } else {
      console.warn(`[deleteCard] 샘플 카드를 찾을 수 없음: ID=${cardId}`);
      return false;
    }
  }
  
  try {
    console.log(`[deleteCard] 카드 삭제 API 호출: /api/cards/${cardId}`);
    
    const response = await fetch(`/api/cards/${cardId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn('[deleteCard] 카드 삭제 API 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return false;
    }
    
    console.log(`[deleteCard] 카드 삭제 성공: ID=${cardId}`);
    return true;
  } catch (error) {
    console.warn('[deleteCard] 카드 삭제 예외:', error);
    return false;
  }
}

// 카드 내용 수정하기
export async function updateCard(card: Partial<FlashQuiz>) {
  if (!card.id) {
    console.warn('[updateCard] 카드 ID가 필요합니다');
    return null;
  }
  
  // 샘플 카드인 경우 메모리 캐시에서 업데이트
  if (isSampleCard(card.id)) {
    console.log(`[updateCard] 샘플 카드(ID: ${card.id}) 수정 시뮬레이션`);
    
    // 메모리 캐시에서 해당 카드 찾기
    const cardIndex = SAMPLE_CARDS_CACHE.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      // 카드 정보 업데이트
      const existingCard = SAMPLE_CARDS_CACHE[cardIndex];
      
      // 변경 가능한 필드만 업데이트
      if (card.front !== undefined) existingCard.front = card.front;
      if (card.back !== undefined) existingCard.back = card.back;
      
      console.log(`[updateCard] 샘플 카드 수정 완료:`, existingCard);
      
      // 업데이트된 카드 복사본 반환
      return { ...existingCard };
    } else {
      console.warn(`[updateCard] 샘플 카드를 찾을 수 없음: ID=${card.id}`);
      return null;
    }
  }
  
  try {
    console.log(`[updateCard] 카드 수정 API 호출: /api/cards/${card.id}`);
    
    const response = await fetch(`/api/cards/${card.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn('[updateCard] 카드 수정 API 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return null;
    }
    
    const data = await response.json();
    
    if (data.data) {
      console.log('[updateCard] 카드 수정 성공:', data.data);
      return data.data;
    } else {
      console.warn('[updateCard] 카드 수정 실패: 응답에 유효한 데이터가 없음');
      return null;
    }
  } catch (error) {
    console.warn('[updateCard] 카드 수정 예외:', error);
    return null;
  }
}

// 카드 검색하기
export async function searchCards(searchText: string, subjectId?: number): Promise<FlashQuiz[]> {
  // 샘플 과목인 경우 캐시된 샘플 카드 중에서 검색
  if (subjectId !== undefined && isSampleSubject(subjectId)) {
    const sampleCards = getCachedSampleCardsBySubject(subjectId);
    const searchLower = searchText.toLowerCase();
    const results = sampleCards.filter(card => 
      card.front.toLowerCase().includes(searchLower) || 
      card.back.toLowerCase().includes(searchLower)
    );
    console.log(`[searchCards] 샘플 과목(ID: ${subjectId})에서 "${searchText}" 검색 결과 ${results.length}개 반환`);
    return results;
  }
  
  // 검색어 없으면 빈 배열 반환
  if (!searchText.trim()) {
    return [];
  }
  
  try {
    const url = new URL(subjectId 
      ? `/api/subjects/${subjectId}/cards/search` 
      : '/api/cards/search', 
      window.location.origin
    );
    
    url.searchParams.append('q', searchText);
    
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    
    // 로그인 상태가 아니거나 API 오류 시 샘플 카드 검색
    if (response.status === 404 || response.status === 401) {
      // 모든 샘플 카드 중에서 검색 (또는 특정 과목의 샘플 카드)
      const cardsToSearch = subjectId 
        ? getCachedSampleCardsBySubject(subjectId) 
        : SAMPLE_CARDS;
      
      const searchLower = searchText.toLowerCase();
      const results = cardsToSearch.filter(card => 
        card.front.toLowerCase().includes(searchLower) || 
        card.back.toLowerCase().includes(searchLower)
      );
      
      console.log(`[searchCards] API 오류/인증 실패 - 샘플 카드 검색 결과 ${results.length}개 반환`);
      return results;
    }
    
    const data = await response.json();
    
    if (response.ok) {
      return data.data || [];
    } else {
      console.warn('카드 검색 오류:', data.error);
      return [];
    }
  } catch (error) {
    return logError<FlashQuiz[]>('카드 검색 예외', error, []);
  }
}

// 과목 수정하기
export async function updateSubject(subjectId: number, updates: { name?: string; description?: string; color?: string }) {
  // 샘플 과목은 수정 불가
  if (isSampleSubject(subjectId)) {
    console.warn(`[updateSubject] 샘플 과목(ID: ${subjectId}) 수정 시도 차단`);
    throw new Error('샘플 과목은 수정할 수 없습니다.');
  }
  
  try {
    const response = await fetch(`/api/subjects/${subjectId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return data.data;
    } else {
      console.warn('과목 수정 오류:', data.error);
      return null;
    }
  } catch (error) {
    console.warn('과목 수정 예외:', error);
    throw error; // 오류를 상위로 전파
  }
}

// 과목 삭제하기
export async function deleteSubject(subjectId: number) {
  // 샘플 과목은 삭제 불가
  if (isSampleSubject(subjectId)) {
    console.warn(`[deleteSubject] 샘플 과목(ID: ${subjectId}) 삭제 시도 차단`);
    throw new Error('샘플 과목은 삭제할 수 없습니다.');
  }
  
  try {
    const response = await fetch(`/api/subjects/${subjectId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (response.ok) {
      return true;
    } else {
      const data = await response.json();
      console.warn('과목 삭제 오류:', data.error);
      return false;
    }
  } catch (error) {
    console.warn('과목 삭제 예외:', error);
    throw error; // 오류를 상위로 전파
  }
} 