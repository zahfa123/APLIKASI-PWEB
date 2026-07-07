"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductFiltersProps {
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  currentSearch: string;
  currentCategory: string;
  currentSupplier: string;
}

export function ProductFilters({
  categories,
  suppliers,
  currentSearch,
  currentCategory,
  currentSupplier,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", search);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <form onSubmit={handleSearch} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan nama, SKU, atau barcode..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <select
        className="border rounded-md px-3 py-2 text-sm bg-background"
        value={currentCategory}
        onChange={(e) => updateParams("category", e.target.value)}
      >
        <option value="">Semua Kategori</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <select
        className="border rounded-md px-3 py-2 text-sm bg-background"
        value={currentSupplier}
        onChange={(e) => updateParams("supplier", e.target.value)}
      >
        <option value="">Semua Supplier</option>
        {suppliers.map((sup) => (
          <option key={sup.id} value={sup.id}>
            {sup.name}
          </option>
        ))}
      </select>
    </div>
  );
}
