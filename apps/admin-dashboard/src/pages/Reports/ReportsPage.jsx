import { useState, useMemo } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { INCIDENT_STATUS, INCIDENT_TYPES, SEVERITY } from '../../mockData/incidents';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { Search, Download, FileText, Filter, ChevronUp, ChevronDown, X } from 'lucide-react';
import { format } from 'date-fns';
import './ReportsPage.css';

const SORT_FIELDS = ['raisedAt', 'typeLabel', 'status', 'severity', 'zone'];

export default function ReportsPage() {
  const { incidents, officers } = useLiveStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sortField, setSortField] = useState('raisedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let list = incidents.filter(i => {
      const matchSearch = !search || i.typeLabel.toLowerCase().includes(search.toLowerCase()) || i.location.address.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search);
      const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
      const matchType = typeFilter === 'ALL' || i.type === typeFilter;
      const matchSev = severityFilter === 'ALL' || i.severity === severityFilter;
      return matchSearch && matchStatus && matchType && matchSev;
    });
    list = [...list].sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === 'raisedAt') { av = new Date(av); bv = new Date(bv); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [incidents, search, statusFilter, typeFilter, severityFilter, sortField, sortDir]);

  const handleExportCSV = () => {
    const rows = [
      ['ID', 'Type', 'Status', 'Severity', 'Location', 'Zone', 'Raised At', 'Officer'].join(','),
      ...filtered.map(i => {
        const off = i.assignedOfficerId ? officers.find(o => o.id === i.assignedOfficerId) : null;
        return [i.id, i.typeLabel, i.status, i.severity, `"${i.location.address}"`, i.zone, i.raisedAtStr, off?.fullName || '—'].join(',');
      })
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'incidents.csv'; a.click();
  };

  const SortIcon = ({ field }) => (
    sortField === field
      ? (sortDir === 'asc' ? <ChevronUp size={12} style={{ color: 'var(--accent-blue-light)' }} /> : <ChevronDown size={12} style={{ color: 'var(--accent-blue-light)' }} />)
      : <ChevronDown size={12} style={{ opacity: 0.3 }} />
  );

  const selectedOfficer = selectedIncident?.assignedOfficerId
    ? officers.find(o => o.id === selectedIncident.assignedOfficerId)
    : null;

  return (
    <div className="reports-page page-content" id="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Incident Tracking</h1>
          <p className="page-subtitle">{incidents.length} total incidents · {filtered.length} shown</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} id="export-csv-btn">Export CSV</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="reports-filters animate-fade-in-up">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input id="report-search" type="text" className="input search-input" placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <select className="select" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} id="report-status-filter">
          <option value="ALL">All Statuses</option>
          {Object.keys(INCIDENT_STATUS).map(k => <option key={k} value={k}>{INCIDENT_STATUS[k].label}</option>)}
        </select>
        <select className="select" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} id="report-type-filter">
          <option value="ALL">All Types</option>
          {INCIDENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <select className="select" style={{ width: 130 }} value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} id="report-severity-filter">
          <option value="ALL">All Severity</option>
          {Object.keys(SEVERITY).map(k => <option key={k} value={k}>{SEVERITY[k].label}</option>)}
        </select>
        <span className="filter-count">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="reports-table" id="reports-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('raisedAt')} className="sortable-th">
                Date/Time <SortIcon field="raisedAt" />
              </th>
              <th onClick={() => handleSort('typeLabel')} className="sortable-th">
                Type <SortIcon field="typeLabel" />
              </th>
              <th>Location</th>
              <th onClick={() => handleSort('severity')} className="sortable-th">
                Severity <SortIcon field="severity" />
              </th>
              <th onClick={() => handleSort('status')} className="sortable-th">
                Status <SortIcon field="status" />
              </th>
              <th>Officer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((incident, idx) => {
              const off = incident.assignedOfficerId ? officers.find(o => o.id === incident.assignedOfficerId) : null;
              return (
                <tr key={incident.id} className="report-row" id={`report-row-${incident.id}`}>
                  <td>
                    <div>
                      <p className="text-sm font-medium">{format(new Date(incident.raisedAt), 'dd MMM yyyy')}</p>
                      <p className="text-xs text-muted font-mono">{format(new Date(incident.raisedAt), 'HH:mm:ss')}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{incident.typeIcon}</span>
                      <div>
                        <p className="text-sm font-medium">{incident.typeLabel}</p>
                        <p className="text-xs text-muted font-mono">{incident.id.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm">{incident.location.address}</p>
                    <p className="text-xs text-muted">{incident.zone}</p>
                  </td>
                  <td><Badge status={incident.severity} size="sm" /></td>
                  <td><Badge status={incident.status} size="sm" /></td>
                  <td>
                    {off ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)' }}>{off.firstName[0]}</div>
                        <div>
                          <p className="text-sm">{off.fullName}</p>
                          <p className="text-xs text-muted">{off.badgeId}</p>
                        </div>
                      </div>
                    ) : <span className="text-sm text-muted">Unassigned</span>}
                  </td>
                  <td>
                    <Button variant="ghost" size="sm" icon={FileText} onClick={() => setSelectedIncident(incident)} id={`report-view-${incident.id}`}>View</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={24} /></div>
            <p className="empty-state-title">No incidents found</p>
            <p className="empty-state-desc">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <Modal isOpen onClose={() => setSelectedIncident(null)} title={`${selectedIncident.typeIcon} ${selectedIncident.typeLabel}`} subtitle={`${selectedIncident.id.toUpperCase()} · ${selectedIncident.location.address}`} id="incident-detail-modal" width={600}>
          <div className="incident-detail">
            <div className="incident-badges-row">
              <Badge status={selectedIncident.status} size="md" />
              <Badge status={selectedIncident.severity} size="md" />
              <span className="text-xs text-muted">{selectedIncident.zone}</span>
            </div>

            {/* Timeline */}
            <div className="incident-timeline-section">
              <p className="section-label">Incident Timeline</p>
              <div className="incident-timeline-list">
                {selectedIncident.timeline.map((step, i) => (
                  <div key={i} className={`inc-timeline-item ${i === selectedIncident.timeline.length - 1 ? 'current' : ''}`}>
                    <div className="inc-timeline-dot" />
                    {i < selectedIncident.timeline.length - 1 && <div className="inc-timeline-connector" />}
                    <div className="inc-timeline-content">
                      <p className="inc-timeline-label">{step.label}</p>
                      <p className="inc-timeline-time font-mono">{format(new Date(step.timestamp), 'dd MMM HH:mm:ss')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Officer */}
            {selectedOfficer && (
              <div>
                <p className="section-label">Responding Officer</p>
                <div className="assigned-officer-card">
                  <div className="ao-avatar">{selectedOfficer.firstName[0]}</div>
                  <div className="ao-info">
                    <p className="ao-name">{selectedOfficer.fullName}</p>
                    <p className="ao-details">{selectedOfficer.rank} · {selectedOfficer.badgeId}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Closure Note */}
            {selectedIncident.closureNote && (
              <div className="closure-note">
                <p className="section-label">Closure Note</p>
                <p className="text-sm" style={{ lineHeight: 1.6 }}>{selectedIncident.closureNote}</p>
              </div>
            )}
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setSelectedIncident(null)}>Close</Button>
            <Button variant="primary" icon={Download} id="export-single-report-btn">Export PDF</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
