import { getProduct } from "@/lib/actions/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id).catch(() => null);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.sku}</p>
          </div>
        </div>
        <Link href={`/products/${product.id}/edit`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Barang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SKU</span>
              <span className="font-mono">{product.sku}</span>
            </div>
            {product.barcode && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Barcode</span>
                <span className="font-mono">{product.barcode}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Harga</span>
              <span>Rp {product.price.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Satuan</span>
              <span>{product.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kategori</span>
              {product.category ? (
                <Badge variant="outline">{product.category.name}</Badge>
              ) : (
                <span>-</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supplier</span>
              <span>{product.supplier?.name || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stok Saat Ini</span>
              <Badge
                variant={
                  product.stock <= product.minimum_stock ? "destructive" : "default"
                }
                className="text-lg"
              >
                {product.stock} {product.unit}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum Stok</span>
              <span>
                {product.minimum_stock} {product.unit}
              </span>
            </div>
            {product.stock <= product.minimum_stock && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                Stok menipis! Segera lakukan pengadaan barang.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
