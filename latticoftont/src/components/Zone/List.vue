<template>
  <ion-page class="bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <Header 
      title="Hududlar" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="Hududni qidirish..."
    >
      <template #actions>
        <Button @click="handleCreate" icon="fas fa-plus-circle" size="sm" />
      </template>
    </Header>

    <ion-content :fullscreen="true" class="ion-padding --background: transparent">
      <GlobalRefresher @refresh="refreshData" />

      <div v-if="loading && zones.length === 0" class="space-y-4 px-1">
        <div v-for="i in 5" :key="i" class="h-28 w-full bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse border border-slate-50 dark:border-slate-800"></div>
      </div>

      <div v-else-if="filteredZones.length > 0" class="space-y-4 pb-24 px-3 mt-2">
        <div 
          v-for="(zone, index) in filteredZones" 
          :key="zone._id"
          class="group relative bg-white dark:bg-slate-900 rounded-[2.2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col gap-3 active:scale-[0.97] transition-all duration-300 animate-slide-up"
          :style="{ animationDelay: `${index * 50}ms` }"
          @click="handleEdit(zone)"
        >
          <div class="flex items-center gap-4">
            <div class="shrink-0">
              <div class="w-14 h-14 rounded-[1.2rem] flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-transparent shadow-sm">
                <i class="fa-solid fa-map-location-dot text-xl"></i>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                    {{ zone.name }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] uppercase font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-transparent tracking-wider">
                       KOD: {{ zone.code || 'Z-01' }}
                    </span>
                  </div>
                </div>
                
                <div class="text-right">
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">Stollar</p>
                  <p class="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {{ zone.tableCount || 0 }} ta
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/50">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <i class="fa-solid fa-user-tie text-[10px] opacity-60"></i>
                <span class="text-[11px] font-bold">Mas'ul: {{ zone.manager || 'Tayinlanmagan' }}</span>
              </div>
            </div>

            <div 
              :class="[
                'flex items-center gap-1.5 px-3 py-1 rounded-full',
                zone.status === 'active' || !zone.status 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' 
                  : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
              ]"
            >
              <i :class="['fa-solid text-[8px]', zone.status === 'active' || !zone.status ? 'fa-circle-check' : 'fa-circle-exclamation']"></i>
              <span class="text-[10px] font-black uppercase tracking-wider">
                {{ zone.status === 'active' || !zone.status ? 'Ochiq' : 'Yopiq' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else title="Hududlar topilmadi" icon="fa-solid fa-map-marked-alt" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { ZoneStore } from '../../stores/index.store'; // Store nomini o'zgartiring
import { Button, Header, GlobalRefresher, EmptyState } from "../../UI/UI";
import { vibrate } from "../../utils/index.util";

const store = ZoneStore();
const { zones, loading } = storeToRefs(store); // 'departments' o'rniga 'zones'
const searchQuery = ref("");

const filteredZones = computed(() => {
  if (!searchQuery.value) return zones.value;
  const q = searchQuery.value.toLowerCase();
  return zones.value.filter(z => 
    z.name.toLowerCase().includes(q) || 
    z.code?.toLowerCase().includes(q)
  );
});

const refreshData = async (event) => {
  vibrate('light');
  await store.GetAll(true);
  if (event) event.target.complete();
};

const handleCreate = () => {
  vibrate('light');
  store.ModalAction({ action: 'create' });
};

const handleEdit = async (zone) => {
  vibrate('light');
  store.model = { ...zone };
  await store.ModalAction({ action: 'edit', id: zone._id });
};

onMounted(() => store.GetAll());
</script>

<style scoped>
ion-content { --background: transparent; }
.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes slideUp {
  0% { transform: translateY(30px); opacity: 0; filter: blur(4px); }
  100% { transform: translateY(0); opacity: 1; filter: blur(0); }
}
</style>