/*Hero.tsx*/
import { useState } from 'react';
import Image from 'next/image';
import QuizModal from './QuizModal';
import ShippingModal from './ShippingModal';
import SubscriptionModal from './SubscriptionModal';

export default function Hero() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  return (
    <section className="bg-brand-bg text-brand-primary min-h-[90vh] flex items-center px-10 md:px-20 py-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* 1. COLUMNA IZQUIERDA: Texto y Botón */}
        <div className="space-y-8 max-w-2xl">
          <h1 className="text-6xl font-editorial text-brand-primary tracking-tight">
            Optimiza tu mente. <br/> Sin compromisos.
          </h1>
          
          <p className="text-xl md:text-2xl text-brand-muted font-medium leading-relaxed">
            Bebidas nootrópicas diseñadas con ciencia para mejorar tu enfoque, reducir la ansiedad y mantener tu energía estable durante todo el día.
          </p>
          
          <div className="pt-4">
            <button 
              onClick={() => setIsQuizOpen(true)}
              className="bg-brand-accent text-white px-10 py-4 rounded-full text-lg font-bold hover:opacity-90 transition-all shadow-sm active:scale-95 inline-block"
            >
              Haz el Quiz de Enfoque
            </button>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setIsShippingOpen(true)}
              className="flex items-center gap-2 border border-brand-surface bg-brand-surface hover:bg-brand-muted/20 text-brand-primary px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <span>🚚</span>
              <span>Envío gratis</span>
            </button>
            <button
              onClick={() => setIsSubscriptionOpen(true)}
              className="flex items-center gap-2 border border-brand-surface bg-brand-surface hover:bg-brand-muted/20 text-brand-primary px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <span>📦</span>
              <span>Pack de suscripción</span>
              <span className="text-brand-accent text-xs font-bold">Saber más →</span>
            </button>
          </div>
        </div>

        {/* 2. COLUMNA DERECHA: Imagen del Producto */}
        <div className="relative aspect-square bg-brand-surface rounded-3xl overflow-hidden border border-brand-surface shadow-sm">
          <Image 
            src="/images/LumaHero.png" 
            alt="Botella de Luma"
            fill
            className="object-cover"
            priority 
          />
        </div>
      </div>

      {/* --- MODALS --- */}
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <ShippingModal isOpen={isShippingOpen} onClose={() => setIsShippingOpen(false)} />
      <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
    </section>
  );
}