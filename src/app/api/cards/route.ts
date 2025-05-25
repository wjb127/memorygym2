import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

console.log('🔥 [Cards API] 파일 로드됨');

// Supabase 클라이언트 (서버용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 샘플 카드 데이터
const SAMPLE_CARDS = [
  // 박스 1 (새로운 카드들)
  { id: '1', question: '대한민국의 수도는?', answer: '서울', box: 1, subject_id: 'sample-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', question: '지구에서 가장 높은 산은?', answer: '에베레스트산', box: 1, subject_id: 'sample-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', question: '물의 화학 기호는?', answer: 'H2O', box: 1, subject_id: 'sample-2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', question: '태양계에서 가장 큰 행성은?', answer: '목성', box: 1, subject_id: 'sample-2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', question: '인체에서 가장 큰 장기는?', answer: '피부', box: 1, subject_id: 'sample-3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', question: '광합성을 하는 세포 소기관은?', answer: '엽록체', box: 1, subject_id: 'sample-3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', question: '컴퓨터의 CPU는 무엇의 약자인가?', answer: 'Central Processing Unit', box: 1, subject_id: 'sample-4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', question: 'HTML은 무엇의 약자인가?', answer: 'HyperText Markup Language', box: 1, subject_id: 'sample-4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '9', question: '피타고라스 정리의 공식은?', answer: 'a² + b² = c²', box: 1, subject_id: 'sample-5', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '10', question: '원의 넓이 공식은?', answer: 'πr²', box: 1, subject_id: 'sample-5', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11', question: '조선을 건국한 인물은?', answer: '이성계(태조)', box: 1, subject_id: 'sample-6', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '12', question: '한글을 창제한 왕은?', answer: '세종대왕', box: 1, subject_id: 'sample-6', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '13', question: '제2차 세계대전이 끝난 해는?', answer: '1945년', box: 1, subject_id: 'sample-6', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '14', question: '영어로 "안녕하세요"는?', answer: 'Hello', box: 1, subject_id: 'sample-7', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '15', question: '영어로 "감사합니다"는?', answer: 'Thank you', box: 1, subject_id: 'sample-7', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '16', question: '일본어로 "안녕하세요"는?', answer: 'こんにちは (Konnichiwa)', box: 1, subject_id: 'sample-8', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '17', question: '중국어로 "안녕하세요"는?', answer: '你好 (Nǐ hǎo)', box: 1, subject_id: 'sample-8', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // 박스 2 (복습 1회)
  { id: '21', question: '지구의 자전 주기는?', answer: '24시간', box: 2, subject_id: 'sample-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '22', question: '산소의 화학 기호는?', answer: 'O', box: 2, subject_id: 'sample-2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '23', question: '사람의 심장은 몇 개의 심방을 가지는가?', answer: '2개', box: 2, subject_id: 'sample-3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '24', question: 'JavaScript는 어떤 종류의 언어인가?', answer: '프로그래밍 언어', box: 2, subject_id: 'sample-4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '25', question: '1 + 1 = ?', answer: '2', box: 2, subject_id: 'sample-5', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // 박스 3 (복습 2회)
  { id: '31', question: '태양계 행성 중 지구에서 가장 가까운 행성은?', answer: '금성', box: 3, subject_id: 'sample-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '32', question: '물의 끓는점은?', answer: '100°C', box: 3, subject_id: 'sample-2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '33', question: '사람의 정상 체온은?', answer: '36.5°C', box: 3, subject_id: 'sample-3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '34', question: 'www는 무엇의 약자인가?', answer: 'World Wide Web', box: 3, subject_id: 'sample-4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // 박스 4 (복습 3회)
  { id: '41', question: '달이 지구를 한 바퀴 도는 데 걸리는 시간은?', answer: '약 28일', box: 4, subject_id: 'sample-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '42', question: '공기 중 산소의 비율은?', answer: '약 21%', box: 4, subject_id: 'sample-2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '43', question: 'HTTP는 무엇의 약자인가?', answer: 'HyperText Transfer Protocol', box: 4, subject_id: 'sample-4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // 박스 5 (완전 암기)
  { id: '51', question: '빛의 속도는?', answer: '약 30만 km/s', box: 5, subject_id: 'sample-2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Supabase 인증 확인 함수
async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Authorization 헤더에서 JWT 토큰 확인
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Supabase JWT 토큰 검증
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.log('🔓 [Cards API] 인증 실패:', error?.message);
        return null;
      }
      
      console.log('🔐 [Cards API] 인증 성공:', user.email);
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('❌ [Cards API] 인증 확인 오류:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    console.log('🎯 [Cards API] 요청 시작:', url.toString());

    // 사용자 인증 확인
    const user = await getAuthenticatedUser(request);
    console.log('🔑 [Cards API] 서버 세션 상태:', {
      hasSession: !!user,
      isAuthenticated: !!user,
      userEmail: user?.email,
      userId: user?.id
    });

    const box = url.searchParams.get('box');
    console.log('📦 [Cards API] 박스 파라미터:', box);

    // 로그인된 사용자인 경우 실제 데이터 조회
    if (user) {
      console.log('🔐 [Cards API] 로그인된 사용자 - 실제 카드 데이터 조회');
      
      try {
        // 박스 필터링을 위한 쿼리 구성
        let queryFilter = `user_id=eq.${user.id}`;
        if (box) {
          const boxNumber = parseInt(box);
          if (!isNaN(boxNumber)) {
            queryFilter += `&box_number=eq.${boxNumber}`;
          }
        }

        // Supabase REST API를 통해 실제 카드 조회
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/flashcards?${queryFilter}&select=*&order=created_at.desc`,
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            }
          }
        );

        if (!response.ok) {
          console.error('💥 [Cards API] Supabase API 오류:', response.statusText);
          return NextResponse.json({ data: [] }); // 오류 시 빈 배열 반환
        }

        const cards = await response.json();
        console.log(`✅ [Cards API] 실제 카드 ${cards.length}개 반환`);
        
        return NextResponse.json({
          success: true,
          data: cards,
          total: cards.length
        });
      } catch (error) {
        console.error('💥 [Cards API] 실제 카드 조회 오류:', error);
        return NextResponse.json({ data: [] }); // 오류 시 빈 배열 반환
      }
    }

    // 비로그인 사용자인 경우 샘플 데이터 제공
    console.log('📝 [Cards API] 비로그인 사용자에게 샘플 데이터 제공');
    
    let cards = SAMPLE_CARDS;

    // 박스별 필터링
    if (box) {
      const boxNumber = parseInt(box);
      if (!isNaN(boxNumber)) {
        cards = cards.filter(card => card.box === boxNumber);
        console.log('🎲 [Cards API] 박스', box, '필터링 결과:', cards.length + '개');
      }
    }

    return NextResponse.json({
      success: true,
      data: cards,
      total: cards.length
    });

  } catch (error) {
    console.error('❌ [Cards API] 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '카드 목록을 가져오는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
} 