// frontend/components/Layout.tsx
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-primary min-h-screen flex flex-col font-sans">
      <Navbar />
      {/* Usamos un padding-top que coincida exactamente con la altura del Navbar */}
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}