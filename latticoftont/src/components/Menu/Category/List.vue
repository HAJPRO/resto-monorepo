<template>
  <ion-page class="bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <Header 
      title="Kategoriyalar" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="Kategoriyani qidirish..."
    >
      <template #actions>
        <Button @click="handleCreate" icon="fas fa-plus-circle" size="sm" />
      </template>
    </Header>

    <ion-content :fullscreen="true" class="ion-padding --background: transparent">
      <GlobalRefresher @refresh="refreshData" />

      <div v-if="loading && categories.length === 0" class="space-y-4 px-1">
        <div v-for="i in 5" :key="i" class="h-28 w-full bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse border border-slate-50 dark:border-slate-800"></div>
      </div>

      <div v-else-if="filteredCategories.length > 0" class="space-y-4 pb-24 px-3 mt-2">
        <div 
          v-for="(cat, index) in filteredCategories" 
          :key="cat._id"
          class="group relative bg-white dark:bg-slate-900 rounded-[2.2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col gap-3 active:scale-[0.97] transition-all duration-300 animate-slide-up"
          :style="{ animationDelay: `${index * 50}ms` }"
          @click="handleEdit(cat)"
        >
          <div class="flex items-center gap-4">
            <div class="shrink-0">
              <div class="w-16 h-16 rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <img 
                  :src="cat.image || 'https://via.placeholder.com/150?text=No+Image'" 
                  class="w-full h-full object-cover"
                  alt="category image"
                />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-base font-black text-slate-800 dark:text-slate-100 truncate">
                    {{ cat.name }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-transparent tracking-widest">
                       {{ cat.type || 'FOOD' }}
                    </span>
                  </div>
                </div>
                
                <div class="text-right">
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">Mahsulotlar</p>
                  <p class="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {{ cat.itemsCount || 0 }} xil
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/50">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <i class="fa-solid fa-sort text-[10px]"></i>
                <span class="text-[11px] font-bold">Tartib: #{{ cat.order || index + 1 }}</span>
              </div>
            </div>

            <div 
              :class="cat.isAvailable !== false ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'"
              class="flex items-center gap-1.5 px-3 py-1 rounded-full"
            >
              <div class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
              <span class="text-[10px] font-black uppercase tracking-wider">
                {{ cat.isAvailable !== false ? 'Sotuvda' : 'To\'xtatilgan' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else title="Kategoriyalar topilmadi" icon="fa-solid fa-utensils" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { CategoryStore } from '../../../stores/index.store'; 
import { Button, Header, GlobalRefresher, EmptyState } from "../../../UI/UI";
import { vibrate } from "../../../utils/index.util"

const store = CategoryStore();
const { categories, loading } = storeToRefs(store);
const searchQuery = ref("");

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  const q = searchQuery.value.toLowerCase();
  return categories.value.filter(c => 
    c.name.toLowerCase().includes(q)
  );
});

const refreshData = async (event) => {
  vibrate('light')
  await store.GetAll(true);
  if (event) event.target.complete();
};

const handleCreate = () => {
  store.model = { isAvailable: true, order: 1 };
  store.ModalAction({ action: 'create' })
};

const handleEdit = async (cat) => {
  vibrate('light')
  store.model = { ...cat };
  await store.ModalAction({ action: 'edit', id: cat._id });
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