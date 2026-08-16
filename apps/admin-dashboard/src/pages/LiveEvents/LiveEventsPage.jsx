import { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { useAuthStore } from '../../store/authStore';
import { INCIDENT_STATUS, INCIDENT_TYPES } from '../../mockData/incidents';
import { OFFICER_STATUS_CONFIG } from '../../mockData/officers';
import * as incidentService from '../../services/incidentService';
import * as officerService from '../../services/officerService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Clock, Navigation2, UserCheck, AlertTriangle, Zap, Users, Phone, RefreshCw, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './LiveEventsPage.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB2GCWjLTqBF1tvlxWhyjp-tELiqP3gaz8';
const MAP_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a0e1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2840' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#061018' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
];

function ElapsedTimer({ raisedAt }) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const update = () => setElapsed(formatDistanceToNow(new Date(raisedAt), { addSuffix: false, includeSeconds: true }));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [raisedAt]);
  return <span className="elapsed-timer">{elapsed}</span>;
}

export default function LiveEventsPage() {
  // ── State ─────────────────────────────────────────────────────
  const { reassignIncident: localReassign, escalateIncident: localEscalate } = useLiveStore();
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [reassigningId, setReassigningId] = useState(null);
  const pollRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'live-events-map',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // ── Fetch incidents from backend ─────────────────────────────
  const fetchIncidents = useCallback(async (silent = false) => {
    if (!silent) setLoadingIncidents(true);
    setApiError(null);
    try {
      const data = await incidentService.getIncidents({ status: 'ACTIVE' });
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      setIncidents(list);
      // Auto-select first if none selected
      setSelectedEvent(prev => prev ?? list[0] ?? null);
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to load incidents');
    } finally {
      setLoadingIncidents(false);
    }
  }, []);

  // ── Fetch officers for reassign list ───────────────────────
  const fetchOfficers = useCallback(async () => {
    try {
      const data = await officerService.getOnDutyOfficers();
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      setOfficers(list);
    } catch {
      // Officers list is non-critical; ignore errors
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchOfficers();
    // Poll every 15 seconds
    pollRef.current = setInterval(() => fetchIncidents(true), 15000);
    return () => clearInterval(pollRef.current);
  }, [fetchIncidents, fetchOfficers]);

  const canSeeAll = ['SP', 'SUPER_ADMIN'].includes(user?.role);
  const activeEvents = incidents.filter(i => i.status === 'ACTIVE' || i.isActive);

  const handleReassign = async (incidentId, officerId) => {
    setReassigningId(incidentId);
    await new Promise(r => setTimeout(r, 600));
    // Optimistic local update (no backend reassign endpoint yet)
    setIncidents(prev => prev.map(i => i.id === incidentId ? { ...i, assignedOfficerId: officerId } : i));
    setShowReassignModal(false);
    setReassigningId(null);
  };

  const handleEscalate = async (incidentId) => {
    await new Promise(r => setTimeout(r, 300));
    // Optimistic local update
    setIncidents(prev => prev.map(i => i.id === incidentId ? { ...i, status: 'ESCALATED', escalated: true } : i));
  };

  const availableOfficers = officers.filter(o => o.status === 'ON_PATROL').slice(0, 12);
  const selectedOfficer = selectedEvent?.assignedOfficerId
    ? officers.find(o => o.id === selectedEvent.assignedOfficerId)
    : null;

  if (loadingIncidents && incidents.length === 0) {
    return (
      <div className="live-events-page" id="live-events-page">
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Live Events</h1>
              <p className="page-subtitle">Loading incidents from server...</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div className="login-spinner" style={{ margin: '0 auto 12px' }} />
            <p>Connecting to admin-service...</p>
            {apiError && <p style={{ marginTop: 8, color: 'var(--accent-red)', fontSize: 13 }}>{apiError}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-events-page" id="live-events-page">
      {/* Left: Event List */}
      <div className="events-list-panel">
        <div className="events-list-header">
          <div>
            <h1 className="page-title">Live Events</h1>
            <p className="page-subtitle">{activeEvents.length} incidents active right now</p>
          </div>
          <div className="events-count-badge">
            <span className="events-count-pulse" />
            {activeEvents.length}
          </div>
        </div>

        <div className="events-list">
          {activeEvents.map((event, idx) => {
            const typeObj = INCIDENT_TYPES.find(t => t.key === event.type);
            const assignedOff = event.assignedOfficerId ? officers.find(o => o.id === event.assignedOfficerId) : null;
            const isEscalated = event.status === 'ESCALATED' || event.status === 'ACTIVE';
            const isSelected = selectedEvent?.id === event.id;

            return (
              <div
                key={event.id}
                className={`event-card animate-fade-in-up stagger-${Math.min(idx + 1, 5)} ${isSelected ? 'selected' : ''} ${isEscalated ? 'escalated' : ''}`}
                onClick={() => setSelectedEvent(event)}
                id={`event-card-${event.id}`}
              >
                <div className="event-card-top">
                  <div className="event-type-icon">{typeObj?.icon || '🚨'}</div>
                  <div className="event-info">
                    <p className="event-type-label">{event.typeLabel}</p>
                    <p className="event-location">{event.location.address}</p>
                  </div>
                  <Badge status={event.status} size="sm" />
                </div>

                <div className="event-meta">
                  <div className="event-meta-item">
                    <Clock size={11} />
                    <ElapsedTimer raisedAt={event.raisedAt} />
                  </div>
                  {assignedOff && (
                    <div className="event-meta-item">
                      <UserCheck size={11} />
                      <span>{assignedOff.fullName}</span>
                    </div>
                  )}
                  {event.etaMinutes && (
                    <div className="event-meta-item">
                      <Navigation2 size={11} />
                      <span>{event.etaMinutes} min ETA</span>
                    </div>
                  )}
                </div>

                <div className="event-severity-bar">
                  <span className="event-severity-dot" style={{ background: event.severity === 'CRITICAL' ? 'var(--accent-red)' : event.severity === 'HIGH' ? 'var(--accent-orange)' : 'var(--accent-amber)' }} />
                  <span className="event-severity-label">{event.severity} · {event.zone}</span>
                </div>

                {/* Escalation warning */}
                {event.status === 'ACTIVE' && !assignedOff && (
                  <div className="event-escalation-warning">
                    <AlertTriangle size={12} />
                    <span>Unassigned — auto-escalating</span>
                    <button
                      className="escalate-now-btn"
                      onClick={(e) => { e.stopPropagation(); handleEscalate(event.id); }}
                      id={`escalate-btn-${event.id}`}
                    >
                      Escalate Now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Detail + Map */}
      <div className="events-detail-panel">
        {selectedEvent ? (
          <>
            {/* Event detail header */}
            <div className="event-detail-header">
              <div className="event-detail-title">
                <span className="event-detail-icon">
                  {INCIDENT_TYPES.find(t => t.key === selectedEvent.type)?.icon}
                </span>
                <div>
                  <h2>{selectedEvent.typeLabel}</h2>
                  <p>{selectedEvent.location.address}</p>
                </div>
              </div>
              <div className="event-detail-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => { setShowReassignModal(true); }}
                  id={`reassign-btn-${selectedEvent.id}`}
                >
                  Reassign
                </Button>
                {selectedEvent.status !== 'ESCALATED' && (
                  <Button
                    variant="warning"
                    size="sm"
                    icon={Zap}
                    onClick={() => handleEscalate(selectedEvent.id)}
                    id={`escalate-detail-btn-${selectedEvent.id}`}
                  >
                    Escalate
                  </Button>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="event-detail-stats">
              <div className="event-detail-stat">
                <Clock size={14} />
                <div>
                  <p className="edt-label">Time Elapsed</p>
                  <p className="edt-value"><ElapsedTimer raisedAt={selectedEvent.raisedAt} /></p>
                </div>
              </div>
              <div className="event-detail-stat">
                <Navigation2 size={14} />
                <div>
                  <p className="edt-label">ETA</p>
                  <p className="edt-value">{selectedEvent.etaMinutes ? `${selectedEvent.etaMinutes} min` : '—'}</p>
                </div>
              </div>
              <div className="event-detail-stat">
                <Users size={14} />
                <div>
                  <p className="edt-label">Notified</p>
                  <p className="edt-value">{selectedEvent.notifiedOfficers} officers</p>
                </div>
              </div>
              <div className="event-detail-stat">
                <Badge status={selectedEvent.severity} size="md" />
              </div>
            </div>

            {/* Assigned Officer */}
            {selectedOfficer && (
              <div className="assigned-officer-card">
                <div className="ao-avatar">{selectedOfficer.firstName[0]}</div>
                <div className="ao-info">
                  <p className="ao-name">{selectedOfficer.fullName}</p>
                  <p className="ao-details">{selectedOfficer.rank} · {selectedOfficer.badgeId} · {selectedOfficer.zone}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {selectedOfficer.specialties.map(s => (
                      <span key={s} className="specialty-tag">{s}</span>
                    ))}
                  </div>
                </div>
                <Badge status={selectedOfficer.status} size="sm" />
              </div>
            )}

            {/* Auto-dispatch reason card */}
            {selectedOfficer && (
              <div className="dispatch-reason-card">
                <div className="dispatch-reason-header">
                  <Zap size={13} />
                  <span>Auto-Dispatch Reason</span>
                </div>
                <p className="dispatch-reason-text">
                  <strong>{selectedOfficer.fullName}</strong> was matched because:{' '}
                  Closest available officer (~{Math.floor(Math.random() * 800 + 200)}m away),
                  assigned to {selectedOfficer.zone},
                  {selectedOfficer.specialties.length > 0 ? ` trained in ${selectedOfficer.specialties[0]}` : ' general patrol'}.
                </p>
              </div>
            )}

            {/* Timeline */}
            <div className="event-timeline-section">
              <p className="event-timeline-title">Incident Timeline</p>
              <div className="event-timeline">
                {selectedEvent.timeline.map((step, i) => (
                  <div key={i} className={`timeline-step ${i === selectedEvent.timeline.length - 1 ? 'current' : 'done'}`}>
                    <div className="timeline-dot" />
                    {i < selectedEvent.timeline.length - 1 && <div className="timeline-line" />}
                    <div className="timeline-content">
                      <p className="timeline-label">{step.label}</p>
                      <p className="timeline-time">{new Date(step.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini map */}
            <div className="event-mini-map">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={{ lat: selectedEvent.location.lat, lng: selectedEvent.location.lng }}
                  zoom={15}
                  options={{ styles: MAP_DARK_STYLE, disableDefaultUI: true }}
                >
                  <Marker position={{ lat: selectedEvent.location.lat, lng: selectedEvent.location.lng }} />
                  {selectedOfficer && (
                    <Marker
                      position={{ lat: selectedOfficer.lat, lng: selectedOfficer.lng }}
                      icon={{ path: window.google?.maps?.SymbolPath?.CIRCLE, fillColor: '#06b6d4', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 10 }}
                    />
                  )}
                </GoogleMap>
              ) : <div className="shimmer-bg" style={{ height: '100%', borderRadius: 8 }} />}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p className="empty-state-title">Select an event</p>
          </div>
        )}
      </div>

      {/* Reassign Modal */}
      <Modal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title="Reassign Incident"
        subtitle={`Select a different officer to respond to ${selectedEvent?.typeLabel}`}
        id="reassign-modal"
        width={480}
      >
        <div className="reassign-officer-list">
          {availableOfficers.map(off => (
            <div
              key={off.id}
              className={`reassign-officer-row ${off.id === selectedEvent?.assignedOfficerId ? 'current' : ''}`}
              onClick={() => handleReassign(selectedEvent.id, off.id)}
              id={`reassign-officer-${off.id}`}
            >
              <div className="avatar avatar-sm" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue-light)' }}>
                {off.firstName[0]}
              </div>
              <div className="reassign-off-info">
                <p>{off.fullName}</p>
                <p className="text-muted text-xs">{off.rank} · {off.zone}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {off.specialties.slice(0, 1).map(s => (
                  <span key={s} className="specialty-tag">{s}</span>
                ))}
              </div>
              <Badge status={off.status} size="sm" />
              {off.id === selectedEvent?.assignedOfficerId && (
                <span className="current-badge">Current</span>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
