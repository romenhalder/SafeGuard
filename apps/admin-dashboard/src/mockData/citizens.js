// ============================================
// SAFEGUARD — Mock Citizens Data
// ============================================
import { subDays, subHours, format } from 'date-fns';

const now = new Date();

const firstNames = ['Ananya', 'Subhash', 'Priya', 'Ratan', 'Mitra', 'Sandip', 'Keya', 'Abhijit', 'Sushma', 'Debashis'];
const lastNames = ['Bose', 'Roy', 'Sen', 'Ghosh', 'Das', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Dutta', 'Chakraborty'];
const AREAS = ['Esplanade', 'Howrah', 'Salt Lake', 'Park Street', 'Behala', 'Gariahat', 'Jadavpur', 'Tollygunge'];

export const CITIZEN_STATUS = {
  ACTIVE: { label: 'Active', color: 'var(--accent-green)', bg: 'var(--accent-green-dim)' },
  HIDDEN: { label: 'Hidden', color: 'var(--text-secondary)', bg: 'rgba(71,85,105,0.2)' },
  SUSPENDED: { label: 'Suspended', color: 'var(--accent-red)', bg: 'var(--accent-red-dim)' },
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.random() * (max - min) + min; }

function generateCitizen(index) {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const status = index === 3 ? 'SUSPENDED' : index === 7 ? 'HIDDEN' : 'ACTIVE';
  const regDate = subDays(now, Math.floor(rand(10, 700)));
  const sosCount = Math.floor(rand(0, 15));
  const falseAlarmCount = Math.floor(rand(0, Math.min(sosCount, 4)));

  const sosHistory = Array.from({ length: sosCount }, (_, j) => ({
    id: `sos-${index}-${j}`,
    date: subHours(now, rand(j * 50, (j + 1) * 100)),
    type: pickRandom(['SOS', 'ASSAULT', 'THEFT', 'MEDICAL', 'HARASSMENT', 'OTHER']),
    status: j === 0 && ['ACTIVE', 'EN_ROUTE'].includes(status) ? 'ACTIVE' : 'CLOSED',
    resolvedByOfficer: `off-${String(Math.floor(rand(1, 51))).padStart(3, '0')}`,
    isFalseAlarm: j < falseAlarmCount,
  }));

  return {
    id: `cit-${String(index + 1).padStart(3, '0')}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    phone: `+91 9${String(Math.floor(rand(100000000, 999999999))).substring(0, 9)}`,
    area: pickRandom(AREAS),
    address: `${Math.floor(rand(1, 200))} ${pickRandom(AREAS)} Road, Kolkata`,
    registrationDate: regDate,
    registrationDateStr: format(regDate, 'dd MMM yyyy'),
    verificationStatus: Math.random() > 0.2 ? 'VERIFIED' : 'UNVERIFIED',
    status,
    statusReason: status !== 'ACTIVE' ? (status === 'SUSPENDED' ? 'Multiple false SOS reports (3 occurrences)' : 'User requested account hide') : null,
    sosHistory,
    totalSOS: sosCount,
    falseAlarmCount,
    lastActivity: sosCount > 0 ? sosHistory[0].date : regDate,
    flagCount: falseAlarmCount,
  };
}

export const mockCitizens = Array.from({ length: 30 }, (_, i) => generateCitizen(i));

export const FALSE_ALARM_AUTO_SUSPEND_THRESHOLD = 3;
