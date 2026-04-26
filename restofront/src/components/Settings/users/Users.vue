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
            <h1 class="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">Foydalanuvchilar</h1>
          </div>
          
          <div class="flex gap-2">
            <Button size="sm" variant="primary" @click="openAdvancedFilter" icon="fas fa-filter" rounded />
            <!-- <Button size="sm" variant="danger" icon="fas fa-heart" rounded outline /> -->
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

          <!-- <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 -mx-4 px-4 flex-nowrap shrink-0">
            <button 
              v-for="cat in categories" 
              :key="cat.value"
              @click="selectedCategory = cat.value"
              class="px-5 py-2 rounded-2xl text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border shrink-0"
              :class="[
                selectedCategory === cat.value 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105' 
                  : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-white/5'
              ]"
            >
              {{ cat.label }}
            </button>
          </div> -->
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true">
   <GlobalRefresher />

      <div class="max-w-full mx-auto px-4 py-4 pb-20">
        
        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 6" :key="i" class="h-40 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-white/5 animate-pulse"></div>
        </div>

        <div v-else-if="filteredUsers.length > 0" class="space-y-4">
          <div 
            v-for="user in filteredUsers" :key="user._id" 
            class="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px] p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 active:scale-[0.98]"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="relative">
                  <div class="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-indigo-500/10 dark:to-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-500/20 overflow-hidden shadow-inner text-2xl font-black">
                    <img v-if="user.profileImage && user.profileImage !== 'default_image_url'" :src="user.profileImage" class="w-full h-full object-cover" />
                    <span v-else>{{ user.fullname?.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div 
                    :class="user.status === 'online' ? 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-500/20' : 'bg-slate-300 ring-slate-100 dark:ring-slate-800'"
                    class="absolute -bottom-1 -right-1 w-5 h-5 border-[3.5px] border-white dark:border-slate-900 rounded-full"
                  ></div>
                </div>

                <div class="flex flex-col">
                  <h3 class="font-black text-[17px] text-slate-800 dark:text-slate-100 tracking-tight leading-tight mb-1 capitalize">
                    {{ user.fullname }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm">
                      {{ user.position || 'Xodim' }}
                    </span>
                    <span class="text-[11px] text-slate-400 font-bold tracking-tighter bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-lg">
                      ID: #{{ user._id?.slice(-6) }}
                    </span>
                  </div>
                </div>
              </div>

              <button class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center active:bg-indigo-50 transition-colors">
                <ion-icon :icon="chevronForwardOutline" class="text-lg" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 py-3 border-y border-slate-50 dark:border-white/5">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <i class="fas fa-phone text-[12px]"></i>
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Telefon</span>
                  <span class="text-[12px] text-slate-700 dark:text-slate-300 font-black truncate">{{ user.phoneNumber || '---' }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2 border-l border-slate-50 dark:border-white/5 pl-2">
                <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <i class="fas fa-location-dot text-[12px]"></i>
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Hudud</span>
                  <span class="text-[12px] text-slate-700 dark:text-slate-300 font-black truncate">
                    {{ user.address?.district || 'Nomaʼlum' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <div class="flex items-center gap-4">
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Buyurtmalar</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[14px] font-black text-slate-800 dark:text-white">{{ user.totalOrders || 0 }}</span>
                    <span class="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-md font-bold">+{{ user.completedOrders || 0 }}</span>
                  </div>
                </div>
                <div class="h-8 w-[1px] bg-slate-100 dark:bg-white/5"></div>
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Bo'lim</span>
                  <span class="text-[13px] font-black text-slate-600 dark:text-slate-400">{{ user.department }}</span>
                </div>
              </div>

              <div class="flex gap-2">
                <Button size="sm" variant="secondary" outline icon="fas fa-comment-dots" class="!w-9 !h-9 !p-0 !rounded-xl" />
                <Button size="sm" variant="primary" icon="fas fa-paper-plane" class="!w-9 !h-9 !p-0 !rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        <EmptyState 
          v-else
          title="Xodim topilmadi"
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
import { Input, EmptyState, Button,GlobalRefresher } from '../../../UI/UI';
import { UserStore } from "../../../stores/index.store";
import { storeToRefs } from 'pinia';

const store = UserStore();
const { users } = storeToRefs(store);

const isLoading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('all');

const categories = ref([
  { label: 'Barchasi', value: 'all' },
  { label: 'Ombor', value: 'Ombor' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Ofitsiant', value: 'Ofitsiant' },
  { label: 'Kassir', value: 'Kassir' },
]);

const filteredUsers = computed(() => {
  if (!users.value) return [];
  return users.value.filter(u => {
    const q = searchQuery.value.toLowerCase();
    const matchesSearch = u.fullname?.toLowerCase().includes(q) || u._id?.includes(q) || u.position?.toLowerCase().includes(q);
    const matchesCat = selectedCategory.value === 'all' || u.department === selectedCategory.value;
    return matchesSearch && matchesCat;
  });
});

const handleRefresh = async (e) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  await store.GetAll();
  e.target.complete();
};

const openAdvancedFilter = () => console.log("Filter modal");
const addUser = () => Haptics.impact({ style: ImpactStyle.Medium });

onMounted(async () => {
  await store.GetAll();
  setTimeout(() => isLoading.value = false, 600);
});
</script>

<style scoped>
/* Gorizontal skrollni yashirish va ishlashini ta'minlash */
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