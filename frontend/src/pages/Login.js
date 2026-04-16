import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (u, p) => {
    setLoading(true); setError('');
    try {
      await login(u || username, p || password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (u, p) => { setUsername(u); setPassword(p); handleLogin(u, p); };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-grid" />
      <div className="login-box">
        <div className="login-brand">
          <div className="login-icon">⚔</div>
          <div className="login-title">MAMS</div>
          <div className="login-subtitle">Military Asset Management System</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="login-creds">
          <p><strong>admin</strong> / admin123 — Full access</p>
          <p><strong>commander1</strong> / commander123 — Alpha Base</p>
          <p><strong>logistics1</strong> / logistics123 — Bravo Base</p>
        </div>

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-control" value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter username"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-control" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => handleLogin()} disabled={loading}
        >
          {loading ? 'Authenticating...' : '🔐 Secure Login'}
        </button>

        <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Admin', u: 'admin', p: 'admin123' },
            { label: 'Commander', u: 'commander1', p: 'commander123' },
            { label: 'Logistics', u: 'logistics1', p: 'logistics123' },
          ].map(({ label, u, p }) => (
            <button key={u} className="btn btn-secondary btn-sm"
              style={{ flex: 1 }} onClick={() => quickLogin(u, p)}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
