/*NavBar.tsx*/
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartModal from './CartModal';
import QuizModal from './QuizModal';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cierra el dropdown si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setUserMenuOpen(false);
    await logout();
    router.push('/');
  }

  // Etiqueta del botón: nombre del usuario o primeros caracteres del email
  const userLabel = user?.user_metadata?.name
    ? user.user_metadata.name.split(' ')[0]
    : user?.email?.split('@')[0];

  return (
    <>
      <nav className="w-full bg-brand-bg border-b border-brand-surface fixed top-0 left-0 right-0 z-[100] shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">

          {/* LOGO */}
          <div className="text-2xl font-bold text-brand-primary">
            <Link href="/" className="cursor-pointer">Luma</Link>
          </div>

          {/* BOTÓN HAMBURGUESA (móvil) */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-2xl focus:outline-none">
              {isOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* LINKS ESCRITORIO */}
          <div className="hidden md:flex ml-auto mr-10 space-x-8 text-sm font-bold uppercase">
            <Link href="/about">POR QUÉ LUMA</Link>
            <Link href="/products">TIENDA</Link>
          </div>

          {/* ACCIONES ESCRITORIO */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Dropdown de usuario */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-accent transition-colors"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <span className="w-7 h-7 rounded-full bg-brand-surface border border-brand-muted/30 flex items-center justify-center text-xs font-bold uppercase">
                    {userLabel?.[0]}
                  </span>
                  <span>{userLabel}</span>
                  <svg className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-brand-surface py-1 z-50">
                    <div className="px-4 py-2 border-b border-brand-surface">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Cuenta</p>
                      <p className="text-xs text-brand-primary truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-brand-primary hover:bg-brand-surface transition-colors"
                    >
                      Mis pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold text-brand-primary hover:text-brand-accent transition-colors"
              >
                Acceder
              </Link>
            )}

            {/* Carrito */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-brand-surface/50 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              aria-label="Abrir carrito"
            >
              <ShoppingCartIcon className="w-6 h-6 text-brand-primary" aria-hidden="true" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {role === 'admin' && (
              <Link
                href="/admin/products"
                className="flex items-center gap-1.5 text-xs font-bold text-brand-muted border border-brand-surface px-3 py-2 rounded-full hover:bg-brand-surface transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </Link>
            )}

            <button
              onClick={() => setQuizOpen(true)}
              className="bg-brand-accent text-white px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Haz el Quiz
            </button>
          </div>
        </div>

        {/* MENÚ DESPLEGABLE MÓVIL */}
        {isOpen && (
          <div className="md:hidden bg-brand-bg border-t border-brand-surface px-6 py-4 space-y-4 flex flex-col font-bold text-sm">
            <Link href="/about" onClick={() => setIsOpen(false)}>POR QUÉ LUMA</Link>
            <Link href="/products" onClick={() => setIsOpen(false)}>TIENDA</Link>
            <div className="border-t border-brand-surface pt-4 space-y-3">
              {user ? (
                <>
                  <p className="text-[10px] uppercase tracking-widest text-brand-muted">{user.email}</p>
                  <Link href="/orders" onClick={() => setIsOpen(false)} className="block">Mis pedidos</Link>
                  {role === 'admin' && (
                    <Link href="/admin/products" onClick={() => setIsOpen(false)} className="block text-brand-muted">Panel admin</Link>
                  )}
                  <button onClick={handleLogout} className="text-red-500">Cerrar sesión</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)}>Acceder</Link>
              )}
              <button
                onClick={() => { setCartOpen(true); setIsOpen(false); }}
                className="relative flex items-center gap-2 focus:outline-none"
                aria-label="Abrir carrito"
              >
                <ShoppingCartIcon className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                <span>Carrito</span>
                {totalItems > 0 && (
                  <span className="ml-1 bg-brand-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <QuizModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} />
    </>
  );
}