export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number; // in MT
  old_price?: number;
  image_url: string;
  file_path: string;
  category_id: string;
  active: boolean;
  benefits?: string[];
  includes?: string[];
  format?: string;
  faq?: ProductFAQ[];
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  method: 'mpesa' | 'emola';
  account: string;
  status: 'Concluído' | 'Pendente' | 'Rejeitado';
  admin_email: string;
  gateway_reference: string;
  created_at: string;
}

export type PaymentMethod = 'mpesa' | 'emola' | 'mkesh' | 'card';
export type PaymentStatus = 'Pendente' | 'Pago' | 'Falhou' | 'Cancelado';

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_id: string;
  product_name: string;
  total: number;
  original_price: number;
  discount_amount: number;
  coupon_code?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  gateway_reference: string;
  receiving_account?: string;
  download_token?: string;
  download_expires_at?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  expires_at: string;
  max_uses: number;
  used_count: number;
  active: boolean;
}

export interface DownloadRecord {
  id: string;
  order_id: string;
  user_email: string;
  product_id: string;
  token: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  created_at: string;
}

export interface AdminStats {
  totalSalesCount: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProductsSold: number;
  pendingOrdersCount: number;
  salesToday: number;
  salesLast7Days: number;
  salesLast30Days: number;
  recentOrders: Order[];
  dailyChartData: { date: string; amount: number; orders: number }[];
}
