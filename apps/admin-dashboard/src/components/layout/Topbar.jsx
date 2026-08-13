import { Bell, Search, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLiveStore } from '../../store/liveStore';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Topbar.css';

const PAGE_TITLES = {
  '/map': { title: 'Live Operations Map', subtitle: 'Real-time officer & incident tracking' },
  '/live-events': { title: 'Live Events', subtitle: 'Currently active incidents' },
  '/officers': { title: 'Officer Management', subtitle: 'Roster, scheduling & performance' },
  '/citizens': { title: 'Citizen Management', subtitle: 'User profiles & SOS history' },
  '/reports': { title: 'Reports & Incidents', subtitle: 'Full incident tracking & export' },
  '/group-dispatch': { title: 'Group Dispatch', subtitle: 'Broadcast emergencies to officer groups' },
  '/zones': { title: 'Zone Manager', subtitle: 'Patrol zone boundaries & coverage' },
  '/analytics': { title: 'Analytics', subtitle: 'Performance metrics & statistics' },
};

const ROLE_LABELS = { OC: 'OC', SP: 'SP', SUPER_ADMIN: 'Super Admin' };

export default function Topbar() {
  const { user } = useAuthStore();
  const { activeIncidents } = useLiveStore();
  const location = useLocation();
  const [isSimulating] = useState(true); // Live simulation always on
  const [showNotifs, setShowNotifs] = useState(false);

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Dashboard', subtitle: '' };
  const criticalCount = activeIncidents?.filter(i => i.severity === 'CRITICAL').length || 0;

  const roleLabel = ROLE_LABELS[user?.role] || 'OC';
  const roleColor = user?.role === 'SUPER_ADMIN' ? 'var(--accent-red)' : user?.role === 'SP' ? 'var(--accent-purple)' : 'var(--accent-blue-light)';

  return (
    <header className="topbar" id="main-topbar">
      <div className="topbar-left">
        <div className="topbar-page-info">
          <h1 className="topbar-title">{pageInfo.title}</h1>
          {pageInfo.subtitle && <p className="topbar-subtitle">{pageInfo.subtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Live simulation indicator */}
        <div className="topbar-live-indicator">
          <span className="live-dot" />
          <span className="live-label">LIVE</span>
          <Wifi size={12} className="live-wifi" />
        </div>

        {/* Active incidents count */}
        {activeIncidents?.length > 0 && (
          <div className="topbar-incidents-chip">
            <span className="incidents-chip-dot" />
            <span>{activeIncidents.length} Active</span>
            {criticalCount > 0 && (
              <span className="critical-chip">{criticalCount} Critical</span>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="topbar-notif-wrap">
          <button
            className="topbar-icon-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            id="notifications-btn"
            title="Notifications"
          >
            <Bell size={17} />
            {criticalCount > 0 && (
              <span className="notif-badge">{criticalCount}</span>
            )}
          </button>

          {showNotifs && (
            <div className="notif-dropdown animate-scale-pop" id="notif-dropdown">
              <div className="notif-header">
                <span>Notifications</span>
                <span className="notif-count">{activeIncidents?.length || 0}</span>
              </div>
              {activeIncidents?.slice(0, 5).map(inc => (
                <div key={inc.id} className="notif-item">
                  <span className="notif-icon">{inc.typeIcon}</span>
                  <div>
                    <p className="notif-title">{inc.typeLabel}</p>
                    <p className="notif-location">{inc.location.address}</p>
                  </div>
                  <span className="notif-time">{inc.raisedAtStr?.split(',')[1]?.trim()}</span>
                </div>
              ))}
              {(!activeIncidents || activeIncidents.length === 0) && (
                <div className="notif-empty">All clear — no active incidents</div>
              )}
            </div>
          )}
        </div>

        {/* User chip */}
        <div className="topbar-user" id="topbar-user">
          <div className="topbar-user-avatar" style={{ background: 'var(--accent-blue-dim)', color: roleColor }}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name}</span>
            <span className="topbar-user-role" style={{ color: roleColor }}>
              {roleLabel} · {user?.stationName}
            </span>
          </div>
          <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </header>
  );
}
