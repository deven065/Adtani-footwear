-- QUICK FIX: Temporarily disable RLS on users table only
-- This will let you login and access the dashboard

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify your user exists
SELECT id, email, full_name, role, is_active 
FROM users;

-- If you see your user above, you're good to go!
-- Login at localhost:3000/login

SELECT 'RLS disabled on users table. You can now login!' AS status;
