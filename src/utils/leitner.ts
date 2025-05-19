import { supabase, supabaseDummy } from './supabase';
import { FlashCard, ReviewInterval, Subject } from './types';

// 실제 Supabase 연결인지 더미 데이터를 사용할지 결정
const db = process.env.NEXT_PUBLIC_SUPABASE_URL && 
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
         ? supabase 
         : supabaseDummy;

// 오류 로깅 헬퍼 함수
const logError = <T>(message: string, error: any, defaultReturn: T): T => {
  console.error(`${message}:`, error);
  return defaultReturn;
};

// 모든 과목 가져오기
export async function getAllSubjects() {
  try {
    const { data, error } = await db
      .from('subjects')
      .select('*')
      .order('name');
    
    if (error) return logError<Subject[]>('과목 가져오기 오류', error, []);
    
    return data as Subject[];
  } catch (error) {
    return logError<Subject[]>('과목 가져오기 예외', error, []);
  }
}

// 특정 ID의 과목 가져오기
export async function getSubjectById(subjectId: number) {
  try {
    const { data, error } = await db
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();
    
    if (error) return logError<Subject | null>('과목 가져오기 오류', error, null);
    
    return data as Subject;
  } catch (error) {
    return logError<Subject | null>('과목 가져오기 예외', error, null);
  }
}

// 새 과목 추가하기
export async function addSubject(name: string, description?: string) {
  try {
    const { data: { user } } = await db.auth.getUser();
    
    if (!user) {
      throw new Error('로그인이 필요합니다');
    }

    const { data, error } = await db
      .from('subjects')
      .insert({
        name,
        description,
        user_id: user.id
      })
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data?.[0] as Subject;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('과목 추가 중 오류가 발생했습니다');
  }
}

// 모든 플래시카드 가져오기 (과목별 필터링 지원)
export async function getAllCards(subjectId?: number) {
  try {
    let query = db
      .from('flashcards')
      .select('*')
      .eq('is_admin_card', true);
    
    // 과목 ID가 제공되면 필터링
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    const { data, error } = await query.order('id');
    
    if (error) return logError<FlashCard[]>('카드 가져오기 오류', error, []);
    
    return data as FlashCard[];
  } catch (error) {
    return logError<FlashCard[]>('카드 가져오기 예외', error, []);
  }
}

// 상자별 카드 가져오기 (과목별 필터링 지원)
export async function getCardsByBox(boxNumber: number, subjectId?: number) {
  try {
    let query = db
      .from('flashcards')
      .select('*')
      .eq('is_admin_card', true)
      .eq('box_number', boxNumber);
    
    // 과목 ID가 제공되면 필터링
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    const { data, error } = await query.order('id');
    
    if (error) return logError<FlashCard[]>(`${boxNumber}번 상자 카드 가져오기 오류`, error, []);
    
    return data as FlashCard[];
  } catch (error) {
    return logError<FlashCard[]>(`${boxNumber}번 상자 카드 가져오기 예외`, error, []);
  }
}

// 오늘 학습할 카드 가져오기 (과목별 필터링 지원)
export async function getTodaysCards(subjectId?: number) {
  try {
    const today = new Date().toISOString();
    
    let query = db
      .from('flashcards')
      .select('*')
      .eq('is_admin_card', true)
      .lte('next_review', today);
    
    // 과목 ID가 제공되면 필터링
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    const { data, error } = await query
      .order('box_number')
      .order('id');
    
    if (error) return logError<FlashCard[]>('오늘의 카드 가져오기 오류', error, []);
    
    return data as FlashCard[];
  } catch (error) {
    return logError<FlashCard[]>('오늘의 카드 가져오기 예외', error, []);
  }
}

// 새 카드 추가하기 (과목 지정 가능)
export async function addCard(front: string, back: string, subjectId: number = 1) {
  try {
    const { data, error } = await db
      .from('flashcards')
      .insert({
        front,
        back,
        box_number: 1,
        is_admin_card: true,
        subject_id: subjectId
      })
      .select();
    
    if (error) return logError<FlashCard | null>('카드 추가 오류', error, null);
    
    return data?.[0] as FlashCard;
  } catch (error) {
    return logError<FlashCard | null>('카드 추가 예외', error, null);
  }
}

// 카드 업데이트하기 (상자 이동)
export async function updateCardBox(cardId: number, isCorrect: boolean) {
  try {
    // 현재 카드 정보 가져오기
    const { data: cardData, error: cardError } = await db
      .from('flashcards')
      .select('*')
      .eq('id', cardId)
      .single();
    
    if (cardError) return logError<FlashCard | null>('카드 정보 가져오기 오류', cardError, null);
    
    const card = cardData as FlashCard;
    let newBoxNumber = card.box_number;
    
    // 맞았으면 다음 상자로, 틀렸으면 1번 상자로
    if (isCorrect) {
      newBoxNumber = Math.min(card.box_number + 1, 5);
    } else {
      newBoxNumber = 1;
    }
    
    // 다음 복습 일자 계산
    const { data: intervalData } = await db
      .from('review_intervals')
      .select('interval_days')
      .eq('box_number', newBoxNumber)
      .single();
    
    const interval = intervalData as ReviewInterval;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval.interval_days);
    
    // 카드 업데이트
    const { data, error } = await db
      .from('flashcards')
      .update({
        box_number: newBoxNumber,
        last_reviewed: new Date().toISOString(),
        next_review: nextReview.toISOString()
      })
      .eq('id', cardId)
      .select();
    
    if (error) return logError<FlashCard | null>('카드 업데이트 오류', error, null);
    
    return data?.[0] as FlashCard;
  } catch (error) {
    return logError<FlashCard | null>('카드 업데이트 예외', error, null);
  }
}

// 카드 삭제하기
export async function deleteCard(cardId: number) {
  try {
    const { error } = await db
      .from('flashcards')
      .delete()
      .eq('id', cardId);
    
    if (error) return logError<boolean>('카드 삭제 오류', error, false);
    
    return true;
  } catch (error) {
    return logError<boolean>('카드 삭제 예외', error, false);
  }
}

// 카드 내용 수정하기
export async function updateCard(card: Partial<FlashCard>) {
  try {
    const { data, error } = await db
      .from('flashcards')
      .update({
        front: card.front,
        back: card.back,
        subject_id: card.subject_id
      })
      .eq('id', card.id)
      .select();
    
    if (error) return logError<FlashCard | null>('카드 내용 수정 오류', error, null);
    
    return data?.[0] as FlashCard;
  } catch (error) {
    return logError<FlashCard | null>('카드 내용 수정 예외', error, null);
  }
}

/**
 * 검색어가 포함된 카드를 찾습니다.
 * front(정답) 또는 back(문제) 필드에 검색어가 포함된 카드를 반환합니다.
 * 추가로 과목별 필터링도 지원합니다.
 */
export async function searchCards(searchText: string, subjectId?: number): Promise<FlashCard[]> {
  try {
    let query = db
      .from('flashcards')
      .select('*')
      .or(`front.ilike.%${searchText}%,back.ilike.%${searchText}%`);
    
    // 과목 ID가 제공되면 필터링
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    const { data, error } = await query.order('box_number', { ascending: true });
    
    if (error) return logError<FlashCard[]>('검색 오류', error, []);
    
    return data as FlashCard[];
  } catch (error) {
    return logError<FlashCard[]>('검색 처리 예외', error, []);
  }
} 