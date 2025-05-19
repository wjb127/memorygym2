import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { POST } from '@/app/api/auth/update-password/route';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { expect, jest, describe, it, beforeEach } from '@jest/globals';

// Types for mocking
type SupabaseResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: any, init?: ResponseInit) => {
        return {
          status: init?.status || 200,
          json: async () => body,
        };
      },
    },
  };
});

// Mock Request class
class MockRequest {
  private body: string;
  private method: string;
  private url: string;

  constructor(url: string, { method, body }: { method: string; body: string }) {
    this.url = url;
    this.method = method;
    this.body = body;
  }

  async json() {
    return JSON.parse(this.body);
  }
}

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: () => null,
    getAll: () => [],
  }),
}));

// Mock Supabase client
const mockUpdateUser = jest.fn();
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    auth: {
      updateUser: (...args: any[]) => mockUpdateUser(...args),
    },
  }),
}));

describe('Update Password API', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
  });

  it('비밀번호가 8자 미만이면 400 에러를 반환해야 함', async () => {
    const request = new MockRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: '1234567' }),
    });

    const response = await POST(request as unknown as Request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('비밀번호는 8자 이상이어야 합니다.');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('유효한 비밀번호로 업데이트가 성공해야 함', async () => {
    const mockResponse: SupabaseResponse<{ user: { id: string } }> = {
      data: { user: { id: '123' } },
      error: null,
    };
    mockUpdateUser.mockResolvedValueOnce(mockResponse);

    const request = new MockRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: '12345678' }),
    });

    const response = await POST(request as unknown as Request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateUser).toHaveBeenCalledWith({
      password: '12345678',
    });
  });

  it('Supabase 에러가 발생하면 500 에러를 반환해야 함', async () => {
    const errorMessage = '비밀번호 변경 중 오류가 발생했습니다';
    const mockResponse: SupabaseResponse<null> = {
      data: null,
      error: { message: errorMessage },
    };
    mockUpdateUser.mockResolvedValueOnce(mockResponse);

    const request = new MockRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: '12345678' }),
    });

    const response = await POST(request as unknown as Request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe(errorMessage);
  });

  it('예외가 발생하면 500 에러를 반환해야 함', async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error('서버 오류'));

    const request = new MockRequest('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: '12345678' }),
    });

    const response = await POST(request as unknown as Request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('서버 오류');
  });
}); 