-- =============================================
-- UPDATE SIGNUP TO SUPPORT ROLE SELECTION
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop and recreate the user creation trigger function
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
  
  -- If no default store exists, create one
  IF default_store_id IS NULL THEN
    INSERT INTO stores (name, city, phone, is_active)
    VALUES ('Main Store', 'Mumbai', '+91-0000000000', TRUE)
    RETURNING id INTO default_store_id;
  END IF;
  
  -- Get role from metadata, default to 'staff'
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff');
  
  -- Insert user profile with role from signup
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Make sure users can insert their own profile
DROP POLICY IF EXISTS "Users can create own profile" ON users;
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow owners to view all users
DROP POLICY IF EXISTS "Owners can view all users" ON users;
CREATE POLICY "Owners can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner'
    )
  );

SELECT 'Signup role function updated successfully!' AS status;
