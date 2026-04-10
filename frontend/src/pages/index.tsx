/*index.tsx*/
import Hero from '../components/Hero';
import ProductSection from '../components/ProductSection';

export default function Home() {
  return (
    <>
      <Hero />           {/* 1. Presentación + Botón Quiz */}
      <ProductSection /> {/* 3. La tienda con las viñetas */}
    </>
  );
}