import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polygon, HeatmapLayer, Circle } from '@react-google-maps/api';
import { useLiveStore } from '../../store/liveStore';
import { useAuthStore } from '../../store/authStore';
import { OFFICER_STATUS_CONFIG } from '../../mockData/officers';
import { INCIDENT_STATUS, INCIDENT_TYPES } from '../../mockData/incidents';
import { coverageGapAreas } from '../../mockData/zones';
import * as officerService from '../../services/officerService';
import * as locationService from '../../services/locationService';
import * as incidentService from '../../services/incidentService';
import { Search, Layers, Users, AlertTriangle, MapPin, Thermometer, Eye, EyeOff, Navigation2, Shield, X, Clock } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { format } from 'date-fns';
import './LiveMapPage.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB2GCWjLTqBF1tvlxWhyjp-tELiqP3gaz8';

const LIBRARIES = ['visualization', 'drawing', 'places'];

const MAP_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a0e1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0e1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a2840' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0d1525' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3b5249' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2840' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d1525' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0d1525' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0d1525' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#061018' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
];

function createOfficerIcon(status, size = 14) {
  const colors = { ON_PATROL: '#10b981', ACTIVE_CALL: '#06b6d4', RETURNING: '#f59e0b', OFF_DUTY: '#374151' };
  const c = colors[status] || '#10b981';
  return {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: c,
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: status === 'ACTIVE_CALL' ? size * 1.2 : size,
  };
}

function createIncidentIcon(severity) {
  const colors = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981' };
  return {
    path: 'M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z',
    fillColor: colors[severity] || '#ef4444',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 1,
    scale: 1.6,
    anchor: window.google?.maps ? new window.google.maps.Point(12, 22) : undefined,
  };
}

