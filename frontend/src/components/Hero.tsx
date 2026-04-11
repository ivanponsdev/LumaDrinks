/*Hero.tsx*/
import { useState } from 'react';
import Image from 'next/image';
import QuizModal from './QuizModal'; // Asegúrate de que la ruta sea correcta

export default function Hero() {
  // Estado para controlar si el modal está abierto o cerrado
  const [isQuizOpen, setIsQuizOpen] = useState(false);

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

      {/* --- INTEGRACIÓN DEL QUIZ --- */}
      {/* El componente QuizModal solo se renderizará cuando isQuizOpen sea true */}
      <QuizModal 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
      />
    </section>
  );
}