-- 사용자 삭제를 위한 함수 생성
CREATE OR REPLACE FUNCTION public.delete_user_manually(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN := FALSE;
BEGIN
  -- 1. 사용자 관련 데이터 삭제 (외래 키 제약 조건 순서대로)
  
  -- flashcards 테이블에서 사용자 데이터 삭제
  DELETE FROM public.flashcards WHERE user_id = user_id_param;
  
  -- subjects 테이블에서 사용자 데이터 삭제
  DELETE FROM public.subjects WHERE user_id = user_id_param;
  
  -- profiles 테이블에서 사용자 데이터 삭제
  DELETE FROM public.profiles WHERE id = user_id_param;
  
  -- 2. auth.users 테이블에서 사용자 삭제 (관리자 권한 필요)
  DELETE FROM auth.users WHERE id = user_id_param;
  
  -- 성공 여부 반환
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting user %: %', user_id_param, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 