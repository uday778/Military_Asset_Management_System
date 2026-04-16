import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#d4a017', '#3498db', '#2ecc71', '#e74c3c', '#e67e22'];

export default function Dashboard() {
  const { API, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [netMovement, setNetMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterBase, setFilterBase] = useState('');
  const [showNetModal, setShowNetModal] = useState(false);

useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = filterBase ? { base: filterBase } : {};

      const [sumRes, netRes] = await Promise.all([
        axios.get(`${API}/dashboard/summary`, { params }),
        axios.get(`${API}/dashboard/net-movement`, { params }),
      ]);

      if (isMounted) {
        setSummary(sumRes.data);
        setNetMovement(netRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, [filterBase, API]);

  if (loading) return <div className="flex-center" style={{ height: 300 }}>Loading...</div>;
  if (!summary) return null;

  const typeData = Object.entries(summary.byType || {}).map(([name, value]) => ({ name, value }));
  const baseData = Object.entries(summary.byBase || {}).map(([base, d]) => ({
    name: base, Vehicles: d.vehicles, Weapons: d.weapons, Ammo: d.ammunition,
  }));

  return (
    <div>
      {/* Filters */}
      {user.role === 'Admin' && (
        <div className="filters-bar" style={{ marginBottom: 20 }}>
          <span className="section-label" style={{ margin: 0 }}>Filter:</span>
          <select className="filter-select" value={filterBase} onChange={e => setFilterBase(e.target.value)}>
            <option value="">All Bases</option>
            {(summary.bases || []).map(b => <option key={b}>{b}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowNetModal(true)}>
            ◉ Net Movement
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard label="Total Assets" value={summary.totals.assets?.toLocaleString()} color="gold" sub="units in inventory" />
        <StatCard label="Asset Types" value={summary.totals.assetTypes} color="blue" sub="distinct items" />
        <StatCard label="Purchases" value={summary.totals.purchases} color="green" sub={`$${(summary.totals.totalPurchaseCost || 0).toLocaleString()}`} />
        <StatCard label="Transfers" value={summary.totals.transfers} color="blue" sub={`${summary.totals.pendingTransfers} pending`} />
        <StatCard label="Active Assignments" value={summary.totals.activeAssignments} color="orange" sub="units deployed" />
        <StatCard label="Expenditures" value={summary.totals.expenditures} color="red" sub={`${summary.totals.totalExpended?.toLocaleString()} units used`} />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Asset Distribution by Type</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#141820', border: '1px solid #1e2535', color: '#e8ecf0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Assets by Base</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={baseData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: '#8a9bb0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8a9bb0', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#141820', border: '1px solid #1e2535', color: '#e8ecf0' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8a9bb0' }} />
              <Bar dataKey="Vehicles" fill="#d4a017" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Weapons" fill="#3498db" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Ammo" fill="#2ecc71" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
        </div>
        <div className="activity-feed">
          {(summary.recentActivity || []).length === 0 && (
            <div className="empty-state"><div className="empty-text">No recent activity</div></div>
          )}
          {(summary.recentActivity || []).map((item, i) => (
            <div key={i} className={`activity-item ${item.type}`}>
              <div className="activity-dot" />
              <div className="activity-desc">{item.description}</div>
              <div className="activity-date">{item.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Net Movement Modal */}
      {showNetModal && netMovement && (
        <div className="modal-overlay" onClick={() => setShowNetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Net Movement Summary</span>
              <button className="modal-close" onClick={() => setShowNetModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="movement-popup">
                <MovCard label="Total In" val={netMovement.totalIn} cls="pos" />
                <MovCard label="Total Out" val={netMovement.totalOut} cls="neg" />
                <MovCard label="Net Movement" val={netMovement.netMovement} cls={netMovement.netMovement >= 0 ? 'pos' : 'neg'} />
                <MovCard label="Purchased" val={netMovement.breakdown.purchased} cls="neu" />
                <MovCard label="Transfers In" val={netMovement.breakdown.transfersIn} cls="pos" />
                <MovCard label="Transfers Out" val={netMovement.breakdown.transfersOut} cls="neg" />
                <MovCard label="Expended" val={netMovement.breakdown.expended} cls="neg" />
                <MovCard label="Assigned" val={netMovement.breakdown.assigned} cls="neu" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function MovCard({ label, val, cls }) {
  return (
    <div className="movement-item">
      <div className="movement-label">{label}</div>
      <div className={`movement-val ${cls}`}>{(val || 0).toLocaleString()}</div>
    </div>
  );
}
