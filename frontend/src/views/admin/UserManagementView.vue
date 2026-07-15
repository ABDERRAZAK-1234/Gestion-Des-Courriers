<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Ban,
  CheckCircle,
  X,
  Phone,
  Mail,
  UserCheck,
  Shield,
  Briefcase
} from '@lucide/vue';

const userStore = useUserStore();
const { users, roles, services, loading, error } = storeToRefs(userStore);

const searchQuery = ref('');
const isModalOpen = ref(false);
const isEditing = ref(false);
const editingUserId = ref(null);

const form = ref({
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  password: '',
  roleId: '',
  serviceId: ''
});

const formErrors = ref({});

onMounted(() => {
  userStore.fetchUsers();
});

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return users.value;
  return users.value.filter(u => 
    u.nom.toLowerCase().includes(query) ||
    u.prenom.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    u.telephone?.toLowerCase().includes(query) ||
    u.roleId?.nom?.toLowerCase().includes(query) ||
    u.serviceId?.nom?.toLowerCase().includes(query)
  );
});

// Watch roleId to toggle serviceId requirement
const selectedRoleName = computed(() => {
  const role = roles.value.find(r => r._id === form.value.roleId);
  return role ? role.nom : '';
});

function openAddModal() {
  isEditing.value = false;
  editingUserId.value = null;
  form.value = {
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    password: '',
    roleId: roles.value[0]?._id || '',
    serviceId: ''
  };
  formErrors.value = {};
  isModalOpen.value = true;
}

