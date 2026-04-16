const express = require('express');
const router = express.Router();
const { store, uuidv4 } = require('../config/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/assets — list assets (filtered by base for non-admins)
router.get('/', authenticate, (req, res) => {
  let assets = [...store.assets];
  const { base, type, status, search } = req.query;

  // Non-admins can only see their own base
  if (req.user.role !== 'Admin') {
    assets = assets.filter(a => a.base === req.user.base);
  } else if (base) {
    assets = assets.filter(a => a.base === base);
  }

  if (type) assets = assets.filter(a => a.type === type);
  if (status) assets = assets.filter(a => a.status === status);
  if (search) assets = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  res.json(assets);
});

// GET /api/assets/:id
router.get('/:id', authenticate, (req, res) => {
  const asset = store.assets.find(a => a._id === req.params.id);
  if (!asset) return res.status(404).json({ message: 'Asset not found' });
  res.json(asset);
});

// POST /api/assets — Admin only
router.post('/', authenticate, authorize('Admin'), (req, res) => {
  const { name, type, base, quantity, status } = req.body;
  if (!name || !type || !base || quantity === undefined) {
    return res.status(400).json({ message: 'name, type, base, quantity are required' });
  }
  const asset = {
    _id: uuidv4(),
    name, type, base,
    quantity: Number(quantity),
    status: status || 'Operational',
    createdAt: new Date().toISOString(),
  };
  store.assets.push(asset);
  store.addAuditLog('CREATE_ASSET', 'Asset', asset._id, req.user.username, `Created asset ${name} at ${base}`);
  res.status(201).json(asset);
});

// PUT /api/assets/:id — Admin only
router.put('/:id', authenticate, authorize('Admin'), (req, res) => {
  const idx = store.assets.findIndex(a => a._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Asset not found' });
  store.assets[idx] = { ...store.assets[idx], ...req.body, _id: req.params.id };
  store.addAuditLog('UPDATE_ASSET', 'Asset', req.params.id, req.user.username, `Updated asset ${req.params.id}`);
  res.json(store.assets[idx]);
});

// DELETE /api/assets/:id — Admin only
router.delete('/:id', authenticate, authorize('Admin'), (req, res) => {
  const idx = store.assets.findIndex(a => a._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Asset not found' });
  const [removed] = store.assets.splice(idx, 1);
  store.addAuditLog('DELETE_ASSET', 'Asset', req.params.id, req.user.username, `Deleted asset ${removed.name}`);
  res.json({ message: 'Asset deleted' });
});

module.exports = router;
