-- =============================================
-- DELETE ALL TEST USERS
-- Run this in Supabase SQL Editor
-- =============================================

-- This will delete ALL users - use with caution!
-- If you want to keep some users, modify the WHERE clause

DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all auth users
  FOR user_record IN SELECT id, email FROM auth.users LOOP
    
    RAISE NOTICE 'Deleting user: %', user_record.email;
    
    -- Delete related data first
    DELETE FROM stock_movements WHERE created_by = user_record.id;
    DELETE FROM stock_transfers 
    WHERE requested_by = user_record.id 
       OR approved_by = user_record.id 
       OR completed_by = user_record.id;
    DELETE FROM products WHERE created_by = user_record.id;
    
    -- Delete from public.users (will cascade from auth.users, but being explicit)
    DELETE FROM public.users WHERE id = user_record.id;
    
  END LOOP;
  
  -- Now delete all from auth.users
  DELETE FROM auth.users;
  
  RAISE NOTICE 'All users deleted successfully';
END $$;

SELECT 'All users deleted! You can now signup fresh.' AS status;
