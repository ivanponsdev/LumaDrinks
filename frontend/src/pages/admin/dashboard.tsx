/* pages/admin/dashboard.tsx — Admin Dashboard */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminStats, getAdminOrders,
  AdminStats, AdminOrder, AdminNonBuyer,
} from '../../services/api';

// ── Colores brand ────────────────────────────────────────────
const C = {
  accent:  '#7A8F7C',
  primary: '#2B2B2B',
  muted:   '#B7A89A',
  surface: '#E8E1D9',
  bg:      '#F7F5F2',
};
const SOURCE_COLORS: Record<string, string> = {
  instagram: '#C13584',
  google:    '#4285F4',
  direct:    '#B7A89A',
  tiktok:    '#010101',
  email:     '#7A8F7C',
};

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

// ── Sub-components ───────────────────────────────────────────
function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-surface p-6 flex flex-col gap-1 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">{label}</p>
      <p className="text-3xl font-editorial text-brand-primary">{value}</p>
      {sub && <p className="text-xs text-brand-muted">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">
      {children}
    </h2>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { session, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats]   = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { router.replace('/login?redirect=/admin/dashboard'); return; }

    Promise.all([
      getAdminStats(session.access_token),
      getAdminOrders(session.access_token, 20),
    ])
      .then(([s, o]) => { setStats(s); setOrders(o); })
      .catch((e) => {
        if (e?.response?.status === 403) setError('Acceso restringido a administradores.');
        else setError('Error al cargar los datos del dashboard.');
      })
      .finally(() => setLoading(false));
  }, [session]);

  if (authLoading || loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-brand-surface border-t-brand-accent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-brand-primary font-semibold mb-2">{error}</p>
        <p className="text-brand-muted text-sm">Sesión: {user?.email}</p>
      </div>
    </div>
  );

  if (!stats) return null;

  const { summary, topProducts, bySource, dailySales, statusBreakdown, customerMetrics, recentNonBuyers } = stats;
  const conversionRate = customerMetrics.registered_count > 0
    ? ((customerMetrics.converted_count / customerMetrics.registered_count) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <div className="bg-white border-b border-brand-surface px-8 py-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Panel de administración</p>
          <h1 className="text-2xl font-editorial text-brand-primary">Dashboard Luma</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-brand-muted">Sesión como</p>
          <p className="text-sm font-semibold text-brand-primary">{user?.email}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-12">

        {/* ── KPIs ── */}
        <div>
          <SectionTitle>Resumen general</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard label="Revenue total"   value={fmt(Number(summary.total_revenue))} />
            <KpiCard label="Pedidos totales" value={String(summary.total_orders)} />
            <KpiCard label="Ticket medio"    value={fmt(Number(summary.avg_order))} />
            <KpiCard label="Revenue 30d"     value={fmt(Number(summary.revenue_30d))} />
            <KpiCard label="Pedidos 30d"     value={String(summary.last_30d)} sub="último mes" />
            <KpiCard label="Pedidos 7d"      value={String(summary.last_7d)}  sub="última semana" />
          </div>
        </div>

        {/* ── Ventas diarias ── */}
        <div>
          <SectionTitle>Ventas diarias — últimos 30 días</SectionTitle>
          <div className="bg-white rounded-2xl border border-brand-surface p-6 shadow-sm">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailySales} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.accent} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.surface} />
                <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 10, fill: C.muted }} />
                <YAxis tickFormatter={(v) => `${v}€`} tick={{ fontSize: 10, fill: C.muted }} width={48} />
                <Tooltip
                  formatter={(v: number) => [fmt(v), 'Revenue']}
                  labelFormatter={fmtDay}
                  contentStyle={{ borderRadius: 12, border: `1px solid ${C.surface}`, fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={C.accent}
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Top productos + Estado ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Top productos */}
          <div>
            <SectionTitle>Top productos por revenue</SectionTitle>
            <div className="bg-white rounded-2xl border border-brand-surface shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-surface bg-brand-bg">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Producto</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Pedidos</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i} className="border-b border-brand-surface/50 hover:bg-brand-bg/50 transition-colors">
                      <td className="px-5 py-3 text-brand-primary font-medium truncate max-w-[180px]">{p.name}</td>
                      <td className="px-5 py-3 text-right text-brand-muted">{p.orders}</td>
                      <td className="px-5 py-3 text-right font-semibold text-brand-primary">{fmt(Number(p.revenue))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Estado de pedidos */}
          <div>
            <SectionTitle>Estado de pedidos</SectionTitle>
            <div className="bg-white rounded-2xl border border-brand-surface p-6 shadow-sm h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusBreakdown.map((_, i) => (
                      <Cell
                        key={i}
                        fill={[C.accent, C.primary, C.muted, C.surface][i % 4]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 11, color: C.primary }}>{v}</span>}
                  />
                  <Tooltip
                    formatter={(v: number, n: string) => [v + ' pedidos', n]}
                    contentStyle={{ borderRadius: 12, border: `1px solid ${C.surface}`, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Atribución UTM ── */}
        <div>
          <SectionTitle>Atribución por canal (utm_source)</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Barchart */}
            <div className="bg-white rounded-2xl border border-brand-surface p-6 shadow-sm">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={bySource} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.surface} horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `${v}€`} tick={{ fontSize: 10, fill: C.muted }} />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: C.primary }} width={72} />
                  <Tooltip
                    formatter={(v: number) => [fmt(v), 'Revenue']}
                    contentStyle={{ borderRadius: 12, border: `1px solid ${C.surface}`, fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {bySource.map((s, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[s.source] ?? C.accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla detalle */}
            <div className="bg-white rounded-2xl border border-brand-surface shadow-sm overflow-hidden self-start">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-surface bg-brand-bg">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Canal</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Pedidos</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bySource.map((s, i) => {
                    const total = bySource.reduce((acc, x) => acc + Number(x.revenue), 0);
                    const pct = total > 0 ? Math.round((Number(s.revenue) / total) * 100) : 0;
                    return (
                      <tr key={i} className="border-b border-brand-surface/50 hover:bg-brand-bg/50 transition-colors">
                        <td className="px-5 py-3 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: SOURCE_COLORS[s.source] ?? C.accent }}
                          />
                          <span className="font-medium text-brand-primary capitalize">{s.source}</span>
                        </td>
                        <td className="px-5 py-3 text-right text-brand-muted">{s.orders}</td>
                        <td className="px-5 py-3 text-right">
                          <span className="font-semibold text-brand-primary">{fmt(Number(s.revenue))}</span>
                          <span className="ml-2 text-[10px] text-brand-muted">{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Métricas de clientes ── */}
        <div>
          <SectionTitle>Clientes y conversión</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KpiCard
              label="Registrados"
              value={String(customerMetrics.registered_count)}
              sub="total usuarios"
            />
            <KpiCard
              label="Han comprado"
              value={String(customerMetrics.converted_count)}
              sub={`${conversionRate}% conversión`}
            />
            <KpiCard
              label="Sin compra"
              value={String(customerMetrics.registered_no_orders_count)}
              sub="registrados inactivos"
            />
            <KpiCard
              label="Días 1ª compra"
              value={`${Number(customerMetrics.avg_days_to_first_purchase).toFixed(1)}d`}
              sub="tiempo medio"
            />
          </div>

          {/* Tabla de no-compradores */}
          <div className="bg-white rounded-2xl border border-brand-surface shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-surface bg-brand-bg flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                Últimos registrados sin compra — {recentNonBuyers.length} usuarios
              </p>
              <span className="text-[10px] text-brand-muted italic">Solo visible para admins</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-surface">
                  <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Email</th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Registrado</th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Días sin comprar</th>
                </tr>
              </thead>
              <tbody>
                {recentNonBuyers.map((u: AdminNonBuyer) => {
                  const daysSince = Math.floor(
                    (Date.now() - new Date(u.created_at).getTime()) / 86400000
                  );
                  return (
                    <tr key={u.id} className="border-b border-brand-surface/50 hover:bg-brand-bg/50 transition-colors">
                      <td className="px-5 py-3 text-brand-primary">{u.email}</td>
                      <td className="px-5 py-3 text-right text-brand-muted text-xs">
                        {new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-xs font-semibold ${
                          daysSince > 30 ? 'text-red-400' :
                          daysSince > 7  ? 'text-yellow-500' :
                                           'text-brand-accent'
                        }`}>
                          {daysSince}d
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Últimos pedidos ── */}
        <div>
          <SectionTitle>Últimos 20 pedidos</SectionTitle>
          <div className="bg-white rounded-2xl border border-brand-surface shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-brand-surface bg-brand-bg">
                  {['Referencia', 'Cliente', 'Canal', 'Campaña', 'Total', 'Estado', 'Fecha'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-brand-surface/50 hover:bg-brand-bg/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-[10px] text-brand-muted truncate max-w-[100px]">
                      {o.id.split('-')[0]}…
                    </td>
                    <td className="px-5 py-3 text-brand-primary truncate max-w-[140px]">{o.customer_email}</td>
                    <td className="px-5 py-3">
                      {o.utm_source ? (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: SOURCE_COLORS[o.utm_source] ?? C.accent }}
                          />
                          <span className="capitalize text-brand-primary">{o.utm_source}</span>
                        </span>
                      ) : (
                        <span className="text-brand-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-brand-muted text-xs">{o.utm_campaign ?? '—'}</td>
                    <td className="px-5 py-3 font-semibold text-brand-primary whitespace-nowrap">
                      {fmt(Number(o.total_paid))}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        o.status === 'Entregado' ? 'bg-brand-accent/10 text-brand-accent' :
                        o.status === 'Enviado'   ? 'bg-blue-50 text-blue-500' :
                        o.status === 'Pagado'    ? 'bg-brand-surface text-brand-primary' :
                                                   'bg-yellow-50 text-yellow-600'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-muted text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
