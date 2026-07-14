<script setup>
/**
 * SkeletonLoader — Reusable shimmer/pulse placeholder for loading states.
 *
 * Props:
 *   type: 'line' | 'circle' | 'card' | 'chart' | 'table-row'
 *   width: CSS width (default: '100%')
 *   height: CSS height (default depends on type)
 *   count: Number of skeleton lines to render (only for 'line' type)
 */
defineProps({
  type: {
    type: String,
    default: 'line',
    validator: (v) => ['line', 'circle', 'card', 'chart', 'table-row'].includes(v)
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: null
  },
  count: {
    type: Number,
    default: 1
  }
});
</script>

<template>
  <!-- Line skeleton -->
  <template v-if="type === 'line'">
    <div
      v-for="i in count"
      :key="i"
      class="rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"
      :style="{
        width: i === count && count > 1 ? '60%' : width,
        height: height || '14px',
        marginBottom: i < count ? '10px' : '0'
      }"
    />
  </template>

  <!-- Circle skeleton -->
  <div
    v-else-if="type === 'circle'"
    class="rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer shrink-0"
    :style="{ width: width || '40px', height: height || width || '40px' }"
  />

  <!-- Card skeleton -->
  <div
    v-else-if="type === 'card'"
    class="rounded-xl bg-white p-5 shadow-sm border border-gray-100"
    :style="{ width, height: height || '120px' }"
  >
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer shrink-0" />
      <div class="flex-1 space-y-2.5">
        <div class="h-3 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        <div class="h-7 w-16 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  </div>

  <!-- Chart skeleton -->
  <div
    v-else-if="type === 'chart'"
    class="rounded-xl bg-white p-5 shadow-sm border border-gray-100"
    :style="{ width, height: height || '320px' }"
  >
    <div class="h-4 w-40 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer mb-6" />
    <div class="flex items-end gap-3 h-[calc(100%-56px)]">
      <div v-for="i in 7" :key="i"
        class="flex-1 rounded-t bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"
        :style="{ height: `${20 + Math.random() * 60}%` }"
      />
    </div>
  </div>

  <!-- Table row skeleton -->
  <tr v-else-if="type === 'table-row'">
    <td v-for="i in 7" :key="i" class="px-4 py-3.5">
      <div
        class="h-3.5 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"
        :style="{ width: i === 2 ? '75%' : i === 7 ? '60%' : '85%' }"
      />
    </td>
  </tr>
</template>
