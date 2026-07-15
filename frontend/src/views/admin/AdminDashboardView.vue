<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useAuthStore } from '@/stores/authStore';

import AdminLayout from '@/layouts/AdminLayout.vue';
import StatCard from '@/components/dashboard/StatCard.vue';
import DashboardCharts from '@/components/dashboard/DashboardCharts.vue';
import RecentActivities from '@/components/dashboard/RecentActivities.vue';
import LatestCourriers from '@/components/dashboard/LatestCourriers.vue';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';

import {
  Users,
  Building2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  CheckCircle2
} from '@lucide/vue';

const dashboardStore = useDashboardStore();
const authStore = useAuthStore();
const { stats, charts, recentActivities, latestCourriers, loading, error } = storeToRefs(dashboardStore);

onMounted(() => {
  dashboardStore.fetchAll();
});
</script>

<template>
  <AdminLayout>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      <p class="text-sm text-gray-500 mt-1">
        Bienvenue, <span class="font-medium text-gray-700">{{ authStore.user?.prenom || 'Admin' }}</span>.
        Voici un aperçu de votre système.
      </p>
    </div>

    <!-- Error alert (stats) -->
    <div
      v-if="error.stats"
      class="mb-6 p-4 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger-700 flex items-center gap-2"
    >
      <span class="font-medium">Erreur :</span> {{ error.stats }}
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <template v-if="loading.stats">
        <SkeletonLoader v-for="i in 6" :key="i" type="card" />
      </template>
      <template v-else-if="stats">
        <StatCard
          title="Utilisateurs"
          :value="stats.totalUtilisateurs ?? 0"
          :icon="Users"
          color="primary"
          :trend="stats.trends?.utilisateurs?.direction"
          :trend-value="stats.trends?.utilisateurs?.value"
        />
        <StatCard
          title="Services"
          :value="stats.totalServices ?? 0"
          :icon="Building2"
          color="purple"
          :trend="stats.trends?.services?.direction"
          :trend-value="stats.trends?.services?.value"
        />
        <StatCard
          title="Courriers entrants"
          :value="stats.courriersEntrants ?? 0"
          :icon="ArrowDownToLine"
          color="success"
          :trend="stats.trends?.entrants?.direction"
          :trend-value="stats.trends?.entrants?.value"
        />
        <StatCard
          title="Courriers sortants"
          :value="stats.courriersSortants ?? 0"
          :icon="ArrowUpFromLine"
          color="indigo"
          :trend="stats.trends?.sortants?.direction"
          :trend-value="stats.trends?.sortants?.value"
        />
        <StatCard
          title="Courriers en attente"
          :value="stats.courriersEnAttente ?? 0"
          :icon="Clock"
          color="warning"
          :trend="stats.trends?.enAttente?.direction"
          :trend-value="stats.trends?.enAttente?.value"
        />
        <StatCard
          title="Courriers traités"
          :value="stats.courriersTraites ?? 0"
          :icon="CheckCircle2"
          color="success"
          :trend="stats.trends?.traites?.direction"
          :trend-value="stats.trends?.traites?.value"
        />
      </template>
    </div>

    <!-- Charts -->
    <div class="mb-6">
      <DashboardCharts :data="charts" :loading="loading.charts" />
    </div>

    <!-- Error alert (charts) -->
    <div
      v-if="error.charts"
      class="mb-6 p-4 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger-700"
    >
      <span class="font-medium">Erreur graphiques :</span> {{ error.charts }}
    </div>

    <!-- Activities + Latest courriers -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Recent activities -->
      <div class="xl:col-span-1">
        <RecentActivities
          :activities="recentActivities"
          :loading="loading.activities"
        />
        <!-- Error alert (activities) -->
        <div
          v-if="error.activities"
          class="mt-3 p-3 bg-danger-50 border border-danger-100 rounded-lg text-xs text-danger-700"
        >
          {{ error.activities }}
        </div>
      </div>

      <!-- Latest courriers table -->
      <div class="xl:col-span-2">
        <LatestCourriers
          :courriers="latestCourriers"
          :loading="loading.courriers"
        />
        <!-- Error alert (courriers) -->
        <div
          v-if="error.courriers"
          class="mt-3 p-3 bg-danger-50 border border-danger-100 rounded-lg text-xs text-danger-700"
        >
          {{ error.courriers }}
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

