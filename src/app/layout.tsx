import type { Metadata } from "next";
import "@fontsource-variable/geist";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Manajemen Stok Barang",
  description: "Aplikasi pengelolaan inventaris dan stok barang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ fontFamily: "Geist Variable, sans-serif" }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
