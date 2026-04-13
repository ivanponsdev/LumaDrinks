import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getAdminPayments, AdminPayment } from '../../services/api';

export default function AdminPaymentsPage() {
  const { session, role } = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) { router.replace('/login?redirect=/admin/payments'); return; }
    if (role && role !== 'admin') { router.replace('/'); return; }
  }, [session, role, router]);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    getAdminPayments(session.access_token)
      .then(setPayments)
      .catch(() => setError('No se pudieron cargar los pagos.'))
      .finally(() => setLoading(false));
  }, [session]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-editorial text-brand-primary">Pagos</h1>
          <p className="text-sm text-brand-muted mt-1">Historial de pagos procesados por el simulador.</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-brand-muted text-sm">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Cargando...
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        {!loading && !error && payments.length === 0 && (
          <p className="text-sm text-brand-muted">Aún no hay pagos registrados.</p>
        )}

        {!loading && payments.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-brand-surface bg-white">
            <table className="w-full text-sm text-brand-primary">
              <thead>
                <tr className="border-b border-brand-surface text-xs uppercase tracking-widest text-brand-muted">
                  <th className="text-left px-5 py-3">ID pago</th>
                  <th className="text-left px-5 py-3">ID pedido</th>
                  <th className="text-right px-5 py-3">Importe</th>
                  <th className="text-center px-5 py-3">Estado</th>
                  <th className="text-center px-5 py-3">Tarjeta</th>
                  <th className="text-left px-5 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-brand-surface/50 last:border-0 hover:bg-brand-bg transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-brand-muted">{p.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3 font-mono text-xs text-brand-muted">
                      {p.order_id ? `${p.order_id.slice(0, 8)}…` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{Number(p.amount).toFixed(2)} €</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-xs">•••• {p.last4}</td>
                    <td className="px-5 py-3 text-xs text-brand-muted">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
