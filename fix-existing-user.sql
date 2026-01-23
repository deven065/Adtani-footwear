-- =============================================
-- FIX FOR EXISTING USER WITHOUT PROFILE
-- =============================================

-- STEP 1: Create the trigger function (if not already created)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_store_id UUID;
BEGIN
  -- Get or create a default store
  SELECT id INTO default_store_id
  FROM stores
  WHERE name = 'Main Store'
  LIMIT 1;
  
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
    'owner',
    default_store_id,
    TRUE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 2: Create the trigger (if not already created)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Fix existing user without profile
-- This will create a profile for any auth.users that don't have a users table entry

DO $$
DECLARE
  auth_user RECORD;
  default_store_id UUID;
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

  -- Loop through auth users without profiles
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

-- STEP 4: Verify it worked
SELECT 
  u.email,
  u.full_name,
  u.role,
  s.name as store_name
FROM users u
JOIN stores s ON u.store_id = s.id;
