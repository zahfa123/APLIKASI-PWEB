import { getCategories } from "@/lib/actions/categories";
import { getSuppliers } from "@/lib/actions/suppliers";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, suppliers] = await Promise.all([
    getCategories(),
    getSuppliers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Barang</h1>
        <p className="text-muted-foreground">Isi data barang baru</p>
      </div>
      <ProductForm categories={categories} suppliers={suppliers} />
    </div>
  );
}
