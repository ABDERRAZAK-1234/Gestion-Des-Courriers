<script setup>
/**
 * RecentActivities — Timeline display of recent dashboard actions.
 *
 * Props:
 *   activities: Array of activity objects from the API
 *   loading:    Boolean loading state
 */
import { computed } from 'vue';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';
import {
  Activity,
  Mail,
  Share2,
  CheckCircle2,
  UserPlus,
  FileEdit,
  AlertCircle
} from '@lucide/vue';

const props = defineProps({
  activities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

const activityConfig = {
  'courrier_created': {
    icon: Mail,
    color: 'bg-blue-50 text-blue-600 ring-blue-100',
    dotColor: 'bg-blue-500'
  },
  'courrier_assigned': {
    icon: Share2,
    color: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    dotColor: 'bg-indigo-500'
  },
  'courrier_processed': {
    icon: CheckCircle2,
    color: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    dotColor: 'bg-emerald-500'
  },
  'user_added': {
    icon: UserPlus,
    color: 'bg-purple-50 text-purple-600 ring-purple-100',
    dotColor: 'bg-purple-500'
  },
  'courrier_updated': {
    icon: FileEdit,
    color: 'bg-amber-50 text-amber-600 ring-amber-100',
    dotColor: 'bg-amber-500'
  }
};

const defaultConfig = {
  icon: AlertCircle,
  color: 'bg-gray-50 text-gray-600 ring-gray-100',
  dotColor: 'bg-gray-400'
};

function getConfig(type) {
  return activityConfig[type] || defaultConfig;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <Activity :size="18" class="text-primary-600" />
        <h3 class="text-sm font-semibold text-gray-800">Activité récente</h3>
      </div>
      <span class="text-xs text-gray-400">Dernières actions</span>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-5 space-y-4">
      <div v-for="i in 5" :key="i" class="flex items-start gap-3">
        <SkeletonLoader type="circle" width="32px" height="32px" />
        <div class="flex-1 space-y-2">
          <SkeletonLoader type="line" height="12px" width="80%" />
          <SkeletonLoader type="line" height="10px" width="40%" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!activities.length" class="py-12 text-center">
      <Activity :size="36" class="mx-auto text-gray-300 mb-3" />
      <p class="text-sm text-gray-400">Aucune activité récente</p>
    </div>

    <!-- Activities timeline -->
    <div v-else class="p-5">
      <div class="space-y-0">
        <div
          v-for="(activity, index) in activities"
          :key="activity.id || index"
          class="relative flex gap-3 pb-5 last:pb-0 group"
        >
          <!-- Timeline line -->
          <div
            v-if="index < activities.length - 1"
            class="absolute left-4 top-9 bottom-0 w-px bg-gray-100"
          />

          <!-- Icon -->
          <div
            :class="[
              'relative z-10 flex items-center justify-center w-8 h-8 rounded-lg ring-1 shrink-0',
              'transition-transform duration-200 group-hover:scale-110',
              getConfig(activity.type).color
            ]"
          >
            <component :is="getConfig(activity.type).icon" :size="15" :stroke-width="1.8" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pt-0.5">
            <p class="text-sm text-gray-700 leading-snug">
              {{ activity.message || activity.description }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ formatTime(activity.createdAt || activity.date) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
