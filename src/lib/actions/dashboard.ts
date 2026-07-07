"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  try {
    const supabase = await createClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const { data: allProducts } = await supabase.from("products").select("id, stock, minimum_stock");
    const { data: allSuppliers } = await supabase.from("suppliers").select("id");
    const { data: stockInToday } = await supabase.from("stock_in").select("id, qty").gte("date", todayStr);
    const { data: stockOutToday } = await supabase.from("stock_out").select("id, qty").gte("date", todayStr);
    const { data: recentStockIn } = await supabase
      .from("stock_in")
      .select("*, product:products(name, sku)")
      .order("date", { ascending: false })
      .limit(5);
    const { data: recentStockOut } = await supabase
      .from("stock_out")
      .select("*, product:products(name, sku)")
      .order("date", { ascending: false })
      .limit(5);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: stockInAll } = await supabase
      .from("stock_in")
      .select("date, qty")
      .gte("date", sixMonthsAgo.toISOString())
      .order("date");

    const { data: stockOutAll } = await supabase
      .from("stock_out")
      .select("date, qty")
      .gte("date", sixMonthsAgo.toISOString())
      .order("date");

    const buildMonthly = (rows: { date: string; qty: number }[] | null) => {
      if (!rows || rows.length === 0) return [];
      const grouped: Record<string, number> = {};
      rows.forEach((item) => {
        const month = new Date(item.date).toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        });
        grouped[month] = (grouped[month] || 0) + item.qty;
      });
      return Object.entries(grouped).map(([month, total]) => ({ month, total }));
    };

    const lowStock = (allProducts || []).filter(p => p.stock <= p.minimum_stock);

    return {
      totalProducts: (allProducts || []).length,
      totalSuppliers: (allSuppliers || []).length,
      stockInToday: (stockInToday || []).length,
      stockOutToday: (stockOutToday || []).length,
      lowStockProducts: lowStock.length,
      recentStockIn: recentStockIn || [],
      recentStockOut: recentStockOut || [],
      stockInByMonth: buildMonthly(stockInAll),
      stockOutByMonth: buildMonthly(stockOutAll),
    };
  } catch {
    return {
      totalProducts: 0,
      totalSuppliers: 0,
      stockInToday: 0,
      stockOutToday: 0,
      lowStockProducts: 0,
      recentStockIn: [],
      recentStockOut: [],
      stockInByMonth: [],
      stockOutByMonth: [],
    };
  }
}
