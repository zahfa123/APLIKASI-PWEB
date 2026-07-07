"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getSuppliers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name");

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function createSupplier(data: {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function updateSupplier(
  id: string,
  data: { name: string; address?: string; phone?: string; email?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update(data)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}
