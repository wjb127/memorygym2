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

class DummySupabase {
  async from(_table: string) {
    if (_table === 'subjects') {
      return {
        select: () => this.selectSubjects(),
        insert: (data: Partial<Subject>) => this.insertSubject(data),
        update: (data: Partial<Subject>) => this.updateSubject(data),
        delete: () => this.delete(),
        eq: () => this,
        order: () => this,
        single: () => this
      };
    }
    
    return {
      select: () => this.select(),
      insert: (data: InsertData) => this.insert(data),
      update: (data: InsertData) => this.update(data),
      delete: () => this.delete(),
      eq: () => this,
      lte: () => this,
      order: () => this,
      single: () => this,
      or: () => this
    };
  }

  select() {
    return Promise.resolve({
      data: getSampleData(),
      error: null
    });
  }
  
  selectSubjects() {
    return Promise.resolve({
      data: getSampleSubjects(),
      error: null
    });
  }

  insert(data: InsertData) {
    return Promise.resolve({
      data: [{ id: Date.now(), created_at: new Date().toISOString(), ...data }],
      error: null
    });
  }
  
  insertSubject(data: Partial<Subject>) {
    return Promise.resolve({
      data: [{ id: Date.now(), created_at: new Date().toISOString(), ...data }],
      error: null
    });
  }

  update(data: InsertData) {
    return Promise.resolve({
      data: [{ id: 1, created_at: new Date().toISOString(), ...data }],
      error: null
    });
  }
  
  updateSubject(data: Partial<Subject>) {
    return Promise.resolve({
      data: [{ id: 1, created_at: new Date().toISOString(), ...data }],
      error: null
    });
  }

  delete() {
    return Promise.resolve({
      error: null
    });
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseDummy = new DummySupabase() as any; 