<script setup>
/**
 * DashboardCharts — Three Chart.js visualizations for dashboard data.
 *
 * Props:
 *   data:    Chart data object from the API (contains monthly, statuts, services)
 *   loading: Boolean loading state
 */
import { computed } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';
import { BarChart3, PieChart, Building2 } from '@lucide/vue';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const props = defineProps({
  data: { type: Object, default: null },
  loading: { type: Boolean, default: false }
});

// --- Courriers par mois (Bar chart) ---
const monthlyChartData = computed(() => {
  if (!props.data?.monthly) {
    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        { label: 'Entrants', data: [], backgroundColor: '#3B82F6', borderRadius: 6, barPercentage: 0.6 },
        { label: 'Sortants', data: [], backgroundColor: '#8B5CF6', borderRadius: 6, barPercentage: 0.6 }
      ]
    };
  }
  return {
    labels: props.data.monthly.labels,
    datasets: [
      {
        label: 'Entrants',
        data: props.data.monthly.entrants,
        backgroundColor: '#3B82F6',
        borderRadius: 6,
        barPercentage: 0.6
      },
      {
        label: 'Sortants',
        data: props.data.monthly.sortants,
        backgroundColor: '#8B5CF6',
        borderRadius: 6,
        barPercentage: 0.6
      }
    ]
  };
});

const monthlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: { family: 'Inter', size: 12 }
      }
    },
    tooltip: {
      backgroundColor: '#1E293B',
      titleFont: { family: 'Inter', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
      padding: 12,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' }
    },
    y: {
      grid: { color: '#F1F5F9' },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' },
      beginAtZero: true
    }
  }
};

// --- Répartition des statuts (Doughnut chart) ---
const statusChartData = computed(() => {
  if (!props.data?.statuts) {
    return {
      labels: ['Nouveau', 'Transmis', 'Reçu', 'En cours', 'Traité', 'Archivé'],
      datasets: [{ data: [], backgroundColor: [] }]
    };
  }
  return {
    labels: props.data.statuts.labels,
    datasets: [{
      data: props.data.statuts.values,
      backgroundColor: ['#3B82F6', '#6366F1', '#8B5CF6', '#F59E0B', '#22C55E', '#94A3B8'],
      borderWidth: 0,
      spacing: 3,
      hoverOffset: 6
    }]
  };
});

const statusChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16,
        font: { family: 'Inter', size: 11 }
      }
    },
    tooltip: {
      backgroundColor: '#1E293B',
      titleFont: { family: 'Inter', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
      padding: 12,
      cornerRadius: 8
    }
  }
};

// --- Courriers par service (Horizontal bar) ---
const serviceChartData = computed(() => {
  if (!props.data?.services) {
    return {
      labels: [],
      datasets: [{ data: [], backgroundColor: '#2563EB' }]
    };
  }
  return {
    labels: props.data.services.labels,
    datasets: [{
      label: 'Courriers',
      data: props.data.services.values,
      backgroundColor: '#2563EB',
      borderRadius: 6,
      barPercentage: 0.5
    }]
  };
});

const serviceChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1E293B',
      titleFont: { family: 'Inter', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { color: '#F1F5F9' },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' },
      beginAtZero: true
    },
    y: {
      grid: { display: false },
      ticks: { font: { family: 'Inter', size: 11 }, color: '#64748B' }
    }
  }
};
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <!-- Courriers par mois -->
    <div class="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div class="flex items-center gap-2 mb-4">
        <BarChart3 :size="18" class="text-primary-600" />
        <h3 class="text-sm font-semibold text-gray-800">Courriers par mois</h3>
      </div>
      <div v-if="loading" class="flex items-center justify-center" style="height: 280px">
        <SkeletonLoader type="chart" height="280px" />
      </div>
      <div v-else style="height: 280px">
        <Bar :data="monthlyChartData" :options="monthlyChartOptions" />
      </div>
    </div>

    <!-- Répartition des statuts -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div class="flex items-center gap-2 mb-4">
        <PieChart :size="18" class="text-indigo-600" />
        <h3 class="text-sm font-semibold text-gray-800">Répartition des statuts</h3>
      </div>
      <div v-if="loading" class="flex items-center justify-center" style="height: 280px">
        <SkeletonLoader type="chart" height="280px" />
      </div>
      <div v-else style="height: 280px">
        <Doughnut :data="statusChartData" :options="statusChartOptions" />
      </div>
    </div>

    <!-- Courriers par service -->
    <div class="xl:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div class="flex items-center gap-2 mb-4">
        <Building2 :size="18" class="text-success-600" />
        <h3 class="text-sm font-semibold text-gray-800">Courriers par service</h3>
      </div>
      <div v-if="loading" class="flex items-center justify-center" style="height: 300px">
        <SkeletonLoader type="chart" height="300px" />
      </div>
      <div v-else style="height: 300px">
        <Bar :data="serviceChartData" :options="serviceChartOptions" />
      </div>
    </div>
  </div>
</template>
