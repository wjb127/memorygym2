// 로그인 함수
export async function login(email: string, password: string) {
  try {
    console.log('[로그인 요청]', { email });
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '로그인에 실패했습니다.');
    }

    console.log('[로그인 응답]', data);

    // 성공 후 세션 상태 즉시 확인
    const session = await getSession();
    console.log('[로그인 후 세션]', { hasSession: !!session });
    
    return data;
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
}

// 로그아웃 함수
export async function logout() {
  try {
    console.log('[로그아웃 요청]');
    
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '로그아웃에 실패했습니다.');
    }

    // 캐시된 세션 초기화
    cachedSession = null;
    
    return true;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
}

let cachedSession: any = null;
let sessionCheckPromise: Promise<any> | null = null;

// 세션 확인 함수
export async function getSession() {
  // 이미 진행 중인 세션 체크가 있으면 그 결과를 재사용
  if (sessionCheckPromise) {
    try {
      return await sessionCheckPromise;
    } catch (error) {
      sessionCheckPromise = null;
      cachedSession = null;
    }
  }

  // 캐시된 세션이 있으면 반환
  if (cachedSession) {
    return cachedSession;
  }

  try {
    console.log('[세션 확인 요청]');
    
    // 새로운 세션 체크 시작
    sessionCheckPromise = (async () => {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          cachedSession = null;
          return null;
        }
        throw new Error(data.error || '세션 확인에 실패했습니다.');
      }

      console.log('[세션 확인 응답]', { 
        hasSession: !!data.data,
        userId: data.data?.user?.id
      });
      
      cachedSession = data.data;
      return data.data;
    })();

    return await sessionCheckPromise;
  } catch (error) {
    console.error('세션 확인 오류:', error);
    sessionCheckPromise = null;
    cachedSession = null;
    return null;
  } finally {
    // 요청이 완료되면 프로미스 참조 제거
    setTimeout(() => {
      sessionCheckPromise = null;
    }, 100);
  }
}

// 로그인 상태 확인 함수
export async function isAuthenticated() {
  try {
    // 캐시된 세션이 있으면 사용
    if (cachedSession) {
      return true;
    }
    
    const session = await getSession();
    return !!session;
  } catch (error) {
    console.error('인증 상태 확인 오류:', error);
    return false;
  }
} 