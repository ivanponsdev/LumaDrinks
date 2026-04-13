/*SubscriptionModal.tsx*/
import { useRouter } from 'next/router';

export default function SubscriptionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const router = useRouter();

  const steps = [
    { step: '01', title: 'Elige tu fórmula', detail: 'Selecciona el pack que mejor se adapta a tu objetivo: enfoque, memoria, relax o energía.' },
    { step: '02', title: 'Ajusta la frecuencia', detail: 'Recibes tu caja cada 2 semanas o cada mes, según tu ritmo. Cambia en cualquier momento.' },
    { step: '03', title: 'Cancela cuando quieras', detail: 'Sin permanencia. Si necesitas pausar o cancelar, lo gestionas desde tu panel de cuenta en segundos.' },
  ];

  const benefits = [
    { label: '15 % de descuento', sublabel: 'vs. precio unitario' },
    { label: 'Envío 0 €', sublabel: 'siempre incluido' },
    { label: 'Acceso anticipado', sublabel: 'a nuevas fórmulas' },
    { label: 'Sin compromisos', sublabel: 'cancela cuando quieras' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-bg rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-brand-surface flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Suscripción
            </span>
            <h2 className="text-3xl font-editorial text-brand-primary mt-1">
              Tu caja Luma, cada mes
            </h2>
            <p className="text-brand-muted text-sm mt-2 leading-relaxed">
              Automatiza tu bienestar. Recibe siempre la fórmula que necesitas, con descuento
              permanente y sin preocuparte de quedarte sin stock.
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

        {/* Benefits grid */}
        <div className="px-8 pt-6">
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((b) => (
              <div key={b.label} className="bg-brand-surface rounded-xl p-4 text-center">
                <p className="font-bold text-brand-primary text-sm">{b.label}</p>
                <p className="text-brand-muted text-xs mt-0.5">{b.sublabel}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="px-8 py-6 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">Cómo funciona</p>
          {steps.map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <span className="text-2xl font-editorial text-brand-accent flex-shrink-0 leading-none">
                {s.step}
              </span>
              <div>
                <p className="font-bold text-brand-primary text-sm">{s.title}</p>
                <p className="text-brand-muted text-sm leading-relaxed">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTAs */}
        <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { onClose(); router.push('/products'); }}
            className="flex-1 bg-brand-accent text-white px-6 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Empezar ahora
          </button>
          <button
            onClick={onClose}
            className="flex-1 border-2 border-brand-primary text-brand-primary px-6 py-3 rounded-full text-sm font-bold hover:bg-brand-surface transition-colors"
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
}
