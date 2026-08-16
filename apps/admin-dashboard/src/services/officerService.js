// ============================================
// SAFEGUARD — Officer Service
// Calls admin-service via API Gateway
// ============================================
import api, { extractData } from './api';

/**
 * GET /api/admin/officers
 * Returns all officers (admin-service aggregates from DB)
 */
export async function getOfficers() {
  const res = await api.get('/api/admin/officers');
  return extractData(res);
}

/**
 * GET /api/admin/officers/{id}
 */
export async function getOfficer(id) {
  const res = await api.get(`/api/admin/officers/${id}`);
  return extractData(res);
}

/**
 * POST /api/admin/officers
 * Creates a new officer record
 */
export async function createOfficer(data) {
  const res = await api.post('/api/admin/officers', data);
  return extractData(res);
}

/**
 * PUT /api/admin/officers/{id}
 * Updates an officer
 */
export async function updateOfficer(id, data) {
  const res = await api.put(`/api/admin/officers/${id}`, data);
  return extractData(res);
}

/**
 * DELETE /api/admin/officers/{id}
 * Deactivates an officer
 */
export async function deactivateOfficer(id) {
  const res = await api.delete(`/api/admin/officers/${id}`);
  return extractData(res);
}

/**
 * GET /api/admin/map/officers
 * Returns all officers with current GPS positions (for map view)
 */
export async function getMapOfficers() {
  const res = await api.get('/api/admin/map/officers');
  return extractData(res);
}

/**
 * GET /api/admin/map/officers/on-duty
 * Returns only on-duty officers
 */
export async function getOnDutyOfficers() {
  const res = await api.get('/api/admin/map/officers/on-duty');
  return extractData(res);
}
