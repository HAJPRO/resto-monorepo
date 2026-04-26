<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617]">
    <ion-header class="ion-no-border">
      <div class="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl pt-safe border-b border-slate-100 dark:border-white/5">
        
        <div class="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button 
              @click="$router.back()" 
              class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center justify-center active:scale-90 transition-all"
            >
              <ion-icon :icon="arrowBackOutline" class="text-xl" />
            </button>
            <h1 class="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">Huquqular</h1>
          </div>
          
          <div class="flex gap-2">
            <Button size="sm" variant="primary" @click="openAdvancedFilter" icon="fas fa-filter" rounded />
            <Button size="sm" @click="addUser" variant="primary" icon="fas fa-user-plus" rounded />
          </div> 
        </div>

        <div class="px-4 pb-2">
          <Input
            size="small"
            icon-pre="fas fa-search"
            clearable
            v-model="searchQuery"
            type="text" 
            placeholder="Ism, ID yoki lavozim..." 
            class="w-full"
          />

          
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true">
     <GlobalRefresher/>

     <div class="max-w-full mx-auto px-4 py-4 pb-20">
  
  <div v-if="isLoading" class="space-y-4">
    <div v-for="i in 6" :key="i" class="h-32 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-white/5 animate-pulse"></div>
  </div>

  <div v-else-if="filteredRoles.length > 0" class="space-y-4">
    <div 
      v-for="role in filteredRoles" :key="role._id" 
      class="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px] p-5 shadow-sm active:scale-[0.98] transition-all duration-300"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <i :class="getRoleIcon(role.name)" class="text-xl"></i>
          </div>

          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-black text-[17px] text-slate-800 dark:text-slate-100 capitalize tracking-tight leading-none">
                {{ role.name }}
              </h3>
              <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-lg border border-slate-200 dark:border-white/5">
                V: {{ role.value }}
              </span>
            </div>
            <p class="text-[12px] text-slate-400 font-medium line-clamp-1 italic">
              {{ role.description || 'Tizimdagi maxsus huquq darajasi' }}
            </p>
          </div>
        </div>

        <button @click="editRole(role)" class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center active:bg-indigo-600 active:text-white transition-all">
          <ion-icon :icon="chevronForwardOutline" class="text-lg" />
        </button>
      </div>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
        <div class="flex items-center gap-6">
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-black uppercase mb-0.5 tracking-wider">Huquqlar</span>
            <div class="flex items-center gap-1.5">
              <span class="text-[14px] font-black text-slate-800 dark:text-white">
                {{ role.permissions?.length || 0 }}
              </span>
              <span class="text-[9px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md font-bold uppercase">Aktiv</span>
            </div>
          </div>

          <div class="h-8 w-[1px] bg-slate-100 dark:bg-white/5"></div>

          <div class="flex flex-col">
            <span class="text-[9px] text-slate-400 font-black uppercase mb-0.5 tracking-wider">Tizim ID</span>
            <span class="text-[12px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
              #{{ role._id?.slice(-6) }}
            </span>
          </div>
        </div>

        <div class="flex gap-2">
          <Button size="sm" variant="secondary" outline icon="fas fa-key" class="!w-9 !h-9 !p-0 !rounded-xl" />
          <Button size="sm" variant="primary" icon="fas fa-edit" class="!w-9 !h-9 !p-0 !rounded-xl" />
        </div>
      </div>
    </div>
  </div>

  <EmptyState 
    v-else
    title="Rol topilmadi"
    :searchTerm="searchQuery"
    @action="searchQuery = ''"
  />
  
</div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonHeader, IonContent, IonRefresher, IonRefresherContent, IonIcon } from '@ionic/vue';
import { arrowBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Input, EmptyState, Button } from '../../../UI/UI';
import { RoleStore } from "../../../stores/index.store";
import { storeToRefs } from 'pinia';
import {GlobalRefresher} from '../../../UI/UI';

const store = RoleStore();
const { roles } = storeToRefs(store);

const isLoading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('all');



const setCategory = async (val) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  selectedCategory.value = val;
};

const filteredRoles = computed(() => {
  if (!roles.value) return [];
  return roles.value.filter(u => {
    const q = searchQuery.value.toLowerCase();
    
    // Qidiruv mantiqi: Ism, ID, Lavozim va Telefon raqami bo'yicha
    const matchesSearch = 
      u.name?.toLowerCase().includes(q) || 
      u._id?.includes(q) || 
      u.value?.includes(q);

    // Kategoriya (Department) mantiqi
    const matchesCat = selectedCategory.value === 'all' || u.department === selectedCategory.value;

    return matchesSearch && matchesCat;
  });
});
const getRoleIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('root')) return 'fas fa-crown';
  if (n.includes('manager')) return 'fas fa-user-tie';
  if (n.includes('ombor')) return 'fas fa-boxes';
  if (n.includes('buxgalter')) return 'fas fa-file-invoice-dollar';
  if (n.includes('director')) return 'fas fa-shield-alt';
  if (n.includes('haydovchi')) return 'fas fa-truck';
  return 'fas fa-user-shield'; // Default icon
};
const handleRefresh = async (e) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  await store.GetAll();
  e.target.complete();
};

const openAdvancedFilter = () => console.log("Murakkab filtr modal");
const addUser = async () => {
  await Haptics.impact({ style: ImpactStyle.Medium });
  console.log("Xodim qo'shish");
};

onMounted(async () => {
  await store.GetAll();
  setTimeout(() => isLoading.value = false, 600);
});
</script>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.shrink-0 { flex-shrink: 0; }

ion-content::part(scroll) {
  scrollbar-width: none;
}
ion-content::part(scroll)::-webkit-scrollbar {
  display: none;
}
.pt-safe { padding-top: env(safe-area-inset-top); }
</style>