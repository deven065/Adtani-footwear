-- =============================================
-- COMPLETE FIX - RUN THIS ENTIRE FILE
-- =============================================

-- Step 1: Update RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Owners and managers can view all users" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Only owners can manage users" ON users;
DROP POLICY IF EXISTS "Only owners can delete users" ON users;

CREATE POLICY "Authenticated users can view users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Owners can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete users"
  ON users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Step 2: Update RLS policies for stores table
DROP POLICY IF EXISTS "Everyone can view stores" ON stores;
DROP POLICY IF EXISTS "Only owners can manage stores" ON stores;

CREATE POLICY "Authenticated users can view stores"
  ON stores FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Owners can create stores"
  ON stores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can manage stores"
  ON stores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete stores"
  ON stores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Step 3: Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_store_id UUID;
BEGIN
  SELECT id INTO default_store_id
  FROM stores
  WHERE name = 'Main Store'
  LIMIT 1;
  
  IF default_store_id IS NULL THEN
    INSERT INTO stores (name, city, phone, is_active)
    VALUES ('Main Store', 'Mumbai', '+91-0000000000', TRUE)
    RETURNING id INTO default_store_id;
  END IF;
  
  INSERT INTO public.users (id, email, full_name, role, store_id, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'owner',
    default_store_id,
    TRUE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Fix existing users without profiles
DO $$
DECLARE
  auth_user RECORD;
  default_store_id UUID;
BEGIN
  SELECT id INTO default_store_id
  FROM stores
  WHERE name = 'Main Store'
  LIMIT 1;
  
  IF default_store_id IS NULL THEN
    INSERT INTO stores (name, city, phone, is_active)
    VALUES ('Main Store', 'Mumbai', '+91-0000000000', TRUE)
    RETURNING id INTO default_store_id;
  END IF;

  FOR auth_user IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.users u ON au.id = u.id
    WHERE u.id IS NULL
  LOOP
    INSERT INTO public.users (id, email, full_name, role, store_id, is_active)
    VALUES (
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
      'owner',
      default_store_id,
      TRUE
    );
    
    RAISE NOTICE 'Created profile for user: %', auth_user.email;
  END LOOP;
END $$;

-- Step 5: Verify the fix worked
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  s.name as store_name
FROM users u
JOIN stores s ON u.store_id = s.id;
