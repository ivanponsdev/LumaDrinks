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