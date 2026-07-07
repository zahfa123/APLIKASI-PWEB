import { getProduct } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { getSuppliers } from "@/lib/actions/suppliers";
import { ProductForm } from "@/components/product-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, suppliers] = await Promise.all([
    getProduct(id).catch(() => null),
    getCategories(),
    getSuppliers(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Barang</h1>
        <p className="text-muted-foreground">Ubah data barang</p>
      </div>
      <ProductForm
        categories={categories}
        suppliers={suppliers}
        product={product}
      />
    </div>
  );
}
