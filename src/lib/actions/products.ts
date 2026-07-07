"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getProducts(search?: string, categoryId?: string, supplierId?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories(id, name), supplier:suppliers(id, name)")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
    }
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    if (supplierId) {
      query = query.eq("supplier_id", supplierId);
    }

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getProduct(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name), supplier:suppliers(id, name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProduct(data: {
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  minimum_stock: number;
  unit: string;
  category_id?: string;
  supplier_id?: string;
  image?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    sku: string;
    barcode?: string;
    price: number;
    minimum_stock: number;
    unit: string;
    category_id?: string;
    supplier_id?: string;
    image?: string;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}
