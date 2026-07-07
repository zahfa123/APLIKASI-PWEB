"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { toast } from "sonner";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode: string | null;
    price: number;
    stock: number;
    minimum_stock: number;
    unit: string;
    category_id: string | null;
    supplier_id: string | null;
    image: string | null;
  };
}

export function ProductForm({
  categories,
  suppliers,
  product,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEdit = !!product;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      sku: form.get("sku") as string,
      barcode: (form.get("barcode") as string) || undefined,
      price: Number(form.get("price")),
      minimum_stock: Number(form.get("minimum_stock")),
      unit: form.get("unit") as string,
      category_id: (form.get("category_id") as string) || undefined,
      supplier_id: (form.get("supplier_id") as string) || undefined,
    };

    let result;
    if (isEdit) {
      result = await updateProduct(product.id, data);
    } else {
      result = await createProduct({ ...data, stock: Number(form.get("stock")) || 0 });
    }

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Barang berhasil diubah" : "Barang berhasil ditambahkan");
      router.push("/products");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Data Barang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Barang *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
                placeholder="Masukkan nama barang"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku}
                required
                placeholder="Masukkan SKU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                name="barcode"
                defaultValue={product?.barcode || ""}
                placeholder="Masukkan barcode"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={product?.price}
                required
                min={0}
              />
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="stock">Stok Awal</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  defaultValue={0}
                  min={0}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Minimum Stok *</Label>
              <Input
                id="minimum_stock"
                name="minimum_stock"
                type="number"
                defaultValue={product?.minimum_stock}
                required
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan *</Label>
              <Input
                id="unit"
                name="unit"
                defaultValue={product?.unit || "pcs"}
                required
                placeholder="pcs, kg, box, dll"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Kategori</Label>
              <select
                id="category_id"
                name="category_id"
                defaultValue={product?.category_id || ""}
                className="border rounded-md px-3 py-2 text-sm bg-background w-full"
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Supplier</Label>
              <select
                id="supplier_id"
                name="supplier_id"
                defaultValue={product?.supplier_id || ""}
                className="border rounded-md px-3 py-2 text-sm bg-background w-full"
              >
                <option value="">Pilih supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Barang"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
