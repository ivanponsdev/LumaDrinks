// Mapeo de categoría de producto → imagen local en /public/images/
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  // Enfoque / Focus
  'Enfoque': '/images/LumaFocus.png',
  'Focus': '/images/LumaFocus.png',
  // Energía
  'Energía': '/images/EnergiaLuma.png',
  'Energia': '/images/EnergiaLuma.png',
  'Energy': '/images/EnergiaLuma.png',
  'Social': '/images/EnergiaLuma.png',
  // Relax / Zen
  'Relax': '/images/LumaRelax.png',
  'Zen': '/images/LumaRelax.png',
  // Memoria / Claridad (4º producto - botella Equilibrio Mental)
  'Memoria': '/images/LumaHero.png',
  'Claridad': '/images/LumaHero.png',
  'Clarity': '/images/LumaHero.png',
};

const FALLBACK_IMAGE = '/images/LumaHero.png';

export function getProductImage(category: string): string {
  return CATEGORY_IMAGE_MAP[category] ?? FALLBACK_IMAGE;
}
