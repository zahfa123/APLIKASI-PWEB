"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getStockOut(dateFrom?: string, dateTo?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("stock_out")
      .select("*, product:products(id, name, sku), user:profiles(id, name)")
      .order("date", { ascending: false });

    if (dateFrom) query = query.gte("date", dateFrom);
    if (dateTo) query = query.lte("date", dateTo + "T23:59:59");

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function createStockOut(data: {
  product_id: string;
  qty: number;
  destination: string;
  date: string;
  note?: string;
  user_id?: string;
}) {
  const supabase = await createClient();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", data.product_id)
    .single();

  if (fetchError) return { error: fetchError.message };
  if (!product || product.stock < data.qty) {
    return { error: "Stok tidak mencukupi" };
  }

  const { error } = await supabase.from("stock_out").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}
