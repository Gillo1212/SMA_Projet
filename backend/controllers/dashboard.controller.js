const { query, queryOne } = require('../config/database');

/**
 * Chiffre d'affaires : commandes payées, hors annulées et remboursées
 * (une commande payée puis annulée ne doit pas gonfler les revenus).
 */
const REVENUE_FILTER = "payment_status = 'paid' AND status NOT IN ('cancelled','refunded')";
const THIS_MONTH = "created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')";
const LAST_MONTH = "created_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')";

/**
 * Compteurs du back-office (pastilles du menu, cloche) : requêtes légères,
 * interrogées régulièrement.
 * GET /api/dashboard/counters
 */
async function loadCounters() {
  const [orders, quotes, tickets] = await Promise.all([
    query('SELECT status, COUNT(*) AS n FROM orders GROUP BY status'),
    query('SELECT status, COUNT(*) AS n FROM quotes GROUP BY status'),
    queryOne("SELECT COUNT(*) AS n FROM support_tickets WHERE status IN ('open','in_progress')"),
  ]);
  const byStatus = rows => Object.fromEntries(rows.map(r => [r.status, Number(r.n)]));
  const o = byStatus(orders);
  const q = byStatus(quotes);
  // « À traiter » : statuts qui attendent une action de l'équipe
  return {
    orders_by_status: o,
    quotes_by_status: q,
    orders_new: o.pending ?? 0,
    orders_to_handle: (o.pending ?? 0) + (o.confirmed ?? 0) + (o.processing ?? 0),
    quotes_new: q.pending ?? 0,
    quotes_to_handle: (q.pending ?? 0) + (q.processing ?? 0),
    open_tickets: Number(tickets.n),
  };
}

exports.getCounters = async (req, res, next) => {
  try {
    res.json({ success: true, data: await loadCounters() });
  } catch (error) { next(error); }
};

/**
 * GET /api/dashboard/admin
 * Périodes en mois calendaires (mois en cours / mois précédent), pour que
 * « ce mois » et « vs mois précédent » comparent des périodes équivalentes.
 */
exports.getStats = async (req, res, next) => {
  try {
    const [totals, counters, clientsCount, machinesCount, recentOrders, monthlyRevenue] = await Promise.all([
      queryOne(`
        SELECT
          COALESCE(SUM(CASE WHEN ${REVENUE_FILTER} THEN total_amount END), 0) AS total_revenue,
          COALESCE(SUM(CASE WHEN ${REVENUE_FILTER} AND ${THIS_MONTH} THEN total_amount END), 0) AS month_revenue,
          COALESCE(SUM(CASE WHEN ${REVENUE_FILTER} AND ${LAST_MONTH} THEN total_amount END), 0) AS last_month_revenue,
          COUNT(*) AS total_orders,
          COUNT(CASE WHEN ${THIS_MONTH} THEN 1 END) AS month_orders,
          COUNT(CASE WHEN ${LAST_MONTH} THEN 1 END) AS last_month_orders
        FROM orders
      `),
      loadCounters(),
      queryOne('SELECT COUNT(*) AS count FROM clients WHERE is_active = 1'),
      queryOne('SELECT COUNT(*) AS count FROM machines WHERE is_active = 1'),
      query(`
        SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
               c.first_name, c.last_name, c.company_name
        FROM orders o LEFT JOIN clients c ON o.client_id = c.id
        ORDER BY o.created_at DESC LIMIT 5
      `),
      query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
               SUM(total_amount) AS revenue, COUNT(*) AS orders
        FROM orders WHERE ${REVENUE_FILTER} AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month ORDER BY month ASC
      `),
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          total_revenue: Number(totals.total_revenue),
          monthly_revenue: Number(totals.month_revenue),
          last_month_revenue: Number(totals.last_month_revenue),
          total_orders: Number(totals.total_orders),
          monthly_orders: Number(totals.month_orders),
          last_month_orders: Number(totals.last_month_orders),
          orders_to_handle: counters.orders_to_handle,
          active_clients: Number(clientsCount.count),
          active_machines: Number(machinesCount.count),
          pending_quotes: counters.quotes_new,
          quotes_to_handle: counters.quotes_to_handle,
          open_tickets: counters.open_tickets,
        },
        // Toutes les commandes, comme total_orders
        orders_by_status: counters.orders_by_status,
        recent_orders: recentOrders,
        monthly_revenue: monthlyRevenue,
      },
    });
  } catch (error) { next(error); }
};

exports.getClientDashboard = async (req, res, next) => {
  try {
    const clientId = req.user.id;

    const [ordersStats, machines, pendingInvoices, openTickets, recentOrders] = await Promise.all([
      query(`
        SELECT status, COUNT(*) AS count, SUM(total_amount) AS total
        FROM orders WHERE client_id = ? GROUP BY status
      `, [clientId]),
      query(`
        SELECT cm.*, m.name AS machine_name, m.image_url, m.brand
        FROM client_machines cm LEFT JOIN machines m ON cm.machine_id = m.id
        WHERE cm.client_id = ? ORDER BY cm.installation_date DESC LIMIT 6
      `, [clientId]),
      query("SELECT COUNT(*) AS count, SUM(amount_ttc) AS total FROM invoices WHERE client_id = ? AND status IN ('sent','overdue')", [clientId]),
      query("SELECT COUNT(*) AS count FROM support_tickets WHERE client_id = ? AND status IN ('open','in_progress')", [clientId]),
      query(`
        SELECT id, order_number, status, total_amount, payment_status, created_at
        FROM orders WHERE client_id = ? ORDER BY created_at DESC LIMIT 5
      `, [clientId]),
    ]);

    const statsMap = Object.fromEntries(ordersStats.map(s => [s.status, { count: s.count, total: s.total }]));
    // SUM() sur un DECIMAL revient en chaîne : sans Number() on concatène.
    const totalSpent = ordersStats.reduce(
      (sum, s) => sum + (s.status === 'delivered' ? Number(s.total || 0) : 0),
      0
    );

    res.json({
      success: true,
      data: {
        kpis: {
          total_orders: ordersStats.reduce((sum, s) => sum + s.count, 0),
          total_spent: totalSpent,
          active_machines: machines.filter(m => m.status === 'active').length,
          pending_invoices: pendingInvoices[0]?.count || 0,
          pending_invoices_amount: pendingInvoices[0]?.total || 0,
          open_tickets: openTickets[0]?.count || 0,
        },
        orders_by_status: statsMap,
        machines,
        recent_orders: recentOrders,
      },
    });
  } catch (error) { next(error); }
};
