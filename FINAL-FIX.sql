-- RUN THIS ENTIRE SCRIPT - IT WILL FIX EVERYTHING
-- Copy and paste ALL of this into Supabase SQL Editor and click RUN

-- 1. Delete all users first
DO $$ 
BEGIN
    DELETE FROM public.users;
    DELETE FROM auth.users;
END $$;

-- 2. Drop ALL policies on users table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- 3. Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 5. Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_store_id UUID;
BEGIN
  -- Get or create default store
  SELECT id INTO default_store_id FROM stores WHERE name = 'Main Store' LIMIT 1;
  
  IF default_store_id IS NULL THEN
    INSERT INTO stores (name, city, phone, is_active)
    VALUES ('Main Store', 'Mumbai', '+91-0000000000', TRUE)
    RETURNING id INTO default_store_id;
  END IF;
  
  -- Insert user profile
  INSERT INTO public.users (id, email, full_name, role, store_id, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff'),
    default_store_id,
    TRUE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Verify
SELECT 
  'DONE! Signup should work now. Go to localhost:3000/signup' AS message,
  COUNT(*) AS users_count 
FROM auth.users;
