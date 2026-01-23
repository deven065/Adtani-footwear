-- =============================================
-- SEED PRODUCTS - 50 Footwear Products with Variants
-- Run this after COMPLETE-FIX.sql
-- =============================================

-- Get the Main Store ID and first user ID for references
DO $$
DECLARE
  main_store_id UUID;
  first_user_id UUID;
  current_product_id UUID;
  variant_id UUID;
BEGIN
  -- Get store and user IDs
  SELECT id INTO main_store_id FROM stores WHERE name = 'Main Store' LIMIT 1;
  SELECT id INTO first_user_id FROM users LIMIT 1;

  -- Nike Products (10 products)
  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Nike', 'Air Max 270', 'Sports', 'Lightweight running shoes with Air cushioning', 12995, 8500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'Black', 'NK270BK8'), (current_product_id, '9', 'Black', 'NK270BK9'), (current_product_id, '10', 'Black', 'NK270BK10'),
    (current_product_id, '8', 'White', 'NK270WH8'), (current_product_id, '9', 'White', 'NK270WH9'), (current_product_id, '10', 'White', 'NK270WH10');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Nike', 'Revolution 6', 'Sports', 'Comfortable everyday running shoes', 3995, 2500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Black', 'NKR6BK7'), (current_product_id, '8', 'Black', 'NKR6BK8'), (current_product_id, '9', 'Black', 'NKR6BK9'),
    (current_product_id, '7', 'Blue', 'NKR6BL7'), (current_product_id, '8', 'Blue', 'NKR6BL8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Nike', 'Court Vision Low', 'Casual', 'Classic basketball-inspired casual shoes', 4495, 3000, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'White', 'NKCVWH8'), (current_product_id, '9', 'White', 'NKCVWH9'), (current_product_id, '10', 'White', 'NKCVWH10'),
    (current_product_id, '8', 'Black', 'NKCVBK8'), (current_product_id, '9', 'Black', 'NKCVBK9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Nike', 'Flex Experience Run', 'Sports', 'Flexible and lightweight running shoes', 5495, 3500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Gray', 'NKFXGR7'), (current_product_id, '8', 'Gray', 'NKFXGR8'), (current_product_id, '9', 'Gray', 'NKFXGR9'),
    (current_product_id, '8', 'Blue', 'NKFXBL8'), (current_product_id, '9', 'Blue', 'NKFXBL9'), (current_product_id, '10', 'Blue', 'NKFXBL10');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Nike', 'Tanjun', 'Casual', 'Simple and sleek casual sneakers', 3495, 2200, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '6', 'Black', 'NKTJBK6'), (current_product_id, '7', 'Black', 'NKTJBK7'), (current_product_id, '8', 'Black', 'NKTJBK8'),
    (current_product_id, '6', 'White', 'NKTJWH6'), (current_product_id, '7', 'White', 'NKTJWH7'), (current_product_id, '8', 'White', 'NKTJWH8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  -- Adidas Products (10 products)
  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Adidas', 'Ultraboost 22', 'Sports', 'Premium running shoes with Boost technology', 16995, 11000, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'Black', 'ADUB22BK8'), (current_product_id, '9', 'Black', 'ADUB22BK9'), (current_product_id, '10', 'Black', 'ADUB22BK10'),
    (current_product_id, '8', 'White', 'ADUB22WH8'), (current_product_id, '9', 'White', 'ADUB22WH9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Adidas', 'Stan Smith', 'Casual', 'Iconic tennis-inspired casual shoes', 7999, 5000, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'White', 'ADSSWH7'), (current_product_id, '8', 'White', 'ADSSWH8'), (current_product_id, '9', 'White', 'ADSSWH9'),
    (current_product_id, '7', 'Green', 'ADSSGR7'), (current_product_id, '8', 'Green', 'ADSSGR8'), (current_product_id, '9', 'Green', 'ADSSGR9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Adidas', 'Superstar', 'Casual', 'Classic shell-toe sneakers', 8999, 5500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'White', 'ADSPWH8'), (current_product_id, '9', 'White', 'ADSPWH9'), (current_product_id, '10', 'White', 'ADSPWH10'),
    (current_product_id, '8', 'Black', 'ADSPBK8'), (current_product_id, '9', 'Black', 'ADSPBK9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Adidas', 'Duramo SL', 'Sports', 'Affordable running shoes for daily training', 4499, 2800, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Blue', 'ADDSLBL7'), (current_product_id, '8', 'Blue', 'ADDSLBL8'), (current_product_id, '9', 'Blue', 'ADDSLBL9'),
    (current_product_id, '8', 'Gray', 'ADDSLGR8'), (current_product_id, '9', 'Gray', 'ADDSLGR9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Adidas', 'Lite Racer', 'Casual', 'Lightweight casual lifestyle shoes', 3999, 2500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '6', 'Black', 'ADLRBK6'), (current_product_id, '7', 'Black', 'ADLRBK7'), (current_product_id, '8', 'Black', 'ADLRBK8'),
    (current_product_id, '7', 'White', 'ADLRWH7'), (current_product_id, '8', 'White', 'ADLRWH8'), (current_product_id, '9', 'White', 'ADLRWH9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  -- Puma Products (10 products)
  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Puma', 'Velocity Nitro 2', 'Sports', 'High-performance running shoes', 10999, 7000, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'Black', 'PMVN2BK8'), (current_product_id, '9', 'Black', 'PMVN2BK9'), (current_product_id, '10', 'Black', 'PMVN2BK10'),
    (current_product_id, '8', 'Red', 'PMVN2RD8'), (current_product_id, '9', 'Red', 'PMVN2RD9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Puma', 'Suede Classic', 'Casual', 'Timeless suede sneakers', 5999, 3800, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Blue', 'PMSCBL7'), (current_product_id, '8', 'Blue', 'PMSCBL8'), (current_product_id, '9', 'Blue', 'PMSCBL9'),
    (current_product_id, '7', 'Gray', 'PMSCGR7'), (current_product_id, '8', 'Gray', 'PMSCGR8'), (current_product_id, '9', 'Gray', 'PMSCGR9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Puma', 'Smash v2', 'Casual', 'Clean and simple casual sneakers', 3499, 2200, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '6', 'White', 'PMSMWH6'), (current_product_id, '7', 'White', 'PMSMWH7'), (current_product_id, '8', 'White', 'PMSMWH8'),
    (current_product_id, '6', 'Black', 'PMSMBK6'), (current_product_id, '7', 'Black', 'PMSMBK7'), (current_product_id, '8', 'Black', 'PMSMBK8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Puma', 'Softride Pro', 'Sports', 'Cushioned running shoes for comfort', 6499, 4000, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'Black', 'PMSRBK8'), (current_product_id, '9', 'Black', 'PMSRBK9'), (current_product_id, '10', 'Black', 'PMSRBK10'),
    (current_product_id, '8', 'Blue', 'PMSRBL8'), (current_product_id, '9', 'Blue', 'PMSRBL9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Puma', 'X-Ray Lite', 'Casual', 'Chunky retro-style casual shoes', 4999, 3200, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'White', 'PMXRWH7'), (current_product_id, '8', 'White', 'PMXRWH8'), (current_product_id, '9', 'White', 'PMXRWH9'),
    (current_product_id, '7', 'Black', 'PMXRBK7'), (current_product_id, '8', 'Black', 'PMXRBK8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  -- Reebok Products (10 products)
  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Reebok', 'Zig Kinetica', 'Sports', 'Energy return running shoes', 9999, 6500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'Black', 'RBZKBK8'), (current_product_id, '9', 'Black', 'RBZKBK9'), (current_product_id, '10', 'Black', 'RBZKBK10'),
    (current_product_id, '8', 'Gray', 'RBZKGR8'), (current_product_id, '9', 'Gray', 'RBZKGR9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Reebok', 'Club C 85', 'Casual', 'Vintage tennis-inspired sneakers', 6499, 4000, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'White', 'RBCCWH7'), (current_product_id, '8', 'White', 'RBCCWH8'), (current_product_id, '9', 'White', 'RBCCWH9'),
    (current_product_id, '7', 'Black', 'RBCCBK7'), (current_product_id, '8', 'Black', 'RBCCBK8'), (current_product_id, '9', 'Black', 'RBCCBK9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Reebok', 'Classic Leather', 'Casual', 'Iconic leather casual shoes', 5999, 3800, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '6', 'White', 'RBCLWH6'), (current_product_id, '7', 'White', 'RBCLWH7'), (current_product_id, '8', 'White', 'RBCLWH8'),
    (current_product_id, '6', 'Black', 'RBCLBK6'), (current_product_id, '7', 'Black', 'RBCLBK7'), (current_product_id, '8', 'Black', 'RBCLBK8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Reebok', 'Energen Plus', 'Sports', 'Affordable running shoes', 4499, 2800, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Blue', 'RBEPBL7'), (current_product_id, '8', 'Blue', 'RBEPBL8'), (current_product_id, '9', 'Blue', 'RBEPBL9'),
    (current_product_id, '8', 'Black', 'RBEPBK8'), (current_product_id, '9', 'Black', 'RBEPBK9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Reebok', 'Lite Plus 3', 'Sports', 'Lightweight daily training shoes', 3999, 2500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Gray', 'RBLPGR7'), (current_product_id, '8', 'Gray', 'RBLPGR8'), (current_product_id, '9', 'Gray', 'RBLPGR9'),
    (current_product_id, '7', 'Black', 'RBLPBK7'), (current_product_id, '8', 'Black', 'RBLPBK8'), (current_product_id, '9', 'Black', 'RBLPBK9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  -- New Balance Products (5 products)
  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('New Balance', '574 Core', 'Casual', 'Classic lifestyle sneakers', 7999, 5000, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Gray', 'NB574GR7'), (current_product_id, '8', 'Gray', 'NB574GR8'), (current_product_id, '9', 'Gray', 'NB574GR9'),
    (current_product_id, '7', 'Blue', 'NB574BL7'), (current_product_id, '8', 'Blue', 'NB574BL8'), (current_product_id, '9', 'Blue', 'NB574BL9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('New Balance', 'Fresh Foam 880', 'Sports', 'Premium cushioned running shoes', 11999, 7500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'Black', 'NB880BK8'), (current_product_id, '9', 'Black', 'NB880BK9'), (current_product_id, '10', 'Black', 'NB880BK10'),
    (current_product_id, '8', 'White', 'NB880WH8'), (current_product_id, '9', 'White', 'NB880WH9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('New Balance', '480', 'Casual', 'Basketball-inspired casual shoes', 5999, 3800, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'White', 'NB480WH7'), (current_product_id, '8', 'White', 'NB480WH8'), (current_product_id, '9', 'White', 'NB480WH9'),
    (current_product_id, '7', 'Black', 'NB480BK7'), (current_product_id, '8', 'Black', 'NB480BK8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('New Balance', '997H', 'Casual', 'Retro-inspired casual sneakers', 8999, 5500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'Gray', 'NB997GR8'), (current_product_id, '9', 'Gray', 'NB997GR9'), (current_product_id, '10', 'Gray', 'NB997GR10'),
    (current_product_id, '8', 'Beige', 'NB997BG8'), (current_product_id, '9', 'Beige', 'NB997BG9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('New Balance', 'FuelCell Propel', 'Sports', 'Responsive training shoes', 6999, 4500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Black', 'NBFCBK7'), (current_product_id, '8', 'Black', 'NBFCBK8'), (current_product_id, '9', 'Black', 'NBFCBK9'),
    (current_product_id, '8', 'Blue', 'NBFCBL8'), (current_product_id, '9', 'Blue', 'NBFCBL9'), (current_product_id, '10', 'Blue', 'NBFCBL10');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  -- Formal & Casual Leather Shoes (5 products)
  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Bata', 'Oxford Formal', 'Formal', 'Classic leather oxford shoes', 3999, 2500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Black', 'BTOXBK7'), (current_product_id, '8', 'Black', 'BTOXBK8'), (current_product_id, '9', 'Black', 'BTOXBK9'),
    (current_product_id, '7', 'Brown', 'BTOXBR7'), (current_product_id, '8', 'Brown', 'BTOXBR8'), (current_product_id, '9', 'Brown', 'BTOXBR9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Red Chief', 'Derby Shoes', 'Formal', 'Premium leather derby shoes', 4999, 3200, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Black', 'RCDBK7'), (current_product_id, '8', 'Black', 'RCDBK8'), (current_product_id, '9', 'Black', 'RCDBK9'),
    (current_product_id, '7', 'Brown', 'RCDBR7'), (current_product_id, '8', 'Brown', 'RCDBR8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Woodland', 'Casual Loafers', 'Casual', 'Comfortable leather loafers', 3499, 2200, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '6', 'Brown', 'WDLBR6'), (current_product_id, '7', 'Brown', 'WDLBR7'), (current_product_id, '8', 'Brown', 'WDLBR8'),
    (current_product_id, '6', 'Black', 'WDLBK6'), (current_product_id, '7', 'Black', 'WDLBK7'), (current_product_id, '8', 'Black', 'WDLBK8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Liberty', 'Fortune Slip-on', 'Formal', 'Easy slip-on formal shoes', 2999, 1800, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Black', 'LBFSBK7'), (current_product_id, '8', 'Black', 'LBFSBK8'), (current_product_id, '9', 'Black', 'LBFSBK9'),
    (current_product_id, '7', 'Brown', 'LBFSBR7'), (current_product_id, '8', 'Brown', 'LBFSBR8'), (current_product_id, '9', 'Brown', 'LBFSBR9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Lee Cooper', 'Lace-up Formals', 'Formal', 'Professional formal shoes', 3799, 2400, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Black', 'LCLUBK7'), (current_product_id, '8', 'Black', 'LCLUBK8'), (current_product_id, '9', 'Black', 'LCLUBK9'),
    (current_product_id, '8', 'Brown', 'LCLUBR8'), (current_product_id, '9', 'Brown', 'LCLUBR9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  -- Sandals & Slippers (5 products)
  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Nike', 'Benassi Slides', 'Slippers', 'Comfortable pool slides', 1999, 1200, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '6', 'Black', 'NKBSBK6'), (current_product_id, '7', 'Black', 'NKBSBK7'), (current_product_id, '8', 'Black', 'NKBSBK8'),
    (current_product_id, '6', 'White', 'NKBSWH6'), (current_product_id, '7', 'White', 'NKBSWH7'), (current_product_id, '8', 'White', 'NKBSWH8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Adidas', 'Adilette Slides', 'Slippers', 'Classic three-stripe slides', 2199, 1400, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Black', 'ADALSTBK7'), (current_product_id, '8', 'Black', 'ADALSTBK8'), (current_product_id, '9', 'Black', 'ADALSTBK9'),
    (current_product_id, '7', 'Blue', 'ADALSTBL7'), (current_product_id, '8', 'Blue', 'ADALSTBL8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Puma', 'Popcat Slides', 'Slippers', 'Soft cushioned slides', 1799, 1100, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '6', 'Black', 'PMPOBK6'), (current_product_id, '7', 'Black', 'PMPOBK7'), (current_product_id, '8', 'Black', 'PMPOBK8'),
    (current_product_id, '6', 'Red', 'PMPORD6'), (current_product_id, '7', 'Red', 'PMPORD7'), (current_product_id, '8', 'Red', 'PMPORD8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Bata', 'Hawaii Sandals', 'Sandals', 'Classic rubber sandals', 699, 400, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '6', 'Black', 'BTHWBK6'), (current_product_id, '7', 'Black', 'BTHWBK7'), (current_product_id, '8', 'Black', 'BTHWBK8'),
    (current_product_id, '6', 'Blue', 'BTHWBL6'), (current_product_id, '7', 'Blue', 'BTHWBL7'), (current_product_id, '8', 'Blue', 'BTHWBL8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Sparx', 'Floater Sandals', 'Sandals', 'Outdoor sports sandals', 899, 550, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Gray', 'SPFLGR7'), (current_product_id, '8', 'Gray', 'SPFLGR8'), (current_product_id, '9', 'Gray', 'SPFLGR9'),
    (current_product_id, '7', 'Black', 'SPFLBK7'), (current_product_id, '8', 'Black', 'SPFLBK8'), (current_product_id, '9', 'Black', 'SPFLBK9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 20 + 5)::int);
  END LOOP;

  -- Boots (5 products)
  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Timberland', '6-Inch Premium', 'Boots', 'Classic waterproof boots', 15999, 10000, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'Brown', 'TB6IPBR8'), (current_product_id, '9', 'Brown', 'TB6IPBR9'), (current_product_id, '10', 'Brown', 'TB6IPBR10'),
    (current_product_id, '8', 'Black', 'TB6IPBK8'), (current_product_id, '9', 'Black', 'TB6IPBK9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 15 + 3)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Woodland', 'Adventure Boots', 'Boots', 'Outdoor hiking boots', 4999, 3200, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Brown', 'WDABBR7'), (current_product_id, '8', 'Brown', 'WDABBR8'), (current_product_id, '9', 'Brown', 'WDABBR9'),
    (current_product_id, '7', 'Black', 'WDABBK7'), (current_product_id, '8', 'Black', 'WDABBK8');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 15 + 3)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Red Chief', 'Trekking Boots', 'Boots', 'Durable trekking boots', 5499, 3500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Brown', 'RCTBR7'), (current_product_id, '8', 'Brown', 'RCTBR8'), (current_product_id, '9', 'Brown', 'RCTBR9'),
    (current_product_id, '8', 'Black', 'RCTBK8'), (current_product_id, '9', 'Black', 'RCTBK9'), (current_product_id, '10', 'Black', 'RCTBK10');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 15 + 3)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('CAT', 'Colorado Boots', 'Boots', 'Industrial work boots', 8999, 5500, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '8', 'Brown', 'CATCOBR8'), (current_product_id, '9', 'Brown', 'CATCOBR9'), (current_product_id, '10', 'Brown', 'CATCOBR10'),
    (current_product_id, '8', 'Black', 'CATCOBK8'), (current_product_id, '9', 'Black', 'CATCOBK9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 15 + 3)::int);
  END LOOP;

  INSERT INTO products (brand, model_name, category, description, mrp, cost_price, created_by)
  VALUES ('Dr. Martens', '1460 Smooth', 'Boots', 'Iconic 8-eye leather boots', 13999, 9000, first_user_id)
  RETURNING id INTO current_product_id;
  INSERT INTO product_variants (product_id, size, color, barcode) VALUES 
    (current_product_id, '7', 'Black', 'DM1460BK7'), (current_product_id, '8', 'Black', 'DM1460BK8'), (current_product_id, '9', 'Black', 'DM1460BK9'),
    (current_product_id, '7', 'Brown', 'DM1460BR7'), (current_product_id, '8', 'Brown', 'DM1460BR8'), (current_product_id, '9', 'Brown', 'DM1460BR9');
  FOR variant_id IN SELECT id FROM product_variants pv WHERE pv.product_id = current_product_id LOOP
    INSERT INTO inventory (variant_id, store_id, quantity) VALUES (variant_id, main_store_id, floor(random() * 15 + 3)::int);
  END LOOP;

  RAISE NOTICE 'Successfully added 50 products with variants and inventory!';
END $$;



