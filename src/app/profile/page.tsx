'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // 계정 삭제 관련 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirectTo=/profile');
    } else if (user) {
      setDisplayName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, isLoading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      // 여기에 실제 업데이트 로직을 추가할 수 있습니다
      // 현재는 임시 지연만 추가
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ 
        type: 'success', 
        text: '프로필이 성공적으로 업데이트되었습니다.' 
      });
      setIsEditing(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '프로필 업데이트 중 오류가 발생했습니다.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };
  
  // 계정 삭제 확인 모달 표시
  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
    setMessage(null);
  };
  
  // 계정 삭제 취소
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePassword('');
  };
  
  // 계정 삭제 확인
  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      setMessage({
        type: 'error',
        text: '계정 삭제를 확인하려면 비밀번호를 입력하세요.'
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      setMessage(null);
      
      console.log('계정 삭제 요청 시작');
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      
      // 응답 상태 코드 로깅
      console.log(`계정 삭제 응답 상태: ${response.status} ${response.statusText}`);
      
      // 비밀번호 검증 실패 시 (상태 코드 400)
      if (response.status === 400) {
        setMessage({
          type: 'error',
          text: '비밀번호가 올바르지 않습니다. 다시 확인해주세요.'
        });
        setIsDeleting(false);
        return;
      }
      
      let data;
      try {
        data = await response.json();
        console.log('계정 삭제 응답 데이터:', data);
      } catch (parseError) {
        console.error('응답 파싱 오류:', parseError);
        data = {};
      }
      
      if (!response.ok) {
        // 자세한 오류 메시지 표시
        let errorMessage = '계정 삭제 중 오류가 발생했습니다.';
        
        // 응답에서 오류 메시지 추출
        if (data && data.error) {
          errorMessage = data.error;
          
          // 상세 정보가 있으면 추가
          if (data.details) {
            if (typeof data.details === 'string') {
              errorMessage += `: ${data.details}`;
            } else if (data.details.message) {
              errorMessage += `: ${data.details.message}`;
            }
          }
        }
        
        setMessage({
          type: 'error',
          text: errorMessage
        });
        setIsDeleting(false);
        return;
      }
      
      console.log('계정 삭제 성공');
      
      // 로그아웃 처리
      await signOut({ callbackUrl: '/?deleted=true' });
      
      // 홈페이지로 리다이렉트
      // router.push('/?deleted=true'); // 로그아웃 시 자동으로 리다이렉트됨
    } catch (error: any) {
      console.error('계정 삭제 오류:', error);
      setMessage({
        type: 'error',
        text: error.message || '계정 삭제 중 오류가 발생했습니다.'
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // useEffect에서 리다이렉트 처리
  }

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-[var(--neutral-700)] hover:text-[var(--neutral-900)] transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent text-center">
          내 계정 관리
        </h1>
      </header>

      <div className="bg-[var(--neutral-100)] rounded-xl shadow-lg p-6 border border-[var(--neutral-300)]">
        {message && message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">계정 정보</h2>
          
          {isEditing ? (
            <form onSubmit={handleSaveProfile}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--neutral-300)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--neutral-700)] mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 border border-[var(--neutral-300)] rounded-lg bg-[var(--neutral-200)] text-[var(--neutral-700)]"
                  />
                  <p className="text-xs mt-1 text-[var(--neutral-700)]">
                    이메일 주소는 변경할 수 없습니다.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[var(--neutral-300)] rounded-lg hover:bg-[var(--neutral-200)] transition-colors"
                    disabled={isSaving}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-70"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        저장 중...
                      </span>
                    ) : '저장하기'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--neutral-300)]">
                <div>
                  <p className="text-sm font-medium text-[var(--neutral-700)]">이름</p>
                  <p className="text-lg">{displayName || '(설정되지 않음)'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-[var(--neutral-300)]">
                <div>
                  <p className="text-sm font-medium text-[var(--neutral-700)]">이메일</p>
                  <p className="text-lg">{email}</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
                >
                  정보 수정
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">비밀번호</h2>
          <div className="bg-[var(--neutral-200)] p-4 rounded-lg">
            <p className="mb-4">비밀번호를 변경하려면 아래 버튼을 클릭하세요.</p>
            <div className="flex justify-end">
              <Link 
                href="/update-password" 
                className="px-4 py-2 border border-[var(--neutral-700)] text-[var(--neutral-700)] rounded-lg hover:bg-[var(--neutral-300)] transition-colors"
              >
                비밀번호 변경
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">계정 관리</h2>
          <div className="bg-[var(--neutral-200)] p-4 rounded-lg">
            <p className="mb-4">현재 세션에서 로그아웃합니다.</p>
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-[var(--neutral-700)] text-[var(--neutral-700)] rounded-lg hover:bg-[var(--neutral-300)] transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-lg font-medium text-red-700 mb-2">계정 삭제</h3>
            
            {showDeleteConfirm ? (
              <div>
                <p className="text-sm text-red-600 mb-4">
                  정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
                </p>
                <div className="mb-4">
                  <label htmlFor="deletePassword" className="block text-sm font-medium text-red-700 mb-1">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="계정 삭제를 확인하려면 비밀번호를 입력하세요"
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelDelete}
                    className="px-4 py-2 border border-[var(--neutral-700)] text-[var(--neutral-700)] rounded-lg hover:bg-[var(--neutral-300)] transition-colors"
                    disabled={isDeleting}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        삭제 중...
                      </span>
                    ) : '계정 영구 삭제'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-red-600 mb-4">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    계정 삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 