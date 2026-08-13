import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager } from '@react-google-maps/api';
import { useLiveStore } from '../../store/liveStore';
import { mockZones, coverageGapAreas } from '../../mockData/zones';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal, { ModalFooter } from '../../components/common/Modal';
import { Plus, Pencil, Trash2, Eye, AlertTriangle, BarChart2, TrendingUp } from 'lucide-react';
import './ZoneManagerPage.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB2GCWjLTqBF1tvlxWhyjp-tELiqP3gaz8';
const LIBRARIES = ['drawing'];

const MAP_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a0e1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2840' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#061018' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
];

export default function ZoneManagerPage() {
  const { officers, layers, setLayer } = useLiveStore();
  const [zones, setZones] = useState([...mockZones]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [comparisonView, setComparisonView] = useState(false);
  const [showGaps, setShowGaps] = useState(true);
  const mapRef = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'zone-manager-map',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const onPolygonComplete = useCallback((polygon) => {
    const paths = polygon.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
    polygon.setMap(null); // Remove drawing layer
    setShowCreateModal(true);
  }, []);

  return (
    <div className="zone-manager-page" id="zone-manager-page">
      {/* Left: Zone List */}
      <div className="zones-list-panel">
        <div className="zones-list-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>Zone Manager</h1>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setDrawingMode(!drawingMode)} id="draw-zone-btn">
            {drawingMode ? 'Stop Drawing' : 'Draw Zone'}
          </Button>
        </div>

        {drawingMode && (
          <div className="drawing-hint animate-fade-in">
            <Pencil size={13} />
            <span>Click on the map to draw a polygon boundary. Click the first point to close.</span>
          </div>
        )}

        {/* Comparison toggle */}
        <div className="zone-tools">
          <button className={`zone-tool-btn ${comparisonView ? 'active' : ''}`} onClick={() => setComparisonView(!comparisonView)} id="comparison-view-btn">
            <BarChart2 size={13} />
            Zone Comparison
          </button>
          <button className={`zone-tool-btn ${showGaps ? 'active' : ''}`} onClick={() => setShowGaps(!showGaps)} id="coverage-gaps-btn">
            <AlertTriangle size={13} />
            Coverage Gaps
          </button>
        </div>

        {/* Zone cards */}
        <div className="zones-list">
          {zones.map((zone, idx) => {
            const zoneOfficers = officers.filter(o => o.zone === zone.name && o.status !== 'OFF_DUTY');
            return (
              <div
                key={zone.id}
                className={`zone-card animate-fade-in-up stagger-${(idx % 5) + 1} ${selectedZone?.id === zone.id ? 'selected' : ''} ${zone.coverageGap ? 'has-gap' : ''}`}
                onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
                id={`zone-card-${zone.id}`}
              >
                <div className="zone-card-header">
                  <div className="zone-color-dot" style={{ background: zone.color }} />
                  <div className="zone-info">
                    <p className="zone-name">{zone.name}</p>
                  </div>
                  {zone.coverageGap && (
                    <div className="zone-gap-badge">
                      <AlertTriangle size={11} />
                      Gap
                    </div>
                  )}
                </div>

                <div className="zone-stats">
                  <div className="zone-stat">
                    <span className="zone-stat-val">{zoneOfficers.length}</span>
                    <span className="zone-stat-lbl">On Duty</span>
                  </div>
                  <div className="zone-stat">
                    <span className="zone-stat-val">{zone.activeIncidents}</span>
                    <span className="zone-stat-lbl">Active Inc.</span>
                  </div>
                  <div className="zone-stat">
                    <span className="zone-stat-val">{Math.floor(zone.avgResponseTime / 60)}m</span>
                    <span className="zone-stat-lbl">Avg Resp.</span>
                  </div>
                  <div className="zone-stat">
                    <span className="zone-stat-val">{zone.incidentCount30d}</span>
                    <span className="zone-stat-lbl">30d Inc.</span>
                  </div>
                </div>

                <div className="zone-card-actions" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" icon={Pencil} id={`edit-zone-${zone.id}`}>Edit</Button>
                  <Button variant="ghost" size="sm" icon={Trash2} id={`delete-zone-${zone.id}`}>Delete</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Map */}
      <div className="zones-map-panel">
        {isLoaded ? (
          <GoogleMap
            mapContainerClassName="gmap-container"
            center={{ lat: 22.5726, lng: 88.3639 }}
            zoom={12}
            options={{
              styles: MAP_DARK_STYLE,
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {/* Zone polygons */}
            {zones.map(zone => (
              <Polygon
                key={zone.id}
                paths={zone.paths}
                onClick={() => setSelectedZone(zone)}
                options={{
                  fillColor: zone.color,
                  fillOpacity: selectedZone?.id === zone.id ? 0.2 : 0.08,
                  strokeColor: zone.color,
                  strokeWeight: selectedZone?.id === zone.id ? 2.5 : 1.5,
                  strokeOpacity: 0.8,
                }}
              />
            ))}

            {/* Coverage gaps */}
            {showGaps && coverageGapAreas.map(gap => (
              <Polygon
                key={gap.id}
                paths={gap.paths}
                options={{
                  fillColor: '#f59e0b',
                  fillOpacity: 0.22,
                  strokeColor: '#f59e0b',
                  strokeWeight: 1.5,
                  strokeOpacity: 0.7,
                }}
              />
            ))}

            {/* Drawing manager */}
            {drawingMode && (
              <DrawingManager
                onPolygonComplete={onPolygonComplete}
                options={{
                  drawingMode: window.google?.maps?.drawing?.OverlayType?.POLYGON,
                  drawingControl: false,
                  polygonOptions: {
                    fillColor: '#3b82f6',
                    fillOpacity: 0.15,
                    strokeColor: '#3b82f6',
                    strokeWeight: 2,
                    editable: true,
                  },
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="map-loading">
            <div className="map-loading-pulse" />
            <p>Loading zone map...</p>
          </div>
        )}

        {/* Comparison view overlay */}
        {comparisonView && (
          <div className="comparison-overlay animate-slide-right">
            <p className="comparison-title">Zone Comparison</p>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Avg Response</th>
                  <th>30d Incidents</th>
                  <th>Officers</th>
                </tr>
              </thead>
              <tbody>
                {zones.map(z => (
                  <tr key={z.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, background: z.color, borderRadius: '50%', display: 'inline-block' }} />
                        {z.name.split(' — ')[1]}
                      </div>
                    </td>
                    <td className={`font-mono text-sm ${z.avgResponseTime > 400 ? 'text-warning' : 'text-success'}`}>
                      {Math.floor(z.avgResponseTime / 60)}m {z.avgResponseTime % 60}s
                    </td>
                    <td className="text-sm">{z.incidentCount30d}</td>
                    <td className="text-sm">{z.officerCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Zone Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Save New Zone" id="create-zone-modal" width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group"><label className="form-label">Zone Name</label><input className="input" placeholder="e.g. Zone F — Ultadanga" id="zone-name-input" /></div>
          <div className="form-group"><label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'].map(c => (
                <button key={c} style={{ width: 28, height: 28, background: c, border: '2px solid transparent', borderRadius: 6, cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <div className="form-group"><label className="form-label">Assign to Station</label>
            <select className="select" id="zone-station-select">
              <option>Lalbazar HQ</option>
              <option>Howrah Thana</option>
              <option>Salt Lake PS</option>
            </select>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setShowCreateModal(false)} id="save-zone-btn">Save Zone</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
