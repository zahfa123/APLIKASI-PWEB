"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { seedTestData } from "@/lib/actions/seed";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handleSeed() {
    setLoading(true);
    setMsg("");
    const result = await seedTestData();
    if (result?.error) {
      toast.error(result.error);
      setMsg("Error: " + result.error);
    } else {
      toast.success("Data test berhasil dibuat!");
      setDone(true);
      router.refresh();
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800 font-medium">Data test berhasil dibuat! Dashboard akan terisi otomatis.</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Database className="h-5 w-5 text-amber-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Dashboard kosong?</p>
          <p className="text-xs text-amber-600">Klik untuk membuat data test (8 barang, 3 supplier, 3 kategori, transaksi)</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSeed} disabled={loading} className="shrink-0">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Database className="h-4 w-4 mr-1" />
              Isi Data Test
            </>
          )}
        </Button>
      </div>
      {msg && <p className="text-xs text-red-600 w-full">{msg}</p>}
    </div>
  );
}
