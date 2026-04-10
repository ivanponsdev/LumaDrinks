// src/data/products.ts
export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  category: 'A' | 'B' | 'C' | 'D';
  color: string; // Color para el borde o detalles
  benefits: string[];
}

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'luma-focus',
    name: 'Pack Focus Luma',
    price: '29.99€',
    category: 'A',
    color: 'border-yellow-500',
    description: 'Enfoque láser con Cafeína natural y L-Teanina. Energía sin nervios.',
    benefits: ['4-6h Energía', 'Sin bajones', 'Mejora el estudio']
  },
  {
    id: 'luma-clarity',
    name: 'Pack Clarity Luma',
    price: '34.99€',
    category: 'B',
    color: 'border-blue-400',
    description: 'Elimina la neblina mental con hongos funcionales y Melena de León.',
    benefits: ['Memoria', 'Agilidad mental', 'Sin cafeína']
  },
  {
    id: 'luma-zen',
    name: 'Pack Zen Luma',
    price: '32.99€',
    category: 'C',
    color: 'border-green-500',
    description: 'Reduce el estrés y mantén el control bajo presión con Ashwagandha.',
    benefits: ['Baja el cortisol', 'Calma centrada', 'Bienestar']
  },
  {
    id: 'luma-social',
    name: 'Pack Social Luma',
    price: '39.99€',
    category: 'D',
    color: 'border-purple-500',
    description: 'La alternativa natural al alcohol para brillar en tus eventos sociales.',
    benefits: ['Euforia leve', 'Desinhibición', 'Mañanas frescas']
  }
];