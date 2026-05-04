<template>
  <ion-page class="bg-slate-50 dark:bg-slate-950">
    <Header 
      title="Statistika" 
      searchable 
      v-model="searchQuery"
      searchPlaceholder="Taom izlash..."
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <transition name="fade">
            <Button 
              v-if="selectedRange || statsStore.activeFilter !== 'Kun'"
              @click="clearDateFilter"
              icon="fas fa-times" 
              size="sm" 
              variant="danger"
              class="scale-90 shadow-lg shadow-red-500/20"
            />
          </transition>

          <Button 
            @click="datePic = true" 
            icon="fas fa-calendar-alt" 
            size="sm" 
            :variant="selectedRange ? 'primary' : 'secondary'"
            class="transition-all duration-300"
          />
        </div>
      </template>
    </Header>

    <ion-content :fullscreen="true">
      <div class="max-w-full mx-auto px-5 py-6 space-y-8">
        
        <div class="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-inner overflow-hidden">
          <button 
            v-if="selectedRange"
            class="flex-[1.2] py-2.5 text-[13px] font-black rounded-xl transition-all duration-300 bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm scale-[1.02]"
          >
            <i class="fas fa-sliders-h mr-1.5 text-[10px]"></i> Maxsus
          </button>

          <button 
            v-for="filter in ['Kun', 'Hafta', 'Oy', 'Yil']" 
            :key="filter"
            @click="handleQuickFilter(filter)"
            :class="[
              'flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-300',
              (statsStore.activeFilter === filter && !selectedRange)
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm scale-[1.02] font-black' 
                : 'text-slate-400 hover:text-slate-600'
            ]"
          >
            {{ filter }}
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-indigo-600 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-500/20 space-y-2 col-span-2 relative overflow-hidden group">
            <div class="relative z-10">
              <p class="text-[10px] font-black opacity-70 uppercase tracking-[2px]">
                {{ selectedRange ? 'Tanlangan oraliq tushumi' : statsStore.activeFilter + 'lik tushum' }}
              </p>
              <div class="text-3xl font-black tracking-tighter">
                {{ formatCurrency(statsStore.totalRevenue, `so'm`) }}
              </div>
              <p v-if="selectedRange" class="text-[9px] font-bold opacity-60 mt-1 uppercase tracking-tighter">
                {{ selectedRange.start }} — {{ selectedRange.end }}
              </p>
            </div>
            <div class="absolute -right-4 -bottom-4 text-white/10 text-8xl rotate-12 transition-transform group-hover:scale-110">
              <i class="fas fa-wallet"></i>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-white/5 space-y-1">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyurtmalar</p>
            <div class="text-xl font-black text-slate-800 dark:text-white">{{ statsStore.totalOrders }}</div>
            <p class="text-[9px] text-emerald-500 font-bold uppercase italic">{{ selectedRange ? 'Maxsus' : statsStore.activeFilter }}</p>
          </div>

          <div class="bg-emerald-500 p-5 rounded-[32px] text-white space-y-1 shadow-lg shadow-emerald-500/10">
            <p class="text-[10px] font-bold opacity-80 uppercase tracking-widest">O'rtacha chek</p>
            <div class="text-xl font-black">{{ formatCurrency(statsStore.averageCheck, `so'm`) }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 space-y-5">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">To'lov turlari</h3>
          <div class="space-y-4">
            <div v-for="pay in statsStore.payments" :key="pay.label" class="space-y-1.5">
              <div class="flex justify-between text-[11px] font-bold uppercase">
                <span class="text-slate-400">{{ pay.label }}</span>
                <span class="text-slate-800 dark:text-white">{{ formatCurrency(pay.value,`so'm`) }}</span>
              </div>
              <div class="w-full h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" :style="{ width: (pay.value / (statsStore.totalRevenue || 1) * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
          <div class="space-y-1">
            <h3 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Savdo dinamikasi</h3>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Sanalarga ko'ra tahlil</p>
          </div>
          <div v-if="!statsStore.loading" class="h-44 w-full flex items-end justify-between gap-3 px-1">
            <div v-for="(item, i) in statsStore.chartData" :key="i" class="flex-1 h-full flex flex-col justify-end group relative">
              <div class="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
                <div class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-xl">{{ (item.value / 1000).toFixed(0) }}k</div>
              </div>
              <div class="w-full h-full bg-slate-50 dark:bg-slate-900/40 rounded-t-xl overflow-hidden relative">
                <div :style="{ height: item.percent + '%' }" class="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-1000"></div>
              </div>
              <span class="text-[8px] font-black text-slate-400 uppercase mt-3 text-center truncate">{{ item.label }}</span>
            </div>
          </div>
          <div v-else class="h-44 flex items-center justify-center"><ion-spinner name="crescent" color="primary"></ion-spinner></div>
        </div>

        <div class="space-y-4">
          <h3 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider px-2">Top Mijozlar</h3>
          <div class="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
            <div v-for="client in statsStore.topCustomers" :key="client._id" 
                 class="min-w-[150px] bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-white/5 text-center space-y-3 shadow-sm transition-all active:scale-95">
              <div class="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl mx-auto flex items-center justify-center text-indigo-600 font-black text-xl">
                {{ client.name[0] }}
              </div>
              <div>
                <p class="text-[12px] font-black truncate text-slate-800 dark:text-white uppercase tracking-tighter">{{ client.name }}</p>
                <p class="text-[10px] text-emerald-500 font-bold mt-1">{{ formatCurrency(client.totalSpent,`so'm`) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4 pb-12">
          <h3 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider px-2">Top Sotuvlar</h3>
          <div class="space-y-3">
            <div v-for="product in statsStore.topProducts" :key="product._id" class="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
              <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600"><i class="fas fa-utensils text-xs"></i></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ product.name }}</p>
                <p class="text-[10px] text-slate-400 font-medium">{{ product.totalSold }} ta sotildi</p>
              </div>
              <div class="text-right"><p class="text-sm font-black text-slate-800 dark:text-white">{{ formatCurrency(product.revenue,`so'm`) }}</p></div>
            </div>
          </div>
        </div>

      </div>
    </ion-content>

    <div v-if="datePic" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px]" @mousedown.self="datePic = false">
      <div class="w-full max-w-md animate-modal">
        <DateRangePicker :initialRange="selectedRange" :initialFilter="statsStore.activeFilter" @selected="handleDateFilter" @close="datePic = false" />
      </div>
    </div>
    <Footer />
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IonPage, IonContent, IonSpinner } from '@ionic/vue';
import { StatisticsStore } from '../../../stores/index.store';
import Footer from '../../../partials/Footer.vue';
import { Button, Header, DateRangePicker } from '../../../UI/UI';
import { formatCurrency } from '../../../utils/index.util';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const statsStore = StatisticsStore();
const searchQuery = ref('');
const datePic = ref(false);
const selectedRange = ref(null);

const loadData = async (range = null) => { await statsStore.fetchAllStats(range); };

const handleQuickFilter = async (filter) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  selectedRange.value = null;
  statsStore.activeFilter = filter;
  await loadData();
};

const handleDateFilter = async (rangeData) => {
  if (!rangeData?.start || !rangeData?.end) { datePic.value = false; return; }
  await Haptics.impact({ style: ImpactStyle.Medium });
  const filterMap = { 'today': 'Kun', 'thisWeek': 'Hafta', 'thisMonth': 'Oy', 'thisYear': 'Yil' };
  if (rangeData.label && filterMap[rangeData.label]) {
    statsStore.activeFilter = filterMap[rangeData.label];
    selectedRange.value = null;
  } else {
    selectedRange.value = rangeData;
    statsStore.activeFilter = 'Maxsus';
  }
  datePic.value = false;
  await loadData({ startDate: rangeData.start, endDate: rangeData.end });
};

const clearDateFilter = async () => {
  await Haptics.impact({ style: ImpactStyle.Light });
  selectedRange.value = null;
  statsStore.activeFilter = 'Kun';
  await loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.5); }
.animate-modal { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
ion-content { --background: transparent; }
</style>