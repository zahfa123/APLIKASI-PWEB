-- ============================================
-- Seed Data - Jalankan di Supabase SQL Editor
-- ============================================

-- Pastikan ada user dulu di Authentication > Users
-- Jalankan script ini SETELAH login pertama berhasil

-- Insert profile admin jika belum ada
INSERT INTO profiles (id, name, email, role)
SELECT id, 'Admin', email, 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Kategori
-- ============================================
INSERT INTO categories (name) VALUES
  ('Elektronik'),
  ('ATK'),
  ('Furniture')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Supplier
-- ============================================
INSERT INTO suppliers (name, address, phone, email) VALUES
  ('PT. Maju Jaya', 'Jl. Sudirman No. 10, Jakarta', '081234567890', 'info@majujaya.co.id'),
  ('CV. Berkah Mandiri', 'Jl. Gatot Subroto No. 25, Bandung', '085678901234', 'sales@berkahmandiri.co.id'),
  ('Toko Sumber Rejeki', 'Jl. Pahlawan No. 8, Surabaya', '087890123456', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- Barang
-- ============================================
DO $$
DECLARE
  cat_elektronik UUID;
  cat_atk UUID;
  cat_furniture UUID;
  sup1 UUID;
  sup2 UUID;
  sup3 UUID;
  uid UUID;
BEGIN
  SELECT id INTO cat_elektronik FROM categories WHERE name = 'Elektronik';
  SELECT id INTO cat_atk FROM categories WHERE name = 'ATK';
  SELECT id INTO cat_furniture FROM categories WHERE name = 'Furniture';
  SELECT id INTO sup1 FROM suppliers WHERE name = 'PT. Maju Jaya';
  SELECT id INTO sup2 FROM suppliers WHERE name = 'CV. Berkah Mandiri';
  SELECT id INTO sup3 FROM suppliers WHERE name = 'Toko Sumber Rejeki';
  SELECT id INTO uid FROM auth.users WHERE email = 'admin@example.com';

  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (name, sku, barcode, price, stock, minimum_stock, unit, category_id, supplier_id) VALUES
      ('Laptop ASUS VivoBook 14',   'SKU-00001', '8991234567890', 8500000, 15, 5,  'pcs', cat_elektronik, sup1),
      ('Mouse Logitech G102',       'SKU-00002', '8991234567891', 150000,  3,  10, 'pcs', cat_elektronik, sup1),
      ('Keyboard Mechanical RK61',   'SKU-00003', '8991234567892', 350000,  20, 8,  'pcs', cat_elektronik, sup1),
      ('Monitor LG 24 inch',         'SKU-00004', '8991234567893', 2200000, 8,  3,  'pcs', cat_elektronik, sup2),
      ('Pulpen Pilot G2',            'SKU-00005', '8991234567894', 5000,    100,50, 'pcs', cat_atk,       sup3),
      ('Buku Tulis Sidu 38 Lembar',  'SKU-00006', '8991234567895', 8000,    2,  30, 'pcs', cat_atk,       sup3),
      ('Meja Kerja Kayu Jati',       'SKU-00007', '8991234567896', 3500000, 5,  2,  'pcs', cat_furniture, sup2),
      ('Kursi Kantor Ergonomis',     'SKU-00008', '8991234567897', 2800000, 1,  3,  'pcs', cat_furniture, sup2);
  END IF;

  -- Barang Masuk (trigger akan update stok otomatis)
  IF NOT EXISTS (SELECT 1 FROM stock_in LIMIT 1) THEN
    INSERT INTO stock_in (product_id, supplier_id, qty, date, note, user_id) VALUES
      ((SELECT id FROM products WHERE sku='SKU-00001'), sup1, 10, NOW(), 'Restok bulanan', uid),
      ((SELECT id FROM products WHERE sku='SKU-00002'), sup1, 5,  NOW(), NULL, uid),
      ((SELECT id FROM products WHERE sku='SKU-00003'), sup1, 15, NOW() - INTERVAL '1 day', 'Pesanan project', uid),
      ((SELECT id FROM products WHERE sku='SKU-00004'), sup2, 3,  NOW() - INTERVAL '1 day', NULL, uid);
  END IF;

  -- Barang Keluar (trigger akan update stok otomatis)
  IF NOT EXISTS (SELECT 1 FROM stock_out LIMIT 1) THEN
    INSERT INTO stock_out (product_id, qty, destination, date, note, user_id) VALUES
      ((SELECT id FROM products WHERE sku='SKU-00005'), 20, 'Ruang Marketing', NOW(), 'Untuk tim sales', uid),
      ((SELECT id FROM products WHERE sku='SKU-00006'), 10, 'Ruang Admin',     NOW() - INTERVAL '1 day', NULL, uid),
      ((SELECT id FROM products WHERE sku='SKU-00007'), 1,  'Kantor Direksi',  NOW(), 'Meja baru', uid);
  END IF;
END $$;
