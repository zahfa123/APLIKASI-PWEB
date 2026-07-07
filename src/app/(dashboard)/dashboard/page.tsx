import { getDashboardStats } from "@/lib/actions/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
} from "lucide-react";
import { StockChart } from "@/components/charts/stock-chart";
import { RecentTransactions } from "@/components/tables/recent-transactions";
import { SeedButton } from "@/components/seed-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Total Barang",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Total Supplier",
      value: stats.totalSuppliers,
      icon: Truck,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Barang Masuk Hari Ini",
      value: stats.stockInToday,
      icon: ArrowDownToLine,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      title: "Barang Keluar Hari Ini",
      value: stats.stockOutToday,
      icon: ArrowUpFromLine,
      color: "text-orange-600 bg-orange-100",
    },
    {
      title: "Stok Menipis",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan data inventaris Anda
        </p>
      </div>

      <SeedButton />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Barang Masuk & Keluar</CardTitle>
          </CardHeader>
          <CardContent>
            <StockChart
              stockIn={stats.stockInByMonth}
              stockOut={stats.stockOutByMonth}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <RecentTransactions
            title="Barang Masuk Terakhir"
            type="in"
            data={stats.recentStockIn}
          />
          <RecentTransactions
            title="Barang Keluar Terakhir"
            type="out"
            data={stats.recentStockOut}
          />
        </div>
      </div>
    </div>
  );
}
