import { useState, useMemo } from 'react';
import { mockCitizens, CITIZEN_STATUS, FALSE_ALARM_AUTO_SUSPEND_THRESHOLD } from '../../mockData/citizens';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { Search, Filter, Download, Flag, CheckCircle, EyeOff, XCircle, AlertTriangle, X, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import './CitizensPage.css';

const STATUS_ACTIONS = {
  ACTIVE: ['HIDDEN', 'SUSPENDED'],
  HIDDEN: ['ACTIVE', 'SUSPENDED'],
  SUSPENDED: ['ACTIVE'],
};

export default function CitizensPage() {
  const [citizens, setCitizens] = useState([...mockCitizens]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [statusModal, setStatusModal] = useState(null); // { citizen, newStatus }
  const [statusReason, setStatusReason] = useState('');
  const [flagModal, setFlagModal] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const filtered = useMemo(() => citizens.filter(c => {
    const matchSearch = !search || c.fullName.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchArea = areaFilter === 'ALL' || c.area === areaFilter;
    return matchSearch && matchStatus && matchArea;
  }), [citizens, search, statusFilter, areaFilter]);

  const areas = [...new Set(mockCitizens.map(c => c.area))];

  const handleStatusChange = (citizen, newStatus) => {
    setStatusModal({ citizen, newStatus });
    setStatusReason('');
  };

  const confirmStatusChange = () => {
    setCitizens(prev => prev.map(c =>
      c.id === statusModal.citizen.id ? { ...c, status: statusModal.newStatus, statusReason } : c
    ));
    setStatusModal(null);
    setStatusReason('');
  };

  const handleFlag = (citizen) => {
    setCitizens(prev => prev.map(c => {
      if (c.id === citizen.id) {
        const newFlags = c.flagCount + 1;
        const autoSuspend = newFlags >= FALSE_ALARM_AUTO_SUSPEND_THRESHOLD;
        return { ...c, flagCount: newFlags, status: autoSuspend ? 'SUSPENDED' : c.status, statusReason: autoSuspend ? `Auto-suspended: ${newFlags} false alarms` : c.statusReason };
      }
      return c;
    }));
    setFlagModal(null);
  };

  const toggleRow = (id) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedRows(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(c => c.id)));
  };

  const handleBulkExport = () => {
    const data = filtered.filter(c => selectedRows.has(c.id));
    const csv = [
      ['Name', 'Phone', 'Area', 'Status', 'SOS Count', 'Flags', 'Registered'].join(','),
      ...data.map(c => [c.fullName, c.phone, c.area, c.status, c.totalSOS, c.flagCount, c.registrationDateStr].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'citizens.csv'; a.click();
  };

  return (
    <div className="citizens-page page-content" id="citizens-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Citizen Management</h1>
          <p className="page-subtitle">{citizens.length} registered citizens</p>
        </div>
        <Button variant="primary" icon={Download} onClick={handleBulkExport} id="export-citizens-btn">
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="citizens-filters animate-fade-in-up">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            id="citizen-search"
            type="text"
            className="input search-input"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <select className="select" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} id="citizen-status-filter">
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="HIDDEN">Hidden</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <select className="select" style={{ width: 150 }} value={areaFilter} onChange={e => setAreaFilter(e.target.value)} id="citizen-area-filter">
          <option value="ALL">All Areas</option>
          {areas.map(a => <option key={a}>{a}</option>)}
        </select>
        <span className="filter-count">{filtered.length} citizens</span>
      </div>

      {/* Bulk actions bar */}
      {selectedRows.size > 0 && (
        <div className="bulk-actions-bar animate-fade-in">
          <span>{selectedRows.size} selected</span>
          <Button variant="secondary" size="sm" onClick={handleBulkExport} icon={Download}>Export Selected</Button>
          <Button variant="danger" size="sm" onClick={() => { /* bulk suspend */ }}>Bulk Suspend</Button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedRows(new Set())}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap">
        <table className="citizens-table" id="citizens-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectedRows.size === filtered.length && filtered.length > 0} onChange={toggleAll} id="citizens-select-all" /></th>
              <th>Citizen</th>
              <th>Phone</th>
              <th>Area</th>
              <th>Registered</th>
              <th>Verification</th>
              <th>Status</th>
              <th>SOS / Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(citizen => (
              <tr key={citizen.id} className={`citizen-row ${selectedRows.has(citizen.id) ? 'selected' : ''}`} id={`citizen-row-${citizen.id}`}>
                <td><input type="checkbox" checked={selectedRows.has(citizen.id)} onChange={() => toggleRow(citizen.id)} /></td>
                <td>
                  <div className="citizen-name-cell" onClick={() => setSelectedCitizen(citizen)} style={{ cursor: 'pointer' }}>
                    <div className="avatar avatar-sm" style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' }}>
                      {citizen.firstName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{citizen.fullName}</p>
                    </div>
                  </div>
                </td>
                <td><span className="text-sm text-muted font-mono">{citizen.phone}</span></td>
                <td><span className="text-sm text-muted">{citizen.area}</span></td>
                <td><span className="text-sm text-muted">{citizen.registrationDateStr}</span></td>
                <td><Badge status={citizen.verificationStatus} size="sm" /></td>
                <td><Badge status={citizen.status} size="sm" /></td>
                <td>
                  <div className="citizen-sos-cell">
                    <span className="sos-count">{citizen.totalSOS} SOS</span>
                    {citizen.flagCount > 0 && (
                      <span className="flag-count">
                        <Flag size={10} /> {citizen.flagCount}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {STATUS_ACTIONS[citizen.status]?.includes('ACTIVE') && (
                      <button className="action-icon-btn success" onClick={() => handleStatusChange(citizen, 'ACTIVE')} title="Activate" id={`activate-${citizen.id}`}><CheckCircle size={13} /></button>
                    )}
                    {STATUS_ACTIONS[citizen.status]?.includes('HIDDEN') && (
                      <button className="action-icon-btn muted" onClick={() => handleStatusChange(citizen, 'HIDDEN')} title="Hide" id={`hide-${citizen.id}`}><EyeOff size={13} /></button>
                    )}
                    {STATUS_ACTIONS[citizen.status]?.includes('SUSPENDED') && (
                      <button className="action-icon-btn danger" onClick={() => handleStatusChange(citizen, 'SUSPENDED')} title="Suspend" id={`suspend-${citizen.id}`}><XCircle size={13} /></button>
                    )}
                    <button className="action-icon-btn warning" onClick={() => setFlagModal(citizen)} title="Flag false alarm" id={`flag-${citizen.id}`}><Flag size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Citizen Profile Modal */}
      {selectedCitizen && (
        <Modal isOpen onClose={() => setSelectedCitizen(null)} title={selectedCitizen.fullName} subtitle={`${selectedCitizen.area} · ${selectedCitizen.phone}`} id="citizen-profile-modal" width={560}>
          <div className="citizen-profile">
            <div className="profile-meta-grid">
              {[
                { label: 'Area', value: selectedCitizen.area },
                { label: 'Registered', value: selectedCitizen.registrationDateStr },
                { label: 'Verification', value: <Badge status={selectedCitizen.verificationStatus} size="sm" dot={false} /> },
                { label: 'Status', value: <Badge status={selectedCitizen.status} size="sm" /> },
                { label: 'Total SOS', value: selectedCitizen.totalSOS },
                { label: 'False Alarms', value: <span style={{ color: selectedCitizen.falseAlarmCount > 0 ? 'var(--accent-red)' : undefined }}>{selectedCitizen.falseAlarmCount}</span> },
              ].map(({ label, value }) => (
                <div key={label} className="profile-meta-item">
                  <p className="form-label">{label}</p>
                  <p className="profile-meta-value">{value}</p>
                </div>
              ))}
            </div>

            {selectedCitizen.statusReason && (
              <div className="profile-reason">
                <AlertTriangle size={13} style={{ color: 'var(--accent-amber)' }} />
                <span>Reason: {selectedCitizen.statusReason}</span>
              </div>
            )}

            <div className="sos-history-section">
              <p className="section-label">SOS History ({selectedCitizen.sosHistory.length})</p>
              {selectedCitizen.sosHistory.length === 0 && <p className="text-muted text-sm">No SOS events recorded</p>}
              {selectedCitizen.sosHistory.map((sos, i) => (
                <div key={sos.id} className={`sos-history-item ${sos.isFalseAlarm ? 'false-alarm' : ''}`}>
                  <div className="sos-history-dot" />
                  <div className="sos-history-info">
                    <p className="sos-type">{sos.type} {sos.isFalseAlarm && <span className="false-alarm-tag">FALSE ALARM</span>}</p>
                    <p className="sos-date">{formatDistanceToNow(new Date(sos.date), { addSuffix: true })}</p>
                  </div>
                  <Badge status={sos.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setSelectedCitizen(null)}>Close</Button>
            <Button variant="warning" icon={Flag} onClick={() => { setFlagModal(selectedCitizen); setSelectedCitizen(null); }} id="profile-flag-btn">Flag</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Status Change Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Change Citizen Status" id="status-change-modal" width={400}>
        {statusModal && (
          <div className="status-modal-body">
            <p className="text-sm" style={{ marginBottom: 16 }}>
              Change <strong>{statusModal.citizen.fullName}</strong> from{' '}
              <Badge status={statusModal.citizen.status} size="sm" /> to <Badge status={statusModal.newStatus} size="sm" />
            </p>
            <div className="form-group">
              <label className="form-label">Reason (required)</label>
              <textarea
                className="textarea"
                placeholder="Provide a reason for this status change..."
                value={statusReason}
                onChange={e => setStatusReason(e.target.value)}
                id="status-reason-input"
              />
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setStatusModal(null)}>Cancel</Button>
          <Button variant="primary" onClick={confirmStatusChange} disabled={!statusReason.trim()} id="confirm-status-btn">Confirm Change</Button>
        </ModalFooter>
      </Modal>

      {/* Flag Modal */}
      <Modal isOpen={!!flagModal} onClose={() => setFlagModal(null)} title="Flag False SOS Alarm" id="flag-modal" width={400}>
        {flagModal && (
          <div>
            <p className="text-sm" style={{ marginBottom: 16 }}>
              Flag <strong>{flagModal.fullName}</strong> for a false SOS alarm. Current flags: {flagModal.flagCount}/{FALSE_ALARM_AUTO_SUSPEND_THRESHOLD}
            </p>
            {flagModal.flagCount + 1 >= FALSE_ALARM_AUTO_SUSPEND_THRESHOLD && (
              <div className="flag-warning">
                <AlertTriangle size={14} />
                <span>This will trigger auto-suspension ({FALSE_ALARM_AUTO_SUSPEND_THRESHOLD} false alarms threshold reached).</span>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setFlagModal(null)}>Cancel</Button>
          <Button variant="warning" icon={Flag} onClick={() => handleFlag(flagModal)} id="confirm-flag-btn">Confirm Flag</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
