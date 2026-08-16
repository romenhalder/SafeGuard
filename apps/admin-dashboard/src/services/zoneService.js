// ============================================
// SAFEGUARD — Zone Service
// Calls admin-service zone endpoints via API Gateway
// ============================================
import api, { extractData } from './api';

/**
 * GET /api/admin/zones
 * Returns all patrol zones
 */
export async function getZones() {
  const res = await api.get('/api/admin/zones');
  return extractData(res);
}

/**
 * POST /api/admin/zones
 * Creates a new patrol zone
 * @param {Object} data - PatrolZone payload
 */
export async function createZone(data) {
  const res = await api.post('/api/admin/zones', data);
  return extractData(res);
}
