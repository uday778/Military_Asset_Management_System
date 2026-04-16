import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';
const TYPES = ['Vehicle', 'Weapon', 'Ammunition', 'Equipment', 'Supplies'];
const BASES = ['Alpha Base', 'Bravo Base', 'Charlie Base', 'HQ', 'Forward Operating Base'];

export default function Transfers() {
  const { API, user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ base: '', status: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    assetName: '', type: 'Weapon',
    fromBase: user.base || '', toBase: '',
    quantity: '', notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

 const fetchTransfers = useCallback(async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${API}/transfers`, { params: filters });
    setTransfers(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [API, filters]);
useEffect(() => {
  fetchTransfers();
}, [fetchTransfers]);

  const handleSubmit = async () => {
    setError('');
    try {
      await axios.post(`${API}/transfers`, form);
await fetchTransfers();
      setSuccess('Transfer request submitted');
      setShowModal(false);
      setForm({ assetName: '', type: 'Weapon', fromBase: user.base || '', toBase: '', quantity: '', notes: '' });
      fetchTransfers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Error submitting transfer'); }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`${API}/transfers`, form);
await fetchTransfers();
    } catch (err) { alert(err.response?.data?.message || 'Error approving transfer'); }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`${API}/transfers/${id}/reject`);
await fetchTransfers();
    } catch (err) { alert(err.response?.data?.message || 'Error rejecting transfer'); }
  };

  const statusBadge = (s) => {
    const map = { Completed: 'badge-green', Pending: 'badge-orange', Rejected: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-muted'}`}>{s}</span>;
  };

  const pendingCount = transfers.filter(t => t.status === 'Pending').length;

  return (
    <div>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="page-header">
        <div>
          <div className="page-title">Asset Transfers</div>
          {pendingCount > 0 && (
            <div style={{ marginTop: 4 }}>
              <span className="badge badge-orange">{pendingCount} Pending Approval</span>
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>⇄ Request Transfer</button>
      </div>

      <div className="filters-bar">
        {user.role === 'Admin' && (
          <select className="filter-select" value={filters.base}
            onChange={e => setFilters(f => ({ ...f, base: e.target.value }))}>
            <option value="">All Bases</option>
            {BASES.map(b => <option key={b}>{b}</option>)}
          </select>
        )}
        <select className="filter-select" value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option>Pending</option>
          <option>Completed</option>
          <option>Rejected</option>
        </select>
        <select className="filter-select" value={filters.type}
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Date</th>
                <th>Requested By</th>
                {user.role === 'Admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : transfers.length === 0 ? (
                <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon">⇄</div><div className="empty-text">No transfers found</div></div></td></tr>
              ) : transfers.map(t => (
                <tr key={t._id}>
                  <td className="bold">{t.assetName}</td>
                  <td><span className="badge badge-muted">{t.type}</span></td>
                  <td className="text-mono">{t.fromBase}</td>
                  <td className="text-mono">→ {t.toBase}</td>
                  <td className="text-accent bold">{t.quantity?.toLocaleString()}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td className="text-mono">{t.transferDate}</td>
                  <td className="text-muted">{t.requestedBy}</td>
                  {user.role === 'Admin' && (
                    <td>
                      {t.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleApprove(t._id)}>✓ Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(t._id)}>✕ Reject</button>
                        </div>
                      )}
                      {t.status !== 'Pending' && <span className="text-muted" style={{ fontSize: '0.75rem' }}>{t.approvedBy || t.rejectedBy || '—'}</span>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Request Transfer</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input className="form-control" value={form.assetName}
                    onChange={e => setForm(f => ({ ...f, assetName: e.target.value }))}
                    placeholder="e.g. M16 Rifle" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-control" value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">From Base</label>
                  <select className="form-control" value={form.fromBase}
                    onChange={e => setForm(f => ({ ...f, fromBase: e.target.value }))}>
                    <option value="">Select base</option>
                    {BASES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">To Base</label>
                  <select className="form-control" value={form.toBase}
                    onChange={e => setForm(f => ({ ...f, toBase: e.target.value }))}>
                    <option value="">Select base</option>
                    {BASES.filter(b => b !== form.fromBase).map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input className="form-control" type="number" min="1" value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-control" value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Transfer reason" />
                </div>
              </div>
              {user.role !== 'Admin' && (
                <div className="alert alert-info">
                  Transfer requests require Admin approval before inventory is updated.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
