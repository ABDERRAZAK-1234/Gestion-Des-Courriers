import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import userService from '@/services/userService';

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Extract unique roles from loaded users to populate dropdowns
  const roles = computed(() => {
    const roleMap = new Map();
    users.value.forEach(u => {
      if (u.roleId && u.roleId._id && u.roleId.nom) {
        roleMap.set(u.roleId._id, {
          _id: u.roleId._id,
          nom: u.roleId.nom
        });
      }
    });
    // Fallbacks in case seed is loaded but some role is missing in current users list
    return Array.from(roleMap.values());
  });

  // Extract unique services from loaded users to populate dropdowns
  const services = computed(() => {
    const serviceMap = new Map();
    users.value.forEach(u => {
      if (u.serviceId && u.serviceId._id && u.serviceId.nom) {
        serviceMap.set(u.serviceId._id, {
          _id: u.serviceId._id,
          nom: u.serviceId.nom,
          description: u.serviceId.description
        });
      }
    });
    return Array.from(serviceMap.values());
  });

  async function fetchUsers() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await userService.getAll();
      users.value = data.users || [];
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
      console.error('[UserStore] fetchUsers error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createUser(userData) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await userService.create(userData);
      if (data.user) {
        users.value.unshift(data.user);
      }
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur';
      console.error('[UserStore] createUser error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(id, userData) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await userService.update(id, userData);
      const index = users.value.findIndex(u => u._id === id);
      if (index !== -1 && data.user) {
        users.value[index] = data.user;
      }
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur';
      console.error('[UserStore] updateUser error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function toggleUserStatus(user) {
    loading.value = true;
    error.value = null;
    const isCurrentlyActive = user.status === 'ACTIVE';
    try {
      const { data } = isCurrentlyActive 
        ? await userService.disable(user._id)
        : await userService.enable(user._id);
      
      const index = users.value.findIndex(u => u._id === user._id);
      if (index !== -1 && data.user) {
        users.value[index] = data.user;
      }
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la modification du statut de l\'utilisateur';
      console.error('[UserStore] toggleUserStatus error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    users,
    roles,
    services,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus
  };
});
