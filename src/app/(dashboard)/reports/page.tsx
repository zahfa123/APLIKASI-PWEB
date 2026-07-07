"use client";

import { useState, useEffect } from "react";
import { getStockIn } from "@/lib/actions/stock-in";
import { getStockOut } from "@/lib/actions/stock-out";
import { getProducts } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface StockInRecord {
  id: string;
  qty: number;
  date: string;
  note: string | null;
  product: { name: string; sku: string } | null;
  supplier: { name: string } | null;
  user: { name: string } | null;
}

interface StockOutRecord {
  id: string;
  qty: number;
  destination: string;
  date: string;
  note: string | null;
  product: { name: string; sku: string } | null;
  user: { name: string } | null;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minimum_stock: number;
  unit: string;
  category?: { name: string } | null;
  supplier?: { name: string } | null;
}

export default function ReportsPage() {
  const [stockInRecords, setStockInRecords] = useState<StockInRecord[]>([]);
  const [stockOutRecords, setStockOutRecords] = useState<StockOutRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState("stock-in");

  async function loadData() {
    try {
      const [si, so, prods] = await Promise.all([
        getStockIn(dateFrom || undefined, dateTo || undefined),
        getStockOut(dateFrom || undefined, dateTo || undefined),
        getProducts(),
      ]);
      setStockInRecords(si);
      setStockOutRecords(so);
      setProducts(prods);
    } catch {
      toast.error("Gagal memuat data laporan");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo]);

  function exportToCSV(data: Record<string, unknown>[], filename: string) {
    if (data.length === 0) {
      toast.error("Tidak ada data untuk di-export");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => `"${String(row[h] ?? "")}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    toast.success(`File ${filename}.csv berhasil di-download`);
  }

  function exportStockIn() {
    const data = stockInRecords.map((r) => ({
      Tanggal: format(new Date(r.date), "dd/MM/yyyy"),
      Barang: r.product?.name || "",
      SKU: r.product?.sku || "",
      Supplier: r.supplier?.name || "",
      Jumlah: r.qty,
      Catatan: r.note || "",
      Oleh: r.user?.name || "",
    }));
    exportToCSV(data, "laporan-barang-masuk");
  }

  function exportStockOut() {
    const data = stockOutRecords.map((r) => ({
      Tanggal: format(new Date(r.date), "dd/MM/yyyy"),
      Barang: r.product?.name || "",
      SKU: r.product?.sku || "",
      Tujuan: r.destination,
      Jumlah: r.qty,
      Catatan: r.note || "",
      Oleh: r.user?.name || "",
    }));
    exportToCSV(data, "laporan-barang-keluar");
  }

  function exportInventory() {
    const data = products.map((p) => ({
      SKU: p.sku,
      Nama: p.name,
      Kategori: p.category?.name || "",
      Supplier: p.supplier?.name || "",
      Stok: p.stock,
      "Minimum Stok": p.minimum_stock,
      Satuan: p.unit,
      Status: p.stock <= p.minimum_stock ? "Menipis" : "Aman",
    }));
    exportToCSV(data, "laporan-persediaan");
  }

  const totalStockIn = stockInRecords.reduce((sum, r) => sum + r.qty, 0);
  const totalStockOut = stockOutRecords.reduce((sum, r) => sum + r.qty, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan</h1>
          <p className="text-muted-foreground">Ringkasan data stok dan transaksi</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Dari Tanggal</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 text-sm bg-background"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Sampai Tanggal</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 text-sm bg-background"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        {(dateFrom || dateTo) && (
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Barang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Masuk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+{totalStockIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Keluar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">-{totalStockOut}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Stok Menipis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products.filter((p) => p.stock <= p.minimum_stock).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stock-in">Barang Masuk</TabsTrigger>
          <TabsTrigger value="stock-out">Barang Keluar</TabsTrigger>
          <TabsTrigger value="inventory">Persediaan</TabsTrigger>
        </TabsList>

        <TabsContent value="stock-in" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={exportStockIn}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Oleh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Memuat...</TableCell>
                  </TableRow>
                ) : stockInRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  stockInRecords.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{format(new Date(rec.date), "dd MMM yyyy", { locale: idLocale })}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rec.product?.name}</p>
                          <p className="text-xs text-muted-foreground">{rec.product?.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell>{rec.supplier?.name || "-"}</TableCell>
                      <TableCell><Badge variant="default">+{rec.qty}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{rec.note || "-"}</TableCell>
                      <TableCell>{rec.user?.name || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="stock-out" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={exportStockOut}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Oleh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Memuat...</TableCell>
                  </TableRow>
                ) : stockOutRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  stockOutRecords.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{format(new Date(rec.date), "dd MMM yyyy", { locale: idLocale })}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rec.product?.name}</p>
                          <p className="text-xs text-muted-foreground">{rec.product?.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell>{rec.destination}</TableCell>
                      <TableCell><Badge variant="destructive">-{rec.qty}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{rec.note || "-"}</TableCell>
                      <TableCell>{rec.user?.name || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={exportInventory}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Min. Stok</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Memuat...</TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category?.name || "-"}</TableCell>
                      <TableCell>{p.supplier?.name || "-"}</TableCell>
                      <TableCell>{p.stock} {p.unit}</TableCell>
                      <TableCell>{p.minimum_stock} {p.unit}</TableCell>
                      <TableCell>
                        <Badge variant={p.stock <= p.minimum_stock ? "destructive" : "default"}>
                          {p.stock <= p.minimum_stock ? "Menipis" : "Aman"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
