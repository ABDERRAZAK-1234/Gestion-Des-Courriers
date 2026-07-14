<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Calendar
} from '@lucide/vue';

const emit = defineEmits(['toggle-sidebar']);

const authStore = useAuthStore();
const router = useRouter();

const searchQuery = ref('');
const showUserMenu = ref(false);
const userMenuRef = ref(null);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const userName = computed(() => {
  if (!authStore.user) return 'Admin';
  return `${authStore.user.prenom || ''} ${authStore.user.nom || ''}`.trim() || 'Admin';
});

const userInitials = computed(() => {
  if (!authStore.user) return 'A';
  const first = authStore.user.prenom?.charAt(0) || '';
  const last = authStore.user.nom?.charAt(0) || '';
  return (first + last).toUpperCase() || 'A';
});

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function handleClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    showUserMenu.value = false;
  }
}

async function handleLogout() {
  showUserMenu.value = false;
  authStore.logout();
  await router.push('/login');
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 h-16">
    <div class="flex items-center justify-between h-full px-4 lg:px-6 gap-4">
      <!-- Left: hamburger + search -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Mobile hamburger -->
        <button
          class="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          @click="emit('toggle-sidebar')"
        >
          <Menu :size="20" />
        </button>

        <!-- Search bar -->
        <div class="relative hidden sm:block w-full max-w-md">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
                   placeholder-gray-400 text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                   transition-all duration-200"
          />
        </div>
      </div>

      <!-- Right: date, notifications, user -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Date -->
        <div class="hidden xl:flex items-center gap-2 text-sm text-gray-500 mr-2">
          <Calendar :size="15" class="text-gray-400" />
          <span class="capitalize">{{ currentDate }}</span>
        </div>

        <!-- Mobile search -->
        <button class="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Search :size="19" />
        </button>

        <!-- Notifications -->
        <button class="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors group">
          <Bell :size="19" class="group-hover:text-gray-700 transition-colors" />
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white" />
        </button>

        <!-- Separator -->
        <div class="hidden sm:block w-px h-6 bg-gray-200" />

        <!-- User dropdown -->
        <div ref="userMenuRef" class="relative">
          <button
            @click="toggleUserMenu"
            class="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-semibold text-white">
              {{ userInitials }}
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-medium text-gray-700 leading-tight">{{ userName }}</p>
              <p class="text-[11px] text-gray-400 leading-tight">Administrateur</p>
            </div>
            <ChevronDown
              :size="15"
              :class="[
                'hidden sm:block text-gray-400 transition-transform duration-200',
                showUserMenu ? 'rotate-180' : ''
              ]"
            />
          </button>

          <!-- Dropdown -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-1 scale-95"
          >
            <div
              v-if="showUserMenu"
              class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl
                     border border-gray-100 py-1.5 origin-top-right"
            >
              <div class="px-4 py-2.5 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-800">{{ userName }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ authStore.user?.email || 'admin@example.com' }}</p>
              </div>

              <div class="py-1.5">
                <button
                  class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600
                         hover:bg-gray-50 hover:text-gray-800 transition-colors"
                >
                  <User :size="16" class="text-gray-400" />
                  Mon profil
                </button>
                <button
                  class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600
                         hover:bg-gray-50 hover:text-gray-800 transition-colors"
                >
                  <Settings :size="16" class="text-gray-400" />
                  Paramètres
                </button>
              </div>

              <div class="border-t border-gray-100 pt-1.5">
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600
                         hover:bg-red-50 transition-colors"
                >
                  <LogOut :size="16" class="text-red-400" />
                  Déconnexion
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>
