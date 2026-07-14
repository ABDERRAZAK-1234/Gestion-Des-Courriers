<script setup>
/**
 * StatusBadge — Color-coded badge for courrier statuses.
 *
 * Props:
 *   status: 'Nouveau' | 'Transmis' | 'Reçu' | 'En cours' | 'Traité' | 'Archivé'
 */
defineProps({
  status: {
    type: String,
    required: true
  }
});

const statusStyles = {
  'Nouveau': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'Transmis': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'Reçu': 'bg-purple-50 text-purple-700 ring-purple-600/20',
  'En cours': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Traité': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Archivé': 'bg-gray-50 text-gray-600 ring-gray-500/20'
};

const dotStyles = {
  'Nouveau': 'bg-blue-500',
  'Transmis': 'bg-indigo-500',
  'Reçu': 'bg-purple-500',
  'En cours': 'bg-amber-500',
  'Traité': 'bg-emerald-500',
  'Archivé': 'bg-gray-400'
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
      statusStyles[status] || 'bg-gray-50 text-gray-600 ring-gray-500/20'
    ]"
  >
    <span
      :class="[
        'inline-block w-1.5 h-1.5 rounded-full',
        dotStyles[status] || 'bg-gray-400'
      ]"
    />
    {{ status }}
  </span>
</template>
