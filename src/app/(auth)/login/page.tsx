"use client";

import { useState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Sistem Stok Barang</CardTitle>
            <CardDescription>Masuk ke panel manajemen inventaris</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Login gagal</p>
                    <p className="text-xs mt-1">
                      {error.includes("Invalid login") || error.includes("invalid")
                        ? "Email atau password salah. Pastikan sudah membuat akun di Supabase Dashboard → Authentication → Users."
                        : error}
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Masuk..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 space-y-2">
            <p className="text-sm font-medium text-blue-800">Cara Setup:</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Buka Supabase Dashboard → SQL Editor</li>
              <li>Jalankan isi file <code>database/schema.sql</code></li>
              <li>Buka Authentication → Users → <strong>Add user</strong></li>
              <li>Isi email & password, centang <strong>Auto Confirm</strong></li>
              <li>Masuk dengan email & password yang dibuat</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
