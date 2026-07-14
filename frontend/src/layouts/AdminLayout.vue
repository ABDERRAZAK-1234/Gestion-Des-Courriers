<script setup>
/**
 * AdminLayout — Main admin dashboard layout shell.
 *
 * Composes: Sidebar (fixed left), Navbar (sticky top), scrollable <slot> content, Footer.
 * Manages sidebar collapsed state (responsive: collapsed on mobile, visible on desktop).
 */
import { ref } from 'vue';
import Sidebar from '@/components/dashboard/Sidebar.vue';
import Navbar from '@/components/dashboard/Navbar.vue';
import { Heart } from '@lucide/vue';

const sidebarCollapsed = ref(true); // collapsed on mobile by default

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

function closeSidebar() {
  sidebarCollapsed.value = true;
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <!-- Sidebar -->
    <Sidebar :collapsed="sidebarCollapsed" @close="closeSidebar" />

    <!-- Main area (shifted right on desktop to account for sidebar width) -->
    <div class="lg:ml-[260px] flex flex-col min-h-screen transition-[margin] duration-300">
      <!-- Navbar -->
      <Navbar @toggle-sidebar="toggleSidebar" />

      <!-- Content -->
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-200/60 bg-white/60 backdrop-blur-sm">
        <div class="px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>
            © {{ new Date().getFullYear() }} <span class="font-medium text-gray-500">Gestion des Courriers</span>. Tous droits réservés.
          </p>
          <p class="flex items-center gap-1">
            Fait avec <Heart :size="12" class="text-red-400 fill-red-400" /> par votre équipe
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>
