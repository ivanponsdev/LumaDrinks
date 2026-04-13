import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(@Inject('DATABASE_POOL') private db: any) {}

  async getStats() {
    const [revenue, period, topProducts, bySource, daily, statusBreakdown, customerMetrics, recentNonBuyers] =
      await Promise.all([
        // Revenue total, ticket medio y total de pedidos
        this.db.query(`
          SELECT
            COALESCE(SUM(total_paid), 0)::numeric  AS total_revenue,
            COALESCE(AVG(total_paid), 0)::numeric  AS avg_order,
            COUNT(*)::int                           AS total_orders
          FROM public.orders
        `),
        // Pedidos últimos 7 y 30 días
        this.db.query(`
          SELECT
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int  AS last_7d,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last_30d,
            COALESCE(SUM(total_paid) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0)::numeric AS revenue_30d
          FROM public.orders
        `),
        // Top 5 productos por revenue (extraídos de items jsonb)
        this.db.query(`
          SELECT
            item->>'name'                           AS name,
            COUNT(*)::int                           AS orders,
            SUM((item->>'price')::numeric)::numeric AS revenue
          FROM public.orders,
               jsonb_array_elements(items) AS item
          GROUP BY item->>'name'
          ORDER BY revenue DESC
          LIMIT 5
        `),
        // Atribución por utm_source
        this.db.query(`
          SELECT
            COALESCE(utm_source, 'direct') AS source,
            COUNT(*)::int                  AS orders,
            SUM(total_paid)::numeric       AS revenue
          FROM public.orders
          GROUP BY utm_source
          ORDER BY revenue DESC
        `),
        // Ventas diarias últimos 30 días
        this.db.query(`
          SELECT
            DATE(created_at)         AS day,
            COUNT(*)::int            AS orders,
            SUM(total_paid)::numeric AS revenue
          FROM public.orders
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY day ASC
        `),
        // Breakdown por estado
        this.db.query(`
          SELECT status::text, COUNT(*)::int AS count
          FROM public.orders
          GROUP BY status
          ORDER BY count DESC
        `),
        // Métricas de clientes: registrados, convertidos, sin compra
        this.db.query(`
          SELECT
            (SELECT COUNT(*)::int FROM public.users WHERE email IS NOT NULL AND role <> 'admin') AS registered_count,
            (SELECT COUNT(DISTINCT customer_id)::int FROM public.orders) AS converted_count,
            (SELECT COUNT(*)::int
               FROM public.users u
               LEFT JOIN public.orders o ON u.id = o.customer_id
               WHERE o.id IS NULL AND u.email IS NOT NULL AND u.role <> 'admin'
            ) AS registered_no_orders_count,
            (SELECT COALESCE(AVG(gap_days), 0)::numeric(10,2)
               FROM (
                 -- Calculamos days to first purchase, pero evitamos valores negativos
                 SELECT CASE
                          WHEN MIN(o.created_at) > u.created_at
                            THEN EXTRACT(EPOCH FROM (MIN(o.created_at) - u.created_at))/86400
                          ELSE 0
                        END AS gap_days
                 FROM public.users u
                 JOIN public.orders o ON u.id = o.customer_id
                 GROUP BY u.id
               ) t
            ) AS avg_days_to_first_purchase
        `),
        // Lista de últimos 25 registrados sin compra (para segmentación)
        this.db.query(`
          SELECT u.id, u.email, u.created_at
          FROM public.users u
          LEFT JOIN public.orders o ON u.id = o.customer_id
          WHERE o.id IS NULL AND u.email IS NOT NULL AND u.role <> 'admin'
          ORDER BY u.created_at DESC
          LIMIT 25
        `),
      ]);

    return {
      summary: {
        ...revenue.rows[0],
        ...period.rows[0],
      },
      topProducts:     topProducts.rows,
      bySource:        bySource.rows,
      dailySales:      daily.rows,
      statusBreakdown: statusBreakdown.rows,
      customerMetrics: customerMetrics.rows[0],
      recentNonBuyers: recentNonBuyers.rows,
    };
  }

  async getOrders(limit = 50, offset = 0) {
    const result = await this.db.query(
      `SELECT
         o.id,
         o.total_paid,
         o.status::text,
         o.utm_source,
         o.utm_medium,
         o.utm_campaign,
         o.created_at,
         u.email AS customer_email,
         o.items
       FROM public.orders o
       LEFT JOIN public.users u ON u.id = o.customer_id
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return result.rows;
  }
}
