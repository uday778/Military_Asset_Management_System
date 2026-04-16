const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { store, uuidv4 } = require('../config/store');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const user = store.users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role, base: user.base, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  store.addAuditLog('LOGIN', 'User', user._id, user.username, `User ${user.username} logged in`);

  res.json({
    token,
    user: { id: user._id, username: user.username, role: user.role, base: user.base, name: user.name }
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = store.users.find(u => u._id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user._id, username: user.username, role: user.role, base: user.base, name: user.name });
});

// GET /api/auth/users (Admin only — for user management page)
router.get('/users', authenticate, (req, res) => {
  const users = store.users.map(({ password, ...u }) => u);
  res.json(users);
});

module.exports = router;
