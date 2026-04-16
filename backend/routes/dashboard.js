const express = require('express');
const router = express.Router();
const { store } = require('../config/store');
const { authenticate } = require('../middleware/auth');

// GET /api/dashboard/summary
router.get('/summary', authenticate, (req, res) => {
  const { base } = req.query;
  const filterBase = req.user.role !== 'Admin' ? req.user.base : base;

  let assets = store.assets;
  let purchases = store.purchases;
  let transfers = store.transfers;
  let assignments = store.assignments;
  let expenditures = store.expenditures;

  if (filterBase) {
    assets = assets.filter(a => a.base === filterBase);
    purchases = purchases.filter(p => p.base === filterBase);
    transfers = transfers.filter(t => t.fromBase === filterBase || t.toBase === filterBase);
    assignments = assignments.filter(a => a.base === filterBase);
    expenditures = expenditures.filter(e => e.base === filterBase);
  }

  // Asset type breakdown
  const byType = assets.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.quantity;
    return acc;
  }, {});

  // By base
  const byBase = store.assets.reduce((acc, a) => {
    if (!acc[a.base]) acc[a.base] = { total: 0, vehicles: 0, weapons: 0, ammunition: 0 };
    acc[a.base].total += a.quantity;
    if (a.type === 'Vehicle') acc[a.base].vehicles += a.quantity;
    if (a.type === 'Weapon') acc[a.base].weapons += a.quantity;
    if (a.type === 'Ammunition') acc[a.base].ammunition += a.quantity;
    return acc;
  }, {});

  const pendingTransfers = store.transfers.filter(t => t.status === 'Pending').length;
  const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const activeAssignments = assignments.filter(a => a.status === 'Active').length;
  const totalExpended = expenditures.reduce((sum, e) => sum + e.quantity, 0);

  // Net movement (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity = [
    ...purchases.slice(-5).map(p => ({ type: 'purchase', date: p.purchaseDate, description: `Purchased ${p.quantity}x ${p.assetName}`, base: p.base })),
    ...transfers.slice(-5).map(t => ({ type: 'transfer', date: t.transferDate, description: `Transfer ${t.quantity}x ${t.assetName}: ${t.fromBase} → ${t.toBase}`, status: t.status })),
    ...assignments.slice(-5).map(a => ({ type: 'assignment', date: a.assignmentDate, description: `Assigned ${a.quantity}x ${a.assetName} to ${a.assignedTo}`, base: a.base })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  res.json({
    totals: {
      assets: assets.reduce((s, a) => s + a.quantity, 0),
      assetTypes: assets.length,
      purchases: purchases.length,
      transfers: transfers.length,
      pendingTransfers,
      activeAssignments,
      expenditures: expenditures.length,
      totalExpended,
      totalPurchaseCost,
    },
    byType,
    byBase,
    recentActivity,
    bases: [...new Set(store.assets.map(a => a.base))],
  });
});

// GET /api/dashboard/net-movement
router.get('/net-movement', authenticate, (req, res) => {
  const { base, assetName } = req.query;
  const filterBase = req.user.role !== 'Admin' ? req.user.base : base;

  let purchases = store.purchases;
  let transfersIn = store.transfers.filter(t => t.status === 'Completed');
  let transfersOut = store.transfers.filter(t => t.status === 'Completed');
  let expenditures = store.expenditures;
  let assignments = store.assignments;

  if (filterBase) {
    purchases = purchases.filter(p => p.base === filterBase);
    transfersIn = transfersIn.filter(t => t.toBase === filterBase);
    transfersOut = transfersOut.filter(t => t.fromBase === filterBase);
    expenditures = expenditures.filter(e => e.base === filterBase);
    assignments = assignments.filter(a => a.base === filterBase);
  }

  if (assetName) {
    purchases = purchases.filter(p => p.assetName === assetName);
    transfersIn = transfersIn.filter(t => t.assetName === assetName);
    transfersOut = transfersOut.filter(t => t.assetName === assetName);
    expenditures = expenditures.filter(e => e.assetName === assetName);
    assignments = assignments.filter(a => a.assetName === assetName);
  }

  const totalIn = purchases.reduce((s, p) => s + p.quantity, 0)
    + transfersIn.reduce((s, t) => s + t.quantity, 0);
  const totalOut = transfersOut.reduce((s, t) => s + t.quantity, 0)
    + expenditures.reduce((s, e) => s + e.quantity, 0)
    + assignments.filter(a => a.status === 'Active').reduce((s, a) => s + a.quantity, 0);

  res.json({
    totalIn,
    totalOut,
    netMovement: totalIn - totalOut,
    breakdown: {
      purchased: purchases.reduce((s, p) => s + p.quantity, 0),
      transfersIn: transfersIn.reduce((s, t) => s + t.quantity, 0),
      transfersOut: transfersOut.reduce((s, t) => s + t.quantity, 0),
      expended: expenditures.reduce((s, e) => s + e.quantity, 0),
      assigned: assignments.filter(a => a.status === 'Active').reduce((s, a) => s + a.quantity, 0),
    },
  });
});

module.exports = router;
