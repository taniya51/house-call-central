const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST / - Create a new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { provider_id, service, booking_date, booking_time, address, description } = req.body;
    const user_id = req.user.id;

    if (!provider_id || !service || !booking_date || !booking_time || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await req.db.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO bookings (user_id, provider_id, service, booking_date, booking_time, address, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [user_id, provider_id, service, booking_date, booking_time, address, description || null, 'pending']
      );

      res.status(201).json({
        message: 'Booking created successfully',
        bookingId: result.insertId,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /my - Get user's bookings
router.get('/my', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const connection = await req.db.getConnection();
    try {
      const [bookings] = await connection.execute(
        `SELECT b.*, u.name as provider_name, u.phone as provider_phone, u.specialization
         FROM bookings b
         JOIN users u ON b.provider_id = u.id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC`,
        [user_id]
      );

      res.json(bookings);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /provider - Get provider's bookings
router.get('/provider', verifyToken, async (req, res) => {
  try {
    const provider_id = req.user.id;

    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can access this' });
    }

    const connection = await req.db.getConnection();
    try {
      const [bookings] = await connection.execute(
        `SELECT b.*, u.name as user_name, u.phone as user_phone, u.email as user_email
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         WHERE b.provider_id = ?
         ORDER BY b.created_at DESC`,
        [provider_id]
      );

      res.json(bookings);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PUT /:id - Update booking status
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const connection = await req.db.getConnection();
    try {
      // Verify user owns the booking or is the provider
      const [bookings] = await connection.execute(
        'SELECT id, user_id, provider_id FROM bookings WHERE id = ?',
        [id]
      );

      if (bookings.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const booking = bookings[0];

      // Check authorization
      if (booking.user_id !== user_id && booking.provider_id !== user_id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await connection.execute(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id]
      );

      res.json({ message: 'Booking status updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

module.exports = router;
