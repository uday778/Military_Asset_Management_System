const express = require('express');
const router = express.Router();
const { store, uuidv4 } = require('../config/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/assignments
router.get('/', authenticate, (req, res) => {
  let results = [...store.assignments, ...store.expenditures.map(e => ({ ...e, recordType: 'expenditure' }))];
  const { base, type, recordType } = req.query;

  if (req.user.role !== 'Admin') {
    results = results.filter(r => r.base === req.user.base);
  } else if (base) {
    results = results.filter(r => r.base === base);
  }

  if (type) results = results.filter(r => r.type === type);

  res.json({
    assignments: store.assignments.filter(a => !base || a.base === base || req.user.role !== 'Admin'),
    expenditures: store.expenditures.filter(e => !base || e.base === base || req.user.role !== 'Admin'),
  });
});

// POST /api/assignments — assignment
router.post('/assign', authenticate, authorize('Admin', 'Base Commander'), (req, res) => {
  const { assetName, type, base, assignedTo, quantity, purpose, returnDate } = req.body;
  if (!assetName || !type || !base || !assignedTo || !quantity || !purpose) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check inventory
  const asset = store.assets.find(a => a.name === assetName && a.base === base);
  if (!asset || asset.quantity < Number(quantity)) {
    return res.status(400).json({ message: 'Insufficient quantity' });
  }

  const assignment = {
    _id: uuidv4(),
    assetName, type, base,
    assignedTo,
    quantity: Number(quantity),
    assignmentDate: new Date().toISOString().split('T')[0],
    returnDate: returnDate || null,
    status: 'Active',
    purpose,
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
  };
  store.assignments.push(assignment);
  asset.quantity -= Number(quantity);

  store.addAuditLog('ASSIGNMENT', 'Assignment', assignment._id, req.user.username,
    `Assigned ${quantity}x ${assetName} to ${assignedTo} at ${base}`);

  res.status(201).json(assignment);
});

// POST /api/assignments/return — return assigned asset
router.post('/return/:id', authenticate, authorize('Admin', 'Base Commander'), (req, res) => {
  const assignment = store.assignments.find(a => a._id === req.params.id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  if (assignment.status !== 'Active') return res.status(400).json({ message: 'Assignment not active' });

  assignment.status = 'Returned';
  assignment.returnedAt = new Date().toISOString();

  // Return to inventory
  const asset = store.assets.find(a => a.name === assignment.assetName && a.base === assignment.base);
  if (asset) asset.quantity += assignment.quantity;

  store.addAuditLog('RETURN', 'Assignment', assignment._id, req.user.username,
    `Returned ${assignment.quantity}x ${assignment.assetName}`);

  res.json(assignment);
});

// POST /api/assignments/expenditure — record ammo/supply expenditure
router.post('/expenditure', authenticate, authorize('Admin', 'Base Commander', 'Logistics Officer'), (req, res) => {
  const { assetName, type, base, quantity, purpose, notes } = req.body;
  if (!assetName || !type || !base || !quantity || !purpose) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const asset = store.assets.find(a => a.name === assetName && a.base === base);
  if (!asset || asset.quantity < Number(quantity)) {
    return res.status(400).json({ message: 'Insufficient quantity for expenditure' });
  }

  const expenditure = {
    _id: uuidv4(),
    assetName, type, base,
    quantity: Number(quantity),
    expenditureDate: new Date().toISOString().split('T')[0],
    purpose,
    authorizedBy: req.user.username,
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
  store.expenditures.push(expenditure);
  asset.quantity -= Number(quantity);

  store.addAuditLog('EXPENDITURE', 'Expenditure', expenditure._id, req.user.username,
    `Expended ${quantity}x ${assetName} at ${base} — ${purpose}`);

  res.status(201).json(expenditure);
});

module.exports = router;
