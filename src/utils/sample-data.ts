import { Subject, FlashQuiz } from './types';

// 샘플 과목 데이터
export const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: -1,
    name: '영어 기초 단어 (샘플)',
    description: '일상에서 자주 사용되는 기본 영어 단어',
    user_id: 'sample',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: true
  },
  {
    id: -2,
    name: '초등 수학 개념 (샘플)',
    description: '초등학교 수학의 기본 개념과 용어',
    user_id: 'sample',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: true
  },
  {
    id: -3,
    name: '한국사 중요 사건 (샘플)',
    description: '한국사 시대별 주요 사건과 인물',
    user_id: 'sample',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: true
  }
];

// 샘플 영어 단어 카드
export const SAMPLE_ENGLISH_CARDS: FlashQuiz[] = [
  {
    id: -101,
    front: 'Apple',
    back: '사과',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -102,
    front: 'Book',
    back: '책',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -103,
    front: 'Computer',
    back: '컴퓨터',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -110,
    front: 'Dog',
    back: '개',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -111,
    front: 'Cat',
    back: '고양이',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -112,
    front: 'Water',
    back: '물',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -113,
    front: 'House',
    back: '집',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -114,
    front: 'Car',
    back: '자동차',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -115,
    front: 'School',
    back: '학교',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -116,
    front: 'Friend',
    back: '친구',
    box_number: 1,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -104,
    front: 'Desk',
    back: '책상',
    box_number: 2,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -105,
    front: 'Elephant',
    back: '코끼리',
    box_number: 2,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -106,
    front: 'Family',
    back: '가족',
    box_number: 3,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -107,
    front: 'Garden',
    back: '정원',
    box_number: 3,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -108,
    front: 'Hospital',
    back: '병원',
    box_number: 4,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -109,
    front: 'Internet',
    back: '인터넷',
    box_number: 5,
    subject_id: -1,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  }
];

// 샘플 수학 카드
export const SAMPLE_MATH_CARDS: FlashQuiz[] = [
  {
    id: -201,
    front: '더하기',
    back: '두 수나 양을 합하는 연산 (+)',
    box_number: 1,
    subject_id: -2,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -202,
    front: '빼기',
    back: '한 수에서 다른 수를 제거하는 연산 (-)',
    box_number: 1,
    subject_id: -2,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -210,
    front: '자연수',
    back: '1, 2, 3, 4, 5... 처럼 1부터 시작하는 수',
    box_number: 1,
    subject_id: -2,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -211,
    front: '홀수',
    back: '2로 나누어 떨어지지 않는 수 (1, 3, 5, 7...)',
    box_number: 1,
    subject_id: -2,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -212,
    front: '짝수',
    back: '2로 나누어 떨어지는 수 (2, 4, 6, 8...)',
    box_number: 1,
    subject_id: -2,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -203,
    front: '곱하기',
    back: '같은 수를 여러 번 더하는 연산 (×)',
    box_number: 2,
    subject_id: -2,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -204,
    front: '나누기',
    back: '한 수를 같은 크기의 부분으로 나누는 연산 (÷)',
    box_number: 2,
    subject_id: -2,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -205,
    front: '분수',
    back: '전체 중 일부를 나타내는 방식 (예: 3/4)',
    box_number: 3,
    subject_id: -2,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -206,
    front: '소수',
    back: '정수가 아닌 수를 표현하는 방식 (예: 0.75)',
    box_number: 4,
    subject_id: -2,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  }
];

// 샘플 한국사 카드
export const SAMPLE_HISTORY_CARDS: FlashQuiz[] = [
  {
    id: -301,
    front: '삼국시대',
    back: '고구려, 백제, 신라가 한반도를 지배했던 시기 (57 BCE - 668 CE)',
    box_number: 1,
    subject_id: -3,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -302,
    front: '통일신라',
    back: '신라가 삼국을 통일한 이후의 시기 (668-935)',
    box_number: 1,
    subject_id: -3,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -303,
    front: '고려시대',
    back: '고려 왕조가 한반도를 통치한 시기 (918-1392)',
    box_number: 2,
    subject_id: -3,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -304,
    front: '조선시대',
    back: '조선 왕조가 한반도를 통치한 시기 (1392-1910)',
    box_number: 3,
    subject_id: -3,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  },
  {
    id: -305,
    front: '일제강점기',
    back: '일본이 한국을 강제 점령한 시기 (1910-1945)',
    box_number: 4,
    subject_id: -3,
    user_id: 'sample',
    created_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    next_review: new Date().toISOString()
  }
];

// 모든 샘플 카드를 한 배열에 모음
export const SAMPLE_CARDS: FlashQuiz[] = [
  ...SAMPLE_ENGLISH_CARDS,
  ...SAMPLE_MATH_CARDS,
  ...SAMPLE_HISTORY_CARDS
];

// 특정 과목의 카드만 가져오는 함수
export function getSampleCardsBySubject(subjectId: number): FlashQuiz[] {
  return SAMPLE_CARDS.filter(card => card.subject_id === subjectId);
}

// 특정 상자의 카드만 가져오는 함수
export function getSampleCardsByBox(boxNumber: number, subjectId?: number): FlashQuiz[] {
  let cards = SAMPLE_CARDS.filter(card => card.box_number === boxNumber);
  
  if (subjectId !== undefined) {
    cards = cards.filter(card => card.subject_id === subjectId);
  }
  
  return cards;
}

// 특정 상자에 있는 특정 과목의 카드 수를 가져오는 함수
export function getSampleCardCountByBoxAndSubject(boxNumber: number, subjectId?: number): number {
  return getSampleCardsByBox(boxNumber, subjectId).length;
}

// 특정 과목의 카드 수를 가져오는 함수
export function getSampleCardCountBySubject(subjectId: number): number {
  return getSampleCardsBySubject(subjectId).length;
}

// 기본 샘플 과목 ID인지 확인하는 함수
export function isSampleSubject(subjectId: number): boolean {
  return subjectId < 0 && SAMPLE_SUBJECTS.some(subject => subject.id === subjectId);
}

// 기본 샘플 카드 ID인지 확인하는 함수
export function isSampleCard(cardId: number): boolean {
  return cardId < 0 && SAMPLE_CARDS.some(card => card.id === cardId);
} 