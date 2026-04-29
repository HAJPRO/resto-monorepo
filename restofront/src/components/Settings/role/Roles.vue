<script setup>
import { ref, computed, onMounted,toRaw } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { arrowBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Input, EmptyState, Button, Header, GlobalRefresher } from '../../../UI/UI';
import { RoleStore } from "../../../stores/index.store";
import { storeToRefs } from 'pinia';
import { vibrate } from '../../../utils/index.util';

const store = RoleStore();
const { roles, loading } = storeToRefs(store);
const searchQuery = ref('');

// --- QIDIRUV MANTIQI ---
const filteredRoles = computed(() => {
  if (!roles.value) return [];
  const q = searchQuery.value.toLowerCase().trim();
  return roles.value.filter(r => 
    r.name?.toLowerCase().includes(q) || 
    r.value?.toLowerCase().includes(q) ||
    r._id?.includes(q)
  );
});

// --- MODAL ACTION ---
// Roles.vue ichida (agar toRaw ishlatishni xohlasangiz)

const openModal = (action, data) => {
  // data'ni "toRaw" qilib yuboring
  store.ModalAction({ action, data: data ? toRaw(data) : null });
}

// --- ROL ICONLARI ---
const getRoleIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('root') || n.includes('admin')) return 'fas fa-crown';
  if (n.includes('manager') || n.includes('boshliq')) return 'fas fa-user-tie';
  if (n.includes('buxgalter') || n.includes('accountant')) return 'fas fa-file-invoice-dollar';
  if (n.includes('ombor') || n.includes('sklad')) return 'fas fa-boxes';
  if (n.includes('director')) return 'fas fa-shield-alt';
  if (n.includes('haydovchi')) return 'fas fa-truck';
  if (n.includes('uquvchi') || n.includes('student')) return 'fas fa-user-graduate';
  return 'fas fa-users-cog'; // Default
};

onMounted(async () => {
  await store.GetAll();
});
</script>

<template>
  <ion-page class="bg-[#F8FAFC] dark:bg-[#020617]">
    <Header 
      title="Huquqlar" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="Rol nomi yoki ID..."
    >
      <template #actions>
        
         <Button @click="openModal('create')" icon="fas fa-plus-circle" size="sm" />
      </template>
    </Header>

    <ion-content :fullscreen="true">
      <GlobalRefresher @refresh="store.GetAll()"/>

      <div class="max-w-full mx-auto px-5 py-6 pb-28">
        
        <div v-if="loading" class="space-y-5">
          <div v-for="i in 5" :key="i" class="h-40 w-full bg-white dark:bg-slate-900/40 rounded-[35px] border border-slate-100 dark:border-white/5 animate-pulse"></div>
        </div>

        <div v-else-if="filteredRoles.length > 0" class="space-y-5">
          <div 
            v-for="role in filteredRoles" :key="role._id" 
            class="relative overflow-hidden group bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 rounded-[35px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none active:scale-[0.97] transition-all duration-300"
          >
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>

            <div class="relative flex items-center justify-between mb-5">
              <div class="flex items-center gap-5">
                <div class="w-16 h-16 rounded-[22px] bg-gradient-to-br from-slate-800 to-slate-900 dark:from-indigo-600 dark:to-violet-700 flex items-center justify-center text-white shadow-xl shadow-slate-200 dark:shadow-indigo-500/20 ring-4 ring-slate-50 dark:ring-indigo-900/20">
                  <i :class="getRoleIcon(role.name)" class="text-2xl"></i>
                </div>

                <div class="flex flex-col">
                  <h3 class="font-bold text-[19px] text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                    {{ role.name }}
                  </h3>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 uppercase tracking-wider">
                    {{ role.value }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end">
                 <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</span>
                 <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">Aktiv</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-2">
              <div class="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-100 dark:border-white/5">
                <span class="text-[9px] font-bold text-slate-400 uppercase block mb-1">Huquqlar soni</span>
                <div class="flex items-center gap-2">
                  <i class="fas fa-key text-indigo-500 text-xs"></i>
                  <span class="text-sm font-black dark:text-white">{{ role.permissions?.length || 0 }} ta</span>
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-100 dark:border-white/5">
                <span class="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tizim ID</span>
                <div class="flex items-center gap-2">
                  <i class="fas fa-fingerprint text-slate-400 text-xs"></i>
                  <span class="text-xs font-mono font-bold dark:text-slate-300">#{{ role._id?.slice(-6) }}</span>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <p class="text-[12px] text-slate-400 italic line-clamp-1 max-w-[60%]">
                {{ role.description || 'Ushbu rol uchun izoh qoldirilmagan.' }}
              </p>
              
              <div class="flex gap-2">
                <Button 
                  @click="openModal('edit', role)"
                  variant="secondary" 
                  icon="fas fa-edit" 
                  class="!w-10 !h-10 !p-0 !rounded-2xl" 
                />
                <Button 
                  @click="store.Delete(role._id)"
                  variant="danger" 
                  icon="fas fa-trash-alt" 
                  class="!w-10 !h-10 !p-0 !rounded-2xl" 
                />
              </div>
            </div>
          </div>
        </div>

        <EmptyState 
          v-else
          title="Rollar topilmadi"
          description="Siz qidirayotgan rol tizimda mavjud emas."
          :searchTerm="searchQuery"
          @action="searchQuery = ''"
        />
        
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
ion-content::part(scroll) {
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.pt-safe { padding-top: env(safe-area-inset-top); }
</style>