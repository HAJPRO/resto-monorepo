<template>
  <ion-page class="bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <Header 
      title="Xodimlar" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="Ism, lavozim yoki telefon..."
    >
      <template #actions>
        <Button @click="handleCreate" icon="fas fa-user-plus" size="sm" />
      </template>
    </Header>

    <ion-content :fullscreen="true" class="ion-padding --background: transparent">
      <GlobalRefresher @refresh="refreshData" />

    

      <div v-if="loading && employees.length === 0" class="space-y-4 px-1">
        <div v-for="i in 5" :key="i" class="h-32 w-full bg-white dark:bg-slate-900 rounded-[2.2rem] animate-pulse border border-slate-50 dark:border-slate-800"></div>
      </div>

      <div v-else-if="filteredEmployees.length > 0" class="space-y-4 pb-24 px-3 mt-2">
        <div 
          v-for="(user, index) in filteredEmployees" 
          :key="user._id"
          class="group relative bg-white dark:bg-slate-900 rounded-[2.2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col gap-4 active:scale-[0.97] transition-all duration-300 animate-slide-up"
          :style="{ animationDelay: `${index * 50}ms` }"
          @click="handleEdit(user)"
        >
          <div class="flex items-center gap-4 ">
            <div class="relative shrink-0">
              <div class="w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-slate-50 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-inner">
                <img 
                  :src="user.image || 'https://ui-avatars.com/api/?background=6366f1&color=fff&name=' + user.firstname" 
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-if="user.isOnline" class="absolute -top-1 -right-1 flex h-4.5 w-4.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                    {{ user.firstname }} {{ user.lastname }}
                  </h3>
                  <span 
                    :class="getRoleStyles(user.department)"
                    class="inline-block mt-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-lg border tracking-wider"
                  >
                    {{ user.department }}
                  </span>
                   <span 
                    :class="getRoleStyles(user.position)"
                    class="inline-block mt-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-lg border tracking-wider"
                  >
                    {{ user.position }}
                  </span>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">Maoshi</p>
                  <p class="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    {{ formatCurrency(user.salary) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/50">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <div :class="user.gender === 'male' ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/10' : 'bg-pink-50 text-pink-500 dark:bg-pink-500/10'" class="w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
                  <i :class="user.gender === 'male' ? 'fa-solid fa-mars' : 'fa-solid fa-venus'"></i>
                </div>
                <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400">{{ user.gender === 'male' ? 'Erkak' : 'Ayol' }}</span>
              </div>
              
              <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <i class="fa-solid fa-calendar-check text-[10px] opacity-60"></i>
                <span class="text-[11px] font-bold">{{ user.age || '—' }} yosh</span>
              </div>
            </div>

            <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
              <i class="fa-solid fa-phone text-[10px]"></i>
              <span class="text-[11px] font-black tracking-tight">{{ formatPhone(user.phone) }}</span>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else title="Xodimlar topilmadi" icon="fa-solid fa-user-ninja" />
    </ion-content>
    
    <ActionModal />
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { EmployeeStore } from '../../../stores/index.store';
import { Button, Header, GlobalRefresher, EmptyState } from "../../../UI/UI";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import ActionModal from "./ActionModal.vue";

const store = EmployeeStore();
const { employees, loading } = storeToRefs(store);
const searchQuery = ref("");

const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value;
  const q = searchQuery.value.toLowerCase();
  return employees.value.filter(e => 
    `${e.firstname} ${e.lastname}`.toLowerCase().includes(q) || 
    e.role?.toLowerCase().includes(q) || 
    e.phone.includes(q)
  );
});

const activeCount = computed(() => employees.value.filter(e => e.isOnline).length);

const getRoleStyles = (role) => {
  const r = role?.toLowerCase();
  const styles = {
    admin: "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-transparent",
    manager: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-transparent",
    chef: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-transparent",
    waiter: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-transparent",
    delivery: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent",
  };
  return styles[r] || "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('uz-UZ').format(val || 0) + " UZS";
};

const formatPhone = (p) => {
  return p ? p.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5') : '—';
};

const refreshData = async (event) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  await store.GetAll(true);
  if (event) event.target.complete();
};

const handleCreate = () => {
  store.model = {};
  store.modalAction = 'create';
  store.isModal = true;
};

const handleEdit = async (user) => {
  await Haptics.impact({ style: ImpactStyle.Medium });
  store.model = {...user}
  await store.ModalAction({action:'edit', id:user._id});
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