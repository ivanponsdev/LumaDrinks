/* pages/products.tsx */
import { useState } from 'react';
import { useProducts, ApiProduct } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { getProductImage } from '../lib/productImages';

const ALL = 'ALL';

// Definimos las categorías como un array simple para los filtros
const CATEGORIES_LIST = ['Enfoque', 'Energía', 'Relax', 'Memoria'];

function normalizePrice(price: string | number): string {
  if (typeof price === 'string') return price.includes('€') ? price : `${price}€`;
  return `${price.toFixed(2)}€`;
}

function normalizeBenefits(benefits: string[] | string | null): string[] {
  if (!benefits) return [];
  if (Array.isArray(benefits)) return benefits;
  try { return JSON.parse(benefits); } catch { return [benefits]; }
}

export default function ProductsPage() {
  const { products, loading, error } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);

  const filterMenu = [ALL, ...CATEGORIES_LIST];

  const filtered = activeCategory === ALL
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="pt-32 pb-12 px-6 md:px-10">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
    <div className="space-y-3">
      <h1 className="text-6xl font-editorial text-brand-primary tracking-tight leading-none">
        Tienda
      </h1>
      <p className="text-brand-muted font-medium text-lg max-w-md opacity-90">
        Nootrópicos funcionales diseñados para cada estado mental. Todo lo que tu cerebro necesita, en un solo lugar.
      </p>
    </div>

    {/* Sustituimos los botones por una etiqueta de calidad o simplemente aire */}
    <div className="hidden md:block">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent border border-brand-accent/20 px-4 py-2 rounded-full">
        Suministro Mensual Disponible
      </span>
    </div>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-16 w-full flex-1">
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-brand-surface border-t-brand-accent animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-24">
            <p className="text-brand-muted font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {filtered.map((product: ApiProduct) => (
              <ProductCard
                key={product.id}
                id={String(product.id)}
                name={product.name}
                price={normalizePrice(product.price)}
                description={product.description}
                imageUrl={getProductImage(product.category)}
                color="" 
                benefits={normalizeBenefits(product.benefits)}
                onDetails={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductDetailModal
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
    </div>
  );
}