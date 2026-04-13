/*AboutSection.tsx*/
import { useState } from 'react';
import ScienceModal from './ScienceModal';

export default function AboutSection() {
  const [isScienceOpen, setIsScienceOpen] = useState(false);

  return (
    <section id="por-que" className="py-32 px-10 bg-brand-bg text-center">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Usamos font-editorial para el título y color brand-primary */}
        <h2 className="text-4xl font-editorial text-brand-primary tracking-tight">
          Menos ruido, más claridad
        </h2>
        
        {/* Cambiamos text-gray-600 por brand-muted para suavizar */}
        <p className="text-lg text-brand-muted leading-relaxed font-light">
          No somos solo una bebida. Somos una herramienta de equilibrio. 
          Nuestra fórmula utiliza nootrópicos naturales para elevar tu estado 
          mental sin la agitación del café tradicional.
        </p>
        
        <div className="pt-6">
          {/* Botón con el color acento de la marca y bordes suaves */}
          <button
            onClick={() => setIsScienceOpen(true)}
            className="border-2 border-brand-primary text-brand-primary px-10 py-3 rounded-full font-bold hover:bg-brand-primary hover:text-brand-bg transition-all duration-300 text-sm tracking-widest"
          >
            Descubrir la ciencia
          </button>
        </div>
      </div>

      <ScienceModal isOpen={isScienceOpen} onClose={() => setIsScienceOpen(false)} />
    </section>
  );
}