/*ScienceModal.tsx*/
export default function ScienceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const ingredients = [
    {
      name: 'L-Teanina + Cafeína Natural',
      dose: '200 mg + 80 mg',
      icon: '⚡',
      claim: 'La sinergia más estudiada para el enfoque',
      detail:
        'La L-Teanina contrarresta la ansiedad de la cafeína sin reducir su efecto estimulante. El resultado: energía limpia, sin picos ni crash.',
    },
    {
      name: 'Bacopa Monnieri',
      dose: '300 mg (50 % bacósidos)',
      icon: '🧠',
      claim: 'Memoria y aprendizaje',
      detail:
        'Adaptógeno ayurvédico con más de 20 estudios clínicos que muestran mejoras en la velocidad de procesamiento mental y la retención de información.',
    },
    {
      name: 'Melena de León',
      dose: '500 mg',
      icon: '🍄',
      claim: 'Neuroplasticidad',
      detail:
        'Hericenones y erinacinas de este hongo funcional estimulan la producción de NGF (Factor de Crecimiento Nervioso), apoyando la creación de nuevas conexiones neuronales.',
    },
    {
      name: 'Ashwagandha KSM-66®',
      dose: '300 mg',
      icon: '🌿',
      claim: 'Control del estrés',
      detail:
        'El extracto de raíz más estudiado del mercado. Reduce los niveles de cortisol hasta un 27 % en 60 días según ensayos clínicos doble ciego.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-bg rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-brand-surface flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Formulación
            </span>
            <h2 className="text-3xl font-editorial text-brand-primary mt-1">
              La ciencia detrás de Luma
            </h2>
            <p className="text-brand-muted text-sm mt-2 leading-relaxed">
              Cada ingrediente seleccionado por su evidencia clínica, su forma biodisponible y su
              sinergia con el resto de la fórmula.
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

        {/* Ingredients */}
        <div className="px-8 py-6 space-y-5">
          {ingredients.map((ing) => (
            <div
              key={ing.name}
              className="bg-brand-surface rounded-xl p-5 flex gap-4 items-start"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{ing.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <span className="font-bold text-brand-primary">{ing.name}</span>
                  <span className="text-xs text-brand-muted bg-brand-bg px-2 py-0.5 rounded-full border border-brand-muted/30">
                    {ing.dose}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">
                  {ing.claim}
                </p>
                <p className="text-sm text-brand-muted leading-relaxed">{ing.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <p className="text-xs text-brand-muted text-center leading-relaxed">
            Todos los ingredientes en dosis clínicamente relevantes. Sin colorantes artificiales,
            sin edulcorantes sintéticos, sin rellenos.
          </p>
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="bg-brand-accent text-white px-8 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
