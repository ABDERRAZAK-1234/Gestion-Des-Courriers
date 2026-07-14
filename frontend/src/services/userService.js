import api from '@/api/axios';

/**
 * User management API service.
 * Uses existing axios instance with JWT interceptor.
 *
 * Backend endpoints (all admin-only):
 *   GET    /api/admin/users          → { count, users[] }
 *   POST   /api/admin/users          → createUser
 *   GET    /api/admin/users/:id      → getUserById
 *   PUT    /api/admin/users/:id      → updateUser
 *   PATCH  /api/admin/users/:id/ban  → disableUser
 *   PATCH  /api/admin/users/:id/unban → enableUser
 */
const userService = {
  getAll() {
    return api.get('/admin/users');
  },

  getById(id) {
    return api.get(`/admin/users/${id}`);
  },

  create(userData) {
    return api.post('/admin/users', userData);
  },

  update(id, userData) {
    return api.put(`/admin/users/${id}`, userData);
  },

  disable(id) {
    return api.patch(`/admin/users/${id}/ban`);
  },

  enable(id) {
    return api.patch(`/admin/users/${id}/unban`);
  }
};

export default userService;
