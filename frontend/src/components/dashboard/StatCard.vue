<script setup>
/**
 * StatCard — Dashboard statistic card with icon, value, optional trend.
 *
 * Props:
 *   title:      Label displayed below the value
 *   value:      The statistic number
 *   icon:       Lucide icon component
 *   color:      'primary' | 'success' | 'warning' | 'danger' | 'indigo' | 'purple'
 *   trend:      'up' | 'down' | null  (optional trend direction)
 *   trendValue: String like '+12%' (optional)
 */
import { TrendingUp, TrendingDown } from '@lucide/vue';

defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  icon: { type: Object, required: true },
  color: { type: String, default: 'primary' },
  trend: { type: String, default: null },
  trendValue: { type: String, default: '' }
});

const colorMap = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    ring: 'ring-primary-100'
  },
  success: {
    bg: 'bg-success-50',
    icon: 'text-success-600',
    ring: 'ring-success-100'
  },
  warning: {
    bg: 'bg-warning-50',
    icon: 'text-warning-600',
    ring: 'ring-warning-100'
  },
  danger: {
    bg: 'bg-danger-50',
    icon: 'text-danger-600',
    ring: 'ring-danger-100'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    ring: 'ring-indigo-100'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    ring: 'ring-purple-100'
  }
};
</script>

<template>
  <div
    class="group relative bg-white rounded-xl border border-gray-100 p-5 shadow-sm
           hover:shadow-md hover:border-gray-200 transition-all duration-300 ease-out
           hover:-translate-y-0.5 overflow-hidden"
  >
    <!-- Decorative gradient bar at top -->
    <div
      class="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      :class="{
        'bg-gradient-to-r from-primary-500 to-primary-600': color === 'primary',
        'bg-gradient-to-r from-success-500 to-success-600': color === 'success',
        'bg-gradient-to-r from-warning-500 to-warning-600': color === 'warning',
        'bg-gradient-to-r from-danger-500 to-danger-600': color === 'danger',
        'bg-gradient-to-r from-indigo-500 to-indigo-600': color === 'indigo',
        'bg-gradient-to-r from-purple-500 to-purple-600': color === 'purple'
      }"
    />

    <div class="flex items-start justify-between gap-4">
      <!-- Icon -->
      <div
        :class="[
          'flex items-center justify-center w-12 h-12 rounded-xl ring-1',
          colorMap[color]?.bg,
          colorMap[color]?.icon,
          colorMap[color]?.ring
        ]"
      >
        <component :is="icon" :size="22" :stroke-width="1.8" />
      </div>

      <!-- Trend badge -->
      <div
        v-if="trend"
        :class="[
          'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
          trend === 'up'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-red-50 text-red-600'
        ]"
      >
        <TrendingUp v-if="trend === 'up'" :size="13" />
        <TrendingDown v-else :size="13" />
        {{ trendValue }}
      </div>
    </div>

    <!-- Value & title -->
    <div class="mt-4">
      <p class="text-2xl font-bold text-gray-900 tracking-tight">
        {{ typeof value === 'number' ? value.toLocaleString('fr-FR') : value }}
      </p>
      <p class="text-sm text-gray-500 mt-0.5">{{ title }}</p>
    </div>
  </div>
</template>
