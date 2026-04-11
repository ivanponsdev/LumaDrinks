/* src/components/ProductCard.tsx */
import Image from 'next/image';
import { useCart } from "../context/CartContext";

interface ProductProps {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl?: string;
  color?: string;
  benefits: string[];
  onDetails?: () => void;
}

export default function ProductCard({ id, name, price, description, imageUrl, color, benefits, onDetails }: ProductProps) {
  const { add } = useCart();

  function handleAddToCart() {
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    add({ id, name, price: numericPrice, quantity: 1 });
  }

  return (
    <div className="bg-brand-surface rounded-3xl p-6 text-brand-primary flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 group">
      <div className="flex-1">

        {/* Imagen del producto */}
        <div className="aspect-square rounded-2xl mb-5 relative overflow-hidden bg-brand-bg shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-brand-muted/30 font-semibold tracking-[0.3em] uppercase text-[10px]">LUMA</span>
            </div>
          )}
        </div>

        {/* Nombre y precio - Aquí aplicamos font-editorial para elevar el diseño */}
        <div className="mb-2">
          <h3 className="text-base font-editorial font-semibold text-brand-primary leading-snug">{name}</h3>
          <span className="text-sm text-brand-primary font-medium">{price}</span>
        </div>

        {/* Descripción */}
        <p className="text-brand-primary/70 text-sm leading-relaxed mb-6 line-clamp-3">
          {description}
        </p>

        {/* SECCIÓN DE BENEFICIOS ELIMINADA: Esto evita los descuadres y errores de caracteres */}

      </div>

      {/* Acciones */}
      <div className="space-y-3 mt-auto">
        <button
          onClick={handleAddToCart}
          className="w-full bg-brand-accent text-brand-bg font-semibold py-3 rounded-full hover:opacity-90 transition-opacity duration-200 text-sm"
        >
          Añadir al carrito
        </button>

        {onDetails && (
          <button
            onClick={onDetails}
            className="block w-full text-center text-xs text-brand-muted hover:text-brand-primary transition-colors duration-200 py-1"
          >
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
}