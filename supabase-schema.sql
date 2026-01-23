-- =============================================
-- ADTANI FOOTWEAR INVENTORY SYSTEM
-- Database Schema with Row Level Security
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');
CREATE TYPE stock_event_type AS ENUM ('NEW_STOCK', 'SALE', 'RETURN', 'TRANSFER_OUT', 'TRANSFER_IN', 'ADJUSTMENT');
CREATE TYPE transfer_status AS ENUM ('pending', 'in_transit', 'completed', 'cancelled');

-- =============================================
-- STORES TABLE (Created first - referenced by users)
-- =============================================

CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USERS TABLE
-- =============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  store_id UUID REFERENCES stores(id),
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL,
  model_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  barcode TEXT UNIQUE,
  mrp DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

-- =============================================
-- PRODUCT VARIANTS TABLE
-- =============================================

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  sku TEXT UNIQUE,
  barcode TEXT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_barcode ON product_variants(barcode) WHERE barcode IS NOT NULL;

-- =============================================
-- INVENTORY TABLE (Computed from events)
-- =============================================

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(variant_id, store_id)
);

CREATE INDEX idx_inventory_store ON inventory(store_id);
CREATE INDEX idx_inventory_variant ON inventory(variant_id);

-- =============================================
-- STOCK MOVEMENTS TABLE (Event Log)
-- =============================================

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  event_type stock_event_type NOT NULL,
  quantity_change INTEGER NOT NULL,
  price_per_unit DECIMAL(10, 2),
  reference_id UUID, -- Link to transfer or other reference
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movements_variant ON stock_movements(variant_id);
CREATE INDEX idx_movements_store ON stock_movements(store_id);
CREATE INDEX idx_movements_created_at ON stock_movements(created_at DESC);

-- =============================================
-- STOCK TRANSFERS TABLE
-- =============================================

CREATE TABLE stock_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  from_store_id UUID NOT NULL REFERENCES stores(id),
  to_store_id UUID NOT NULL REFERENCES stores(id),
  quantity INTEGER NOT NULL,
  status transfer_status DEFAULT 'pending',
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  completed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (from_store_id != to_store_id),
  CHECK (quantity > 0)
);

CREATE INDEX idx_transfers_from_store ON stock_transfers(from_store_id);
CREATE INDEX idx_transfers_to_store ON stock_transfers(to_store_id);
CREATE INDEX idx_transfers_status ON stock_transfers(status);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATE
-- =============================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER stock_transfers_updated_at BEFORE UPDATE ON stock_transfers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- FUNCTION: UPDATE INVENTORY ON STOCK MOVEMENT
-- =============================================

CREATE OR REPLACE FUNCTION update_inventory_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory (variant_id, store_id, quantity, last_updated)
  VALUES (NEW.variant_id, NEW.store_id, NEW.quantity_change, NOW())
  ON CONFLICT (variant_id, store_id)
  DO UPDATE SET
    quantity = inventory.quantity + NEW.quantity_change,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory
AFTER INSERT ON stock_movements
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_movement();

-- =============================================
-- FUNCTION: AUTO-CREATE USER PROFILE ON SIGNUP
-- =============================================

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
  
  -- If no default store exists, create one
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
    'owner', -- First user is owner, subsequent users can be changed by owner
    default_store_id,
    TRUE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Drop all existing user policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Owners and managers can view all users" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Only owners can manage users" ON users;
DROP POLICY IF EXISTS "Only owners can delete users" ON users;

-- Allow all authenticated users to read users (needed for app functionality)
CREATE POLICY "Authenticated users can view users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Only owners can update users
CREATE POLICY "Owners can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Only owners can delete users
CREATE POLICY "Owners can delete users"
  ON users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- =============================================
-- STORES TABLE POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can view stores" ON stores;
DROP POLICY IF EXISTS "Only owners can manage stores" ON stores;

-- All authenticated users can view stores
CREATE POLICY "Authenticated users can view stores"
  ON stores FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert stores (needed for initial setup)
