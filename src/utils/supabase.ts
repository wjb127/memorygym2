import { createClient } from '@supabase/supabase-js'
import { Subject } from './types';

// Supabase 클라이언트 생성
// 실제 프로젝트에서는 환경 변수에서 값을 가져와야 합니다
// .env.local 파일에 다음 변수를 설정하세요:
// NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

// 실제 Supabase 연결 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL 또는 Anon Key가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// 개발 환경용 더미 데이터 구현 (실제 API 호출 대신 가짜 데이터 반환)
// Supabase 연결 없이도 UI가 작동하도록 합니다
type FlashCardData = {
  id: number;
  created_at: string;
  front: string;
  back: string;
  box_number: number;
  last_reviewed: string;
  next_review: string;
  is_admin_card: boolean;
  subject_id: number;
}

type InsertData = Partial<FlashCardData>;

class QueryBuilder {
  private _table: string;
  private _filters: Record<string, any> = {};
  private _sortFields: string[] = [];
  private _sortDirections: Record<string, boolean> = {};
  private _isSingle: boolean = false;
  private _orCondition: string | null = null;

  constructor(table: string) {
    this._table = table;
  }

  select(columns: string = '*') {
    // select 메서드는 이미 QueryBuilder를 반환하므로 여기서 chain을 시작합니다
    return this;
  }

  eq(field: string, value: any) {
    this._filters[field] = value;
    return this;
  }

  lte(field: string, value: any) {
    this._filters[`${field}_lte`] = value;
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this._sortFields.push(field);
    if (options) {
      this._sortDirections[field] = options.ascending !== false;
    }
    return this;
  }

  single() {
    this._isSingle = true;
    return this;
  }

  or(condition: string) {
    this._orCondition = condition;
    return this;
  }

  async then(resolve: any) {
    // 이 메서드는 Promise를 가장하여 await 구문에서 작동하게 합니다
    if (this._table === 'subjects') {
      return resolve(this._getSubjectsResult());
    } else if (this._table === 'flashcards') {
      return resolve(this._getFlashcardsResult());
    } else if (this._table === 'review_intervals') {
      return resolve(this._getReviewIntervalsResult());
    }
    return resolve({ data: [], error: null });
  }

  // 실제 데이터 반환 로직
  private _getSubjectsResult() {
    let data = getSampleSubjects();
    
    // 필터 적용
    Object.entries(this._filters).forEach(([key, value]) => {
      data = data.filter(item => item[key as keyof Subject] === value);
    });
    
    // 정렬 적용
    if (this._sortFields.length > 0) {
      data.sort((a, b) => {
        for (const field of this._sortFields) {
          const aValue = a[field as keyof Subject];
          const bValue = b[field as keyof Subject];
          // null이나 undefined를 처리
          if (aValue === undefined && bValue === undefined) continue;
          if (aValue === undefined) return this._sortDirections[field] ? -1 : 1;
          if (bValue === undefined) return this._sortDirections[field] ? 1 : -1;
          if (aValue < bValue) return this._sortDirections[field] ? -1 : 1;
          if (aValue > bValue) return this._sortDirections[field] ? 1 : -1;
        }
        return 0;
      });
    }
    
    // single 모드 적용
    if (this._isSingle) {
      return { data: data[0] || null, error: null };
    }
    
    return { data, error: null };
  }

  private _getFlashcardsResult() {
    let data = getSampleData();
    
    // 필터 적용
    Object.entries(this._filters).forEach(([key, value]) => {
      if (key.endsWith('_lte')) {
        const realKey = key.replace('_lte', '');
        data = data.filter(item => item[realKey as keyof FlashCardData] <= value);
      } else {
        data = data.filter(item => item[key as keyof FlashCardData] === value);
      }
    });
    
    // OR 조건 적용
    if (this._orCondition) {
      try {
        // 단순한 OR 조건 처리 로직
        // 예: "front.ilike.%text%,back.ilike.%text%"
        const orParts = this._orCondition.split(',');
        data = data.filter(item => {
          return orParts.some(part => {
            const [field, op, value] = part.split('.');
            if (op === 'ilike') {
              const searchValue = value.replace(/%/g, '');
              return String(item[field as keyof FlashCardData]).toLowerCase().includes(searchValue.toLowerCase());
            }
            return false;
          });
        });
      } catch (e) {
        console.error('OR 조건 처리 중 오류:', e);
      }
    }
    
    // 정렬 적용
    if (this._sortFields.length > 0) {
      data.sort((a, b) => {
        for (const field of this._sortFields) {
          const aValue = a[field as keyof FlashCardData];
          const bValue = b[field as keyof FlashCardData];
          // null이나 undefined를 처리
          if (aValue === undefined && bValue === undefined) continue;
          if (aValue === undefined) return this._sortDirections[field] ? -1 : 1;
          if (bValue === undefined) return this._sortDirections[field] ? 1 : -1;
          if (aValue < bValue) return this._sortDirections[field] ? -1 : 1;
          if (aValue > bValue) return this._sortDirections[field] ? 1 : -1;
        }
        return 0;
      });
    }
    
    // single 모드 적용
    if (this._isSingle) {
      return { data: data[0] || null, error: null };
    }
    
    return { data, error: null };
  }

