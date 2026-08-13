import { useState, useMemo } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { OFFICER_STATUS_CONFIG, ZONES, RANKS, SPECIALTIES } from '../../mockData/officers';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { Search, Plus, Filter, UserX, MapPin, Clock, Star, TrendingUp, Calendar, Zap, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import './OfficersPage.css';

const TABS = ['Roster', 'Duty Schedule', 'Performance'];

function OfficerRow({ officer, onSelect }) {
  const statusCfg = OFFICER_STATUS_CONFIG[officer.status];
  const lastPingAgo = formatDistanceToNow(new Date(officer.lastPing), { addSuffix: true });
  const isStale = Date.now() - new Date(officer.lastPing).getTime() > 5 * 60 * 1000; // > 5 min

  return (
    <tr className="officer-row" onClick={() => onSelect(officer)} id={`officer-row-${officer.id}`}>
      <td>
        <div className="officer-cell-name">
          <div className="avatar avatar-sm" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)' }}>
            {officer.firstName[0]}
          </div>
          <div>
            <p className="font-medium">{officer.fullName}</p>
            <p className="text-xs text-muted font-mono">{officer.badgeId}</p>
          </div>
        </div>
      </td>
      <td><span className="text-sm text-muted">{officer.rank}</span></td>
      <td><span className="text-sm text-muted">{officer.zone.split(' — ')[1]}</span></td>
      <td>
        <div className="officer-status-cell">
          <span className="officer-status-dot" style={{ background: statusCfg.dot }} />
          <span className="text-sm">{statusCfg.label}</span>
        </div>
      </td>
      <td>
        <span className={`text-xs font-mono ${isStale ? 'stale-ping' : ''}`}>{lastPingAgo}</span>
        {isStale && <span className="stale-badge">Stale</span>}
      </td>
      <td>
        <div className="specialty-tags-cell">
          {officer.specialties.slice(0, 2).map(s => (
            <span key={s} className="specialty-tag">{s}</span>
          ))}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="ghost" size="sm" id={`officer-view-${officer.id}`}>View</Button>
        </div>
      </td>
    </tr>
  );
}

