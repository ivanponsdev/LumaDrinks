import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // NestJS backend
});

export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    return Array.isArray(response.data) ? response.data : [];
  } catch (err: any) {
    console.warn('getProducts failed:', err?.message ?? err);
    return [];
  }
};

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  floor?: string;
  city: string;
  postalCode: string;
  province: string;
}

export const createOrder = async (
  items: OrderItem[],
  total: number,
  accessToken: string,
  shippingAddress: ShippingAddress,
) => {
  const response = await api.post(
    '/orders',
    { items, total, shippingAddress },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data;
};

export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  total_paid: number;
  status: string;
  created_at: string;
}

export const getMyOrders = async (accessToken: string): Promise<Order[]> => {
  const response = await api.get('/orders/my', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

// --- Cart (multi-device DB persistence) ---

export const getServerCart = async (accessToken: string): Promise<OrderItem[]> => {
  const response = await api.get('/cart', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.items ?? [];
};

export const saveServerCart = async (
  items: OrderItem[],
  accessToken: string,
): Promise<void> => {
  await api.put(
    '/cart',
    { items },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
};

// --- Admin ---

export interface AdminSummary {
  total_revenue: number;
  avg_order: number;
  total_orders: number;
  last_7d: number;
  last_30d: number;
  revenue_30d: number;
}

export interface AdminTopProduct {
  name: string;
  orders: number;
  revenue: number;
}

export interface AdminBySource {
  source: string;
  orders: number;
  revenue: number;
}

export interface AdminDailySale {
  day: string;
  orders: number;
  revenue: number;
}

export interface AdminStatusBreakdown {
  status: string;
  count: number;
}

export interface AdminCustomerMetrics {
  registered_count: number;
  converted_count: number;
  registered_no_orders_count: number;
  avg_days_to_first_purchase: number;
}

export interface AdminNonBuyer {
  id: string;
  email: string;
  created_at: string;
}

export interface AdminStats {
  summary: AdminSummary;
  topProducts: AdminTopProduct[];
  bySource: AdminBySource[];
  dailySales: AdminDailySale[];
  statusBreakdown: AdminStatusBreakdown[];
  customerMetrics: AdminCustomerMetrics;
  recentNonBuyers: AdminNonBuyer[];
}

export interface AdminOrder {
  id: string;
  total_paid: number;
  status: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  customer_email: string;
  items: OrderItem[];
}

export const getAdminStats = async (accessToken: string): Promise<AdminStats> => {
  const response = await api.get('/admin/stats', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const getAdminOrders = async (
  accessToken: string,
  limit = 50,
  offset = 0,
): Promise<AdminOrder[]> => {
  const response = await api.get(`/admin/orders?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

// --- Admin: gestión de productos ---

export const adminCreateProduct = async (data: any, accessToken: string): Promise<any> => {
  const response = await api.post('/products', data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const adminUpdateProduct = async (
  id: string,
  data: any,
  accessToken: string,
): Promise<any> => {
  const response = await api.patch(`/products/${id}`, data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const adminDeleteProduct = async (id: string, accessToken: string): Promise<void> => {
  await api.delete(`/products/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

// --- Payments ---

export interface SimulatePaymentDto {
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardholderName: string;
  amount: number;
  orderId?: string;
}

export interface PaymentResult {
  paymentId: string;
  status: string;
  last4: string;
  processedAt: string;
}

export const simulatePayment = async (
  data: SimulatePaymentDto,
  accessToken: string,
): Promise<PaymentResult> => {
  const response = await api.post('/payments/simulate', data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export interface AdminPayment {
  id: string;
  order_id: string | null;
  amount: number;
  status: string;
  last4: string;
  metadata: Record<string, unknown>;
  created_at: string;
  processed_at: string;
}

export const getAdminPayments = async (
  accessToken: string,
  limit = 50,
  offset = 0,
): Promise<AdminPayment[]> => {
  const response = await api.get(`/payments?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};
