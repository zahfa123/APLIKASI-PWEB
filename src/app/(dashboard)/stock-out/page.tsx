"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/actions/products";
import { getStockOut, createStockOut } from "@/lib/actions/stock-out";
import { getCurrentUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
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

export default function StockOutPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [records, setRecords] = useState<StockOutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product_id: "",
    qty: 1,
    destination: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  async function loadData() {
    try {
      const [productsData, recordsData, user] = await Promise.all([
        getProducts(),
        getStockOut(),
        getCurrentUser(),
      ]);
      setProducts(productsData);
      setRecords(recordsData);
      if (user) setUserId(user.id);
    } catch {
      toast.error("Gagal memuat data");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave() {
    if (!formData.product_id || !formData.destination || formData.qty <= 0) {
      toast.error("Lengkapi semua data yang wajib diisi");
      return;
    }
    setSaving(true);
    const result = await createStockOut({
      product_id: formData.product_id,
      qty: formData.qty,
      destination: formData.destination,
      date: formData.date,
      note: formData.note || undefined,
      user_id: userId || undefined,
    });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Barang keluar berhasil dicatat");
      setShowDialog(false);
      setFormData({
        product_id: "",
        qty: 1,
        destination: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      loadData();
      router.refresh();
    }
    setSaving(false);
  }

  const selectedProduct = products.find((p) => p.id === formData.product_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Barang Keluar</h1>
          <p className="text-muted-foreground">Catat barang yang keluar</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Barang Keluar
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
                <TableCell colSpan={6} className="text-center py-8">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada barang keluar
                </TableCell>
              </TableRow>
            ) : (
              records.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell>
                    {format(new Date(rec.date), "dd MMM yyyy", { locale: idLocale })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rec.product?.name}</p>
                      <p className="text-xs text-muted-foreground">{rec.product?.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>{rec.destination}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">-{rec.qty}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {rec.note || "-"}
                  </TableCell>
                  <TableCell>{rec.user?.name || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Barang Keluar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Barang *</Label>
              <select
                className="border rounded-md px-3 py-2 text-sm bg-background w-full"
                value={formData.product_id}
                onChange={(e) =>
                  setFormData({ ...formData, product_id: e.target.value })
                }
              >
                <option value="">Pilih barang</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) - Stok: {p.stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tujuan *</Label>
              <Input
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
                placeholder="Tujuan pengeluaran"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah *</Label>
                <Input
                  type="number"
                  min={1}
                  max={selectedProduct?.stock}
                  value={formData.qty}
                  onChange={(e) =>
                    setFormData({ ...formData, qty: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            {selectedProduct && (
              <div className="bg-muted p-3 rounded-md text-sm">
                Stok saat ini: <strong>{selectedProduct.stock}</strong>
                {" → "}
                Stok setelah keluar:{" "}
                <strong>{selectedProduct.stock - formData.qty}</strong>
                {selectedProduct.stock - formData.qty < 0 && (
                  <span className="text-destructive ml-2">(Stok tidak mencukupi!)</span>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Catatan tambahan..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || (selectedProduct ? selectedProduct.stock < formData.qty : false)}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