CREATE POLICY "Authenticated users can create stores"
  ON stores FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only owners can update/delete stores
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

-- =============================================
-- PRODUCTS TABLE POLICIES
-- =============================================

-- Everyone can view active products
CREATE POLICY "Everyone can view products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- Only owners and managers can create/edit products
CREATE POLICY "Owners and managers can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- =============================================
-- PRODUCT VARIANTS POLICIES
-- =============================================

-- Everyone can view variants
CREATE POLICY "Everyone can view variants"
  ON product_variants FOR SELECT
  USING (is_active = TRUE);

-- Only owners and managers can manage variants
CREATE POLICY "Owners and managers can manage variants"
  ON product_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- =============================================
-- INVENTORY TABLE POLICIES
-- =============================================

-- Staff can only view inventory for their store
CREATE POLICY "Staff view own store inventory"
  ON inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'staff'
        AND store_id = inventory.store_id
    )
  );

-- Owners and managers can view all inventory
CREATE POLICY "Owners and managers view all inventory"
  ON inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- No direct updates to inventory (only via stock_movements)
CREATE POLICY "No direct inventory updates"
  ON inventory FOR UPDATE
  USING (FALSE);

-- =============================================
-- STOCK MOVEMENTS POLICIES
-- =============================================

-- Staff can view movements for their store
CREATE POLICY "Staff view own store movements"
  ON stock_movements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'staff'
        AND store_id = stock_movements.store_id
    )
  );

-- Owners and managers view all movements
CREATE POLICY "Owners and managers view all movements"
  ON stock_movements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Staff can only create SALE and RETURN for their store
CREATE POLICY "Staff create sales and returns"
  ON stock_movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'staff'
        AND store_id = stock_movements.store_id
    )
    AND event_type IN ('SALE', 'RETURN')
  );

-- Owners and managers can create any movement
CREATE POLICY "Owners and managers create any movement"
  ON stock_movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- =============================================
-- STOCK TRANSFERS POLICIES
-- =============================================

-- Staff can view transfers for their store
CREATE POLICY "Staff view own store transfers"
  ON stock_transfers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'staff'
        AND store_id IN (stock_transfers.from_store_id, stock_transfers.to_store_id)
    )
  );

-- Owners and managers view all transfers
CREATE POLICY "Owners and managers view all transfers"
  ON stock_transfers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Managers and owners can create/manage transfers
CREATE POLICY "Managers and owners manage transfers"
  ON stock_transfers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- =============================================
-- HELPER VIEWS
-- =============================================

-- View: Current inventory with product details
CREATE VIEW inventory_with_details AS
SELECT
  i.id,
  i.variant_id,
  i.store_id,
  i.quantity,
  i.last_updated,
  s.name AS store_name,
  p.brand,
  p.model_name,
  p.category,
  p.mrp,
  pv.size,
  pv.color,
  pv.barcode
FROM inventory i
JOIN product_variants pv ON i.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
JOIN stores s ON i.store_id = s.id
WHERE p.is_active = TRUE AND pv.is_active = TRUE AND s.is_active = TRUE;

-- View: Low stock alerts (quantity < 5)
CREATE VIEW low_stock_alerts AS
SELECT * FROM inventory_with_details
WHERE quantity < 5 AND quantity >= 0
ORDER BY quantity ASC, brand, model_name;

-- =============================================
-- AUTOMATIC USER SETUP
-- =============================================

/*
This schema now automatically creates user profiles when someone signs up!

When a new user signs up via Supabase Auth:
1. A trigger automatically creates their profile in the users table
2. If no "Main Store" exists, it creates one automatically
3. The first user is automatically assigned the 'owner' role
4. Subsequent users are also created as 'owner' (you can change their role later)

TO GET STARTED:
1. Run this entire schema file in Supabase SQL Editor
2. Go to your app at localhost:3000 and sign up
3. Your profile will be created automatically!
4. Refresh the page and you'll see your dashboard

NO MANUAL STEPS NEEDED!
*/
