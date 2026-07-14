import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import dashboardService from '@/services/dashboardService';

/**
 * Dashboard store — computes all dashboard data from real backend endpoints.
 *
 * No dedicated dashboard API exists. We fetch:
 *   - GET /api/admin/users       → user list + count
 *   - GET /api/courriers         → all courriers (large limit to get totals)
 *   - GET /api/notifications/me  → notifications for activity feed
 *
 * Stats, charts, and tables are computed on the frontend from these raw responses.
 */
export const useDashboardStore = defineStore('dashboard', () => {
  // --- Raw data from API ---
  const users = ref([]);
  const courriers = ref([]);
  const notifications = ref([]);

  // --- Loading & Error ---
  const loading = ref({
    stats: false,
    charts: false,
    activities: false,
    courriers: false
  });

  const error = ref({
    stats: null,
    charts: null,
    activities: null,
    courriers: null
  });

  // --- Computed: Stats ---
  const stats = computed(() => {
    if (!courriers.value.length && !users.value.length) return null;

    // Extract unique services from users (populated serviceId)
    const serviceSet = new Set();
    users.value.forEach(u => {
      if (u.serviceId?._id) serviceSet.add(u.serviceId._id);
    });

    const entrants = courriers.value.filter(c => c.type === 'ENTRANT');
    const sortants = courriers.value.filter(c => c.type === 'SORTANT');
    const enAttente = courriers.value.filter(c =>
      ['NOUVEAU', 'TRANSMIS', 'RECU'].includes(c.statut)
    );
    const traites = courriers.value.filter(c =>
      ['TRAITE', 'ARCHIVE'].includes(c.statut)
    );

    return {
      totalUtilisateurs: users.value.length,
      totalServices: serviceSet.size,
      courriersEntrants: entrants.length,
      courriersSortants: sortants.length,
      courriersEnAttente: enAttente.length,
      courriersTraites: traites.length
    };
  });

  // --- Computed: Charts data ---
  const charts = computed(() => {
    if (!courriers.value.length) return null;

    // Monthly breakdown for the current year
    const currentYear = new Date().getFullYear();
    const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const entrantsPerMonth = new Array(12).fill(0);
    const sortantsPerMonth = new Array(12).fill(0);

    courriers.value.forEach(c => {
      const date = new Date(c.createdAt);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        if (c.type === 'ENTRANT') entrantsPerMonth[month]++;
        else if (c.type === 'SORTANT') sortantsPerMonth[month]++;
      }
    });

    // Status distribution
    const statutMap = {
      'NOUVEAU': 0,
      'TRANSMIS': 0,
      'RECU': 0,
      'EN_COURS': 0,
      'TRAITE': 0,
      'ARCHIVE': 0
    };
    courriers.value.forEach(c => {
      if (statutMap[c.statut] !== undefined) statutMap[c.statut]++;
    });

    const statutLabels = ['Nouveau', 'Transmis', 'Reçu', 'En cours', 'Traité', 'Archivé'];
    const statutValues = [
      statutMap['NOUVEAU'],
      statutMap['TRANSMIS'],
      statutMap['RECU'],
      statutMap['EN_COURS'],
      statutMap['TRAITE'],
      statutMap['ARCHIVE']
    ];

    // Courriers per service
    const serviceMap = {};
    courriers.value.forEach(c => {
      const serviceName = c.serviceId?.nom || 'Non affecté';
      serviceMap[serviceName] = (serviceMap[serviceName] || 0) + 1;
    });
    const serviceLabels = Object.keys(serviceMap);
    const serviceValues = Object.values(serviceMap);

    return {
      monthly: {
        labels: monthLabels,
        entrants: entrantsPerMonth,
        sortants: sortantsPerMonth
      },
      statuts: {
        labels: statutLabels,
        values: statutValues
      },
      services: {
        labels: serviceLabels,
        values: serviceValues
      }
    };
  });

  // --- Computed: Recent activities from notifications ---
  const recentActivities = computed(() => {
    return notifications.value.slice(0, 10).map(n => {
      // Map notification type to activity type
      const typeMap = {
        'NEW_COURRIER': 'courrier_created',
        'AFFECTATION': 'courrier_assigned',
        'STATUS_UPDATE': 'courrier_processed',
        'TRANSFERT': 'courrier_assigned',
        'SYSTEM_INFO': 'courrier_updated'
      };

      return {
        id: n._id,
        type: typeMap[n.type] || 'courrier_updated',
        message: n.message,
        createdAt: n.createdAt,
        courrier: n.courrierId
      };
    });
  });

  // --- Computed: Latest courriers for the table ---
  const latestCourriers = computed(() => {
    // Map backend statut codes to display labels
    const statutDisplayMap = {
      'NOUVEAU': 'Nouveau',
      'TRANSMIS': 'Transmis',
      'RECU': 'Reçu',
      'EN_COURS': 'En cours',
      'TRAITE': 'Traité',
      'ARCHIVE': 'Archivé'
    };

    return courriers.value.slice(0, 10).map(c => ({
      id: c._id,
      reference: c.reference,
      objet: c.objet,
      expediteur: c.createdBy
        ? `${c.createdBy.prenom || ''} ${c.createdBy.nom || ''}`.trim()
        : '—',
      service: c.serviceId?.nom || 'Non affecté',
      responsable: '—', // Responsable is on the Service model, not populated on courrier
      statut: statutDisplayMap[c.statut] || c.statut,
      createdAt: c.createdAt
    }));
  });

  // --- Actions ---
  async function fetchUsers() {
    loading.value.stats = true;
    error.value.stats = null;
    try {
      const { data } = await dashboardService.getUsers();
      users.value = data.users || [];
    } catch (err) {
      error.value.stats = err.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
      console.error('[DashboardStore] fetchUsers error:', err);
    } finally {
      loading.value.stats = false;
    }
  }

  async function fetchCourriers() {
    loading.value.charts = true;
    loading.value.courriers = true;
    error.value.charts = null;
    error.value.courriers = null;
    try {
      // Fetch all courriers with a large limit to compute stats
      const { data } = await dashboardService.getCourriers({ limit: 1000 });
      courriers.value = data.courriers || [];
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du chargement des courriers';
      error.value.charts = msg;
      error.value.courriers = msg;
      console.error('[DashboardStore] fetchCourriers error:', err);
    } finally {
      loading.value.charts = false;
      loading.value.courriers = false;
    }
  }

  async function fetchNotifications() {
    loading.value.activities = true;
    error.value.activities = null;
    try {
      const { data } = await dashboardService.getNotifications();
      notifications.value = data.notifications || [];
    } catch (err) {
      error.value.activities = err.response?.data?.message || 'Erreur lors du chargement des notifications';
      console.error('[DashboardStore] fetchNotifications error:', err);
    } finally {
      loading.value.activities = false;
    }
  }

  async function fetchAll() {
    await Promise.allSettled([
      fetchUsers(),
      fetchCourriers(),
      fetchNotifications()
    ]);
  }

  return {
    // Raw data
    users,
    courriers: computed(() => courriers.value),
    notifications,
    // Computed dashboard data
    stats,
    charts,
    recentActivities,
    latestCourriers,
    // Loading & error
    loading,
    error,
    // Actions
    fetchUsers,
    fetchCourriers,
    fetchNotifications,
    fetchAll
  };
});
