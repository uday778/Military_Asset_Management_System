const express = require('express');
const router = express.Router();
const { store } = require('../config/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/audit — Admin only
router.get('/', authenticate, authorize('Admin'), (req, res) => {
  let logs = [...store.auditLogs];
  const { action, entity, performedBy, startDate, endDate, limit = 100 } = req.query;

  if (action) logs = logs.filter(l => l.action === action);
  if (entity) logs = logs.filter(l => l.entity === entity);
  if (performedBy) logs = logs.filter(l => l.performedBy === performedBy);
  if (startDate) logs = logs.filter(l => l.timestamp >= startDate);
  if (endDate) logs = logs.filter(l => l.timestamp <= endDate);

  // Sort newest first
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(logs.slice(0, Number(limit)));
});

module.exports = router;
