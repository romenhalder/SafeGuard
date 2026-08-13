// ============================================
// SAFEGUARD — Mock Zones Data (GeoJSON Polygons)
// ============================================

export const mockZones = [
  {
    id: 'zone-a',
    name: 'Zone A — Esplanade',
    color: '#3b82f6',
    stationId: 'st-001',
    officerCount: 12,
    activeIncidents: 3,
    paths: [
      { lat: 22.582, lng: 88.340 },
      { lat: 22.582, lng: 88.362 },
      { lat: 22.563, lng: 88.362 },
      { lat: 22.563, lng: 88.340 },
    ],
    avgResponseTime: 320,
    incidentCount30d: 28,
    coverageGap: false,
  },
  {
    id: 'zone-b',
    name: 'Zone B — Howrah',
    color: '#10b981',
    stationId: 'st-002',
    officerCount: 10,
    activeIncidents: 1,
    paths: [
      { lat: 22.600, lng: 88.295 },
      { lat: 22.600, lng: 88.330 },
      { lat: 22.560, lng: 88.330 },
      { lat: 22.560, lng: 88.295 },
    ],
    avgResponseTime: 410,
    incidentCount30d: 18,
    coverageGap: false,
  },
  {
    id: 'zone-c',
    name: 'Zone C — Salt Lake',
    color: '#8b5cf6',
    stationId: 'st-003',
    officerCount: 8,
    activeIncidents: 2,
    paths: [
      { lat: 22.600, lng: 88.395 },
      { lat: 22.600, lng: 88.440 },
      { lat: 22.565, lng: 88.440 },
      { lat: 22.565, lng: 88.395 },
    ],
    avgResponseTime: 290,
    incidentCount30d: 14,
    coverageGap: false,
  },
  {
    id: 'zone-d',
    name: 'Zone D — Park Street',
    color: '#f59e0b',
    stationId: 'st-001',
    officerCount: 6,
    activeIncidents: 1,
    paths: [
      { lat: 22.563, lng: 88.340 },
      { lat: 22.563, lng: 88.368 },
      { lat: 22.540, lng: 88.368 },
      { lat: 22.540, lng: 88.340 },
    ],
    avgResponseTime: 380,
    incidentCount30d: 22,
    coverageGap: true,
  },
  {
    id: 'zone-e',
    name: 'Zone E — Behala',
    color: '#ef4444',
    stationId: 'st-002',
    officerCount: 5,
    activeIncidents: 1,
    paths: [
      { lat: 22.515, lng: 88.305 },
      { lat: 22.515, lng: 88.345 },
      { lat: 22.480, lng: 88.345 },
      { lat: 22.480, lng: 88.305 },
    ],
    avgResponseTime: 540,
    incidentCount30d: 10,
    coverageGap: true,
  },
];

// Coverage gap zones (areas with no patrolling officer)
export const coverageGapAreas = [
  {
    id: 'gap-1',
    zoneId: 'zone-d',
    paths: [
      { lat: 22.558, lng: 88.355 },
      { lat: 22.558, lng: 88.368 },
      { lat: 22.548, lng: 88.368 },
      { lat: 22.548, lng: 88.355 },
    ],
    label: 'Unpatrolled sector',
  },
  {
    id: 'gap-2',
    zoneId: 'zone-e',
    paths: [
      { lat: 22.506, lng: 88.318 },
      { lat: 22.506, lng: 88.335 },
      { lat: 22.494, lng: 88.335 },
      { lat: 22.494, lng: 88.318 },
    ],
    label: 'Unpatrolled sector',
  },
];
