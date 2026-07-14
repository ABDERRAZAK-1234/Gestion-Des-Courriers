<script setup>
/**
 * LatestCourriers — Responsive data table showing the latest courriers.
 *
 * Props:
 *   courriers: Array of courrier objects from the API
 *   loading:   Boolean loading state
 */
import StatusBadge from '@/components/ui/StatusBadge.vue';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';
import { Mail, ExternalLink } from '@lucide/vue';

defineProps({
  courriers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <Mail :size="18" class="text-primary-600" />
        <h3 class="text-sm font-semibold text-gray-800">Derniers courriers</h3>
      </div>
      <button
        class="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600
               hover:text-primary-700 transition-colors"
      >
        Voir tout
        <ExternalLink :size="13" />
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="overflow-x-auto">
      <table class="w-full min-w-[800px]">
        <thead>
          <tr class="bg-gray-50/60">
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Référence</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expéditeur</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsable</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <SkeletonLoader v-for="i in 5" :key="i" type="table-row" />
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-else-if="!courriers.length" class="py-12 text-center">
      <Mail :size="36" class="mx-auto text-gray-300 mb-3" />
      <p class="text-sm text-gray-400">Aucun courrier disponible</p>
    </div>

    <!-- Data table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[800px]">
        <thead>
          <tr class="bg-gray-50/60">
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Référence</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expéditeur</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsable</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="courrier in courriers"
            :key="courrier.id || courrier.reference"
            class="hover:bg-gray-50/50 transition-colors duration-150"
          >
            <td class="px-4 py-3.5">
              <span class="text-sm font-semibold text-primary-600">
                {{ courrier.reference }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <span class="text-sm text-gray-700 line-clamp-1">
                {{ courrier.objet }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <span class="text-sm text-gray-600">
                {{ courrier.expediteur }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <span class="text-sm text-gray-600">
                {{ courrier.service }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <span class="text-sm text-gray-600">
                {{ courrier.responsable }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <StatusBadge :status="courrier.statut" />
            </td>
            <td class="px-4 py-3.5">
              <span class="text-sm text-gray-500">
                {{ formatDate(courrier.createdAt || courrier.date) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
