import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.roleId?.nom || null
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/auth/login', credentials);

        this.token = response.data.token;
        this.user = response.data.user;

        localStorage.setItem('token', this.token);

        return this.user;
      } catch (error) {
        console.log('LOGIN ERROR:', error.response?.data);
        console.log('STATUS:', error.response?.status);

        this.error = error.response?.data?.message || 'Email ou mot de passe incorrect';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      if (!this.token) return;

      try {
        const response = await api.get('/auth/me');
        this.user = response.data.user;
      } catch (error) {
        this.logout();
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    }
  }
});
