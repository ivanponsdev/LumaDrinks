/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luma brand palette — from identidad-marketing.md
        'brand-bg':        '#F7F5F2', // off-white — fondo principal
        'brand-surface':   '#E8E1D9', // beige — tarjetas y bloques
        'brand-muted':     '#B7A89A', // marrón claro — textos secundarios
        'brand-primary':   '#2B2B2B', // negro suave — textos principales
        'brand-accent':    '#7A8F7C', // verde desaturado — CTAs, hover, detalles
      },
      fontFamily: {
        // Luma typography — from identidad-marketing.md
        sans: ['Inter', 'Helvetica Neue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        editorial: ['Playfair Display', 'Canela', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
}