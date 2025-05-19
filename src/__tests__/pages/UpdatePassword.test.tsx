import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdatePassword from '@/app/update-password/page';
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

describe('UpdatePassword Page', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      updateUser: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('인증 상태 확인', () => {
    it('유효한 세션이 있을 때 폼을 표시해야 함', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: '123' } } },
      });

      render(<UpdatePassword />);

      await waitFor(() => {
        expect(screen.getByLabelText(/새 비밀번호/)).toBeInTheDocument();
        expect(screen.getByLabelText(/비밀번호 확인/)).toBeInTheDocument();
      });
    });

    it('세션이 없을 때 에러 메시지를 표시해야 함', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      render(<UpdatePassword />);

      await waitFor(() => {
        expect(screen.getByText(/인증 세션이 유효하지 않습니다/)).toBeInTheDocument();
      });
    });
  });

  describe('비밀번호 유효성 검사', () => {
    beforeEach(async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: '123' } } },
      });
      render(<UpdatePassword />);
      await waitFor(() => {
        expect(screen.getByLabelText(/새 비밀번호/)).toBeInTheDocument();
      });
    });

    it('비밀번호가 8자 미만일 때 에러 메시지를 표시해야 함', async () => {
      const passwordInput = screen.getByLabelText(/새 비밀번호/);
      const confirmInput = screen.getByLabelText(/비밀번호 확인/);
      const form = screen.getByRole('form');

      fireEvent.change(passwordInput, { target: { value: '1234567' } });
      fireEvent.change(confirmInput, { target: { value: '1234567' } });
      fireEvent.submit(form);

      expect(await screen.findByText(/비밀번호는 8자 이상이어야 합니다/)).toBeInTheDocument();
      expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled();
    });

    it('비밀번호가 일치하지 않을 때 에러 메시지를 표시해야 함', async () => {
      const passwordInput = screen.getByLabelText(/새 비밀번호/);
      const confirmInput = screen.getByLabelText(/비밀번호 확인/);
      const form = screen.getByRole('form');

      fireEvent.change(passwordInput, { target: { value: '12345678' } });
      fireEvent.change(confirmInput, { target: { value: '87654321' } });
      fireEvent.submit(form);

      expect(await screen.findByText(/비밀번호가 일치하지 않습니다/)).toBeInTheDocument();
      expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('비밀번호 업데이트 처리', () => {
    beforeEach(async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: '123' } } },
      });
      render(<UpdatePassword />);
      await waitFor(() => {
        expect(screen.getByLabelText(/새 비밀번호/)).toBeInTheDocument();
      });
    });

    it('유효한 비밀번호로 업데이트가 성공해야 함', async () => {
      mockSupabase.auth.updateUser.mockResolvedValueOnce({ error: null });

      const passwordInput = screen.getByLabelText(/새 비밀번호/);
      const confirmInput = screen.getByLabelText(/비밀번호 확인/);
      const form = screen.getByRole('form');

      fireEvent.change(passwordInput, { target: { value: '12345678' } });
      fireEvent.change(confirmInput, { target: { value: '12345678' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
          password: '12345678',
        });
      });

      expect(await screen.findByText(/비밀번호가 성공적으로 변경되었습니다/)).toBeInTheDocument();
    });

    it('업데이트 중 에러가 발생하면 에러 메시지를 표시해야 함', async () => {
      const errorMessage = '비밀번호 변경 중 오류가 발생했습니다';
      mockSupabase.auth.updateUser.mockRejectedValueOnce(new Error(errorMessage));

      const passwordInput = screen.getByLabelText(/새 비밀번호/);
      const confirmInput = screen.getByLabelText(/비밀번호 확인/);
      const form = screen.getByRole('form');

      fireEvent.change(passwordInput, { target: { value: '12345678' } });
      fireEvent.change(confirmInput, { target: { value: '12345678' } });
      fireEvent.submit(form);

      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it('로딩 상태를 올바르게 표시해야 함', async () => {
      mockSupabase.auth.updateUser.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const passwordInput = screen.getByLabelText(/새 비밀번호/);
      const confirmInput = screen.getByLabelText(/비밀번호 확인/);
      const form = screen.getByRole('form');

      fireEvent.change(passwordInput, { target: { value: '12345678' } });
      fireEvent.change(confirmInput, { target: { value: '12345678' } });
      fireEvent.submit(form);

      expect(screen.getByText('처리 중...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('처리 중...')).not.toBeInTheDocument();
      });
    });
  });
}); 