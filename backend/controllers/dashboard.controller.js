const { query, queryOne } = require('../config/database');

exports.getStats = async (req, res, next) => {
  try {
    const [
      ordersStats, revenueStats, clientsCount,
      machinesCount, quotesCount, ticketsCount,
      recentOrders, monthlyRevenue
    ] = await Promise.all([
      query(`
        SELECT status, COUNT(*) AS count FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY status
      `),
      query(`
        SELECT
          SUM(CASE WHEN payment_status='paid' THEN total_amount ELSE 0 END) AS total_revenue,
          SUM(CASE WHEN payment_status='paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total_amount ELSE 0 END) AS monthly_revenue,
          COUNT(*) AS total_orders,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) AS monthly_orders
        FROM orders
      `),
      queryOne('SELECT COUNT(*) AS count FROM clients WHERE is_active = 1'),
      queryOne('SELECT COUNT(*) AS count FROM machines WHERE is_active = 1'),
      queryOne("SELECT COUNT(*) AS count FROM quotes WHERE status = 'pending'"),
      queryOne("SELECT COUNT(*) AS count FROM support_tickets WHERE status IN ('open','in_progress')"),
      query(`
        SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
               c.first_name, c.last_name, c.company_name
        FROM orders o LEFT JOIN clients c ON o.client_id = c.id
        ORDER BY o.created_at DESC LIMIT 5
      `),
      query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
               SUM(total_amount) AS revenue, COUNT(*) AS orders
        FROM orders WHERE payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month ORDER BY month ASC
      `),
    ]);

    const ordersByStatus = Object.fromEntries(ordersStats.map(s => [s.status, s.count]));

    res.json({
      success: true,
      data: {
        kpis: {
          total_revenue: revenueStats.total_revenue || 0,
          monthly_revenue: revenueStats.monthly_revenue || 0,
          total_orders: revenueStats.total_orders || 0,
          monthly_orders: revenueStats.monthly_orders || 0,
          active_clients: clientsCount.count || 0,
          active_machines: machinesCount.count || 0,
          pending_quotes: quotesCount.count || 0,
          open_tickets: ticketsCount.count || 0,
        },
        orders_by_status: ordersByStatus,
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
    const totalSpent = ordersStats.reduce((sum, s) => sum + (s.status === 'delivered' ? (s.total || 0) : 0), 0);

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
