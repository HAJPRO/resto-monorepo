<script setup>
import { ref, computed, onMounted, toRaw } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { EmptyState, Button, Header, GlobalRefresher, Toast } from '../../../UI/UI';
import { UserStore } from "../../../stores/index.store";
import { storeToRefs } from 'pinia';
import { vibrate } from '../../../utils/index.util';

const store = UserStore();
const { users, loading } = storeToRefs(store);
const searchQuery = ref('');

const filteredUsers = computed(() => {
  if (!users.value) return [];
  const q = searchQuery.value.toLowerCase().trim();
  return users.value.filter(u => 
    u.fullname?.toLowerCase().includes(q) || 
    u.phoneNumber?.includes(q) ||
    u.driverDetails?.carNumber?.toLowerCase().includes(q)
  );
});

const openModal = (action, data = null) => {
  vibrate("light");
  store.ModalAction({ action, data: data ? toRaw(data) : null });
}

const confirmDelete = async (user) => {
  vibrate("heavy");
  if(confirm(`${user.fullname}ni tizimdan o'chirasizmi?`)) {
    const success = await store.Delete(user._id);
    if(success) Toast.success("Muvaffaqiyatli o'chirildi");
  }
}

onMounted(() => store.GetAll());
</script>

<template>
  <ion-page class="bg-[#F8FAFC] dark:bg-[#020617]">
    <Header title="Xodimlar" searchable v-model="searchQuery">
      <template #actions>
         <Button @click="openModal('create')" icon="fas fa-user-plus" size="sm" />
      </template>
    </Header>

    <ion-content>
      <GlobalRefresher @refresh="store.GetAll()"/>

      <div class="max-w-full mx-auto px-3 py-3 pb-4 space-y-6">
        
        <div v-for="user in filteredUsers" :key="user._id" class="full-user-card group">
          
       <!-- 1. HEADER: Rasm, Ism va Rollar -->