  private _getReviewIntervalsResult() {
    const reviewIntervals = [
      { box_number: 1, interval_days: 1 },
      { box_number: 2, interval_days: 3 },
      { box_number: 3, interval_days: 7 },
      { box_number: 4, interval_days: 14 },
      { box_number: 5, interval_days: 30 },
    ];
    
    let data = reviewIntervals;
    
    // 필터 적용
    Object.entries(this._filters).forEach(([key, value]) => {
      data = data.filter(item => item[key as keyof typeof item] === value);
    });
    
    // single 모드 적용
    if (this._isSingle) {
      return { data: data[0] || null, error: null };
    }
    
    return { data, error: null };
  }

  // 삽입/업데이트/삭제 기능
  async insert(data: InsertData | Partial<Subject>) {
    if (this._table === 'subjects') {
      return {
        data: [{ id: Date.now(), created_at: new Date().toISOString(), ...data }],
        error: null
      };
    } else {
      return {
        data: [{ id: Date.now(), created_at: new Date().toISOString(), ...data }],
        error: null
      };
    }
  }

  async update(data: InsertData | Partial<Subject>) {
    const filteredData = this._table === 'subjects'
      ? getSampleSubjects().filter(item => this._matchesFilters(item))
      : getSampleData().filter(item => this._matchesFilters(item));
    
    if (filteredData.length === 0) {
      return { data: null, error: null };
    }
    
    return {
      data: [{ ...filteredData[0], ...data }],
      error: null
    };
  }

  async delete() {
    return { error: null };
  }

  private _matchesFilters(item: any) {
    return Object.entries(this._filters).every(([key, value]) => {
      return item[key] === value;
    });
  }
}

class DummySupabase {
  from(table: string) {
    return new QueryBuilder(table);
  }

  auth = {
    signInWithOtp: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: { id: 'dummy-user-id' } } })
  };
}

// 더미 데이터 생성 함수
function getSampleData(): FlashCardData[] {
  return [
    {
      id: 1,
      created_at: new Date().toISOString(),
      front: 'Hello',
      back: '안녕하세요',
      box_number: 1,
      last_reviewed: new Date().toISOString(),
      next_review: new Date().toISOString(),
      is_admin_card: true,
      subject_id: 1
    },
    {
      id: 2,
      created_at: new Date().toISOString(),
      front: 'Goodbye',
      back: '안녕히 가세요',
      box_number: 1,
      last_reviewed: new Date().toISOString(),
      next_review: new Date().toISOString(),
      is_admin_card: true,
      subject_id: 1
    },
    {
      id: 3,
      created_at: new Date().toISOString(),
      front: 'Thank you',
      back: '감사합니다',
      box_number: 2,
      last_reviewed: new Date().toISOString(),
      next_review: new Date().toISOString(),
      is_admin_card: true,
      subject_id: 1
    },
    {
      id: 4,
      created_at: new Date().toISOString(),
      front: 'Sorry',
      back: '죄송합니다',
      box_number: 3,
      last_reviewed: new Date().toISOString(),
      next_review: new Date().toISOString(),
      is_admin_card: true,
      subject_id: 1
    },
    {
      id: 5,
      created_at: new Date().toISOString(),
      front: 'Yes',
      back: '네',
      box_number: 4,
      last_reviewed: new Date().toISOString(),
      next_review: new Date().toISOString(),
      is_admin_card: true,
      subject_id: 1
    },
    {
      id: 6,
      created_at: new Date().toISOString(),
      front: 'Algorithm',
      back: '알고리즘',
      box_number: 1,
      last_reviewed: new Date().toISOString(),
      next_review: new Date().toISOString(),
      is_admin_card: true,
      subject_id: 2
    },
    {
      id: 7,
      created_at: new Date().toISOString(),
      front: 'Data Structure',
      back: '자료구조',
      box_number: 2,
      last_reviewed: new Date().toISOString(),
      next_review: new Date().toISOString(),
      is_admin_card: true,
      subject_id: 2
    },
    {
      id: 8,
      created_at: new Date().toISOString(),
      front: 'Mitochondria',
      back: '미토콘드리아는 세포의 발전소입니다',
      box_number: 1,
      last_reviewed: new Date().toISOString(),
      next_review: new Date().toISOString(),
      is_admin_card: true,
      subject_id: 3
    }
  ];
}

// 더미 과목 데이터
function getSampleSubjects(): Subject[] {
  return [
    {
      id: 1,
      created_at: new Date().toISOString(),
      name: '영어',
      description: '영어 단어와 문장 학습'
    },
    {
      id: 2,
      created_at: new Date().toISOString(),
      name: '컴퓨터 과학',
      description: '프로그래밍과 컴퓨터 과학 용어'
    },
    {
      id: 3,
      created_at: new Date().toISOString(),
      name: '생물학',
      description: '생물학 개념과 용어'
    }
  ];
}

// 더미 Supabase 객체 생성
export const supabaseDummy = new DummySupabase(); 