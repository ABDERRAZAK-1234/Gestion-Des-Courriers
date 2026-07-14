import api from '@/api/axios';

/**
 * Dashboard API service
 *
 * Uses the REAL backend endpoints — there is no dedicated /dashboard/* API.
 * Stats and charts are computed from existing resource endpoints:
 *
 *   GET /api/admin/users            → { count, users[] }
 *   GET /api/courriers              → { count, total, page, limit, totalPages, courriers[] }
 *   GET /api/courriers?statut=X     → filtered courriers by status
 *   GET /api/notifications/me       → { count, notifications[] }
 *
 * NOTE: There is no GET /api/admin/services endpoint in the backend.
 *       The Service model exists but only has create/update/delete routes.
 *       We use a workaround via User model (services are populated on users).
 */
const dashboardService = {
  /** Fetch all users (admin only) */
  getUsers() {
    return api.get('/admin/users');
  },

  /**
   * Fetch courriers with optional filters.
   * @param {Object} params - { statut, serviceId, page, limit }
   */
  getCourriers(params = {}) {
    return api.get('/courriers', { params });
  },

  /** Fetch current user's notifications */
  getNotifications() {
    return api.get('/notifications/me');
  }
};

export default dashboardService;