<div class="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
  <div class="flex items-center gap-4">
    <!-- Avatar & Status -->
    <div class="relative shrink-0">
      <div class="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
        <img v-if="user.image" :src="user.image" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-indigo-500 font-black text-xl uppercase">
          {{ user.fullname?.charAt(0) }}
        </div>
      </div>
      <div :class="user.isActivated ? 'bg-emerald-500' : 'bg-slate-300'" 
           class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
      </div>
    </div>

    <div class="space-y-1">
      <h2 class="text-lg font-black text-slate-900 dark:text-white leading-none">
        {{ user.fullname }}
      </h2>
      
      <!-- Position & Username -->
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
          {{ user.position || 'Staff' }}
        </span>
        <span class="text-[10px] font-medium text-slate-400">@{{ user.username }}</span>
      </div>

      <!-- ROLLAR VA ULARNING PERMISSIONS'LARI -->
      <div class="flex flex-wrap gap-2 mt-3">
        <div v-for="role in user.roles" :key="role._id" class="group relative">
          <!-- Role Badge -->
          <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all group-hover:border-indigo-400">
            <i class="fas fa-user-shield text-[10px] text-indigo-500"></i>
            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">{{ role.name }}</span>
            
            <!-- Permissions counter dots -->
            <div v-if="role.permissions?.length" class="flex gap-0.5 ml-1">
              <span v-for="n in Math.min(role.permissions.length, 3)" :key="n" class="w-1 h-1 rounded-full bg-emerald-400"></span>
            </div>
          </div>

          <!-- Minimalist Tooltip (Hoverda permissions ko'rinadi) -->
          <div v-if="role.permissions?.length" 
               class="absolute bottom-full left-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
            <div class="bg-slate-900 dark:bg-slate-800 text-white p-2.5 rounded-xl shadow-2xl border border-white/10 w-48">
              <div class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 border-b border-white/5 pb-1">
                Huquqlar ({{ role.permissions.length }})
              </div>
              <div class="flex flex-wrap gap-1">
                <span v-for="perm in role.permissions" :key="perm._id" 
                      class="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md border border-indigo-500/30">
                  {{ perm.name || perm }}
                </span>
              </div>
            </div>
            <!-- Arrow -->
            <div class="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 absolute -bottom-1 left-4 border-r border-b border-white/10"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="flex gap-2">
    <a :href="`tel:${user.phoneNumber}`" class="action-circle bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
      <i class="fas fa-phone-alt"></i>
    </a>
    <button @click="openModal('edit', user)" class="action-circle bg-slate-100 text-slate-600 dark:bg-white/5">
      <i class="fas fa-edit"></i>
    </button>
  </div>
</div>
          <!-- 2. MA'LUMOTLAR: Manzil va Holat -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Manzil -->
            <div class="info-section">
              <h4 class="section-title"><i class="fas fa-map-marker-alt mr-2"></i> Yashash manzili</h4>
              <div v-if="user.address" class="mt-2 text-xs">
                <p class="font-bold text-slate-700 dark:text-slate-300">
                  {{ user.address.region }}, {{ user.address.district }}
                </p>
                <p class="text-slate-500 italic mt-0.5">
                  {{ user.address.neighborhood }}, {{ user.address.street }} {{ user.address.house }}-uy
                </p>
              </div>
              <p v-else class="mt-2 text-[11px] text-slate-400">Manzil ko'rsatilmagan</p>
            </div>

            <!-- Reyting va Aktivlik -->
            <div class="info-section">
              <h4 class="section-title"><i class="fas fa-chart-line mr-2"></i> Ko'rsatkichlar</h4>
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center gap-1">
                  <i v-for="i in 5" :key="i" class="fas fa-star text-[10px]" 
                     :class="i <= (user.averageRating || 0) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'"></i>
                  <span class="text-xs font-bold ml-1">{{ user.averageRating || 0 }}</span>
                </div>
                <div :class="user.isActivated ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'" 
                     class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-current">
                  {{ user.isActivated ? 'Aktiv' : 'Bloklangan' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 3. HAYDOVCHI MA'LUMOTLARI -->
          <div v-if="user.driverDetails?.carNumber" class="driver-pane">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                  <i class="fas fa-car-side"></i>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">Transport</p>
                  <p class="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ user.driverDetails.carNumber }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase leading-none">Sig'im</p>
                <p class="text-sm font-black text-slate-700 dark:text-slate-300">{{ user.driverDetails.vehicleCapacity }} kishi</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-3 border-t border-indigo-100 dark:border-white/5">
              <div>
                <span class="text-[9px] font-bold text-slate-400 uppercase block">Model & Rang</span>
                <span class="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {{ user.driverDetails.carType }} ({{ user.driverDetails.carColor }})
                </span>
              </div>
              <div class="flex justify-around bg-white/50 dark:bg-black/20 rounded-xl py-1.5">
                <div class="text-center">
                  <span class="text-[9px] font-bold text-slate-400 uppercase block">Jami</span>
                  <p class="text-xs font-black text-slate-800 dark:text-white">{{ user.driverDetails.totalOrders || 0 }}</p>
                </div>
                <div class="text-center">
                  <span class="text-[9px] font-bold text-emerald-500 uppercase block">Bajarildi</span>
                  <p class="text-xs font-black text-emerald-600">{{ user.driverDetails.completedOrders || 0 }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. FOOTER: ID va Delete -->
          <div class="mt-6 pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
            <span class="text-[9px] font-mono text-slate-300 dark:text-slate-600 uppercase tracking-widest">
              ID: {{ user._id }}
            </span>
            <button @click="confirmDelete(user)" 
                    class="text-[10px] font-black text-rose-500/40 hover:text-rose-600 transition-all uppercase tracking-widest flex items-center gap-1">
              <i class="fas fa-trash-alt text-sm"></i> 
            </button>
          </div>
        </div>

        <EmptyState v-if="filteredUsers.length === 0 && !loading" />
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.full-user-card {
  @apply relative bg-white dark:bg-slate-900/60 rounded-[35px] p-6 shadow-sm border border-slate-100 dark:border-white/5 
         transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1;
}

.info-section {
  @apply p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5;
}

.section-title {
  @apply text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center;
}

.role-badge {
  @apply text-[9px] font-black bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 
         px-2 py-0.5 rounded-md uppercase tracking-tighter border border-slate-200 dark:border-white/10;
}

.full-user-card:hover .role-badge {
  @apply border-indigo-200 dark:border-indigo-500/30 text-indigo-500 transition-colors duration-300;
}

.driver-pane {
  @apply p-5 rounded-[30px] bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-500/5 dark:to-slate-800/30 
         border border-indigo-100 dark:border-indigo-500/10 shadow-inner;
}

.action-icon {
  @apply w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-sm transition-all 
         active:scale-90 hover:shadow-md;
}
/* Tugmalar uchun minimalist stil */
.action-btn {
  @apply w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-all duration-300 active:scale-90 shadow-sm;
}

/* Tooltip animatsiyasi */
.animate-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Karta umumiy ko'rinishi uchun */
.full-user-card {
  @apply bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-5 border border-slate-100 dark:border-white/5;
}

/* Rol badge hover bo'lganda icon rangini o'zgartirish */
.group:hover .fa-shield-alt {
  @apply text-white opacity-100;
}
ion-content::part(scroll) {
  scrollbar-width: none;
}
.action-circle {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-xs transition-transform active:scale-90;
}
</style>