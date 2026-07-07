"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getCategories() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function createCategory(name: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name });
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(id: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}
