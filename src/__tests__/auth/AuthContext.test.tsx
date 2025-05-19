import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase-browser';
import { AuthContextType } from '@/context/AuthContext';

// Mock createClient
jest.mock('@/utils/supabase-browser', () => ({
  createClient: jest.fn(),
}));

// Mock window.location
const mockLocation = new URL('http://localhost:3000');
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('AuthContext', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('초기 상태가 올바르게 설정되어야 함', async () => {
    const mockSession = {
      user: { id: '123', email: 'test@example.com' },
    };

    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
    });

    let authContext: AuthContextType | undefined;
    const TestComponent = () => {
      authContext = useAuth();
      return null;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(authContext?.isLoading).toBe(false);
    expect(authContext?.user).toEqual(mockSession.user);
    expect(authContext?.session).toEqual(mockSession);
  });

  it('로그아웃이 올바르게 동작해야 함', async () => {
    mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

    let authContext: AuthContextType | undefined;
    const TestComponent = () => {
      authContext = useAuth();
      return null;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      await authContext?.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
    expect(window.location.href).toBe('http://localhost:3000/');
  });

  it('로그아웃 시 에러가 발생하면 콘솔에 기록되어야 함', async () => {
    const mockError = new Error('로그아웃 실패');
    mockSupabase.auth.signOut.mockRejectedValueOnce(mockError);
    const consoleSpy = jest.spyOn(console, 'error');

    let authContext: AuthContextType | undefined;
    const TestComponent = () => {
      authContext = useAuth();
      return null;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      await authContext?.signOut();
    });

    expect(consoleSpy).toHaveBeenCalledWith('로그아웃 중 오류 발생:', mockError);
  });

  it('AuthProvider 외부에서 useAuth를 사용하면 에러가 발생해야 함', () => {
    const TestComponent = () => {
      useAuth();
      return null;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다');
  });
}); 