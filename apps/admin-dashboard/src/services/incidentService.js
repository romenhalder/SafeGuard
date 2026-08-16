// ============================================
// SAFEGUARD — Incident Service
// Calls admin-service incident endpoints via API Gateway
// ============================================
import api, { extractData } from './api';

/**
 * GET /api/admin/incidents
 * @param {string} [status] - optional status filter e.g. "ACTIVE"
 * @param {string} [incidentType] - optional type filter e.g. "SOS_MEDICAL"
 */
export async function getIncidents({ status, incidentType } = {}) {
  const params = {};
  if (status) params.status = status;
  if (incidentType) params.incidentType = incidentType;
  const res = await api.get('/api/admin/incidents', { params });
  return extractData(res);
}

/**
 * GET /api/admin/incidents/{id}
 */
export async function getIncident(id) {
  const res = await api.get(`/api/admin/incidents/${id}`);
  return extractData(res);
}
