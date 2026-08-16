// ============================================
// SAFEGUARD — Location Service
// Calls location-service via API Gateway
// ============================================
import api, { extractData } from './api';

/**
 * GET /api/location/all
 * Returns all officers' latest GPS positions
 */
export async function getAllLocations() {
  const res = await api.get('/api/location/all');
  return extractData(res);
}

/**
 * GET /api/location/officer/{officerId}
 * Returns the latest location of a specific officer
 */
export async function getOfficerLocation(officerId) {
  const res = await api.get(`/api/location/officer/${officerId}`);
  return extractData(res);
}
