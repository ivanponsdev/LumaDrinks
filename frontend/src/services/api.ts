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

export const createOrder = async (
  items: OrderItem[],
  total: number,
  accessToken: string,
) => {
  const response = await api.post(
    '/orders',
    { items, total },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data;
};

export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  total: number;
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
