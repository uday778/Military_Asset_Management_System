import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TYPES = ['Vehicle', 'Weapon', 'Ammunition', 'Equipment', 'Supplies'];

export default function Purchases() {
  const { API, user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ base: '', type: '', startDate: '', endDate: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    assetName: '', type: 'Weapon', base: user.base || '',
    quantity: '', unitCost: '', supplier: '', purchaseDate: new Date().toISOString().split('T')[0], notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

 useEffect(() => {
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/purchases`, { params: filters });
      setPurchases(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchPurchases();
}, [filters]);

  const handleSubmit = async () => {
    setError('');
    try {
      await axios.post(`${API}/purchases`, form);
      setSuccess('Purchase recorded successfully');
      setShowModal(false);
      setForm({ assetName: '', type: 'Weapon', base: user.base || '', quantity: '', unitCost: '', supplier: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '' });
      fetchPurchases();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Error recording purchase'); }
  };

  const totalCost = Number(form.quantity) * Number(form.unitCost) || 0;
  const grandTotal = purchases.reduce((s, p) => s + (p.totalCost || 0), 0);
  const bases = [...new Set(purchases.map(p => p.base))];

  const canCreate = ['Admin', 'Logistics Officer'].includes(user.role);

  return (
    <div>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="page-header">
        <div>
          <div className="page-title">Purchase Records</div>
          <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
            Total spend: <span className="text-accent bold">${grandTotal.toLocaleString()}</span>
          </div>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record Purchase</button>
        )}
      </div>

      <div className="filters-bar">
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
        <input type="date" className="filter-select" value={filters.startDate}
          onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        <input type="date" className="filter-select" value={filters.endDate}
          onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        <button className="btn btn-secondary btn-sm"
          onClick={() => setFilters({ base: '', type: '', startDate: '', endDate: '' })}>
          Clear
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Base</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon">◉</div><div className="empty-text">No purchases found</div></div></td></tr>
              ) : purchases.map(p => (
                <tr key={p._id}>
                  <td className="bold">{p.assetName}</td>
                  <td><span className="badge badge-muted">{p.type}</span></td>
                  <td className="text-mono">{p.base}</td>
                  <td className="text-accent bold">{p.quantity?.toLocaleString()}</td>
                  <td className="text-mono">${p.unitCost?.toLocaleString()}</td>
                  <td><span className="text-green bold">${p.totalCost?.toLocaleString()}</span></td>
                  <td className="text-muted">{p.supplier}</td>
                  <td className="text-mono">{p.purchaseDate}</td>
                  <td className="text-muted">{p.createdBy}</td>
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
              <span className="modal-title">Record Purchase</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input className="form-control" value={form.assetName}
                    onChange={e => setForm(f => ({ ...f, assetName: e.target.value }))}
                    placeholder="e.g. AK-47 Rifle" />
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
                  <label className="form-label">Base</label>
                  <input className="form-control" value={form.base}
                    onChange={e => setForm(f => ({ ...f, base: e.target.value }))}
                    placeholder="e.g. Alpha Base" />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input className="form-control" value={form.supplier}
                    onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                    placeholder="e.g. DefenseTech Corp" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input className="form-control" type="number" min="1" value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Cost ($)</label>
                  <input className="form-control" type="number" min="0" value={form.unitCost}
                    onChange={e => setForm(f => ({ ...f, unitCost: e.target.value }))} />
                </div>
              </div>
              {totalCost > 0 && (
                <div className="alert alert-info" style={{ marginBottom: 12 }}>
                  Total Cost: <strong>${totalCost.toLocaleString()}</strong>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purchase Date</label>
                  <input className="form-control" type="date" value={form.purchaseDate}
                    onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-control" value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional notes" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Record Purchase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
