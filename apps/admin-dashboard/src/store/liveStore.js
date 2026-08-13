// ============================================
// SAFEGUARD — Live Data Store (Officers + Incidents)
// Simulates WebSocket updates via intervals
// ============================================
import { create } from 'zustand';
import { mockOfficers } from '../mockData/officers';
import { mockIncidents, mockActiveIncidents } from '../mockData/incidents';
import { mockZones } from '../mockData/zones';

let officerUpdateInterval = null;
let incidentUpdateInterval = null;

function nudgePosition(lat, lng, maxDelta = 0.0008) {
  return {
    lat: lat + (Math.random() - 0.5) * maxDelta,
    lng: lng + (Math.random() - 0.5) * maxDelta,
  };
}

export const useLiveStore = create((set, get) => ({
  officers: [...mockOfficers],
  incidents: [...mockIncidents],
  activeIncidents: [...mockActiveIncidents],
  zones: [...mockZones],

  // Map UI state
  mapCenter: { lat: 22.5726, lng: 88.3639 },
  mapZoom: 13,
  layers: {
    officers: true,
    incidents: true,
    zones: true,
    heatmap: false,
    coverageGaps: false,
  },
  selectedIncidentId: null,
  selectedOfficerId: null,

  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setLayer: (layer, value) => set(s => ({ layers: { ...s.layers, [layer]: value } })),
  setSelectedIncident: (id) => set({ selectedIncidentId: id }),
  setSelectedOfficer: (id) => set({ selectedOfficerId: id }),

  flyToIncident: (incidentId) => {
    const inc = get().incidents.find(i => i.id === incidentId);
    if (inc) {
      set({
        mapCenter: { lat: inc.location.lat, lng: inc.location.lng },
        mapZoom: 16,
        selectedIncidentId: incidentId,
      });
    }
  },

  flyToLocation: (lat, lng) => {
    set({ mapCenter: { lat, lng }, mapZoom: 16 });
  },

  // Start live simulation
  startLiveSimulation: () => {
    if (officerUpdateInterval) return; // already running

    // Move on-patrol officers every 3 seconds
    officerUpdateInterval = setInterval(() => {
      set(state => ({
        officers: state.officers.map(o => {
          if (o.status === 'ON_PATROL' || o.status === 'ACTIVE_CALL') {
            const moved = nudgePosition(o.lat, o.lng);
            return { ...o, lat: moved.lat, lng: moved.lng, lastPing: new Date() };
          }
          return o;
        }),
      }));
    }, 3000);

    // Simulate occasional status changes every 15 seconds
    incidentUpdateInterval = setInterval(() => {
      const { incidents } = get();
      const activeIdx = incidents.findIndex(i => i.isActive);
      if (activeIdx >= 0) {
        // Randomly decrement ETA
        set(state => ({
          incidents: state.incidents.map(inc => {
            if (inc.isActive && inc.etaMinutes > 1) {
              return { ...inc, etaMinutes: inc.etaMinutes - 1 };
            }
            return inc;
          }),
        }));
      }
    }, 15000);
  },

  stopLiveSimulation: () => {
    if (officerUpdateInterval) { clearInterval(officerUpdateInterval); officerUpdateInterval = null; }
    if (incidentUpdateInterval) { clearInterval(incidentUpdateInterval); incidentUpdateInterval = null; }
  },

  // Officer management actions
  updateOfficerStatus: (officerId, status) => {
    set(state => ({
      officers: state.officers.map(o => o.id === officerId ? { ...o, status } : o),
    }));
  },

  addOfficer: (officer) => {
    set(state => ({ officers: [officer, ...state.officers] }));
  },

  updateOfficer: (officerId, updates) => {
    set(state => ({
      officers: state.officers.map(o => o.id === officerId ? { ...o, ...updates } : o),
    }));
  },

  // Incident management actions
  reassignIncident: (incidentId, newOfficerId) => {
    set(state => ({
      incidents: state.incidents.map(i =>
        i.id === incidentId ? { ...i, assignedOfficerId: newOfficerId } : i
      ),
    }));
  },

  escalateIncident: (incidentId) => {
    set(state => ({
      incidents: state.incidents.map(i =>
        i.id === incidentId ? { ...i, status: 'ESCALATED', escalated: true } : i
      ),
    }));
  },
}));
