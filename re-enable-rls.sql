-- =============================================
-- RE-ENABLE RLS WITH PROPER POLICIES
-- Run this after you've logged in as admin
-- =============================================

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;

-- 2. USERS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Owners can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

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

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 3. STORES POLICIES
DROP POLICY IF EXISTS "Everyone can view stores" ON stores;
DROP POLICY IF EXISTS "Owners can manage stores" ON stores;

CREATE POLICY "Everyone can view stores"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can manage stores"
  ON stores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'manager')
    )
  );

-- 4. PRODUCTS POLICIES
DROP POLICY IF EXISTS "Everyone can view products" ON products;
DROP POLICY IF EXISTS "Authorized users can manage products" ON products;

CREATE POLICY "Everyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'manager')
    )
  );

-- 5. PRODUCT VARIANTS POLICIES
DROP POLICY IF EXISTS "Everyone can view variants" ON product_variants;
DROP POLICY IF EXISTS "Authorized users can manage variants" ON product_variants;

CREATE POLICY "Everyone can view variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can manage variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'manager')
    )
  );

-- 6. INVENTORY POLICIES
DROP POLICY IF EXISTS "Users can view inventory" ON inventory;
DROP POLICY IF EXISTS "Authorized users can manage inventory" ON inventory;

CREATE POLICY "Users can view inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can manage inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'manager', 'staff')
    )
  );

-- 7. STOCK MOVEMENTS POLICIES
DROP POLICY IF EXISTS "Users can view stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can create stock movements" ON stock_movements;

CREATE POLICY "Users can view stock movements"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create stock movements"
  ON stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 8. STOCK TRANSFERS POLICIES
DROP POLICY IF EXISTS "Users can view transfers" ON stock_transfers;
DROP POLICY IF EXISTS "Users can create transfers" ON stock_transfers;

CREATE POLICY "Users can view transfers"
  ON stock_transfers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create transfers"
  ON stock_transfers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'manager')
    )
  );

SELECT 'RLS re-enabled with proper policies!' AS status;
