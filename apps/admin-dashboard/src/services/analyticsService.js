// ============================================
// SAFEGUARD — Analytics Service
// Calls analytics-service via API Gateway
// ============================================
import api, { extractData } from './api';

/**
 * GET /api/analytics/reports?start=...&end=...
 * Returns a full analytics report for the given date range.
 *
 * @param {Date|string} start - ISO datetime string or Date object
 * @param {Date|string} end   - ISO datetime string or Date object
 */
export async function getAnalyticsReport(start, end) {
  const startStr = start instanceof Date ? start.toISOString() : start;
  const endStr = end instanceof Date ? end.toISOString() : end;
  const res = await api.get('/api/analytics/reports', {
    params: { start: startStr, end: endStr },
  });
  return extractData(res);
}

/**
 * GET /api/analytics/reports/response-time?start=...&end=...
 * Returns the average response time (seconds) for the given range
 */
export async function getAverageResponseTime(start, end) {
  const startStr = start instanceof Date ? start.toISOString() : start;
  const endStr = end instanceof Date ? end.toISOString() : end;
  const res = await api.get('/api/analytics/reports/response-time', {
    params: { start: startStr, end: endStr },
  });
  return extractData(res);
}

/**
 * GET /api/admin/dashboard/overview
 * Returns dashboard-level counters from admin-service
 */
export async function getDashboardOverview() {
  const res = await api.get('/api/admin/dashboard/overview');
  return extractData(res);
}
