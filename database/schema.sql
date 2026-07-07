-- ============================================
-- Sistem Manajemen Stok Barang - Database Schema
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'petugas' CHECK (role IN ('admin', 'petugas')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: suppliers
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: stock_in
-- ============================================
CREATE TABLE IF NOT EXISTS stock_in (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: stock_out
-- ============================================
CREATE TABLE IF NOT EXISTS stock_out (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  destination TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_stock_in_product ON stock_in(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_in_date ON stock_in(date);
CREATE INDEX IF NOT EXISTS idx_stock_out_product ON stock_out(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_out_date ON stock_out(date);

-- ============================================
-- Trigger: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  );
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Trigger: auto-update stock on stock_in
-- ============================================
CREATE OR REPLACE FUNCTION update_stock_on_stock_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET stock = stock + NEW.qty, updated_at = NOW() WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_stock_in_insert ON stock_in;
CREATE TRIGGER on_stock_in_insert
  AFTER INSERT ON stock_in
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_stock_in();

-- ============================================
-- Trigger: auto-update stock on stock_out
-- ============================================
CREATE OR REPLACE FUNCTION update_stock_on_stock_out()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET stock = stock - NEW.qty, updated_at = NOW() WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_stock_out_insert ON stock_out;
CREATE TRIGGER on_stock_out_insert
  AFTER INSERT ON stock_out
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_stock_out();

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_out ENABLE ROW LEVEL SECURITY;

-- Drop old policies if any
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
  DROP POLICY IF EXISTS "Authenticated can view categories" ON categories;
  DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
  DROP POLICY IF EXISTS "Admins can update categories" ON categories;
  DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
  DROP POLICY IF EXISTS "Authenticated can view suppliers" ON suppliers;
  DROP POLICY IF EXISTS "Admins can insert suppliers" ON suppliers;
  DROP POLICY IF EXISTS "Admins can update suppliers" ON suppliers;
  DROP POLICY IF EXISTS "Admins can delete suppliers" ON suppliers;
  DROP POLICY IF EXISTS "Authenticated can view products" ON products;
  DROP POLICY IF EXISTS "Admins can insert products" ON products;
  DROP POLICY IF EXISTS "Admins can update products" ON products;
  DROP POLICY IF EXISTS "Admins can delete products" ON products;
  DROP POLICY IF EXISTS "Authenticated can view stock_in" ON stock_in;
  DROP POLICY IF EXISTS "Authenticated can insert stock_in" ON stock_in;
  DROP POLICY IF EXISTS "Authenticated can view stock_out" ON stock_out;
  DROP POLICY IF EXISTS "Authenticated can insert stock_out" ON stock_out;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);

-- Categories: all authenticated can read, all authenticated can write
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (true);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (true);

-- Suppliers
CREATE POLICY "suppliers_select" ON suppliers FOR SELECT USING (true);
CREATE POLICY "suppliers_insert" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "suppliers_update" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "suppliers_delete" ON suppliers FOR DELETE USING (true);

-- Products
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- Stock In
CREATE POLICY "stock_in_select" ON stock_in FOR SELECT USING (true);
CREATE POLICY "stock_in_insert" ON stock_in FOR INSERT WITH CHECK (true);

-- Stock Out
CREATE POLICY "stock_out_select" ON stock_out FOR SELECT USING (true);
CREATE POLICY "stock_out_insert" ON stock_out FOR INSERT WITH CHECK (true);
