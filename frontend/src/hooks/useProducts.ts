import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';

export interface ApiProduct {
  id: string | number;
  name: string;
  description: string;
  price: string | number;
  category: string;
  benefits: string[];
  image_url?: string;
  stock?: number;
}

interface UseProductsResult {
  products: ApiProduct[];
  loading: boolean;
  error: string | null;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then((data: unknown) => {
        if (!cancelled) {
          setProducts(Array.isArray(data) ? (data as ApiProduct[]) : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudieron cargar los productos.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}
