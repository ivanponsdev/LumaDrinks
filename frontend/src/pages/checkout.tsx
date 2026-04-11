import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';

export default function CheckoutPage() {
  const { user, session } = useAuth();
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState(user?.user_metadata?.name ?? '');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-brand-muted mb-4">Debes iniciar sesión para realizar tu pedido.</p>
          <Link
            href="/login"
            className="inline-block bg-brand-accent text-brand-bg px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-brand-muted mb-4">Tu carrito está vacío.</p>
          <Link
            href="/products"
            className="inline-block bg-brand-accent text-brand-bg px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      setError('La dirección de envío es obligatoria.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const order = await createOrder(items, totalPrice, session!.access_token);
      clear();
      router.push(`/order-confirmation?orderId=${order.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-editorial text-brand-primary mb-8">Finalizar pedido</h1>

        <div className="grid gap-8 md:grid-cols-5">
          {/* ---- Form ---- */}
          <form onSubmit={handleSubmit} noValidate className="md:col-span-3 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full border border-brand-surface rounded-xl px-4 py-2.5 text-sm bg-white text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full border border-brand-surface rounded-xl px-4 py-2.5 text-sm bg-brand-surface text-brand-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">
                Dirección de envío
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, ciudad, código postal"
                rows={3}
                required
                className="w-full border border-brand-surface rounded-xl px-4 py-2.5 text-sm bg-white text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-accent text-brand-bg py-3.5 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
            >
              {loading ? 'Procesando...' : `Confirmar pedido — ${totalPrice.toFixed(2)} €`}
            </button>
          </form>

          {/* ---- Order summary ---- */}
          <div className="md:col-span-2">
            <div className="bg-brand-surface rounded-2xl border border-brand-muted/20 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">Resumen</h2>
              <ul className="space-y-3 text-sm text-brand-primary">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.name}{' '}
                      <span className="text-brand-muted">×{item.quantity}</span>
                    </span>
                    <span className="font-medium">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-brand-muted/20 mt-4 pt-4 flex justify-between font-bold text-brand-primary">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
