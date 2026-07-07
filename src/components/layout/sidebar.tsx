"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tag,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileBarChart,
  LogOut,
  PackageIcon,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Barang", icon: Package },
  { href: "/categories", label: "Kategori", icon: Tag },
  { href: "/suppliers", label: "Supplier", icon: Truck },
  { href: "/stock-in", label: "Barang Masuk", icon: ArrowDownToLine },
  { href: "/stock-out", label: "Barang Keluar", icon: ArrowUpFromLine },
  { href: "/reports", label: "Laporan", icon: FileBarChart },
];

const petugasLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Cari Barang", icon: Package },
  { href: "/stock-in", label: "Barang Masuk", icon: ArrowDownToLine },
  { href: "/stock-out", label: "Barang Keluar", icon: ArrowUpFromLine },
];

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : petugasLinks;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r bg-card">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <PackageIcon className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">Stok Barang</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
