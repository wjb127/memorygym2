import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'sb-auth-token',
        storage: {
          getItem: (key) => {
            try {
              return window.localStorage.getItem(key);
            } catch (error) {
              console.error('스토리지 접근 오류:', error);
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              window.localStorage.setItem(key, value);
            } catch (error) {
              console.error('스토리지 설정 오류:', error);
            }
          },
          removeItem: (key) => {
            try {
              window.localStorage.removeItem(key);
            } catch (error) {
              console.error('스토리지 항목 제거 오류:', error);
            }
          }
        }
      }
    }
  );
} 