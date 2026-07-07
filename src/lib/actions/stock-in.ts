"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getStockIn(dateFrom?: string, dateTo?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("stock_in")
      .select("*, product:products(id, name, sku), supplier:suppliers(id, name), user:profiles(id, name)")
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

export async function createStockIn(data: {
  product_id: string;
  supplier_id?: string;
  qty: number;
  date: string;
  note?: string;
  user_id?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("stock_in").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}
