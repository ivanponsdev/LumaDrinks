/*NavBar.tsx*/
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartModal from './CartModal';
import QuizModal from './QuizModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <>
      <nav className="w-full bg-brand-bg border-b border-brand-surface fixed top-0 left-0 right-0 z-[100] shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* LOGO */}
        <div className="text-2xl font-bold text-brand-primary">
            <Link href="/" className='cursor-pointer'>
            Luma
            </Link>
        </div>
        {/* BOTÓN HAMBURGUESA (Solo se ve en móvil) */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-2xl focus:outline-none">
            {isOpen ? '✕' : '☰'} {/* Cambia el icono según el estado */}
          </button>
        </div>

        {/* LINKS ESCRITORIO */}
        <div className="hidden md:flex ml-auto mr-10 space-x-8 text-sm font-bold uppercase">
          <Link href="/about">POR QUÉ LUMA</Link>
          <Link href="/products">TIENDA</Link>
        </div>

        {/* ICONOS Y BOTÓN (Escritorio y Móvil) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <button onClick={handleLogout} className="text-sm font-semibold hover:text-brand-accent transition-colors" title={user.email}>
              👤 Salir
            </button>
          ) : (
            <Link href="/login" className="text-sm font-semibold hover:text-brand-accent transition-colors">
              👤 Entrar
            </Link>
          )}
          <button
            onClick={() => setCartOpen(true)}
            className="relative"
            aria-label="Abrir carrito"
          >
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setQuizOpen(true)}
            className="bg-brand-accent text-white px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Haz el Quiz
          </button>
        </div>
      </div>

      {/* 3. MENÚ DESPLEGABLE MÓVIL */}
      {/* Si isOpen es true, mostramos este div */}
      {isOpen && (
        <div className="md:hidden bg-brand-bg border-t border-brand-surface px-6 py-4 space-y-4 flex flex-col font-bold text-sm">
          <Link href="/about" onClick={() => setIsOpen(false)}>POR QUÉ LUMA</Link>
          <Link href="/products" onClick={() => setIsOpen(false)}>TIENDA</Link>
          <div className="flex space-x-4 pt-2">
            {user ? (
              <button onClick={handleLogout}>👤 Salir</button>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}>👤 Entrar</Link>
            )}
            <button onClick={() => { setCartOpen(true); setIsOpen(false); }}>🛒 Carrito{totalItems > 0 && ` (${totalItems})`}</button>
          </div>
        </div>
      )}
      </nav>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <QuizModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} />
    </>
  );
}