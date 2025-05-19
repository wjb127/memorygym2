import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from '@/app/reset-password/page';
import { createClient } from '@/utils/supabase-browser';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock createClient
const mockResetPasswordForEmail = jest.fn();
jest.mock('@/utils/supabase-browser', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

// Mock window.location
const originalWindow = window;
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: { origin: 'http://localhost:3000' },
    writable: true,
  });
});

afterAll(() => {
  window.location = originalWindow.location;
});

describe('ResetPassword Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('이메일 입력 필드와 제출 버튼이 렌더링되어야 함', () => {
    render(<ResetPassword />);

    expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /비밀번호 재설정 링크 받기/ })).toBeInTheDocument();
  });

  it('유효하지 않은 이메일 주소를 입력하면 에러 메시지를 표시해야 함', async () => {
    render(<ResetPassword />);

    const emailInput = screen.getByLabelText(/이메일/);
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('유효한 이메일 주소를 입력해주세요.')).toBeInTheDocument();
    });
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('비밀번호 재설정 요청이 성공하면 성공 메시지를 표시하고 로그인 페이지로 리다이렉트해야 함', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });
    jest.useFakeTimers();

    render(<ResetPassword />);

    const emailInput = screen.getByLabelText(/이메일/);
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/비밀번호 재설정 링크가 이메일로 전송되었습니다/)).toBeInTheDocument();
    });
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      { redirectTo: 'http://localhost:3000/auth/callback?next=/update-password' }
    );
    
    jest.advanceTimersByTime(3000);
    
    expect(mockPush).toHaveBeenCalledWith('/login');
    jest.useRealTimers();
  });

  it('비밀번호 재설정 요청이 실패하면 에러 메시지를 표시해야 함', async () => {
    const errorMessage = '비밀번호 재설정 중 오류가 발생했습니다';
    mockResetPasswordForEmail.mockRejectedValueOnce(new Error(errorMessage));

    render(<ResetPassword />);

    const emailInput = screen.getByLabelText(/이메일/);
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('요청 처리 중에는 로딩 상태를 표시해야 함', async () => {
    mockResetPasswordForEmail.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<ResetPassword />);

    const emailInput = screen.getByLabelText(/이메일/);
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);

    expect(screen.getByText('처리 중...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('처리 중...')).not.toBeInTheDocument();
    });
  });
}); 