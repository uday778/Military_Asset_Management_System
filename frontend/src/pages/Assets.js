import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TYPES = ['Vehicle', 'Weapon', 'Ammunition', 'Equipment', 'Supplies'];
const STATUSES = ['Operational', 'Maintenance', 'Decommissioned'];

export default function Assets() {
  const { API, user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ base: '', type: '', status: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Vehicle', base: '', quantity: '', status: 'Operational' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/assets`, { params: filters });
      setAssets(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssets(); }, [filters,fetchAssets]);

  const handleSubmit = async () => {
    setError('');
    try {
      await axios.post(`${API}/assets`, form);
      setSuccess('Asset created successfully');
      setShowModal(false);
      setForm({ name: '', type: 'Vehicle', base: '', quantity: '', status: 'Operational' });
      fetchAssets();
    } catch (err) { setError(err.response?.data?.message || 'Error creating asset'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await axios.delete(`${API}/assets/${id}`);
      fetchAssets();
    } catch (err) { alert(err.response?.data?.message); }
  };

  const bases = [...new Set(assets.map(a => a.base))];

  const statusBadge = (s) => {
    const map = { Operational: 'badge-green', Maintenance: 'badge-orange', Decommissioned: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-muted'}`}>{s}</span>;
  };

  return (
    <div>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="page-header">
        <span className="page-title">Asset Inventory</span>
        {user.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Asset</button>
        )}
      </div>

      <div className="filters-bar">
        <input className="filter-input" placeholder="Search assets..." value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        {user.role === 'Admin' && (
          <select className="filter-select" value={filters.base}
            onChange={e => setFilters(f => ({ ...f, base: e.target.value }))}>
            <option value="">All Bases</option>
            {bases.map(b => <option key={b}>{b}</option>)}
          </select>
        )}
        <select className="filter-select" value={filters.type}
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="filter-select" value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Base</th>
                <th>Quantity</th>
                <th>Status</th>
                {user.role === 'Admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">◼</div><div className="empty-text">No assets found</div></div></td></tr>
              ) : assets.map(a => (
                <tr key={a._id}>
                  <td><span className="bold">{a.name}</span></td>
                  <td><span className="badge badge-muted">{a.type}</span></td>
                  <td className="text-mono">{a.base}</td>
                  <td><span className="bold text-accent">{a.quantity?.toLocaleString()}</span></td>
                  <td>{statusBadge(a.status)}</td>
                  {user.role === 'Admin' && (
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Delete</button>
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
              <span className="modal-title">New Asset</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. M1 Abrams Tank" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Base</label>
                  <input className="form-control" value={form.base} onChange={e => setForm(f => ({ ...f, base: e.target.value }))} placeholder="e.g. Alpha Base" />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input className="form-control" type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Create Asset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
