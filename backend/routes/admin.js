const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /stats - Get dashboard statistics
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const connection = await req.db.getConnection();
    try {
      // Get user count
      const [userCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = ?',
        ['user']
      );

      // Get provider count
      const [providerCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = ?',
        ['provider']
      );

      // Get booking count
      const [bookingCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM bookings'
      );

      // Get pending providers
      const [pendingProviders] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = ? AND is_approved = ?',
        ['provider', 0]
      );

      res.json({
        totalUsers: userCount[0].count,
        totalProviders: providerCount[0].count,
        totalBookings: bookingCount[0].count,
        pendingProviders: pendingProviders[0].count,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /users - Get all users
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const connection = await req.db.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT id, name, email, phone, role, specialization, is_approved, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
        ['user']
      );

      res.json(users);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /providers - Get all providers
router.get('/providers', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const connection = await req.db.getConnection();
    try {
      const [providers] = await connection.execute(
        'SELECT id, name, email, phone, specialization, is_approved, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
        ['provider']
      );

      res.json(providers);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// PUT /providers/:id/approve - Approve a provider
router.put('/providers/:id/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await req.db.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE users SET is_approved = 1 WHERE id = ? AND role = ?',
        [id, 'provider']
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      res.json({ message: 'Provider approved successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Approve provider error:', error);
    res.status(500).json({ error: 'Failed to approve provider' });
  }
});

// GET /bookings - Get all bookings
router.get('/bookings', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const connection = await req.db.getConnection();
    try {
      const [bookings] = await connection.execute(
        `SELECT b.*, 
                u1.name as user_name, u1.email as user_email,
                u2.name as provider_name, u2.email as provider_email
         FROM bookings b
         JOIN users u1 ON b.user_id = u1.id
         JOIN users u2 ON b.provider_id = u2.id
         ORDER BY b.created_at DESC`
      );

      res.json(bookings);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
