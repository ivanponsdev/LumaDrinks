/*_app.tsx*/
import { useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider, useCart, CartItem } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import { getServerCart, saveServerCart } from '../services/api';

function CartSync() {
  const { merge, items } = useCart();
  // undefined = estado inicial desconocido, null = anónimo, string = userId
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  // Evita escribir en DB hasta que el carrito esté hidratado desde el servidor
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Conocer el estado inicial ANTES de que lleguen eventos
    supabase.auth.getSession().then(({ data }) => {
      if (prevUserIdRef.current === undefined) {
        prevUserIdRef.current = data.session?.user?.id ?? null;
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id ?? null;

      // Solo cargar/mergear cuando la transición es null (anónimo) → userId (login real)
      if (newUserId !== null && prevUserIdRef.current === null) {
        const token = session!.access_token;
        getServerCart(token)
          .then((serverItems) => {
            if (serverItems.length > 0) merge(serverItems);
            hydratedRef.current = true;
          })
          .catch(() => {
            // Fallback a localStorage si el servidor no está disponible
            const userKey = `luma_cart_${newUserId}`;
            try {
              const saved = localStorage.getItem(userKey);
              if (saved) {
                const parsed = JSON.parse(saved) as CartItem[];
                if (parsed.length > 0) merge(parsed);
              }
            } catch { /* ignore */ }
            hydratedRef.current = true;
          });
      }

      if (newUserId === null) hydratedRef.current = false;
      prevUserIdRef.current = newUserId;
    });

    return () => listener.subscription.unsubscribe();
  }, [merge]);

  // Persistir carrito en DB + localStorage cuando cambia (solo logueado e hidratado)
  useEffect(() => {
    if (!hydratedRef.current) return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) return;
      localStorage.setItem(`luma_cart_${data.session.user.id}`, JSON.stringify(items));
      saveServerCart(items, data.session.access_token).catch(() => {});
    });
  }, [items]);

  return null;
}

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <CartSync />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}