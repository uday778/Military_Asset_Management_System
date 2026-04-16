const express = require('express');
const router = express.Router();
const { store, uuidv4 } = require('../config/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/transfers
router.get('/', authenticate, (req, res) => {
  let transfers = [...store.transfers];
  const { base, status, type } = req.query;

  if (req.user.role !== 'Admin') {
    transfers = transfers.filter(t => t.fromBase === req.user.base || t.toBase === req.user.base);
  } else if (base) {
    transfers = transfers.filter(t => t.fromBase === base || t.toBase === base);
  }

  if (status) transfers = transfers.filter(t => t.status === status);
  if (type) transfers = transfers.filter(t => t.type === type);

  transfers.sort((a, b) => new Date(b.transferDate) - new Date(a.transferDate));
  res.json(transfers);
});

// POST /api/transfers — All authenticated users can request
router.post('/', authenticate, (req, res) => {
  const { assetName, type, fromBase, toBase, quantity, notes } = req.body;
  if (!assetName || !type || !fromBase || !toBase || !quantity) {
    return res.status(400).json({ message: 'assetName, type, fromBase, toBase, quantity required' });
  }
  if (fromBase === toBase) {
    return res.status(400).json({ message: 'Source and destination bases must be different' });
  }

  // Check availability at source
  const sourceAsset = store.assets.find(a => a.name === assetName && a.base === fromBase);
  if (!sourceAsset || sourceAsset.quantity < Number(quantity)) {
    return res.status(400).json({ message: 'Insufficient quantity at source base' });
  }

  const transfer = {
    _id: uuidv4(),
    assetName, type, fromBase, toBase,
    quantity: Number(quantity),
    status: req.user.role === 'Admin' ? 'Completed' : 'Pending',
    transferDate: new Date().toISOString().split('T')[0],
    requestedBy: req.user.username,
    approvedBy: req.user.role === 'Admin' ? req.user.username : null,
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
  store.transfers.push(transfer);

  // If auto-approved (Admin), update inventories
  if (transfer.status === 'Completed') {
    sourceAsset.quantity -= Number(quantity);
    const destAsset = store.assets.find(a => a.name === assetName && a.base === toBase);
    if (destAsset) {
      destAsset.quantity += Number(quantity);
    } else {
      store.assets.push({ _id: uuidv4(), name: assetName, type, base: toBase, quantity: Number(quantity), status: 'Operational' });
    }
  }

  store.addAuditLog('TRANSFER_REQUEST', 'Transfer', transfer._id, req.user.username,
    `Transfer ${quantity}x ${assetName} from ${fromBase} to ${toBase} — ${transfer.status}`);

  res.status(201).json(transfer);
});

// PATCH /api/transfers/:id/approve — Admin only
router.patch('/:id/approve', authenticate, authorize('Admin'), (req, res) => {
  const transfer = store.transfers.find(t => t._id === req.params.id);
  if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
  if (transfer.status !== 'Pending') return res.status(400).json({ message: 'Transfer is not pending' });

  // Check availability again
  const sourceAsset = store.assets.find(a => a.name === transfer.assetName && a.base === transfer.fromBase);
  if (!sourceAsset || sourceAsset.quantity < transfer.quantity) {
    return res.status(400).json({ message: 'Insufficient quantity at source base' });
  }

  transfer.status = 'Completed';
  transfer.approvedBy = req.user.username;
  transfer.approvedAt = new Date().toISOString();

  sourceAsset.quantity -= transfer.quantity;
  const destAsset = store.assets.find(a => a.name === transfer.assetName && a.base === transfer.toBase);
  if (destAsset) {
    destAsset.quantity += transfer.quantity;
  } else {
    store.assets.push({ _id: uuidv4(), name: transfer.assetName, type: transfer.type, base: transfer.toBase, quantity: transfer.quantity, status: 'Operational' });
  }

  store.addAuditLog('TRANSFER_APPROVE', 'Transfer', transfer._id, req.user.username,
    `Approved transfer of ${transfer.quantity}x ${transfer.assetName}`);

  res.json(transfer);
});

// PATCH /api/transfers/:id/reject — Admin only
router.patch('/:id/reject', authenticate, authorize('Admin'), (req, res) => {
  const transfer = store.transfers.find(t => t._id === req.params.id);
  if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
  if (transfer.status !== 'Pending') return res.status(400).json({ message: 'Transfer is not pending' });
  transfer.status = 'Rejected';
  transfer.rejectedBy = req.user.username;
  store.addAuditLog('TRANSFER_REJECT', 'Transfer', transfer._id, req.user.username, `Rejected transfer ${transfer._id}`);
  res.json(transfer);
});

module.exports = router;
