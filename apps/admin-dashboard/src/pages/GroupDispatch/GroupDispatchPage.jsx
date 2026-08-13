import { useState } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { mockGroups } from '../../mockData/groups';
import { INCIDENT_TYPES } from '../../mockData/incidents';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { Send, Plus, Users, Zap, Check, X, Clock, Shield, Radio } from 'lucide-react';
import './GroupDispatchPage.css';

export default function GroupDispatchPage() {
  const { officers, incidents } = useLiveStore();
  const [groups, setGroups] = useState([...mockGroups]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [broadcastIncidentId, setBroadcastIncidentId] = useState('');
  const [broadcastGroupId, setBroadcastGroupId] = useState('');
  const [broadcastResponse, setBroadcastResponse] = useState(null); // tracking state

  const activeIncidents = incidents.filter(i => i.isActive);

  const getGroupOfficers = (group) => group.officerIds.map(id => officers.find(o => o.id === id)).filter(Boolean);

  const handleBroadcast = async () => {
    const group = groups.find(g => g.id === broadcastGroupId);
    if (!group || !broadcastIncidentId) return;
    setShowBroadcastModal(false);
    // Simulate broadcast — first officer to "accept"
    const notified = getGroupOfficers(group);
    const tracking = notified.map(o => ({ officer: o, status: 'NOTIFIED', notifiedAt: new Date() }));
    setBroadcastResponse({ group, incidentId: broadcastIncidentId, tracking });
    // Simulate responses coming in after delays
    tracking.forEach((entry, i) => {
      setTimeout(() => {
        setBroadcastResponse(prev => {
          if (!prev) return null;
          const updated = [...prev.tracking];
          updated[i] = {
            ...updated[i],
            status: i === 0 ? 'ACCEPTED' : Math.random() > 0.5 ? 'IGNORED' : 'SEEN',
          };
          return { ...prev, tracking: updated };
        });
      }, 1000 + i * 800);
    });
  };

  return (
    <div className="group-dispatch-page page-content" id="group-dispatch-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Group Dispatch</h1>
          <p className="page-subtitle">Broadcast emergencies to officer teams</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary" icon={Radio} onClick={() => setShowBroadcastModal(true)} id="broadcast-btn">
            Broadcast Incident
          </Button>
          <Button variant="secondary" icon={Plus} onClick={() => setShowCreateModal(true)} id="create-group-btn">
            New Group
          </Button>
        </div>
      </div>

      {/* Broadcast response tracker */}
      {broadcastResponse && (
        <div className="broadcast-tracker animate-fade-in">
          <div className="broadcast-tracker-header">
            <div>
              <Radio size={16} style={{ color: 'var(--accent-purple)' }} />
              <span>Broadcast Active — Group: {broadcastResponse.group.name}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setBroadcastResponse(null)}><X size={13} /></button>
          </div>
          <div className="broadcast-tracker-list">
            {broadcastResponse.tracking.map((entry, i) => (
              <div key={entry.officer.id} className={`broadcast-tracker-row status-${entry.status.toLowerCase()}`} id={`tracker-${entry.officer.id}`}>
                <div className="avatar avatar-sm" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)' }}>
                  {entry.officer.firstName[0]}
                </div>
                <div className="tracker-info">
                  <p className="text-sm font-medium">{entry.officer.fullName}</p>
                  <p className="text-xs text-muted">{entry.officer.zone}</p>
                </div>
                <div className="tracker-status">
                  {entry.status === 'NOTIFIED' && <span className="tracker-status-badge notified"><Clock size={10} /> Notified</span>}
                  {entry.status === 'SEEN' && <span className="tracker-status-badge seen"><Check size={10} /> Seen</span>}
                  {entry.status === 'ACCEPTED' && <span className="tracker-status-badge accepted"><Check size={10} /> Accepted ✓</span>}
                  {entry.status === 'IGNORED' && <span className="tracker-status-badge ignored"><X size={10} /> No Response</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="groups-grid">
        {groups.map((group, idx) => {
          const groupOfficers = getGroupOfficers(group);
          const activeCount = groupOfficers.filter(o => o.status !== 'OFF_DUTY').length;

          return (
            <div
              key={group.id}
              className={`group-card animate-fade-in-up stagger-${(idx % 5) + 1} ${selectedGroup?.id === group.id ? 'selected' : ''}`}
              onClick={() => setSelectedGroup(selectedGroup?.id === group.id ? null : group)}
              id={`group-card-${group.id}`}
            >
              <div className="group-card-header">
                <div className="group-icon">
                  <Users size={18} />
                </div>
                <div className="group-info">
                  <p className="group-name">{group.name}</p>
                  <p className="group-desc">{group.description}</p>
                </div>
                <div className="group-active-badge">
                  <span className="group-active-dot" />
                  {activeCount}/{group.officerIds.length}
                </div>
              </div>

              <div className="group-tags">
                {group.zone && <span className="group-tag blue">{group.zone.split(' — ')[1]}</span>}
                {group.shift && <span className="group-tag purple">{group.shift} Shift</span>}
                {group.specialty && <span className="group-tag green">{group.specialty}</span>}
              </div>

              <div className="group-members">
                {groupOfficers.slice(0, 5).map(o => (
                  <div key={o.id} className="group-member-avatar" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)' }} title={o.fullName}>
                    {o.firstName[0]}
                  </div>
                ))}
                {groupOfficers.length > 5 && (
                  <div className="group-member-avatar more">+{groupOfficers.length - 5}</div>
                )}
              </div>

              <div className="group-card-footer" onClick={e => e.stopPropagation()}>
                <Button
                  variant="purple"
                  size="sm"
                  icon={Send}
                  onClick={() => { setBroadcastGroupId(group.id); setShowBroadcastModal(true); }}
                  id={`broadcast-group-${group.id}`}
                >
                  Broadcast
                </Button>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Group Expanded View */}
      {selectedGroup && (
        <div className="group-detail-panel animate-fade-in-up">
          <div className="group-detail-header">
            <h2>{selectedGroup.name}</h2>
            <p className="text-muted text-sm">{selectedGroup.description}</p>
          </div>
          <div className="group-officers-list">
            {getGroupOfficers(selectedGroup).map(o => (
              <div key={o.id} className="group-officer-row" id={`group-member-${o.id}`}>
                <div className="avatar avatar-sm" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)' }}>{o.firstName[0]}</div>
                <div style={{ flex: 1 }}>
                  <p className="text-sm font-medium">{o.fullName}</p>
                  <p className="text-xs text-muted">{o.rank} · {o.zone}</p>
                </div>
                {o.specialties.length > 0 && <span className="specialty-tag">{o.specialties[0]}</span>}
                <Badge status={o.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      <Modal isOpen={showBroadcastModal} onClose={() => setShowBroadcastModal(false)} title="Broadcast Incident to Group" id="broadcast-modal" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Select Active Incident</label>
            <select className="select" value={broadcastIncidentId} onChange={e => setBroadcastIncidentId(e.target.value)} id="broadcast-incident-select">
              <option value="">Choose incident...</option>
              {activeIncidents.map(inc => (
                <option key={inc.id} value={inc.id}>{inc.typeIcon} {inc.typeLabel} — {inc.location.address}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Select Group</label>
            <select className="select" value={broadcastGroupId} onChange={e => setBroadcastGroupId(e.target.value)} id="broadcast-group-select">
              <option value="">Choose group...</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.officerIds.length} officers)</option>
              ))}
            </select>
          </div>
          {broadcastGroupId && broadcastIncidentId && (
            <div className="broadcast-confirm-info">
              <Shield size={14} style={{ color: 'var(--accent-purple)' }} />
              <span className="text-sm">Alert will be sent to <strong>{groups.find(g => g.id === broadcastGroupId)?.officerIds.length || 0} officers</strong>. First to accept gets dispatched.</span>
            </div>
          )}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowBroadcastModal(false)}>Cancel</Button>
          <Button variant="purple" icon={Send} onClick={handleBroadcast} disabled={!broadcastGroupId || !broadcastIncidentId} id="confirm-broadcast-btn">
            Send Broadcast
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create Group Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Officer Group" id="create-group-modal" width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group"><label className="form-label">Group Name</label><input className="input" placeholder="e.g. Night Patrol Team C" id="group-name-input" /></div>
          <div className="form-group"><label className="form-label">Description</label><input className="input" placeholder="Brief description" id="group-desc-input" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Zone (optional)</label>
              <select className="select" id="group-zone-select"><option value="">Any zone</option>{['Esplanade', 'Howrah', 'Salt Lake', 'Park Street', 'Behala'].map(z => <option key={z}>{z}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Shift (optional)</label>
              <select className="select" id="group-shift-select"><option value="">Any shift</option><option>Morning</option><option>Evening</option><option>Night</option></select>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setShowCreateModal(false)} id="save-group-btn">Create Group</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
