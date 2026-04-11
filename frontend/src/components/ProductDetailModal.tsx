/* ProductDetailModal.tsx */
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    benefits: string[];
    price: number; // precio real del API (precio del pack completo de 30)
    imageUrl?: string;
  };
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailProps) {
  const { add } = useCart();
  
  // Estados para la lógica Smart Utility
  const [packSize, setPackSize] = useState<10 | 30>(30); // Por defecto el hábito mensual
  const [isSubscription, setIsSubscription] = useState(true); // Suscripción por defecto

  // Lógica de precios basada en el precio real del API
  // product.price = precio del pack de 30 (compra única). Pack 10 = proporcional.
  const basePrice30 = product.price;
  const basePrice10 = Math.round((product.price / 30) * 10 * 100) / 100;
  const baseTotal = packSize === 30 ? basePrice30 : basePrice10;
  const finalPrice = isSubscription ? Math.round(baseTotal * 0.85 * 100) / 100 : baseTotal; // 15% dto suscripción

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleAddToCart() {
    add({ 
      id: `${product.id}-${packSize}-${isSubscription ? 'sub' : 'once'}`, 
      name: `${product.name} (Pack ${packSize} - ${isSubscription ? 'Suscripción' : 'Compra única'})`, 
      price: finalPrice, 
      quantity: 1 
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-brand-bg text-brand-primary rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Lado Izquierdo: Imagen del producto */}
        <div className="bg-brand-surface w-full md:w-1/3 flex items-center justify-center relative overflow-hidden rounded-l-[2.5rem]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <span className="text-brand-muted/30 font-bold tracking-[0.3em] uppercase text-sm">LUMA</span>
          )}
          <span className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-bold tracking-widest text-white/70 uppercase drop-shadow">
            Pack {packSize} días
          </span>
        </div>

        {/* Lado Derecho: Configuración */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto space-y-8">
          <header className="space-y-1">
            <button onClick={onClose} className="absolute top-6 right-6 text-brand-muted hover:text-brand-primary transition-colors text-xl">✕</button>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">{product.category}</span>
            <h2 className="text-3xl font-editorial leading-tight">{product.name}</h2>
            <p className="text-brand-muted text-sm leading-relaxed italic">"{product.description}"</p>
          </header>

          {/* 1. Selección de Cantidad - Título del bloque */}
          <div className="space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-primary/90 block">
              Selecciona tu suministro
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[10, 30].map((size) => (
                <button
                  key={size}
                  onClick={() => setPackSize(size as 10 | 30)}
                  className={`p-5 rounded-2xl border-2 transition-all text-left ${
                    packSize === size 
                    ? 'border-brand-primary bg-brand-primary text-brand-bg' 
                    : 'border-brand-surface bg-white text-brand-primary hover:border-brand-muted'
                  }`}
                >
                  <span className="block text-lg font-bold">{size} Bebidas</span>
                  <span className={`text-[10px] uppercase font-bold tracking-tight ${packSize === size ? 'text-brand-bg/60' : 'text-brand-muted'}`}>
                    {size === 30 ? 'Ciclo Completo' : 'Pack de Inicio'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Modalidad de Compra (Smart Utility) */}
          <div className="space-y-3">
            <div 
              onClick={() => setIsSubscription(true)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                isSubscription ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-surface bg-white'
              }`}
            >
              <div>
                <span className="block font-bold">Suscripción Luma</span>
                <span className="text-xs text-brand-accent">Ahorra 15% + Envío gratis</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSubscription ? 'border-brand-accent bg-brand-accent' : 'border-brand-muted'}`}>
                {isSubscription && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>

            <div 
              onClick={() => setIsSubscription(false)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                !isSubscription ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-surface bg-white'
              }`}
            >
              <div>
                <span className="block font-bold text-sm">Compra única</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isSubscription ? 'border-brand-primary bg-brand-primary' : 'border-brand-muted'}`}>
                {!isSubscription && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          </div>

          {/* Botón Acción Final */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-brand-primary text-brand-bg font-bold py-5 rounded-full hover:opacity-90 transition-all flex justify-between px-8 items-center group"
          >
            <span className="uppercase text-[10px] tracking-widest">Añadir al Carrito</span>
            <span className="text-lg font-editorial">{finalPrice.toFixed(2)}€</span>
          </button>
        </div>
      </div>
    </div>
  );
}