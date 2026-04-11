import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, Order, OrderItem } from '../services/api';

export default function OrdersPage() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getMyOrders(session.access_token)
      .then(setOrders)
      .catch(() => setError('No se pudieron cargar tus pedidos.'))
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-brand-muted mb-4">Debes iniciar sesión para ver tus pedidos.</p>
          <Link
            href="/login"
            className="inline-block bg-brand-accent text-brand-bg px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity text-sm uppercase tracking-widest"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-editorial text-brand-primary mb-2 tracking-tight">
          Mis pedidos
        </h1>
        <p className="text-brand-muted text-sm mb-10">Historial de todas tus compras</p>

        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-brand-surface border-t-brand-accent animate-spin" />
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-brand-muted py-16">{error}</p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-24">
            <p className="text-brand-muted mb-6">Aún no tienes pedidos.</p>
            <Link
              href="/products"
              className="inline-block bg-brand-accent text-brand-bg px-6 py-2 rounded-full font-bold hover:opacity-90 transition-opacity text-sm uppercase tracking-widest"
            >
              Explorar tienda
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <ul className="space-y-6">
            {orders.map((order) => (
              <li
                key={order.id}
                className="bg-brand-surface rounded-2xl border border-brand-muted/20 p-6"
              >
                {/* Cabecera del pedido */}
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">
                      Referencia
                    </p>
                    <p className="font-mono text-xs text-brand-primary break-all">{order.id}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">
                      Fecha
                    </p>
                    <p className="text-xs text-brand-primary">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <ul className="divide-y divide-brand-muted/10 mb-4">
                  {(order.items as OrderItem[]).map((item, i) => (
                    <li key={i} className="flex justify-between py-2 text-sm text-brand-primary">
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

                {/* Total y estado */}
                <div className="flex items-center justify-between pt-3 border-t border-brand-muted/20">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      order.status === 'pending'
                        ? 'bg-brand-accent/10 text-brand-accent'
                        : 'bg-brand-surface text-brand-muted'
                    }`}
                  >
                    {order.status === 'pending' ? 'En proceso' : order.status}
                  </span>
                  <span className="font-bold text-brand-primary">
                    {Number(order.total).toFixed(2)} €
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
