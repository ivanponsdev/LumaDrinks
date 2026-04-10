/*QuizModal.tsx*/
import React, { useState } from 'react';

// Productos alineados con el enum real de Supabase
const PRODUCTS = {
  Enfoque: {
    id: 'luma-enfoque',
    name: 'Pack Enfoque Luma',
    desc: 'Ideal para jornadas intensas. Energía sostenida de 4-6 horas sin el crash del café.',
    tags: ['Cafeína Natural', 'L-Teanina', 'Bacopa'],
    color: 'border-yellow-500'
  },
  Memoria: {
    id: 'luma-memoria',
    name: 'Pack Memoria Luma',
    desc: 'Elimina la neblina mental y mejora tu memoria a corto plazo con hongos funcionales.',
    tags: ['Melena de León', 'Ginkgo Biloba', 'Sin Estimulantes'],
    color: 'border-blue-400'
  },
  Relax: {
    id: 'luma-relax',
    name: 'Pack Relax Luma',
    desc: 'Reduce el cortisol y el estrés. Control total bajo presión sin somnolencia.',
    tags: ['Ashwagandha', 'Magnesio', 'Relajación Activa'],
    color: 'border-green-500'
  },
  Energía: {
    id: 'luma-energia',
    name: 'Pack Energía Luma',
    desc: 'La alternativa perfecta al alcohol. Euforia natural para eventos y cenas.',
    tags: ['5-HTP', 'GABA', 'Mente Fresca'],
    color: 'border-orange-500'
  }
};

const QUESTIONS = [
  {
    text: "¿Cuál es tu principal objetivo hoy?",
    options: [
      { text: "Estudiar o trabajar intensamente", points: "Enfoque" },
      { text: "Quitarme la sensación de 'mente nublada'", points: "Memoria" },
      { text: "Gestionar el estrés y la ansiedad", points: "Relax" },
      { text: "Subir la energía para un evento o sesión intensa", points: "Energía" }
    ]
  },
  {
    text: "¿Cómo te sientes respecto a la cafeína?",
    options: [
      { text: "Me encanta, necesito el empújón", points: "Enfoque" },
      { text: "Prefiero evitarla, me pone nervioso/a", points: "Memoria" },
      { text: "Busco algo que equilibre mis nervios", points: "Relax" },
      { text: "No me importa, quiero máxima energía", points: "Energía" }
    ]
  }
];

export default function QuizModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ Enfoque: 0, Memoria: 0, Relax: 0, Energía: 0 });
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState("");
  const [couponSent, setCouponSent] = useState(false);

  if (!isOpen) return null;

  const handleAnswer = (point: string) => {
    setScores({ ...scores, [point]: scores[point as keyof typeof scores] + 1 });
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  // Lógica para obtener el producto ganador
  const winnerKey = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof typeof PRODUCTS;
  const result = PRODUCTS[winnerKey];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí conectarías con tu backend/newsletter
    setCouponSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

        {!showResult ? (
          <div className="animate-fadeIn">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Pregunta {step + 1}/{QUESTIONS.length}</span>
            <h2 className="text-2xl font-bold mt-2 mb-6">{QUESTIONS[step].text}</h2>
            <div className="space-y-3">
              {QUESTIONS[step].options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleAnswer(opt.points)}
                  className="w-full text-left p-4 border-2 border-gray-100 rounded-xl hover:border-black hover:bg-gray-50 transition-all font-medium"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center animate-scaleIn">
            <div className={`inline-block px-4 py-1 rounded-full border-2 ${result.color} text-xs font-bold mb-4 uppercase`}>
              Tu recomendación
            </div>
            <h2 className="text-3xl font-black mb-2">{result.name}</h2>
            <p className="text-gray-600 mb-6">{result.desc}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {result.tags.map(tag => (
                <span key={tag} className="bg-gray-100 px-3 py-1 rounded-md text-sm font-semibold italic">#{tag}</span>
              ))}
            </div>

            <button 
              onClick={() => window.location.href = `/tienda/${result.id}`}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity mb-8"
            >
              Ver Producto y Comprar
            </button>

            <div className="border-t pt-6">
              <p className="text-sm font-medium mb-4">🎁 ¡Consigue un 10% de descuento!</p>
              {!couponSent ? (
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Tu email..." 
                    className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit" className="bg-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-300">Enviar</button>
                </form>
              ) : (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg font-bold text-sm">
                  ¡Código enviado! Revisa tu bandeja de entrada.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}