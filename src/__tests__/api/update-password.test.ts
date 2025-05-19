import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { POST } from '@/app/api/auth/update-password/route';
import { NextResponse } from 'next/server';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}));

describe('Update Password API', () => {
  const mockSupabase = {
    auth: {
      updateUser: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('비밀번호가 8자 미만이면 400 에러를 반환해야 함', async () => {
    const request = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: '1234567' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('비밀번호는 8자 이상이어야 합니다.');
    expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it('유효한 비밀번호로 업데이트가 성공해야 함', async () => {
    mockSupabase.auth.updateUser.mockResolvedValueOnce({ error: null });

    const request = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: '12345678' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      password: '12345678',
    });
  });

  it('Supabase 에러가 발생하면 500 에러를 반환해야 함', async () => {
    const errorMessage = '비밀번호 변경 중 오류가 발생했습니다';
    mockSupabase.auth.updateUser.mockResolvedValueOnce({
      error: { message: errorMessage },
    });

    const request = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: '12345678' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe(errorMessage);
  });

  it('예외가 발생하면 500 에러를 반환해야 함', async () => {
    mockSupabase.auth.updateUser.mockRejectedValueOnce(
      new Error('서버 오류')
    );

    const request = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: '12345678' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('서버 오류');
  });
}); 