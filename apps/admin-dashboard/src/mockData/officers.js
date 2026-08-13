// ============================================
// SAFEGUARD — Mock Officers Data
// 50 officers across 3 zones/stations
// ============================================
import { subHours, subMinutes, format } from 'date-fns';

const now = new Date();

const ZONES = ['Zone A — Esplanade', 'Zone B — Howrah', 'Zone C — Salt Lake', 'Zone D — Park Street', 'Zone E — Behala'];
const STATIONS = [
  { id: 'st-001', name: 'Lalbazar HQ', oc: 'OC' },
  { id: 'st-002', name: 'Howrah Thana', oc: 'OC' },
  { id: 'st-003', name: 'Salt Lake PS', oc: 'OC' },
];
const RANKS = ['Constable', 'Head Constable', 'ASI', 'SI', 'Inspector'];
const SPECIALTIES = [
  'Medical Response', 'Fire Rescue', 'Riot Control', 'Cyber Crime',
  'Anti-Narcotics', 'Traffic', 'VIP Security', 'Canine Unit', 'Harassment Cases'
];
const STATUSES = ['ON_PATROL', 'ON_PATROL', 'ON_PATROL', 'ACTIVE_CALL', 'RETURNING', 'OFF_DUTY'];

const firstNames = ['Rajesh', 'Sunil', 'Amit', 'Praveen', 'Sanjay', 'Anoop', 'Deepak', 'Vikram', 'Mohan', 'Ravi',
  'Arun', 'Kartik', 'Suresh', 'Ramesh', 'Dinesh', 'Mahesh', 'Ganesh', 'Lokesh', 'Nilesh', 'Umesh',
  'Priya', 'Sunita', 'Kavya', 'Anita', 'Rekha', 'Meena', 'Seema', 'Geeta', 'Lata', 'Nita'];
const lastNames = ['Kumar', 'Sharma', 'Singh', 'Verma', 'Gupta', 'Patel', 'Yadav', 'Das', 'Roy', 'Ghosh',
  'Chatterjee', 'Banerjee', 'Mukherjee', 'Sen', 'Bose', 'Dey', 'Mondal', 'Mandal', 'Biswas', 'Chakraborty'];

// Base coordinates near Kolkata center (22.5726, 88.3639)
const ZONE_BOUNDS = {
  'Zone A — Esplanade': { lat: 22.5726, lng: 88.3639, spread: 0.012 },
  'Zone B — Howrah': { lat: 22.5726, lng: 88.3100, spread: 0.015 },
  'Zone C — Salt Lake': { lat: 22.5838, lng: 88.4144, spread: 0.018 },
  'Zone D — Park Street': { lat: 22.5524, lng: 88.3527, spread: 0.010 },
  'Zone E — Behala': { lat: 22.4995, lng: 88.3215, spread: 0.014 },
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOfficer(index) {
  const zone = ZONES[index % ZONES.length];
  const bounds = ZONE_BOUNDS[zone];
  const status = pick(STATUSES);
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const station = STATIONS[index % STATIONS.length];
  const lastPing = status === 'OFF_DUTY'
    ? subHours(now, rand(1, 8))
    : subMinutes(now, rand(0, 3));
  const specialtyCount = Math.floor(rand(1, 3));
  const officerSpecialties = [];
  const shuffled = [...SPECIALTIES].sort(() => Math.random() - 0.5);
  for (let i = 0; i < specialtyCount; i++) officerSpecialties.push(shuffled[i]);

  return {
    id: `off-${String(index + 1).padStart(3, '0')}`,
    badgeId: `KP${String(1000 + index).padStart(4, '0')}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    rank: RANKS[Math.min(Math.floor(rand(0, RANKS.length)), RANKS.length - 1)],
    phone: `+91 9${String(Math.floor(rand(100000000, 999999999))).substring(0, 9)}`,
    zone,
    stationId: station.id,
    stationName: station.name,
    status, // ON_PATROL | ACTIVE_CALL | RETURNING | OFF_DUTY
    lat: bounds.lat + rand(-bounds.spread, bounds.spread),
    lng: bounds.lng + rand(-bounds.spread, bounds.spread),
    lastPing,
    lastPingStr: format(lastPing, 'HH:mm:ss'),
    photoUrl: null, // Will use initials avatar
    specialties: officerSpecialties,
    joinDate: subHours(now, rand(2000, 20000)),
    avgResponseTime: Math.floor(rand(180, 900)), // seconds
    incidentsHandled: Math.floor(rand(10, 200)),
    acceptanceRate: Math.floor(rand(70, 99)),
    citizenRating: parseFloat(rand(3.2, 5.0).toFixed(1)),
    activeIncidentId: status === 'ACTIVE_CALL' ? `inc-${String(Math.floor(rand(1, 20))).padStart(3, '0')}` : null,
    shift: pick(['Morning', 'Evening', 'Night']),
    isActive: status !== 'OFF_DUTY',
  };
}

export const mockOfficers = Array.from({ length: 50 }, (_, i) => generateOfficer(i));

export const OFFICER_STATUS_CONFIG = {
  ON_PATROL: { label: 'On Patrol', color: 'var(--status-on-patrol)', dot: '#10b981' },
  ACTIVE_CALL: { label: 'Active Call', color: 'var(--status-active-call)', dot: '#06b6d4' },
  RETURNING: { label: 'Returning', color: 'var(--status-returning)', dot: '#f59e0b' },
  OFF_DUTY: { label: 'Off Duty', color: 'var(--status-off-duty)', dot: '#374151' },
};

export { ZONES, STATIONS, RANKS, SPECIALTIES };
