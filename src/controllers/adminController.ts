import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import pool from '../config/database';

class AdminController {
  getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Parallel queries for performance
    const [usersRes, restaurantsRes, reservationsRes, revenueRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM restaurants'),
      pool.query('SELECT COUNT(*) FROM reservations'),
      pool.query("SELECT SUM(amount) FROM payments WHERE payment_status = 'completed'")
    ]);

    const stats = {
      totalUsers: parseInt(usersRes.rows[0].count),
      totalRestaurants: parseInt(restaurantsRes.rows[0].count),
      totalReservations: parseInt(reservationsRes.rows[0].count),
      totalRevenue: parseFloat(revenueRes.rows[0].sum || '0')
    };

    res.json({
      success: true,
      data: stats
    });
  });

  getAllReservations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, search } = req.query;
    
    let query = `
      SELECT 
        r.id,
        r.reservation_date,
        r.reservation_time,
        r.guest_count,
        r.status,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        res.name as restaurant_name,
        CASE WHEN r.status = 'completed' THEN 70 ELSE 0 END as commission
      FROM reservations r
      JOIN users u ON r.customer_id = u.id
      JOIN restaurants res ON r.restaurant_id = res.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR res.name ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY r.reservation_date DESC, r.reservation_time DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  });

  getAllRestaurants = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Get restaurants with completed reservations count and total payouts
    const query = `
      WITH restaurant_stats AS (
        SELECT 
          r.restaurant_id,
          COUNT(*) as completed_reservations
        FROM reservations r
        WHERE r.status = 'completed'
        GROUP BY r.restaurant_id
      ),
      payout_stats AS (
        SELECT 
          restaurant_id,
          SUM(amount) as total_paid
        FROM restaurant_payouts
        GROUP BY restaurant_id
      )
      SELECT 
        res.id,
        res.name,
        res.is_active,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        COALESCE(rs.completed_reservations, 0) as completed_reservations,
        COALESCE(ps.total_paid, 0) as total_paid
      FROM restaurants res
      JOIN users u ON res.owner_id = u.id
      LEFT JOIN restaurant_stats rs ON res.id = rs.restaurant_id
      LEFT JOIN payout_stats ps ON res.id = ps.restaurant_id
      ORDER BY res.created_at DESC
    `;

    const result = await pool.query(query);

    const restaurants = result.rows.map(row => {
      const totalCommission = parseInt(row.completed_reservations) * 70;
      const commissionDue = totalCommission - parseFloat(row.total_paid);
      
      return {
        id: row.id,
        name: row.name,
        owner: `${row.owner_first_name} ${row.owner_last_name}`,
        isActive: row.is_active,
        completedReservations: parseInt(row.completed_reservations),
        commissionDue: Math.max(0, commissionDue)
      };
    });

    res.json({
      success: true,
      data: restaurants
    });
  });

  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.is_active,
        u.created_at,
        COUNT(r.id) as reservation_count
      FROM users u
      LEFT JOIN reservations r ON u.id = r.customer_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    const result = await pool.query(query);

    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: `${row.first_name} ${row.last_name}`,
      role: row.role,
      isActive: row.is_active,
      joinedAt: row.created_at,
      reservationCount: parseInt(row.reservation_count)
    }));

    res.json({
      success: true,
      data: users
    });
  });

  updateReservationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Reservation updated successfully'
    });
  });

  toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    // First check current status
    const check = await pool.query('SELECT is_active FROM users WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = !check.rows[0].is_active;

    await pool.query('UPDATE users SET is_active = $1 WHERE id = $2', [newStatus, id]);

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`
    });
  });

  markCommissionPaid = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params; // restaurantId
    
    // Calculate current due
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM reservations WHERE restaurant_id = $1 AND status = 'completed') * 30 as total_commission,
        (SELECT COALESCE(SUM(amount), 0) FROM restaurant_payouts WHERE restaurant_id = $1) as total_paid
    `;
    
    const stats = await pool.query(statsQuery, [id]);
    const due = parseFloat(stats.rows[0].total_commission) - parseFloat(stats.rows[0].total_paid);

    if (due <= 0) {
      return res.status(400).json({ success: false, message: 'No commission due' });
    }

    // Record payout
    await pool.query(
      'INSERT INTO restaurant_payouts (restaurant_id, amount) VALUES ($1, $2)',
      [id, due]
    );

    res.json({
      success: true,
      message: `Marked commission of ₱${due} as paid`
    });
  });
}

export default new AdminController();
