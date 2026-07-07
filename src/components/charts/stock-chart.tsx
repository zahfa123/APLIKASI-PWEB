"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StockChartProps {
  stockIn: { month: string; total: number }[];
  stockOut: { month: string; total: number }[];
}

export function StockChart({ stockIn, stockOut }: StockChartProps) {
  const months = new Set([
    ...stockIn.map((d) => d.month),
    ...stockOut.map((d) => d.month),
  ]);
  const data = Array.from(months).map((month) => ({
    month,
    "Masuk": stockIn.find((d) => d.month === month)?.total || 0,
    "Keluar": stockOut.find((d) => d.month === month)?.total || 0,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Belum ada data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Masuk" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Keluar" fill="#f97316" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
