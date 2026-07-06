<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const dashboardByRole = {
  ADMIN: '/admin/dashboard',
  SECRETAIRE: '/secretaire/dashboard',
  RESPONSABLE: '/responsable/dashboard',
  EMPLOYE: '/employe/dashboard'
};

const goBack = () => {
  router.push(dashboardByRole[authStore.role] || '/login');
};
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
    <section
      class="w-full max-w-2xl rounded-2xl bg-white p-8 md:p-12 text-center shadow-md border border-slate-100 flex flex-col items-center"
    >
      <div class="w-full max-w-[500px] mx-auto mb-6 overflow-hidden rounded-lg">
        <img
          src="../../assets/images/403.gif"
          alt="403 Forbidden"
          class="w-full h-auto object-contain mx-auto"
        />
      </div>

      <div class="max-w-md mx-auto">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 mb-4 border border-red-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Erreur 403 • Accès refusé
        </span>

        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Vous n’êtes pas autorisé à accéder à cette page.
        </h1>

        <p class="text-slate-500 text-sm md:text-base mb-8 leading-relaxed">
          Cette zone est réservée à un autre rôle utilisateur. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur IT.
        </p>

        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm text-white font-semibold shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all duration-200 active:scale-[0.98]"
          @click="goBack"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Retour à mon tableau de bord
        </button>
      </div>
    </section>
  </main>
</template>