export default function OfficersPage() {
  const { officers, updateOfficerStatus, updateOfficer } = useLiveStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [tab, setTab] = useState('Roster');
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return officers.filter(o => {
      const matchSearch = !search || o.fullName.toLowerCase().includes(search.toLowerCase()) || o.badgeId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchZone = zoneFilter === 'ALL' || o.zone === zoneFilter;
      return matchSearch && matchStatus && matchZone;
    });
  }, [officers, search, statusFilter, zoneFilter]);

  const stats = useMemo(() => ({
    total: officers.length,
    onDuty: officers.filter(o => o.status !== 'OFF_DUTY').length,
    activeCall: officers.filter(o => o.status === 'ACTIVE_CALL').length,
    offDuty: officers.filter(o => o.status === 'OFF_DUTY').length,
  }), [officers]);

  return (
    <div className="officers-page page-content" id="officers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Officer Management</h1>
          <p className="page-subtitle">Roster, scheduling, performance & live tracking</p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={() => setShowAddModal(true)} id="add-officer-btn">
          Add Officer
        </Button>
      </div>

      {/* Stats */}
      <div className="officers-stats animate-fade-in-up">
        {[
          { label: 'Total Officers', value: stats.total, color: 'var(--accent-blue)' },
          { label: 'On Duty Now', value: stats.onDuty, color: 'var(--accent-green)' },
          { label: 'Active Calls', value: stats.activeCall, color: 'var(--accent-cyan)', pulse: true },
          { label: 'Off Duty', value: stats.offDuty, color: 'var(--text-muted)' },
        ].map((s, i) => (
          <div key={s.label} className={`officer-stat-card stagger-${i + 1}`} style={{ '--accent-gradient': s.color }}>
            {s.pulse && <span className="stat-live-dot" />}
            <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} id={`officers-tab-${t.toLowerCase().replace(' ', '-')}`}>{t}</button>
        ))}
      </div>

      {tab === 'Roster' && (
        <>
          {/* Filters */}
          <div className="officers-filters">
            <div className="search-wrap">
              <Search size={14} className="search-icon" />
              <input
                id="officer-search"
                type="text"
                className="input search-input"
                placeholder="Search by name or badge ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="search-clear" onClick={() => setSearch('')}><X size={13} /></button>}
            </div>
            <select className="select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} id="officer-status-filter">
              <option value="ALL">All Statuses</option>
              <option value="ON_PATROL">On Patrol</option>
              <option value="ACTIVE_CALL">Active Call</option>
              <option value="RETURNING">Returning</option>
              <option value="OFF_DUTY">Off Duty</option>
            </select>
            <select className="select" style={{ width: 180 }} value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} id="officer-zone-filter">
              <option value="ALL">All Zones</option>
              {ZONES.map(z => <option key={z} value={z}>{z.split(' — ')[1]}</option>)}
            </select>
            <span className="filter-count">{filtered.length} officers</span>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table className="officers-table" id="officers-table">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Rank</th>
                  <th>Zone</th>
                  <th>Status</th>
                  <th>Last Ping</th>
                  <th>Specialties</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(officer => (
                  <OfficerRow key={officer.id} officer={officer} onSelect={setSelectedOfficer} />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><Search size={24} /></div>
                <p className="empty-state-title">No officers found</p>
                <p className="empty-state-desc">Try adjusting the search or filters</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'Duty Schedule' && (
        <div className="duty-schedule animate-fade-in">
          <div className="schedule-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="schedule-day">
                <p className="schedule-day-label">{day}</p>
                {officers.filter((_, i) => i % 7 === ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(day)).slice(0, 5).map(o => (
                  <div key={o.id} className="schedule-officer-chip">
                    <span className="schedule-officer-dot" style={{ background: OFFICER_STATUS_CONFIG[o.status].dot }} />
                    <span>{o.firstName}</span>
                    <span className="schedule-shift">{o.shift}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Performance' && (
        <div className="performance-grid animate-fade-in">
          {officers.slice(0, 12).map((o, i) => (
            <div key={o.id} className={`performance-card animate-fade-in-up stagger-${(i % 5) + 1}`} id={`perf-card-${o.id}`}>
              <div className="perf-card-header">
                <div className="avatar" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)' }}>
                  {o.firstName[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{o.fullName}</p>
                  <p className="text-xs text-muted">{o.rank}</p>
                </div>
                <Badge status={o.status} size="sm" />
              </div>
              <div className="perf-stats">
                <div className="perf-stat">
                  <TrendingUp size={12} />
                  <span>{Math.floor(o.avgResponseTime / 60)}m {o.avgResponseTime % 60}s</span>
                  <span className="perf-stat-label">Avg Response</span>
                </div>
                <div className="perf-stat">
                  <Zap size={12} />
                  <span>{o.incidentsHandled}</span>
                  <span className="perf-stat-label">Incidents</span>
                </div>
                <div className="perf-stat">
                  <Star size={12} />
                  <span>{o.citizenRating}</span>
                  <span className="perf-stat-label">Rating</span>
                </div>
                <div className="perf-stat">
                  <span>{o.acceptanceRate}%</span>
                  <span className="perf-stat-label">Accept Rate</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Officer Detail Modal */}
      {selectedOfficer && (
        <Modal
          isOpen={!!selectedOfficer}
          onClose={() => setSelectedOfficer(null)}
          title={selectedOfficer.fullName}
          subtitle={`${selectedOfficer.rank} · ${selectedOfficer.badgeId}`}
          id="officer-detail-modal"
          width={520}
        >
          <div className="officer-detail">
            <div className="officer-detail-header">
              <div className="avatar avatar-xl" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)', fontSize: '28px' }}>
                {selectedOfficer.firstName[0]}
              </div>
              <div>
                <Badge status={selectedOfficer.status} size="md" />
                <p className="text-sm text-muted" style={{ marginTop: 6 }}>{selectedOfficer.zone}</p>
                <p className="text-sm text-muted">{selectedOfficer.stationName}</p>
              </div>
            </div>

            <div className="officer-detail-grid">
              {[
                { label: 'Badge ID', value: selectedOfficer.badgeId },
                { label: 'Phone', value: selectedOfficer.phone },
                { label: 'Shift', value: selectedOfficer.shift },
                { label: 'Joined', value: format(new Date(selectedOfficer.joinDate), 'dd MMM yyyy') },
                { label: 'Avg Response', value: `${Math.floor(selectedOfficer.avgResponseTime / 60)}m ${selectedOfficer.avgResponseTime % 60}s` },
                { label: 'Incidents', value: selectedOfficer.incidentsHandled },
                { label: 'Rating', value: `${selectedOfficer.citizenRating} ⭐` },
                { label: 'Accept Rate', value: `${selectedOfficer.acceptanceRate}%` },
              ].map(({ label, value }) => (
                <div key={label} className="officer-detail-field">
                  <p className="form-label">{label}</p>
                  <p className="officer-detail-value">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="form-label" style={{ marginBottom: 8 }}>Specialties</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedOfficer.specialties.map(s => <span key={s} className="specialty-tag">{s}</span>)}
                {selectedOfficer.specialties.length === 0 && <span className="text-muted text-sm">No specialties listed</span>}
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setSelectedOfficer(null)} id="officer-detail-close">Close</Button>
            <Button variant="danger" size="md" id="deactivate-officer-btn">Deactivate</Button>
            <Button variant="primary" size="md" id="edit-officer-btn">Edit Officer</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Add Officer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Officer" id="add-officer-modal" width={520}>
        <form className="add-officer-form" onSubmit={e => { e.preventDefault(); setShowAddModal(false); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label className="form-label">First Name</label><input className="input" placeholder="First name" id="officer-first-name" /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="input" placeholder="Last name" id="officer-last-name" /></div>
            <div className="form-group"><label className="form-label">Badge ID</label><input className="input" placeholder="KP0000" id="officer-badge-id" /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="input" placeholder="+91 9XXXXXXXXX" id="officer-phone" /></div>
            <div className="form-group"><label className="form-label">Rank</label>
              <select className="select" id="officer-rank">
                {RANKS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Zone</label>
              <select className="select" id="officer-zone">
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Specialties</label>
            <select className="select" id="officer-specialties">
              {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <ModalFooter>
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" id="save-officer-btn">Add Officer</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
