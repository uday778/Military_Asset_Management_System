const express = require('express');
const router = express.Router();
const { store, uuidv4 } = require('../config/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/purchases
router.get('/', authenticate, (req, res) => {
  let purchases = [...store.purchases];
  const { base, type, startDate, endDate } = req.query;

  if (req.user.role !== 'Admin') {
    purchases = purchases.filter(p => p.base === req.user.base);
  } else if (base) {
    purchases = purchases.filter(p => p.base === base);
  }

  if (type) purchases = purchases.filter(p => p.type === type);
  if (startDate) purchases = purchases.filter(p => p.purchaseDate >= startDate);
  if (endDate) purchases = purchases.filter(p => p.purchaseDate <= endDate);

  // Sort newest first
  purchases.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
  res.json(purchases);
});

// POST /api/purchases — Admin & Logistics Officer
router.post('/', authenticate, authorize('Admin', 'Logistics Officer'), (req, res) => {
  const { assetName, type, base, quantity, unitCost, supplier, purchaseDate, notes } = req.body;
  if (!assetName || !type || !base || !quantity || !unitCost) {
    return res.status(400).json({ message: 'assetName, type, base, quantity, unitCost required' });
  }

  const totalCost = Number(quantity) * Number(unitCost);
  const purchase = {
    _id: uuidv4(),
    assetName, type, base,
    quantity: Number(quantity),
    unitCost: Number(unitCost),
    totalCost,
    supplier: supplier || 'Unknown',
    purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
    notes: notes || '',
    createdBy: req.user.username,
    createdAt: new Date().toISOString(),
  };
  store.purchases.push(purchase);

  // Update or create asset inventory
  const existing = store.assets.find(a => a.name === assetName && a.base === base);
  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    store.assets.push({
      _id: uuidv4(),
      name: assetName, type, base,
      quantity: Number(quantity),
      status: 'Operational',
    });
  }

  store.addAuditLog('PURCHASE', 'Purchase', purchase._id, req.user.username,
    `Purchased ${quantity}x ${assetName} for ${base} — $${totalCost}`);

  res.status(201).json(purchase);
});

// DELETE /api/purchases/:id — Admin only
router.delete('/:id', authenticate, authorize('Admin'), (req, res) => {
  const idx = store.purchases.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Purchase not found' });
  store.purchases.splice(idx, 1);
  res.json({ message: 'Purchase deleted' });
});

module.exports = router;
