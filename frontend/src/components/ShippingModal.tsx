/*ShippingModal.tsx*/
import { useRouter } from 'next/router';

export default function ShippingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  if (!isOpen) return null;

  const perks = [
    {
      icon: '🚚',
      title: 'Envío estándar gratuito',
      detail: 'En todos los pedidos de la tienda, sin mínimo de compra. Sin letra pequeña.',
    },
    {
      icon: '⏱️',
      title: 'Entrega en 24–48 h',
      detail: 'Peninsular España. Baleares y Canarias en 3–5 días hábiles.',
    },
    {
      icon: '📦',
      title: 'Embalaje sostenible',
      detail: 'Cajas de cartón reciclado y relleno biodegradable. Cero plástico de un solo uso.',
    },
    {
      icon: '↩️',
      title: 'Devoluciones sin coste',
      detail: 'Si no estás satisfecho/a, tienes 30 días para devolver tu pedido. Te reembolsamos el 100 %.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-bg rounded-2xl max-w-lg w-full shadow-2xl border border-brand-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-brand-surface flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Logística
            </span>
            <h2 className="text-3xl font-editorial text-brand-primary mt-1">
              Envío gratis, siempre
            </h2>
            <p className="text-brand-muted text-sm mt-2 leading-relaxed">
              Nos tomamos en serio que tu pedido llegue rápido y en perfectas condiciones,
              sin costes ocultos.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-brand-muted hover:text-brand-primary transition-colors flex-shrink-0 mt-1"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        {/* Perks */}
        <div className="px-8 py-6 space-y-4">
          {perks.map((perk) => (
            <div key={perk.title} className="flex gap-4 items-start">
              <span className="text-xl flex-shrink-0 mt-0.5">{perk.icon}</span>
              <div>
                <p className="font-bold text-brand-primary text-sm">{perk.title}</p>
                <p className="text-brand-muted text-sm leading-relaxed">{perk.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <button
            onClick={() => { onClose(); router.push('/products'); }}
            className="bg-brand-accent text-white px-8 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Perfecto, ir a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}
