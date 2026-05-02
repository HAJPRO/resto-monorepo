<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617] select-none">
    <!-- 1. HEADER (Har doim tepada) -->
    <Header 
      :title="isShiftOpen ? (activeTabLabel) : 'Kassa'" 
      :searchable="isShiftOpen" 
      v-model="searchQuery" 
    >
      <template #actions>
        <div class="flex items-center gap-1">
          <Button 
            v-if="isShiftOpen"
            @click="showCloseModal = true" 
            icon="fas fa-power-off" 
            color="danger" 
            size="sm" 
          />
        </div>
      </template>
    </Header>

    <!-- 2. STICKY SEGMENT TABS (Faqat smena ochiq bo'lsa) -->
    <div 
      v-if="isShiftOpen" 
      class="sticky-tabs-container"
    >
      <SegmentTabs 
        :tabs="Tabs" 
        v-model="activeTab" 
        @reorder="handleReorder"
      />
    </div>

    <!-- 3. MAIN CONTENT -->
    <ion-content :fullscreen="true" class="ion-padding">
      <GlobalRefresher @refresh="refreshData" />

      <!-- A. SMENA YOPIQ (LOCK SCREEN) -->
      <div v-if="!isShiftOpen" class="flex flex-col items-center justify-center h-full py-10 animate-fade-in">
        <div class="relative mb-10">
          <div class="w-32 h-32 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
            <i class="fas fa-cash-register text-4xl text-indigo-500"></i>
          </div>
          <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white border-4 border-slate-50 dark:border-[#020617]">
            <i class="fas fa-lock text-xs"></i>
          </div>
        </div>
        <h2 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Terminal Yopiq</h2>
        <p class="text-slate-400 text-sm mt-2 mb-10 text-center max-w-[240px]">Ish kuni boshlanishi uchun kassa smenasini oching</p>
        
        <div class="w-full max-w-xs space-y-3">
          <div class="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
            <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Kassir</label>
            <p class="font-bold text-slate-700 dark:text-slate-200 ml-1 italic">Administrator</p>
          </div>
          <Button @click="isShiftOpen = true" label="Smenani Startlash" color="primary" size="lg" class="w-full h-16 shadow-xl shadow-indigo-500/20" />
        </div>
      </div>

      <!-- B. AKTIV KONTENT (SMENA OCHIQ) -->
      <div v-else class="pb-20">
        
        <!-- 1. KASSA TAB -->
        <div v-if="activeTab === 'kassa'" class="space-y-6 animate-tab">
          <div class="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden">
            <div class="flex justify-between items-start relative z-10">
              <div>
                <p class="text-[10px] uppercase font-black tracking-widest opacity-60">Jami tushum</p>
                <h2 class="text-4xl font-black mt-1">{{ totalBalance.toLocaleString() }} <span class="text-sm opacity-50">UZS</span></h2>
              </div>
              <div class="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <i class="fas fa-wallet text-xl"></i>
              </div>
            </div>
            <div class="mt-8 flex gap-4 relative z-10">
              <div class="flex-1 bg-white/10 p-4 rounded-2xl border border-white/5">
                <p class="text-[9px] uppercase opacity-50 font-bold">Naqd</p>
                <p class="text-lg font-black">{{ (totalBalance * 0.7).toLocaleString() }}</p>
              </div>
              <div class="flex-1 bg-white/10 p-4 rounded-2xl border border-white/5">
                <p class="text-[9px] uppercase opacity-50 font-bold">Terminal</p>
                <p class="text-lg font-black">{{ (totalBalance * 0.3).toLocaleString() }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-3">
            <button @click="addTransaction('in')" class="quick-action-btn group">
              <div class="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center group-active:scale-90 transition border border-green-500/5">
                <i class="fas fa-arrow-down"></i>
              </div>
              <span>Kirim</span>
            </button>
            <button @click="addTransaction('out')" class="quick-action-btn group">
              <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-active:scale-90 transition border border-rose-500/5">
                <i class="fas fa-arrow-up"></i>
              </div>
              <span>Chiqim</span>
            </button>
            <button @click="printReport('X')" class="quick-action-btn group">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-active:scale-90 transition border border-amber-500/5">
                <i class="fas fa-print"></i>
              </div>
              <span>X-Report</span>
            </button>
            <button @click="activeTab = 'stats'" class="quick-action-btn group">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-active:scale-90 transition border border-indigo-500/5">
                <i class="fas fa-chart-line"></i>
              </div>
              <span>Stat</span>
            </button>
          </div>

          <div>
            <div class="flex justify-between items-center mb-4 px-1">
              <h3 class="text-xs font-black uppercase text-slate-400 tracking-widest">Oxirgi harakatlar</h3>
              <span class="text-[10px] text-indigo-500 font-bold">Barchasi</span>
            </div>
            <div class="space-y-3">
              <div v-for="tx in filteredTransactions" :key="tx.id" class="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <div class="flex items-center gap-4">
                  <div :class="tx.type === 'in' ? 'bg-green-500' : 'bg-rose-500'" class="w-1.5 h-8 rounded-full"></div>
                  <div>
                    <p class="text-sm font-bold">{{ tx.title }}</p>
                    <p class="text-[10px] text-slate-400 uppercase font-mono">{{ tx.time }} • {{ tx.method }}</p>
                  </div>
                </div>
                <p :class="tx.type === 'in' ? 'text-green-600' : 'text-rose-600'" class="font-black">
                  {{ tx.type === 'in' ? '+' : '-' }}{{ tx.amount.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

       

      

      </div>
    </ion-content>

    <!-- Z-REPORT MODAL -->
    <ion-modal :is-open="showCloseModal" @didDismiss="showCloseModal = false" class="pos-modal">
      <div class="p-8 h-full bg-white dark:bg-slate-900 flex flex-col">
        <div class="flex-1">
          <div class="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-8"></div>
          <h2 class="text-3xl font-black italic mb-2 uppercase tracking-tighter">Z-Report</h2>
          <p class="text-slate-400 text-sm mb-10 italic">Smenani yakunlash va moliyaviy hisobotni chop etish.</p>
          <div class="space-y-4">
            <div class="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span class="font-bold opacity-60">Smena ID</span>
              <span class="font-mono font-bold">#2026-0502-001</span>
            </div>
            <div class="flex justify-between p-6 bg-indigo-600 text-white rounded-[32px] shadow-xl">
              <span class="font-bold">Jami Yopilish:</span>
              <span class="text-2xl font-black">{{ totalBalance.toLocaleString() }} UZS</span>
            </div>
          </div>
        </div>
        <div class="flex gap-3">
          <Button @click="showCloseModal = false" label="Bekor" color="light" class="flex-1 h-16 rounded-3xl" />
          <Button @click="closeShift" label="Yopish" color="danger" class="flex-[2] h-16 rounded-3xl font-black" />
        </div>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { IonPage, IonContent, IonModal } from '@ionic/vue';
import { Button, Header, GlobalRefresher, SegmentTabs } from '../../UI/UI'; // UI yo'lingizni tekshiring
import { vibrate, notify } from '../../utils/index.util';

// STATE
const isShiftOpen = ref(false);
const activeTab = ref('kassa'); // Boshlang'ich tab 'kassa' bo'lishi kerak
const searchQuery = ref('');
const showCloseModal = ref(false);
const totalBalance = ref(12450000);

const Tabs = [
  { id: 'cash', label: 'Asosiy', routeName: 'cash', icon: 'fas fa-home' },
  { id: 'order', label: 'Buyurtmalar', routeName: 'order', icon: 'fas fa-list' },
    { id: 'tables', label: 'Stollar', routeName: 'tables', icon: 'fas fa-table' },
    { id: 'statistic', label: 'Statistika', routeName: 'statistic', icon: 'fas fa-chart-bar' },
   

];

// DATA
const transactions = ref([
  { id: 1, title: 'Chek #4502', time: '08:15', amount: 125000, type: 'in', method: 'Terminal' },
  { id: 2, title: 'Oshxona harajati', time: '07:50', amount: 45000, type: 'out', method: 'Naqd' },
  { id: 3, title: 'Chek #4501', time: '07:20', amount: 85000, type: 'in', method: 'Naqd' },
]);

const tables = ref([
  { id: 1, name: 'T-01', status: 'busy', total: 450000 },
  { id: 2, name: 'T-02', status: 'free', total: 0 },
  { id: 3, name: 'T-03', status: 'busy', total: 125000 },
  { id: 4, name: 'T-04', status: 'free', total: 0 },
]);

const weekData = [40, 65, 50, 95, 70, 85, 45];
const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya'];

// COMPUTED
const activeTabLabel = computed(() => {
  return Tabs.find(t => t.id === activeTab.value)?.label || 'Asosiy kassa';
});

const filteredTransactions = computed(() => {
  if (!searchQuery.value) return transactions.value;
  return transactions.value.filter(tx => tx.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const filteredTables = computed(() => {
  if (!searchQuery.value) return tables.value;
  return tables.value.filter(t => t.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

// METHODS
const handleReorder = (newOrder) => { vibrate('light'); };

const addTransaction = (type) => {
  vibrate('medium');
  notify(`${type === 'in' ? 'Kirim' : 'Chiqim'} oynasi`, 'info');
};

const printReport = (type) => {
  vibrate('heavy');
  notify(`${type}-Report chop etilmoqda...`, 'success');
};

const closeShift = () => {
  vibrate('heavy');
  isShiftOpen.value = false;
  showCloseModal.value = false;
  activeTab.value = 'kassa';
  notify("Smena yopildi", "warning");
};

const refreshData = (done) => {
  setTimeout(() => { done(); notify("Yangilandi", "success"); }, 1000);
};
</script>

<style scoped>
/* Tabs Header ostida yopishib turishi uchun */
/* .sticky-tabs-container {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: inherit;
  padding: 1px 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
} */

/* Animatsiyalar */
.animate-tab {
  animation: tabSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes tabSlide {
  from { opacity: 0; transform: scale(0.98) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.quick-action-btn {
  @apply flex flex-col items-center gap-2 transition-all active:scale-90 outline-none;
}
.quick-action-btn span {
  @apply text-[10px] font-black uppercase text-slate-400 tracking-tighter;
}

.pos-modal {
  --height: 480px;
  --border-radius: 40px;
}
</style>