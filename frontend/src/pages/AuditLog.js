import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';

const ACTION_COLORS = {
  LOGIN: 'badge-blue',
  CREATE_ASSET: 'badge-green',
  UPDATE_ASSET: 'badge-gold',
  DELETE_ASSET: 'badge-red',
  PURCHASE: 'badge-green',
  TRANSFER_REQUEST: 'badge-blue',
  TRANSFER_APPROVE: 'badge-green',
  TRANSFER_REJECT: 'badge-red',
  ASSIGNMENT: 'badge-gold',
  RETURN: 'badge-muted',
  EXPENDITURE: 'badge-red',
};

export default function AuditLog() {
  const { API } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', entity: '', performedBy: '', limit: 100 });

  const fetchLogs = useCallback(async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${API}/audit`, { params: filters });
    setLogs(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [API, filters]);

useEffect(() => {
  fetchLogs();
}, [fetchLogs]);

  const actions = [...new Set(logs.map(l => l.action))];
  const entities = [...new Set(logs.map(l => l.entity))];
  const performers = [...new Set(logs.map(l => l.performedBy))];

  const formatTimestamp = (ts) => {
    try {
      return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch { return ts; }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Audit Log</div>
          <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
            {logs.length} entries • Admin access only
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>↻ Refresh</button>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={filters.action}
          onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a}>{a}</option>)}
        </select>
        <select className="filter-select" value={filters.entity}
          onChange={e => setFilters(f => ({ ...f, entity: e.target.value }))}>
          <option value="">All Entities</option>
          {entities.map(e => <option key={e}>{e}</option>)}
        </select>
        <select className="filter-select" value={filters.performedBy}
          onChange={e => setFilters(f => ({ ...f, performedBy: e.target.value }))}>
          <option value="">All Users</option>
          {performers.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="filter-select" value={filters.limit}
          onChange={e => setFilters(f => ({ ...f, limit: e.target.value }))}>
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
          <option value={500}>Last 500</option>
        </select>
        <button className="btn btn-secondary btn-sm"
          onClick={() => setFilters({ action: '', entity: '', performedBy: '', limit: 100 })}>
          Clear
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Performed By</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-icon">▤</div>
                    <div className="empty-text">No audit logs yet. Perform actions to generate logs.</div>
                  </div>
                </td></tr>
              ) : logs.map(l => (
                <tr key={l._id}>
                  <td className="text-mono" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(l.timestamp)}
                  </td>
                  <td>
                    <span className={`badge ${ACTION_COLORS[l.action] || 'badge-muted'}`}>
                      {l.action}
                    </span>
                  </td>
                  <td><span className="badge badge-muted">{l.entity}</span></td>
                  <td>
                    <span className="text-accent bold" style={{ fontSize: '0.85rem' }}>
                      {l.performedBy}
                    </span>
                  </td>
                  <td className="text-muted" style={{ fontSize: '0.82rem' }}>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
