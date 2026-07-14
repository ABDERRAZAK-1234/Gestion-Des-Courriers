import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

import LoginView from '../views/loginView.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },

  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('../views/admin/AdminDashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN']
    }
  },
  {
    path: '/admin/utilisateurs',
    name: 'admin-utilisateurs',
    component: () => import('../views/admin/UserManagementView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN']
    }
  },
  {
    path: '/secretaire/dashboard',
    name: 'secretaire-dashboard',
    component: () => import('../views/secretaire/SecretaireDashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['SECRETAIRE']
    }
  },
  {
    path: '/responsable/dashboard',
    name: 'responsable-dashboard',
    component: () => import('../views/responsable/ResponsableDashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['RESPONSABLE']
    }
  },
  {
    path: '/employe/dashboard',
    name: 'employe-dashboard',
    component: () => import('../views/employe/EmployeDashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['EMPLOYE']
    }
  },

  {
    path: '/403',
    name: 'forbidden',
    component: () => import('../views/errors/ForbiddenView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const dashboardByRole = {
  ADMIN: '/admin/dashboard',
  SECRETAIRE: '/secretaire/dashboard',
  RESPONSABLE: '/responsable/dashboard',
  EMPLOYE: '/employe/dashboard'
};

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    await authStore.fetchMe();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return dashboardByRole[authStore.role] || '/login';
  }

  if (to.meta.roles && !to.meta.roles.includes(authStore.role)) {
    return '/403';
  }
});

export default router;
