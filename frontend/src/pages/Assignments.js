import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TYPES = ['Vehicle', 'Weapon', 'Ammunition', 'Equipment', 'Supplies'];

export default function Assignments() {
  const { API, user } = useAuth();
  const [data, setData] = useState({ assignments: [], expenditures: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('assignments');
  const [showModal, setShowModal] = useState(null); // 'assign' | 'expenditure'
  const [assignForm, setAssignForm] = useState({
    assetName: '', type: 'Weapon', base: user.base || '',
    assignedTo: '', quantity: '', purpose: '', returnDate: ''
  });
  const [expForm, setExpForm] = useState({
    assetName: '', type: 'Ammunition', base: user.base || '',
    quantity: '', purpose: '', notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/assignments`);
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async () => {
    setError('');
    try {
      await axios.post(`${API}/assignments/assign`, assignForm);
      setSuccess('Asset assigned successfully');
      setShowModal(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Error assigning asset'); }
  };

  const handleExpenditure = async () => {
    setError('');
    try {
      await axios.post(`${API}/assignments/expenditure`, expForm);
      setSuccess('Expenditure recorded');
      setShowModal(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Error recording expenditure'); }
  };

  const handleReturn = async (id) => {
    try {
      await axios.post(`${API}/assignments/return/${id}`);
      setSuccess('Asset returned to inventory');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { alert(err.response?.data?.message); }
  };

  const canAssign = ['Admin', 'Base Commander'].includes(user.role);
  const canExpend = ['Admin', 'Base Commander', 'Logistics Officer'].includes(user.role);

  const statusBadge = (s) => {
    const map = { Active: 'badge-green', Returned: 'badge-muted', Completed: 'badge-blue' };
    return <span className={`badge ${map[s] || 'badge-muted'}`}>{s}</span>;
  };

  return (
    <div>
      {success && <div className="alert alert-success">{success}</div>}

      <div className="page-header">
        <div className="page-title">Assignments & Expenditures</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {canAssign && (
            <button className="btn btn-primary" onClick={() => { setError(''); setShowModal('assign'); }}>
              ◎ Assign Asset
            </button>
          )}
          {canExpend && (
            <button className="btn btn-secondary" onClick={() => { setError(''); setShowModal('expenditure'); }}>
              − Record Expenditure
            </button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {['assignments', 'expenditures'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t} ({(data[t] || []).length})
          </button>
        ))}
      </div>

      {/* Assignments Table */}
      {tab === 'assignments' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Base</th>
                  <th>Assigned To</th>
                  <th>Qty</th>
                  <th>Purpose</th>
                  <th>Date</th>
                  <th>Status</th>
                  {canAssign && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
                ) : (data.assignments || []).length === 0 ? (
                  <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon">◎</div><div className="empty-text">No assignments found</div></div></td></tr>
                ) : (data.assignments || []).map(a => (
                  <tr key={a._id}>
                    <td className="bold">{a.assetName}</td>
                    <td><span className="badge badge-muted">{a.type}</span></td>
                    <td className="text-mono">{a.base}</td>
                    <td>{a.assignedTo}</td>
                    <td className="text-accent bold">{a.quantity?.toLocaleString()}</td>
                    <td className="text-muted">{a.purpose}</td>
                    <td className="text-mono">{a.assignmentDate}</td>
                    <td>{statusBadge(a.status)}</td>
                    {canAssign && (
                      <td>
                        {a.status === 'Active' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleReturn(a._id)}>
                            ↩ Return
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenditures Table */}
      {tab === 'expenditures' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Base</th>
                  <th>Qty Expended</th>
                  <th>Purpose</th>
                  <th>Authorized By</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
                ) : (data.expenditures || []).length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">−</div><div className="empty-text">No expenditures found</div></div></td></tr>
                ) : (data.expenditures || []).map(e => (
                  <tr key={e._id}>
                    <td className="bold">{e.assetName}</td>
                    <td><span className="badge badge-muted">{e.type}</span></td>
                    <td className="text-mono">{e.base}</td>
                    <td><span className="text-red bold">{e.quantity?.toLocaleString()}</span></td>
                    <td>{e.purpose}</td>
                    <td className="text-muted">{e.authorizedBy}</td>
                    <td className="text-mono">{e.expenditureDate}</td>
                    <td className="text-muted">{e.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showModal === 'assign' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Assign Asset</span>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input className="form-control" value={assignForm.assetName}
                    onChange={e => setAssignForm(f => ({ ...f, assetName: e.target.value }))}
                    placeholder="e.g. AK-47 Rifle" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-control" value={assignForm.type}
                    onChange={e => setAssignForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Base</label>
                  <input className="form-control" value={assignForm.base}
                    onChange={e => setAssignForm(f => ({ ...f, base: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned To (Squad/Unit)</label>
                  <input className="form-control" value={assignForm.assignedTo}
                    onChange={e => setAssignForm(f => ({ ...f, assignedTo: e.target.value }))}
                    placeholder="e.g. Delta Squad" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input className="form-control" type="number" min="1" value={assignForm.quantity}
                    onChange={e => setAssignForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Return Date</label>
                  <input className="form-control" type="date" value={assignForm.returnDate}
                    onChange={e => setAssignForm(f => ({ ...f, returnDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose / Mission</label>
                <input className="form-control" value={assignForm.purpose}
                  onChange={e => setAssignForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="e.g. Patrol Mission Alpha-7" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign}>Assign Asset</button>
            </div>
          </div>
        </div>
      )}

      {/* Expenditure Modal */}
      {showModal === 'expenditure' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Record Expenditure</span>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input className="form-control" value={expForm.assetName}
                    onChange={e => setExpForm(f => ({ ...f, assetName: e.target.value }))}
                    placeholder="e.g. 5.56mm Ammo" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-control" value={expForm.type}
                    onChange={e => setExpForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Base</label>
                  <input className="form-control" value={expForm.base}
                    onChange={e => setExpForm(f => ({ ...f, base: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity Expended</label>
                  <input className="form-control" type="number" min="1" value={expForm.quantity}
                    onChange={e => setExpForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose</label>
                <input className="form-control" value={expForm.purpose}
                  onChange={e => setExpForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="e.g. Training Exercise, Combat Operation" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-control" value={expForm.notes}
                  onChange={e => setExpForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional notes" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleExpenditure}>Record Expenditure</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
