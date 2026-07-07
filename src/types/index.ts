export interface Profile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "petugas";
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  supplier_id: string | null;
  sku: string;
  barcode: string | null;
  name: string;
  price: number;
  stock: number;
  minimum_stock: number;
  unit: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  supplier?: Supplier;
}

export interface StockIn {
  id: string;
  product_id: string;
  supplier_id: string | null;
  qty: number;
  date: string;
  note: string | null;
  user_id: string | null;
  created_at: string;
  product?: Product;
  supplier?: Supplier;
  user?: Profile;
}

export interface StockOut {
  id: string;
  product_id: string;
  qty: number;
  destination: string;
  date: string;
  note: string | null;
  user_id: string | null;
  created_at: string;
  product?: Product;
  user?: Profile;
}

export interface DashboardStats {
  totalProducts: number;
  totalSuppliers: number;
  stockInToday: number;
  stockOutToday: number;
  lowStockProducts: number;
  recentStockIn: StockIn[];
  recentStockOut: StockOut[];
  stockInByMonth: { month: string; total: number }[];
  stockOutByMonth: { month: string; total: number }[];
}
