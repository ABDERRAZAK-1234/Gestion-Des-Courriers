import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/loginView.vue';
import { useAuthStore } from '../stores/authStore';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('../views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/secretaire/dashboard',
    name: 'secretaire-dashboard',
    component: () => import('../views/secretaire/SecretaireDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['SECRETAIRE'] }
  },
  {
    path: '/responsable/dashboard',
    name: 'responsable-dashboard',
    component: () => import('../views/responsable/ResponsableDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['RESPONSABLE'] }
  },
  {
    path: '/employe/dashboard',
    name: 'employe-dashboard',
    component: () => import('../views/employe/EmployeDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['EMPLOYE'] }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    await authStore.fetchMe();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }

  if (to.meta.roles && !to.meta.roles.includes(authStore.role)) {
    return '/login';
  }
});

export default router;
