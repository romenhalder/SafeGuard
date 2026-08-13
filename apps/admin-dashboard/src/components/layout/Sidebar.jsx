import { NavLink, useLocation } from 'react-router-dom';
import {
  Map, Users, FileText, Radio, UserCheck,
  Send, Settings, BarChart2, Layers,
  Shield, ChevronLeft, ChevronRight, Activity, LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/map', icon: Map, label: 'Live Map', badge: null },
  { to: '/live-events', icon: Radio, label: 'Live Events', badge: 'live' },
  { to: '/officers', icon: UserCheck, label: 'Officers', badge: null },
  { to: '/citizens', icon: Users, label: 'Citizens', badge: null },
  { to: '/reports', icon: FileText, label: 'Reports', badge: null },
  { to: '/group-dispatch', icon: Send, label: 'Group Dispatch', badge: null },
  { to: '/zones', icon: Layers, label: 'Zone Manager', badge: null },
  { to: '/analytics', icon: BarChart2, label: 'Analytics', badge: null },
];

const ROLE_COLORS = {
  OC: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)', label: 'Officer in Charge' },
  SP: { bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', label: 'Superintendent' },
  SUPER_ADMIN: { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)', label: 'Super Admin' },
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const roleConfig = ROLE_COLORS[user?.role] || ROLE_COLORS.OC;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SA';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="main-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Shield size={20} />
        </div>
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-name">SafeGuard</span>
            <span className="logo-sub">Admin Portal</span>
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          id="sidebar-collapse-btn"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="sidebar-role" style={{ background: roleConfig.bg }}>
          <Activity size={12} style={{ color: roleConfig.color }} />
          <span style={{ color: roleConfig.color, fontSize: '11px', fontWeight: 600 }}>
            {roleConfig.label}
          </span>
          {user?.stationName && (
            <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginLeft: 'auto' }}>
              {user.stationName}
            </span>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <div className="nav-icon">
              <Icon size={18} />
              {badge === 'live' && <span className="nav-live-dot" />}
            </div>
            {!collapsed && <span className="nav-label">{label}</span>}
            {badge === 'live' && !collapsed && (
              <span className="nav-badge-live">LIVE</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: User + Logout */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="avatar avatar-sm" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)', border: '1px solid var(--accent-blue)' }}>
              {initials}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-badge">{user?.badge}</span>
            </div>
          </div>
        )}
        <button
          className="logout-btn"
          onClick={logout}
          title="Logout"
          id="logout-btn"
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
