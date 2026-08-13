// ============================================
// SAFEGUARD — Mock Incidents Data
// ============================================
import { subMinutes, subHours, subDays, format, addMinutes } from 'date-fns';

const now = new Date();

export const INCIDENT_TYPES = [
  { key: 'SOS', label: 'SOS Emergency', icon: '🆘', color: 'var(--accent-red)' },
  { key: 'ASSAULT', label: 'Assault', icon: '⚠️', color: 'var(--accent-red)' },
  { key: 'THEFT', label: 'Theft / Robbery', icon: '🔓', color: 'var(--accent-orange)' },
  { key: 'FIRE', label: 'Fire', icon: '🔥', color: 'var(--accent-orange)' },
  { key: 'MEDICAL', label: 'Medical Emergency', icon: '🏥', color: 'var(--accent-amber)' },
  { key: 'HARASSMENT', label: 'Harassment', icon: '🚨', color: 'var(--accent-amber)' },
  { key: 'ACCIDENT', label: 'Road Accident', icon: '🚗', color: 'var(--accent-amber)' },
  { key: 'OTHER', label: 'Other', icon: '📋', color: 'var(--text-muted)' },
];

export const INCIDENT_STATUS = {
  ACTIVE: { label: 'Active', color: 'var(--accent-red)', bg: 'var(--accent-red-dim)' },
  EN_ROUTE: { label: 'En Route', color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-dim)' },
  REACHED: { label: 'Reached', color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)' },
  RESOLVED: { label: 'Resolved', color: 'var(--accent-green)', bg: 'var(--accent-green-dim)' },
  ESCALATED: { label: 'Escalated', color: 'var(--accent-purple)', bg: 'var(--accent-purple-dim)' },
  CLOSED: { label: 'Closed', color: 'var(--text-muted)', bg: 'rgba(71,85,105,0.2)' },
};

export const SEVERITY = {
  CRITICAL: { label: 'Critical', color: 'var(--severity-critical)' },
  HIGH: { label: 'High', color: 'var(--severity-high)' },
  MEDIUM: { label: 'Medium', color: 'var(--severity-medium)' },
  LOW: { label: 'Low', color: 'var(--severity-low)' },
};

const LOCATIONS = [
  { address: '14 Park Street, Kolkata', lat: 22.5524, lng: 88.3527, zone: 'Zone D — Park Street' },
  { address: 'Esplanade Metro Station', lat: 22.5726, lng: 88.3499, zone: 'Zone A — Esplanade' },
  { address: 'Howrah Bridge, Howrah', lat: 22.5851, lng: 88.3468, zone: 'Zone B — Howrah' },
  { address: 'Salt Lake Sector V', lat: 22.5838, lng: 88.4144, zone: 'Zone C — Salt Lake' },
  { address: 'New Market, Kolkata', lat: 22.5609, lng: 88.3537, zone: 'Zone A — Esplanade' },
  { address: 'Behala Chowrasta', lat: 22.4995, lng: 88.3215, zone: 'Zone E — Behala' },
  { address: 'Gariahat Road', lat: 22.5166, lng: 88.3662, zone: 'Zone D — Park Street' },
  { address: 'Sealdah Station', lat: 22.5654, lng: 88.3704, zone: 'Zone A — Esplanade' },
  { address: 'Jadavpur University', lat: 22.4988, lng: 88.3718, zone: 'Zone E — Behala' },
  { address: 'Tollygunge Metro', lat: 22.4990, lng: 88.3474, zone: 'Zone E — Behala' },
];

const OFFICER_IDS = Array.from({ length: 50 }, (_, i) => `off-${String(i + 1).padStart(3, '0')}`);
const CITIZEN_IDS = Array.from({ length: 10 }, (_, i) => `cit-${String(i + 1).padStart(3, '0')}`);

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.random() * (max - min) + min; }

function buildTimeline(raisedAt, status) {
  const steps = [];
  steps.push({ event: 'RAISED', timestamp: raisedAt, label: 'SOS Raised by Citizen' });

  const types = ['ACTIVE', 'EN_ROUTE', 'REACHED', 'RESOLVED', 'CLOSED', 'ESCALATED'];
  const statusIndex = types.indexOf(status);

  if (statusIndex >= 1) {
    const acceptedAt = addMinutes(raisedAt, rand(0.5, 3));
    steps.push({ event: 'ACCEPTED', timestamp: acceptedAt, label: 'Officer Accepted Alert' });
  }
  if (statusIndex >= 2) {
    const enRouteAt = addMinutes(steps[steps.length - 1].timestamp, rand(0.5, 2));
    steps.push({ event: 'EN_ROUTE', timestamp: enRouteAt, label: 'Officer En Route' });
  }
  if (statusIndex >= 3) {
    const reachedAt = addMinutes(steps[steps.length - 1].timestamp, rand(2, 15));
    steps.push({ event: 'REACHED', timestamp: reachedAt, label: 'Officer Reached Location' });
  }
  if (statusIndex >= 4) {
    const resolvedAt = addMinutes(steps[steps.length - 1].timestamp, rand(5, 30));
    steps.push({ event: 'CLOSED', timestamp: resolvedAt, label: 'Incident Closed' });
  }
  return steps;
}

function generateIncident(index, forceStatus = null) {
  const location = pickRandom(LOCATIONS);
  const typeObj = pickRandom(INCIDENT_TYPES);
  const statusKeys = Object.keys(INCIDENT_STATUS);
  const status = forceStatus || pickRandom(statusKeys);
  const severityKeys = Object.keys(SEVERITY);
  const severity = pickRandom(severityKeys);
  const raisedAt = subMinutes(now, rand(5, 60 * 24 * 30)); // within last 30 days
  const isActive = ['ACTIVE', 'EN_ROUTE', 'REACHED', 'ESCALATED'].includes(status);
  const assignedOfficer = status !== 'ACTIVE' ? pickRandom(OFFICER_IDS) : null;

  return {
    id: `inc-${String(index + 1).padStart(3, '0')}`,
    type: typeObj.key,
    typeLabel: typeObj.label,
    typeIcon: typeObj.icon,
    status,
    severity,
    location: { ...location },
    citizenId: pickRandom(CITIZEN_IDS),
    assignedOfficerId: assignedOfficer,
    raisedAt,
    raisedAtStr: format(raisedAt, 'dd MMM yyyy, HH:mm'),
    timeline: buildTimeline(raisedAt, status),
    closureNote: status === 'CLOSED' || status === 'RESOLVED'
      ? 'Situation neutralized. Citizen safe. Filed report #KP-2024-' + String(Math.floor(rand(1000, 9999))) + '.'
      : null,
    escalated: status === 'ESCALATED',
    notifiedOfficers: Math.floor(rand(2, 6)),
    zone: location.zone,
    isActive,
    etaMinutes: isActive && assignedOfficer ? Math.floor(rand(2, 18)) : null,
  };
}

// Generate: first 8 are "active" incidents for Live Events panel
export const mockIncidents = [
  ...Array.from({ length: 8 }, (_, i) => generateIncident(i, pickRandom(['ACTIVE', 'EN_ROUTE', 'REACHED', 'ESCALATED']))),
  ...Array.from({ length: 20 }, (_, i) => generateIncident(i + 8)),
];

export const mockActiveIncidents = mockIncidents.filter(inc => inc.isActive);
