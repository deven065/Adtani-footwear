-- =============================================
-- QUICK FIX - RUN THIS IN SUPABASE SQL EDITOR
-- =============================================

-- Step 1: Temporarily disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Get your auth user info
SELECT id, email FROM auth.users;

-- Step 3: Create/Get Main Store
INSERT INTO stores (name, city, phone, is_active)
VALUES ('Main Store', 'Mumbai', '+91-0000000000', TRUE)
ON CONFLICT DO NOTHING;

-- Step 4: Create your profile (will show your user ID after running Step 2)
-- REPLACE 'YOUR-USER-ID-HERE' WITH YOUR ACTUAL ID FROM STEP 2
INSERT INTO users (id, email, full_name, role, store_id, is_active)
SELECT 
  'YOUR-USER-ID-HERE'::uuid,  -- PASTE YOUR ID FROM STEP 2
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  'owner',
  (SELECT id FROM stores WHERE name = 'Main Store' LIMIT 1),
  TRUE
FROM auth.users au
WHERE au.id = 'YOUR-USER-ID-HERE'::uuid  -- PASTE YOUR ID FROM STEP 2 HERE TOO
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  store_id = EXCLUDED.store_id;

-- Step 5: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify
SELECT u.id, u.email, u.full_name, u.role, s.name as store
FROM users u
LEFT JOIN stores s ON u.store_id = s.id;
