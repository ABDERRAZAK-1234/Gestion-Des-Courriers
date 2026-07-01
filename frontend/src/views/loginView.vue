<script setup>
import { useRouter } from 'vue-router';
import { useForm, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email obligatoire'),
  password: yup.string().required('Mot de passe obligatoire')
});

const { handleSubmit } = useForm({
  validationSchema: schema
});

const redirectByRole = (role) => {
  const routes = {
    ADMIN: '/admin/dashboard',
    SECRETAIRE: '/secretaire/dashboard',
    RESPONSABLE: '/responsable/dashboard',
    EMPLOYE: '/employe/dashboard'
  };
  router.push(routes[role] || '/dashboard');
};

const onSubmit = handleSubmit(async (values) => {
  const user = await authStore.login(values);
  redirectByRole(user.roleId.nom);
});

</script>
<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-50 px-4 antialiased selection:bg-blue-500/10">
    <!-- Card avec ombre douce profonde et angles arrondis modernes -->
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-10 transition-all duration-300">

      <!-- En-tête épuré -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Connexion
        </h1>
        <p class="text-sm text-slate-500">
          Veuillez renseigner vos identifiants pour accéder à l'application.
        </p>
      </div>

      <form @submit="onSubmit" class="space-y-6">
        <!-- Champ Email -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Adresse Email
          </label>
          <Field name="email" type="email"
            class="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200"
            placeholder="exemple@email.com" />
          <ErrorMessage name="email" class="text-xs font-medium text-red-500 mt-1 block" />
        </div>

        <!-- Champ Mot de passe -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Mot de passe
            </label>
          </div>
          <Field name="password" type="password"
            class="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200"
            placeholder="••••••••" />
          <ErrorMessage name="password" class="text-xs font-medium text-red-500 mt-1 block" />
        </div>

        <!-- Message d'erreur global du Store -->
        <div v-if="authStore.error"
          class="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <span class="font-medium">{{ authStore.error }}</span>
        </div>

        <!-- Bouton d'action principal -->
        <button type="submit" :disabled="authStore.loading"
          class="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-md shadow-slate-900/10">
          {{ authStore.loading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </main>
</template>
