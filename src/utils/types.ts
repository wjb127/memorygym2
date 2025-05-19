export type FlashQuiz = {
  id: number;
  created_at: string;
  front: string; // 단어 (뒷면)
  back: string;  // 뜻 (앞면)
  box_number: number; // 라이트너 훈련소 번호 (1~5)
  last_reviewed: string; // 마지막 학습 일시
  next_review: string; // 다음 학습 예정 일시
  is_admin_card?: boolean; // 관리자 퀴즈 여부 (선택 사항)
  subject_id: number; // 과목 ID
  user_id: string; // 사용자 ID
};

export type Subject = {
  id: number;
  created_at: string;
  updated_at?: string; // 마지막 업데이트 일시 (선택 사항)
  name: string; // 과목 이름
  description?: string; // 과목 설명 (선택 사항)
  user_id: string; // 사용자 ID
  is_public?: boolean; // 공개 여부 (선택 사항)
};

export type ReviewInterval = {
  box_number: number;
  interval_days: number;
};

export const BOX_COLORS = {
  1: 'border-red-400',
  2: 'border-yellow-400',
  3: 'border-green-400',
  4: 'border-blue-400',
  5: 'border-purple-400',
};

export const BOX_NAMES = {
  1: '매일 퀴즈',
  2: '3일마다 퀴즈',
  3: '일주일마다 퀴즈',
  4: '2주마다 퀴즈',
  5: '한달마다 퀴즈',
};