export default function LiveMapPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const {
    officers: mockOfficers, incidents: mockIncidents, zones, layers, mapCenter, mapZoom,
    setLayer, flyToIncident, flyToLocation, setMapCenter, setMapZoom,
    selectedIncidentId, selectedOfficerId, setSelectedIncident, setSelectedOfficer,
  } = useLiveStore();
  const { user } = useAuthStore();

  // ── Real API state ─────────────────────────────────────────────
  const [apiOfficers, setApiOfficers] = useState(null); // null = not yet loaded
  const [apiIncidents, setApiIncidents] = useState(null);
  const gpsIntervalRef = useRef(null);

  // Fetch initial officer list from admin-service
  useEffect(() => {
    officerService.getMapOfficers()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        if (list.length > 0) setApiOfficers(list);
      })
      .catch(() => { /* fall back to mock */ });

    incidentService.getIncidents({ status: 'ACTIVE' })
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        if (list.length > 0) setApiIncidents(list);
      })
      .catch(() => { /* fall back to mock */ });

    // Poll GPS positions every 10s from location-service
    gpsIntervalRef.current = setInterval(async () => {
      try {
        const locs = await locationService.getAllLocations();
        if (Array.isArray(locs) && locs.length > 0) {
          // Merge GPS updates into officer list
          setApiOfficers(prev => {
            if (!prev) return prev;
            const locMap = {};
            locs.forEach(l => { locMap[l.officerId] = l; });
            return prev.map(o => {
              const loc = locMap[o.id];
              return loc ? { ...o, lat: loc.latitude, lng: loc.longitude, lastPing: loc.updatedAt } : o;
            });
          });
        }
      } catch { /* silent */ }
    }, 10000);

    return () => clearInterval(gpsIntervalRef.current);
  }, []);

  // Use real API data if available, otherwise fall back to mock store
  const officers = apiOfficers ?? mockOfficers;
  const incidents = apiIncidents ?? mockIncidents;

  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOfficerInfo, setSelectedOfficerInfo] = useState(null);
  const [selectedIncidentInfo, setSelectedIncidentInfo] = useState(null);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Filter by role scope
  const canSeeAll = ['SP', 'SUPER_ADMIN'].includes(user?.role);
  const visibleOfficers = canSeeAll ? officers : officers.filter(o => o.stationId === user?.stationId);
  const visibleIncidents = canSeeAll ? incidents : incidents.filter(i => {
    const userZone = zones.find(z => z.stationId === user?.stationId);
    return userZone ? i.zone === userZone.name : true;
  });

  const handleOfficerClick = (officer) => {
    setSelectedOfficerInfo(officer);
    setSelectedIncidentInfo(null);
    setSelectedOfficer(officer.id);
    mapRef.current?.panTo({ lat: officer.lat, lng: officer.lng });
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncidentInfo(incident);
    setSelectedOfficerInfo(null);
    setSelectedIncident(incident.id);
    mapRef.current?.panTo({ lat: incident.location.lat, lng: incident.location.lng });
    mapRef.current?.setZoom(16);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Search zones
    const matchZone = zones.find(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (matchZone) {
      const center = matchZone.paths.reduce((acc, p) => ({ lat: acc.lat + p.lat / matchZone.paths.length, lng: acc.lng + p.lng / matchZone.paths.length }), { lat: 0, lng: 0 });
      flyToLocation(center.lat, center.lng);
      return;
    }
    // Fallback: geocode via Google Places
    if (window.google && mapRef.current) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery + ', Kolkata, India' }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          flyToLocation(loc.lat(), loc.lng());
        }
      });
    }
  };

  const heatmapData = isLoaded && window.google
    ? visibleIncidents.map(inc => new window.google.maps.LatLng(inc.location.lat, inc.location.lng))
    : [];

  return (
    <div className="live-map-page" id="live-map-page">
      {/* Search bar overlay */}
      <div className="map-search-bar animate-fade-in-up">
        <form onSubmit={handleSearch} className="map-search-form">
          <Search size={15} className="map-search-icon" />
          <input
            id="map-search-input"
            type="text"
            className="map-search-input"
            placeholder="Search address, zone name, or officer badge..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="map-search-clear" onClick={() => setSearchQuery('')}>
              <X size={13} />
            </button>
          )}
        </form>

        {/* Layer toggle button */}
        <button
          className={`map-layers-btn ${showLayerPanel ? 'active' : ''}`}
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          id="map-layers-btn"
          title="Toggle map layers"
        >
          <Layers size={16} />
          <span>Layers</span>
        </button>

        {/* Layer panel */}
        {showLayerPanel && (
          <div className="map-layer-panel animate-scale-pop" id="map-layer-panel">
            <p className="layer-panel-title">Map Layers</p>
            {[
              { key: 'officers', icon: Users, label: 'Officers', color: 'var(--accent-green)' },
              { key: 'incidents', icon: AlertTriangle, label: 'Incidents', color: 'var(--accent-red)' },
              { key: 'zones', icon: MapPin, label: 'Patrol Zones', color: 'var(--accent-blue)' },
              { key: 'heatmap', icon: Thermometer, label: 'Heatmap', color: 'var(--accent-orange)' },
              { key: 'coverageGaps', icon: Eye, label: 'Coverage Gaps', color: 'var(--accent-amber)' },
            ].map(({ key, icon: Icon, label, color }) => (
              <div
                key={key}
                className={`layer-item ${layers[key] ? 'active' : ''}`}
                onClick={() => setLayer(key, !layers[key])}
                id={`layer-toggle-${key}`}
              >
                <Icon size={14} style={{ color }} />
                <span>{label}</span>
                {layers[key] ? <Eye size={13} style={{ marginLeft: 'auto', color: 'var(--accent-blue-light)' }} /> : <EyeOff size={13} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="map-stats-strip animate-slide-left">
        <div className="map-stat">
          <span className="map-stat-dot on-patrol" />
          <span className="map-stat-val">{visibleOfficers.filter(o => o.status === 'ON_PATROL').length}</span>
          <span className="map-stat-lbl">On Patrol</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-dot active-call" />
          <span className="map-stat-val">{visibleOfficers.filter(o => o.status === 'ACTIVE_CALL').length}</span>
          <span className="map-stat-lbl">Active Call</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-dot sos" />
          <span className="map-stat-val">{visibleIncidents.filter(i => i.isActive).length}</span>
          <span className="map-stat-lbl">Active SOS</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-dot off-duty" />
          <span className="map-stat-val">{visibleOfficers.filter(o => o.status === 'OFF_DUTY').length}</span>
          <span className="map-stat-lbl">Off Duty</span>
        </div>
      </div>

      {/* Map */}
      <div className="map-container">
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName="gmap-container"
            center={mapCenter}
            zoom={mapZoom}
            onLoad={onMapLoad}
            onUnmount={onMapUnmount}
            onCenterChanged={() => {
              if (mapRef.current) {
                const c = mapRef.current.getCenter();
                setMapCenter({ lat: c.lat(), lng: c.lng() });
              }
            }}
            onZoomChanged={() => {
              if (mapRef.current) setMapZoom(mapRef.current.getZoom());
            }}
            options={{
              styles: MAP_DARK_STYLE,
              disableDefaultUI: true,
              zoomControl: true,
              fullscreenControl: false,
              mapTypeControl: false,
              streetViewControl: false,
              zoomControlOptions: {
                position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM,
              },
            }}
          >
            {/* Patrol Zone Polygons */}
            {layers.zones && zones.map(zone => (
              <Polygon
                key={zone.id}
                paths={zone.paths}
                options={{
                  fillColor: zone.color,
                  fillOpacity: 0.07,
                  strokeColor: zone.color,
                  strokeWeight: 1.5,
                  strokeOpacity: 0.6,
                }}
              />
            ))}

            {/* Coverage Gap Areas */}
            {layers.coverageGaps && coverageGapAreas.map(gap => (
              <Polygon
                key={gap.id}
                paths={gap.paths}
                options={{
                  fillColor: '#f59e0b',
                  fillOpacity: 0.18,
                  strokeColor: '#f59e0b',
                  strokeWeight: 1,
                  strokeOpacity: 0.5,
                  strokeDashArray: '4,4',
                }}
              />
            ))}

            {/* Officer Markers */}
            {layers.officers && visibleOfficers.map(officer => (
              <Marker
                key={officer.id}
                position={{ lat: officer.lat, lng: officer.lng }}
                onClick={() => handleOfficerClick(officer)}
                icon={isLoaded ? createOfficerIcon(officer.status) : undefined}
                title={`${officer.fullName} — ${OFFICER_STATUS_CONFIG[officer.status]?.label}`}
                animation={officer.status === 'ACTIVE_CALL' ? window.google?.maps?.Animation?.BOUNCE : undefined}
              />
            ))}

            {/* Incident Pins */}
            {layers.incidents && visibleIncidents.filter(i => i.isActive).map(incident => (
              <Marker
                key={incident.id}
                position={{ lat: incident.location.lat, lng: incident.location.lng }}
                onClick={() => handleIncidentClick(incident)}
                icon={isLoaded ? createIncidentIcon(incident.severity) : undefined}
                title={`${incident.typeIcon} ${incident.typeLabel} — ${INCIDENT_STATUS[incident.status]?.label}`}
              />
            ))}

            {/* Heatmap */}
            {layers.heatmap && heatmapData.length > 0 && (
              <HeatmapLayer
                data={heatmapData}
                options={{
                  radius: 30,
                  opacity: 0.6,
                  gradient: [
                    'rgba(0,0,0,0)',
                    'rgba(16,185,129,0.8)',
                    'rgba(245,158,11,0.8)',
                    'rgba(249,115,22,0.9)',
                    'rgba(239,68,68,1)',
                  ],
                }}
              />
            )}

            {/* Officer InfoWindow */}
            {selectedOfficerInfo && (
              <InfoWindow
                position={{ lat: selectedOfficerInfo.lat, lng: selectedOfficerInfo.lng }}
                onCloseClick={() => setSelectedOfficerInfo(null)}
              >
                <div className="map-info-window">
                  <div className="iw-header">
                    <div className="iw-avatar" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                      {selectedOfficerInfo.firstName[0]}
                    </div>
                    <div>
                      <p className="iw-name">{selectedOfficerInfo.fullName}</p>
                      <p className="iw-sub">{selectedOfficerInfo.rank} · {selectedOfficerInfo.badgeId}</p>
                    </div>
                  </div>
                  <div className="iw-rows">
                    <div className="iw-row">
                      <span className="iw-dot" style={{ background: OFFICER_STATUS_CONFIG[selectedOfficerInfo.status]?.dot }} />
                      {OFFICER_STATUS_CONFIG[selectedOfficerInfo.status]?.label}
                    </div>
                    <div className="iw-row"><MapPin size={11} /> {selectedOfficerInfo.zone}</div>
                    <div className="iw-row"><Clock size={11} /> Last ping {selectedOfficerInfo.lastPingStr}</div>
                    {selectedOfficerInfo.specialties.length > 0 && (
                      <div className="iw-row"><Shield size={11} /> {selectedOfficerInfo.specialties[0]}</div>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Incident InfoWindow */}
            {selectedIncidentInfo && (
              <InfoWindow
                position={{ lat: selectedIncidentInfo.location.lat, lng: selectedIncidentInfo.location.lng }}
                onCloseClick={() => setSelectedIncidentInfo(null)}
              >
                <div className="map-info-window">
                  <div className="iw-header">
                    <span className="iw-type-icon">{selectedIncidentInfo.typeIcon}</span>
                    <div>
                      <p className="iw-name">{selectedIncidentInfo.typeLabel}</p>
                      <p className="iw-sub">{selectedIncidentInfo.id.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="iw-rows">
                    <div className="iw-row"><MapPin size={11} /> {selectedIncidentInfo.location.address}</div>
                    <div className="iw-row">
                      <span className="iw-dot" style={{ background: INCIDENT_STATUS[selectedIncidentInfo.status]?.color }} />
                      {INCIDENT_STATUS[selectedIncidentInfo.status]?.label}
                    </div>
                    {selectedIncidentInfo.etaMinutes && (
                      <div className="iw-row"><Navigation2 size={11} /> ETA: {selectedIncidentInfo.etaMinutes} min</div>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="map-loading">
            <div className="map-loading-pulse" />
            <p>Loading live map...</p>
          </div>
        )}
      </div>
    </div>
  );
}
