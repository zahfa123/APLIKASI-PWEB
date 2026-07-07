"use server";

import { createClient } from "@/lib/supabase/server";

export async function seedTestData() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Tidak terautentikasi" };

    const { data: existing } = await supabase.from("products").select("id").limit(1);
    if (existing && existing.length > 0) {
      return { error: "Data sudah ada" };
    }

    const { data: cat1 } = await supabase.from("categories").insert({ name: "Elektronik" }).select().single();
    const { data: cat2 } = await supabase.from("categories").insert({ name: "ATK" }).select().single();
    const { data: cat3 } = await supabase.from("categories").insert({ name: "Furniture" }).select().single();

    const { data: sup1 } = await supabase.from("suppliers").insert({
      name: "PT. Maju Jaya",
      address: "Jl. Sudirman No. 10, Jakarta",
      phone: "081234567890",
      email: "info@majujaya.co.id",
    }).select().single();

    const { data: sup2 } = await supabase.from("suppliers").insert({
      name: "CV. Berkah Mandiri",
      address: "Jl. Gatot Subroto No. 25, Bandung",
      phone: "085678901234",
      email: "sales@berkahmandiri.co.id",
    }).select().single();

    const { data: sup3 } = await supabase.from("suppliers").insert({
      name: "Toko Sumber Rejeki",
      address: "Jl. Pahlawan No. 8, Surabaya",
      phone: "087890123456",
      email: null,
    }).select().single();

    const productRows = [
      { name: "Laptop ASUS VivoBook 14", sku: "SKU-00001", barcode: "8991234567890", price: 8500000, stock: 15, minimum_stock: 5, unit: "pcs", category_id: cat1?.id, supplier_id: sup1?.id },
      { name: "Mouse Logitech G102", sku: "SKU-00002", barcode: "8991234567891", price: 150000, stock: 3, minimum_stock: 10, unit: "pcs", category_id: cat1?.id, supplier_id: sup1?.id },
      { name: "Keyboard Mechanical RK61", sku: "SKU-00003", barcode: "8991234567892", price: 350000, stock: 20, minimum_stock: 8, unit: "pcs", category_id: cat1?.id, supplier_id: sup1?.id },
      { name: "Monitor LG 24 inch", sku: "SKU-00004", barcode: "8991234567893", price: 2200000, stock: 8, minimum_stock: 3, unit: "pcs", category_id: cat1?.id, supplier_id: sup2?.id },
      { name: "Pulpen Pilot G2", sku: "SKU-00005", barcode: "8991234567894", price: 5000, stock: 100, minimum_stock: 50, unit: "pcs", category_id: cat2?.id, supplier_id: sup3?.id },
      { name: "Buku Tulis Sidu 38 Lembar", sku: "SKU-00006", barcode: "8991234567895", price: 8000, stock: 2, minimum_stock: 30, unit: "pcs", category_id: cat2?.id, supplier_id: sup3?.id },
      { name: "Meja Kerja Kayu Jati", sku: "SKU-00007", barcode: "8991234567896", price: 3500000, stock: 5, minimum_stock: 2, unit: "pcs", category_id: cat3?.id, supplier_id: sup2?.id },
      { name: "Kursi Kantor Ergonomis", sku: "SKU-00008", barcode: "8991234567897", price: 2800000, stock: 1, minimum_stock: 3, unit: "pcs", category_id: cat3?.id, supplier_id: sup2?.id },
    ];

    for (const p of productRows) {
      await supabase.from("products").insert(p);
    }

    const { data: prods } = await supabase.from("products").select("id").order("created_at", { ascending: false }).limit(8);

    if (prods && prods.length >= 4) {
      const today = new Date().toISOString();
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      await supabase.from("stock_in").insert([
        { product_id: prods[0].id, supplier_id: sup1?.id, qty: 10, date: today, note: "Restok bulanan", user_id: user.id },
        { product_id: prods[1].id, supplier_id: sup1?.id, qty: 5, date: today, note: null, user_id: user.id },
        { product_id: prods[2].id, supplier_id: sup1?.id, qty: 15, date: yesterday, note: "Pesanan project", user_id: user.id },
        { product_id: prods[3].id, supplier_id: sup2?.id, qty: 3, date: yesterday, note: null, user_id: user.id },
      ]);

      await supabase.from("stock_out").insert([
        { product_id: prods[4].id, qty: 20, destination: "Ruang Marketing", date: today, note: "Untuk tim sales", user_id: user.id },
        { product_id: prods[5].id, qty: 10, destination: "Ruang Admin", date: yesterday, note: null, user_id: user.id },
        { product_id: prods[6].id, qty: 1, destination: "Kantor Direksi", date: today, note: "Meja baru", user_id: user.id },
      ]);
    }

    return { success: true, message: "Data test berhasil dibuat" };
  } catch (e) {
    return { error: String(e) };
  }
}
