/*CartModal.tsx*/
import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, totalItems, totalPrice, remove, updateQuantity, clear } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay: Oscurece el fondo para dar foco al modal */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Panel: Blanco sólido con sombra profunda para que resalte */}
      <div className="relative bg-white text-brand-primary rounded-[2.5rem] w-full max-w-md shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col max-h-[85vh] overflow-hidden border border-gray-100">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            Tu Carrito 
            {totalItems > 0 && <span className="ml-2 text-xs font-medium text-brand-muted">({totalItems})</span>}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-brand-primary font-light text-xl"
          >
            ✕
          </button>
        </div>

        {/* Lista de productos */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6 bg-white">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-4">🛒</span>
              <p className="text-brand-muted font-medium italic">Tu carrito está vacío.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                {/* Miniatura */}
                <div className="w-16 h-16 rounded-2xl bg-brand-surface flex items-center justify-center shrink-0 border border-gray-50">
                  <span className="text-[10px] font-black text-brand-muted uppercase tracking-tighter text-center px-1">
                    {item.name.split(' ')[1] ?? 'Luma'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm uppercase truncate tracking-tight">{item.name}</p>
                  <p className="text-brand-accent font-black text-sm">{item.price.toFixed(2)}€</p>
                </div>

                {/* Controles manuales */}
                <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-full transition-all font-bold text-sm"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-full transition-all font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Eliminar */}
                <button 
                  onClick={() => remove(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors px-1 text-lg"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-8 py-8 bg-gray-50 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Subtotal</span>
              <span className="text-xl font-black">{totalPrice.toFixed(2)}€</span>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full text-center bg-brand-accent text-white font-bold py-5 rounded-full hover:brightness-105 transition-all active:scale-[0.98] shadow-lg shadow-brand-accent/20 uppercase text-[11px] tracking-[0.2em]"
            >
              Finalizar Compra
            </Link>

            <button 
              onClick={clear}
              className="w-full text-[10px] text-brand-muted hover:text-red-500 uppercase tracking-widest transition-colors font-bold py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}