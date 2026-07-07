"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/actions/products";
import { getSuppliers } from "@/lib/actions/suppliers";
import { getStockIn, createStockIn } from "@/lib/actions/stock-in";
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

interface Supplier {
  id: string;
  name: string;
}

interface StockInRecord {
  id: string;
  qty: number;
  date: string;
  note: string | null;
  product: { name: string; sku: string } | null;
  supplier: { name: string } | null;
  user: { name: string } | null;
}

export default function StockInPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [records, setRecords] = useState<StockInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product_id: "",
    supplier_id: "",
    qty: 1,
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  async function loadData() {
    try {
      const [productsData, suppliersData, recordsData, user] = await Promise.all([
        getProducts(),
        getSuppliers(),
        getStockIn(),
        getCurrentUser(),
      ]);
      setProducts(productsData);
      setSuppliers(suppliersData);
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
    if (!formData.product_id || formData.qty <= 0) {
      toast.error("Lengkapi data barang dan jumlah");
      return;
    }
    setSaving(true);
    const result = await createStockIn({
      product_id: formData.product_id,
      supplier_id: formData.supplier_id || undefined,
      qty: formData.qty,
      date: formData.date,
      note: formData.note || undefined,
      user_id: userId || undefined,
    });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Barang masuk berhasil dicatat");
      setShowDialog(false);
      setFormData({
        product_id: "",
        supplier_id: "",
        qty: 1,
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
          <h1 className="text-2xl font-bold">Barang Masuk</h1>
          <p className="text-muted-foreground">Catat barang yang masuk</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Barang Masuk
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
                <TableCell colSpan={6} className="text-center py-8">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada barang masuk
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
                  <TableCell>{rec.supplier?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="default">+{rec.qty}</Badge>
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
            <DialogTitle>Tambah Barang Masuk</DialogTitle>
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
              <Label>Supplier</Label>
              <select
                className="border rounded-md px-3 py-2 text-sm bg-background w-full"
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
              >
                <option value="">Pilih supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah *</Label>
                <Input
                  type="number"
                  min={1}
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
                Stok setelah masuk:{" "}
                <strong>{selectedProduct.stock + formData.qty}</strong>
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
