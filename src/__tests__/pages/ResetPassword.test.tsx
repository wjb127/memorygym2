import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from '@/app/reset-password/page';
import { createClient } from '@/utils/supabase-browser';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock createClient
jest.mock('@/utils/supabase-browser', () => ({
  createClient: jest.fn(),
}));

describe('ResetPassword Page', () => {
  const mockSupabase = {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  it('이메일 유효성 검사를 수행해야 함', async () => {
    render(<ResetPassword />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const form = screen.getByRole('form');
    
    // 빈 이메일로 제출
    fireEvent.submit(form);
    
    await waitFor(() => {
      const errorMessage = screen.getByText('유효한 이메일 주소를 입력해주세요.');
      expect(errorMessage).toBeInTheDocument();
    });
    expect(mockSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
    
    // 잘못된 형식의 이메일
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      const errorMessage = screen.getByText('유효한 이메일 주소를 입력해주세요.');
      expect(errorMessage).toBeInTheDocument();
    });
    expect(mockSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('유효한 이메일로 비밀번호 재설정 요청을 보내야 함', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });
    
    render(<ResetPassword />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const form = screen.getByRole('form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/auth/callback?next=/update-password' }
      );
    });
    
    expect(await screen.findByText(/비밀번호 재설정 링크가 이메일로 전송되었습니다/i)).toBeInTheDocument();
  });

  it('에러가 발생했을 때 에러 메시지를 표시해야 함', async () => {
    const errorMessage = '서버 오류가 발생했습니다';
    mockSupabase.auth.resetPasswordForEmail.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<ResetPassword />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const form = screen.getByRole('form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);
    
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('로딩 상태를 올바르게 표시해야 함', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<ResetPassword />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const form = screen.getByRole('form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(form);
    
    expect(screen.getByText('처리 중...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('처리 중...')).not.toBeInTheDocument();
    });
  });
}); 