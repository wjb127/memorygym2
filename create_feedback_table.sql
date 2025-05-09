-- feedback 테이블 생성 및, 테이블 생성 함수 등록

-- 테이블이 없는 경우에만 생성하는 함수
CREATE OR REPLACE FUNCTION create_feedback_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 테이블이 존재하는지 확인
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feedback') THEN
    -- feedback 테이블 생성
    CREATE TABLE public.feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    -- RLS 활성화
    ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
    
    -- 익명 사용자에게 INSERT 권한 부여
    CREATE POLICY "Allow anonymous inserts on feedback"
      ON public.feedback
      FOR INSERT
      TO anon
      WITH CHECK (true);
      
    -- 인증된 사용자에게 모든 권한 부여
    CREATE POLICY "Allow authenticated users full access to feedback"
      ON public.feedback
      TO authenticated
      USING (true)
      WITH CHECK (true);
    
    RAISE NOTICE 'Feedback table created successfully';
  ELSE
    RAISE NOTICE 'Feedback table already exists';
  END IF;
END;
$$;

-- 함수를 즉시 실행하여 테이블 생성
SELECT create_feedback_table(); 