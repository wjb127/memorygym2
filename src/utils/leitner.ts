import { supabase } from './supabase';
import { FlashCard, ReviewInterval } from './types';

// 모든 플래시카드 가져오기
export async function getAllCards() {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('is_admin_card', true)
    .order('id');
  
  if (error) {
    console.error('카드 가져오기 오류:', error);
    return [];
  }
  
  return data as FlashCard[];
}

// 상자별 카드 가져오기
export async function getCardsByBox(boxNumber: number) {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('is_admin_card', true)
    .eq('box_number', boxNumber)
    .order('id');
  
  if (error) {
    console.error(`${boxNumber}번 상자 카드 가져오기 오류:`, error);
    return [];
  }
  
  return data as FlashCard[];
}

// 오늘 학습할 카드 가져오기
export async function getTodaysCards() {
  const today = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('is_admin_card', true)
    .lte('next_review', today)
    .order('box_number')
    .order('id');
  
  if (error) {
    console.error('오늘의 카드 가져오기 오류:', error);
    return [];
  }
  
  return data as FlashCard[];
}

// 새 카드 추가하기
export async function addCard(front: string, back: string) {
  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      front,
      back,
      box_number: 1,
      is_admin_card: true
    })
    .select();
  
  if (error) {
    console.error('카드 추가 오류:', error);
    return null;
  }
  
  return data?.[0] as FlashCard;
}

// 카드 업데이트하기 (상자 이동)
export async function updateCardBox(cardId: number, isCorrect: boolean) {
  // 현재 카드 정보 가져오기
  const { data: cardData, error: cardError } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', cardId)
    .single();
  
  if (cardError) {
    console.error('카드 정보 가져오기 오류:', cardError);
    return null;
  }
  
  const card = cardData as FlashCard;
  let newBoxNumber = card.box_number;
  
  // 맞았으면 다음 상자로, 틀렸으면 1번 상자로
  if (isCorrect) {
    newBoxNumber = Math.min(card.box_number + 1, 5);
  } else {
    newBoxNumber = 1;
  }
  
  // 다음 복습 일자 계산
  const { data: intervalData } = await supabase
    .from('review_intervals')
    .select('interval_days')
    .eq('box_number', newBoxNumber)
    .single();
  
  const interval = intervalData as ReviewInterval;
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval.interval_days);
  
  // 카드 업데이트
  const { data, error } = await supabase
    .from('flashcards')
    .update({
      box_number: newBoxNumber,
      last_reviewed: new Date().toISOString(),
      next_review: nextReview.toISOString()
    })
    .eq('id', cardId)
    .select();
  
  if (error) {
    console.error('카드 업데이트 오류:', error);
    return null;
  }
  
  return data?.[0] as FlashCard;
}

// 카드 삭제하기
export async function deleteCard(cardId: number) {
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', cardId);
  
  if (error) {
    console.error('카드 삭제 오류:', error);
    return false;
  }
  
  return true;
}

// 카드 내용 수정하기
export async function updateCard(card: FlashCard) {
  const { data, error } = await supabase
    .from('flashcards')
    .update({
      front: card.front,
      back: card.back
    })
    .eq('id', card.id)
    .select();
  
  if (error) {
    console.error('카드 내용 수정 오류:', error);
    return null;
  }
  
  return data?.[0] as FlashCard;
} 