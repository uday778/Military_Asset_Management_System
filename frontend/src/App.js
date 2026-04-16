import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import AuditLog from './pages/AuditLog';
import './App.css';

const PAGES = {
  dashboard: 'Dashboard',
  assets: 'Assets',
  purchases: 'Purchases',
  transfers: 'Transfers',
  assignments: 'Assignments & Expenditures',
  audit: 'Audit Log',
};

const pageComponents = {
  dashboard: Dashboard,
  assets: Assets,
  purchases: Purchases,
  transfers: Transfers,
  assignments: Assignments,
  audit: AuditLog,
};

function AppInner() {
  const { user, logout, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-icon">⚔</div>
          <div className="loading-text">MAMS</div>
          <div className="loading-sub">Military Asset Management System</div>
          <div className="loading-bar"><div className="loading-bar-fill" /></div>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const PageComponent = pageComponents[activePage];
  const visiblePages = Object.keys(PAGES).filter(p => {
    if (p === 'audit') return user.role === 'Admin';
    return true;
  });

  const roleColor = {
    'Admin': '#ff4444',
    'Base Commander': '#44aaff',
    'Logistics Officer': '#44ff88',
  }[user.role] || '#aaa';

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">⚔</span>
            {sidebarOpen && <span className="logo-text">MAMS</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {visiblePages.map(page => (
            <button
              key={page}
              className={`nav-item ${activePage === page ? 'active' : ''}`}
              onClick={() => setActivePage(page)}
            >
              <span className="nav-icon">{navIcons[page]}</span>
              {sidebarOpen && <span className="nav-label">{PAGES[page]}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-user">
            <div className="user-avatar">{user.name?.charAt(0) || 'U'}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role" style={{ color: roleColor }}>{user.role}</div>
              <div className="user-base">{user.base}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{PAGES[activePage]}</h1>
            <span className="topbar-breadcrumb">MAMS / {PAGES[activePage]}</span>
          </div>
          <div className="topbar-right">
            <div className="status-indicator">
              <span className="status-dot" />
              <span>SYSTEM ONLINE</span>
            </div>
            <div className="topbar-user">
              <span className="topbar-role" style={{ color: roleColor }}>{user.role}</span>
              <span className="topbar-name">{user.username}</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          <PageComponent />
        </div>
      </main>
    </div>
  );
}

const navIcons = {
  dashboard: '◈',
  assets: '◼',
  purchases: '◉',
  transfers: '⇄',
  assignments: '◎',
  audit: '▤',
};

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
