<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Users,
  Building2,
  Mail,
  Share2,
  Bell,
  FileText,
  Settings,
  LogOut,
  X,
  ChevronRight
} from '@lucide/vue';

const props = defineProps({
  collapsed: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
  { label: 'Utilisateurs', icon: Users, route: '/admin/utilisateurs' },
  { label: 'Services', icon: Building2, route: '/admin/services' },
  { label: 'Courriers', icon: Mail, route: '/admin/courriers' },
  { label: 'Affectations', icon: Share2, route: '/admin/affectations' },
  { label: 'Notifications', icon: Bell, route: '/admin/notifications' },
  { label: 'Logs', icon: FileText, route: '/admin/logs' },
  { label: 'Paramètres', icon: Settings, route: '/admin/parametres' }
];

function isActive(path) {
  return route.path === path;
}

function navigateTo(path) {
  router.push(path);
  emit('close');
}

async function handleLogout() {
  authStore.logout();
  await router.push('/login');
}

const userName = computed(() => {
  if (!authStore.user) return 'Admin';
  return `${authStore.user.prenom || ''} ${authStore.user.nom || ''}`.trim() || 'Admin';
});
</script>

<template>
  <!-- Mobile backdrop -->
  <Transition name="fade">
    <div
      v-if="!collapsed"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
      @click="emit('close')"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed top-0 left-0 z-50 h-screen flex flex-col',
      'bg-surface-sidebar text-white w-[260px]',
      'transition-transform duration-300 ease-out',
      'lg:translate-x-0 lg:z-30',
      collapsed ? '-translate-x-full' : 'translate-x-0'
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between h-16 px-5 border-b border-white/10 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <Mail :size="18" class="text-white" />
        </div>
        <div>
          <h1 class="text-sm font-bold tracking-tight">Gestion Courriers</h1>
        </div>
      </div>
      <button
        class="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        @click="emit('close')"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- User info -->
    <div class="px-5 py-4 border-b border-white/10 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold uppercase">
          {{ userName.charAt(0) }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium truncate">{{ userName }}</p>
          <p class="text-xs text-gray-400">Administrateur</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <p class="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        Menu principal
      </p>

      <button
        v-for="item in menuItems"
        :key="item.route"
        @click="navigateTo(item.route)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
          'transition-all duration-200 group',
          isActive(item.route)
            ? 'bg-surface-sidebar-active text-white shadow-lg shadow-primary-900/30'
            : 'text-gray-300 hover:bg-surface-sidebar-hover hover:text-white'
        ]"
      >
        <component
          :is="item.icon"
          :size="19"
          :stroke-width="1.8"
          :class="[
            'shrink-0 transition-colors',
            isActive(item.route) ? 'text-primary-300' : 'text-gray-400 group-hover:text-gray-200'
          ]"
        />
        <span class="truncate">{{ item.label }}</span>
        <ChevronRight
          v-if="isActive(item.route)"
          :size="14"
          class="ml-auto text-primary-300"
        />
      </button>
    </nav>

    <!-- Logout -->
    <div class="px-3 py-4 border-t border-white/10 shrink-0">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
               text-gray-300 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200 group"
      >
        <LogOut :size="19" :stroke-width="1.8" class="shrink-0 text-gray-400 group-hover:text-red-400 transition-colors" />
        <span>Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
