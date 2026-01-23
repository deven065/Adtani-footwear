-- =============================================
-- COMPLETE FIX: Delete Users + Fix Trigger
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================

-- STEP 1: Delete all existing users and their data
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Delete related data
    DELETE FROM stock_movements WHERE created_by = user_record.id;
    DELETE FROM stock_transfers WHERE requested_by = user_record.id OR approved_by = user_record.id OR completed_by = user_record.id;
    DELETE FROM products WHERE created_by = user_record.id;
    DELETE FROM public.users WHERE id = user_record.id;
  END LOOP;
  
  -- Delete all auth users
  DELETE FROM auth.users;
  
  RAISE NOTICE 'All users deleted';
END $$;

-- STEP 2: Drop and recreate the trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_store_id UUID;
  user_role user_role;
BEGIN
  -- Get or create default store
  SELECT id INTO default_store_id
  FROM stores
  WHERE name = 'Main Store'
  LIMIT 1;
  
  IF default_store_id IS NULL THEN
    INSERT INTO stores (name, city, phone, is_active)
    VALUES ('Main Store', 'Mumbai', '+91-0000000000', TRUE)
    RETURNING id INTO default_store_id;
  END IF;
  
  -- Get role from metadata, default to 'staff'
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff');
  
  -- Insert user profile
  INSERT INTO public.users (id, email, full_name, role, store_id, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    user_role,
    default_store_id,
    TRUE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 4: Fix RLS policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Owners can view all users" ON users;

-- Allow the trigger to insert (bypass RLS for service role)
CREATE POLICY "Allow trigger to create users"
  ON users FOR INSERT
  TO authenticated, anon, service_role
  WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Owners can view all users
CREATE POLICY "Owners can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner'
    )
  );

-- STEP 5: Verify setup
SELECT 
  'Setup complete! Try signing up now.' AS status,
  (SELECT COUNT(*) FROM auth.users) AS auth_users_count,
  (SELECT COUNT(*) FROM public.users) AS public_users_count;