function openEditModal(user) {
  isEditing.value = true;
  editingUserId.value = user._id;
  form.value = {
    nom: user.nom,
    prenom: user.prenom,
    telephone: user.telephone || '',
    email: user.email,
    password: '', // Leave blank unless changing
    roleId: user.roleId?._id || '',
    serviceId: user.serviceId?._id || ''
  };
  formErrors.value = {};
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function validateForm() {
  const errors = {};
  if (!form.value.nom) errors.nom = 'Le nom est requis';
  if (!form.value.prenom) errors.prenom = 'Le prénom est requis';
  if (!form.value.email) errors.email = 'L\'adresse email est requise';
  else if (!/\S+@\S+\.\S+/.test(form.value.email)) errors.email = 'L\'email est invalide';
  
  if (!isEditing.value && !form.value.password) {
    errors.password = 'Le mot de passe est requis';
  }

  if (!form.value.roleId) errors.roleId = 'Le rôle est requis';

  if (selectedRoleName.value === 'RESPONSABLE' && !form.value.serviceId) {
    errors.serviceId = 'Le service est obligatoire pour un Responsable';
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) return;

  try {
    const payload = { ...form.value };
    if (isEditing.value) {
      // Remove empty password so it is not updated blank
      if (!payload.password) delete payload.password;
      await userStore.updateUser(editingUserId.value, payload);
    } else {
      await userStore.createUser(payload);
    }
    closeModal();
  } catch (err) {
    // Error is set in the store and will be displayed in the modal
  }
}

async function handleToggleStatus(user) {
  if (confirm(`Êtes-vous sûr de vouloir ${user.status === 'ACTIVE' ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
    try {
      await userStore.toggleUserStatus(user);
    } catch (err) {
      alert(err.response?.data?.message || 'Une erreur est survenue');
    }
  }
}
</script>

<template>
  <AdminLayout>
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <p class="text-sm text-gray-500 mt-1">Créez, modifiez et gérez les comptes des utilisateurs de la plateforme.</p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white
               text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-200"
      >
        <UserPlus :size="18" />
        Ajouter un utilisateur
      </button>
    </div>

    <!-- Error message banner -->
    <div
      v-if="error && !isModalOpen"
      class="mb-6 p-4 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger-700"
    >
      <span class="font-medium">Erreur :</span> {{ error }}
    </div>

    <!-- User list container -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Search bar & filters -->
      <div class="p-5 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between gap-4">
        <div class="relative w-full max-w-md">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom, email, rôle, service..."
            class="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl
                   placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2
                   focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
          />
        </div>
        <div class="text-xs text-gray-400 font-medium">
          Total : {{ filteredUsers.length }} utilisateur(s)
        </div>
      </div>

      <!-- Table content -->
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead>
            <tr class="bg-gray-50/60 border-b border-gray-100">
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="loading && !users.length">
              <SkeletonLoader v-for="i in 5" :key="i" type="table-row" />
            </template>
            <template v-else-if="!filteredUsers.length">
              <tr>
                <td colspan="6" class="py-12 text-center text-gray-400 text-sm">
                  <Users :size="40" class="mx-auto text-gray-200 mb-3" />
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="user in filteredUsers"
                :key="user._id"
                class="hover:bg-gray-50/40 transition-colors duration-150"
              >
                <!-- Identity -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white uppercase shrink-0"
                      :class="user.status === 'ACTIVE' ? 'bg-primary-600' : 'bg-gray-400'"
                    >
                      {{ user.prenom.charAt(0) }}{{ user.nom.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900 leading-tight">
                        {{ user.prenom }} {{ user.nom }}
                      </p>
                      <p class="text-xs text-gray-400 mt-0.5">ID: {{ user._id.slice(-6) }}</p>
                    </div>
                  </div>
                </td>

                <!-- Contact info -->
                <td class="px-6 py-4">
                  <div class="space-y-1">
                    <div class="flex items-center gap-1.5 text-xs text-gray-600">
                      <Mail :size="13" class="text-gray-400" />
                      {{ user.email }}
                    </div>
                    <div v-if="user.telephone" class="flex items-center gap-1.5 text-xs text-gray-600">
                      <Phone :size="13" class="text-gray-400" />
                      {{ user.telephone }}
                    </div>
                  </div>
                </td>

                <!-- Role -->
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset"
                    :class="[
                      user.roleId?.nom === 'ADMIN' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : '',
                      user.roleId?.nom === 'SECRETAIRE' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : '',
                      user.roleId?.nom === 'RESPONSABLE' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : '',
                      user.roleId?.nom === 'EMPLOYE' ? 'bg-green-50 text-green-700 ring-green-600/20' : '',
                    ]"
                  >
                    <Shield :size="12" />
                    {{ user.roleId?.nom || 'Non spécifié' }}
                  </span>
                </td>

                <!-- Service -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1.5 text-sm text-gray-600">
                    <Briefcase :size="14" class="text-gray-400" />
                    {{ user.serviceId?.nom || '—' }}
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                    :class="user.status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                      : 'bg-danger-50 text-danger-700 ring-danger-600/20'"
                  >
                    <span
                      class="inline-block w-1.5 h-1.5 rounded-full"
                      :class="user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-danger-500'"
                    />
                    {{ user.status === 'ACTIVE' ? 'Actif' : 'Inactif' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openEditModal(user)"
                      class="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-all duration-150"
                      title="Modifier l'utilisateur"
                    >
                      <Edit2 :size="16" />
                    </button>
                    <button
                      @click="handleToggleStatus(user)"
                      class="p-1.5 rounded-lg transition-all duration-150"
                      :class="user.status === 'ACTIVE' 
                        ? 'text-gray-500 hover:text-danger-600 hover:bg-gray-100' 
                        : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100'"
                      :title="user.status === 'ACTIVE' ? 'Désactiver' : 'Activer'"
                    >
                      <Ban v-if="user.status === 'ACTIVE'" :size="16" />
                      <UserCheck v-else :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal dialog for Add / Edit User -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="closeModal"></div>

          <!-- Trick to center modal -->
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <!-- Modal box -->
          <div
            class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl
                   transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100"
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900" id="modal-title">
                {{ isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}
              </h3>
              <button @click="closeModal" class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                <X :size="18" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit">
              <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <!-- Modal Error message -->
                <div v-if="error" class="p-3 bg-danger-50 border border-danger-100 rounded-xl text-xs text-danger-700">
                  {{ error }}
                </div>

                <!-- Nom / Prenom -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Prénom *</label>
                    <input
                      v-model="form.prenom"
                      type="text"
                      class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      :class="{ 'border-danger-400': formErrors.prenom }"
                    />
                    <p v-if="formErrors.prenom" class="text-xs text-danger-600 mt-1">{{ formErrors.prenom }}</p>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Nom *</label>
                    <input
                      v-model="form.nom"
                      type="text"
                      class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      :class="{ 'border-danger-400': formErrors.nom }"
                    />
                    <p v-if="formErrors.nom" class="text-xs text-danger-600 mt-1">{{ formErrors.nom }}</p>
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Email *</label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    :class="{ 'border-danger-400': formErrors.email }"
                  />
                  <p v-if="formErrors.email" class="text-xs text-danger-600 mt-1">{{ formErrors.email }}</p>
                </div>

                <!-- Telephone -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Téléphone</label>
                  <input
                    v-model="form.telephone"
                    type="text"
                    placeholder="06XXXXXXXX"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <!-- Password -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                    Mot de passe <span v-if="!isEditing">*</span><span v-else class="text-[10px] text-gray-400"> (laisser vide pour conserver)</span>
                  </label>
                  <input
                    v-model="form.password"
                    type="password"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    :class="{ 'border-danger-400': formErrors.password }"
                  />
                  <p v-if="formErrors.password" class="text-xs text-danger-600 mt-1">{{ formErrors.password }}</p>
                </div>

                <!-- Role dropdown -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Rôle *</label>
                  <select
                    v-model="form.roleId"
                    class="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    :class="{ 'border-danger-400': formErrors.roleId }"
                  >
                    <option v-for="role in roles" :key="role._id" :value="role._id">
                      {{ role.nom }}
                    </option>
                  </select>
                  <p v-if="formErrors.roleId" class="text-xs text-danger-600 mt-1">{{ formErrors.roleId }}</p>
                </div>

                <!-- Service dropdown -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                    Service <span v-if="selectedRoleName === 'RESPONSABLE'">*</span>
                  </label>
                  <select
                    v-model="form.serviceId"
                    class="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    :class="{ 'border-danger-400': formErrors.serviceId }"
                  >
                    <option value="">Aucun service</option>
                    <option v-for="service in services" :key="service._id" :value="service._id">
                      {{ service.nom }}
                    </option>
                  </select>
                  <p v-if="formErrors.serviceId" class="text-xs text-danger-600 mt-1">{{ formErrors.serviceId }}</p>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  :disabled="loading"
                >
                  <CheckCircle :size="16" />
                  {{ isEditing ? 'Enregistrer' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </AdminLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
