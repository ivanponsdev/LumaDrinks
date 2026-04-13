// src/components/ProductSection.tsx
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import { useProducts, ApiProduct } from '../hooks/useProducts';
import { getProductImage } from '../lib/productImages';

function normalizePrice(price: string | number): string {
  if (typeof price === 'string') return price.includes('€') ? price : `${price}€`;
  return `${(price as number).toFixed(2)}€`;
}

function normalizeBenefits(benefits: string[] | string | null): string[] {
  if (!benefits) return [];
  if (Array.isArray(benefits)) return benefits;
  try { return JSON.parse(benefits as string); } catch { return [benefits as string]; }
}

export default function ProductSection() {
  const { products, loading, error } = useProducts();
  const featured = products.slice(0, 4);
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);

  return (
    <section id="tienda" className="py-24 px-10 bg-brand-bg">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="text-5xl font-editorial text-brand-primary mb-4 tracking-tight">
              Productos Destacados
            </h2>
            <p className="text-brand-muted max-w-md font-medium text-lg">
              Selección de bebidas inteligentes diseñadas para cada estado mental.
            </p>
          </div>
          <Link 
            href="/products" 
            className="mt-6 md:mt-0 border-2 border-brand-primary text-brand-primary px-6 py-2 rounded-full font-medium text-sm hover:bg-brand-primary hover:text-brand-bg transition-all"
          >
            Ver todos →
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-brand-surface border-t-brand-accent animate-spin" />
          </div>
        )}
        {!loading && error && (
          <p className="text-center text-brand-muted py-16">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((product: ApiProduct) => (
              <ProductCard
                key={product.id}
                id={String(product.id)}
                name={product.name}
                price={normalizePrice(product.price)}
                description={product.description}
                imageUrl={getProductImage(product.category)}
                benefits={normalizeBenefits(product.benefits)}
                onDetails={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

      </div>

      {/* AQUÍ ESTABA EL ERROR: Eliminamos 'price' y 'color' del objeto product */}
      {selectedProduct && (        <ProductDetailModal
          product={{
            id: String(selectedProduct.id),
            name: selectedProduct.name,
            description: selectedProduct.description,
            benefits: normalizeBenefits(selectedProduct.benefits),
            category: selectedProduct.category,
            imageUrl: getProductImage(selectedProduct.category),
            price: typeof selectedProduct.price === 'string'
              ? parseFloat(selectedProduct.price.replace(/[^0-9.]/g, ''))
              : Number(selectedProduct.price),
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}