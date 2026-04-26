<template>
  <ion-page class="bg-slate-50 dark:bg-slate-950">
    <Header />

    <ion-content :fullscreen="true" class="bg-slate-50 dark:bg-[#020617] mt-2">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content 
          pulling-icon="chevron-down-outline" 
          refreshing-spinner="bubbles">
        </ion-refresher-content>
      </ion-refresher>

      <div class="max-w-full mx-auto px-5 py-6 space-y-8 mt-24 pb-12">
        
        <div class="grid grid-cols-2 gap-4">
          <div class="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden">
            <div class="relative z-10">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                <i class="fas fa-check-double text-lg"></i>
              </div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Yopilgan</p>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ stats.closedCount }} <span class="text-[10px] text-emerald-500 font-black">+12%</span></h3>
            </div>
          </div>

          <div class="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden">
            <div class="relative z-10">
              <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                <i class="fas fa-spinner fa-spin text-lg"></i>
              </div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Hozirgi Ochiq</p>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ stats.activeCount }} <span class="text-[10px] text-amber-500 font-black">Faol</span></h3>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ofitsiantlar</h3>
              <i class="fas fa-medal text-amber-400"></i>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
              <div v-for="(staff, index) in topStaff" :key="staff.id" class="p-5 flex items-center justify-between border-b border-slate-50 dark:border-white/5 last:border-0 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
                <div class="flex items-center gap-4">
                  <span :class="['w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black', index === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400']">
                    {{ index + 1 }}
                  </span>
                  <p class="text-[14px] font-bold dark:text-slate-200 text-slate-700">{{ staff.name }}</p>
                </div>
                <div class="text-right font-black text-indigo-600 text-sm">{{ staff.orders }} <small class="text-[10px] opacity-60 uppercase">Zakaz</small></div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Top Taomlar</h3>
              <i class="fas fa-fire text-orange-500"></i>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
              <div v-for="dish in topDishes" :key="dish.id" class="p-5 flex items-center justify-between border-b border-slate-50 dark:border-white/5 last:border-0 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
                <div class="flex items-center gap-4">
                  <img :src="dish.image" class="w-10 h-10 rounded-2xl object-cover ring-4 ring-slate-50 dark:ring-slate-800">
                  <div>
                    <p class="text-[14px] font-bold dark:text-slate-200 text-slate-700 leading-none">{{ dish.name }}</p>
                    <p class="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Mashhurlik: {{ (dish.count / 4.2).toFixed(1) }}%</p>
                  </div>
                </div>
                <div class="text-[14px] font-black text-slate-900 dark:text-white">{{ dish.count }}</div>
              </div>
            </div>
          </div>
        </div>

      <div class="relative group mx-2 mb-8 overflow-hidden rounded-[38px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-[1px] shadow-2xl shadow-indigo-500/20">
    
    <div class="relative z-10 bg-indigo-600/90 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[37px] p-7 sm:p-9 text-white">
      
      <div class="flex justify-between items-start mb-12">
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="px-2 py-0.5 bg-white rounded-lg backdrop-blur-md border border-white/10 mt-2">
              <i class="fas fa-leaf text-emerald-400 text-xs"></i>
            </div>
            <h2 class="text-xl font-black tracking-tight leading-none">
              Resto<span class="text-indigo-200">uz</span>
            </h2>
          </div>
          
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live Bukhara</span>
          </div>
        </div>

        <button class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90">
          <i class="fas fa-qrcode text-lg text-indigo-100"></i>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-y-8 gap-x-6">
        <div v-for="info in contactDetails" :key="info.label" class="group/item">
          <div class="flex items-start gap-3">
            <div class="mt-1 w-1 h-4 rounded-full bg-indigo-400/30 group-hover/item:bg-indigo-300 transition-colors"></div>
            
            <div class="space-y-1">
              <p class="text-[9px] font-black text-indigo-300/80 uppercase tracking-[0.15em] leading-none">
                {{ info.label }}
              </p>
              <p class="text-[13px] font-semibold text-white/95 leading-snug break-words">
                {{ info.value }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 pt-6 border-t border-white/5 flex justify-between items-center">
        <div class="flex -space-x-2">
          <div v-for="i in 3" :key="i" class="w-6 h-6 rounded-full border-2 border-indigo-700 bg-indigo-500 flex items-center justify-center text-[8px] font-bold">
            {{ ['UI', 'DB', 'AP'][i-1] }}
          </div>
        </div>
        <p class="text-[9px] font-bold text-indigo-300/60 uppercase tracking-widest">
          v2.4.0 Cloud-Sync
        </p>
      </div>
    </div>

    <div class="absolute top-0 right-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
    <div class="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] -ml-16 -mb-16"></div>
  </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border bg-white dark:bg-slate-950">
      <Footer />
    </ion-footer>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, 
  IonHeader, 
  IonContent, 
  IonFooter, 
  IonRefresher, 
  IonRefresherContent,
  IonIcon 
} from '@ionic/vue';
import { ref,onMounted} from 'vue';
import Header from '../../partials/Header.vue';
import Footer from '../../partials/Footer.vue';
import {StatisticsStore} from '../../stores/index.store';
import { storeToRefs } from "pinia";
const store_stats = StatisticsStore();
const { stats, topStaff, topDishes, loading } = storeToRefs(store_stats);

const contactDetails = [
  { label: 'Manzil', value: 'Vobkent, Buxoro' },
  { label: 'Ish vaqti', value: '09:00 - 23:00' },
  { label: 'Aloqa', value: '+998 90 123 45 67' },
  { label: 'Texnik yordam', value: '24/7 Onlayn' }
];

// Refresh funksiyasi
const handleRefresh = async (event) => {
  setTimeout(() => {
    event.target.complete();
  }, 1500);
};
onMounted(async ()=>{
await store_stats.GetHomeStats()
})
</script>

<style scoped>
/* Skroll barni yashirish */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Header shaffofligi */
ion-header {
  background: transparent;
}

.backdrop-blur-xl {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Content joylashuvi */
ion-content {
  --padding-top: 0;
}

/* Footer borderini to'g'rilash */
ion-footer {
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.03);
}
</style>