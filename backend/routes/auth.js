const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, specialization } = req.body;

    // Validate inputs
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await req.db.getConnection();
    try {
      // Check if user already exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      await connection.execute(
        'INSERT INTO users (name, email, password, phone, role, specialization, is_approved, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [name, email, hashedPassword, phone, role, specialization || null, role === 'provider' ? 0 : 1]
      );

      res.status(201).json({ message: 'User registered successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Admin hardcoded credentials
    if (email === 'admin@homeserve.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 0, email: 'admin@homeserve.com', role: 'admin', name: 'Admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: 0,
          name: 'Admin',
          email: 'admin@homeserve.com',
          role: 'admin',
        },
      });
    }

    const connection = await req.db.getConnection();
    try {
      // Find user by email
      const [users] = await connection.execute(
        'SELECT id, name, email, password, role, is_approved, specialization FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if provider is approved
      if (user.role === 'provider' && !user.is_approved) {
        return res.status(403).json({ error: 'Your account is pending approval' });
      }

      // Create JWT token
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
          is_approved: user.is_approved,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
