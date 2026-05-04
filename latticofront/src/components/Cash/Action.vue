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

   <!-- A. SMENA YOPIQ (KO'P BOSQICHLI LOCK SCREEN) -->
<div v-if="!isShiftOpen" class="flex flex-col h-full bg-slate-50 dark:bg-[#020617] animate-fade-in">
  
  <div class="flex-1 flex flex-col items-center justify-center px-6">
    <!-- Vizual Icon -->
    <div class="relative mb-8">
      <div class="absolute inset-0 bg-indigo-500/10 blur-[50px] rounded-full"></div>
      <div class="relative w-20 h-20 bg-white dark:bg-slate-800 rounded-[30px] shadow-xl flex items-center justify-center border border-white dark:border-slate-700">
        <i :class="step === 1 ? 'fas fa-shield-halved' : 'fas fa-coins'" class="text-2xl text-indigo-500"></i>
      </div>
    </div>

    <!-- Sarlavha -->
    <div class="text-center mb-10">
      <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
        {{ step === 1 ? 'Xush kelibsiz' : 'Kassa Qoldig\'i' }}
      </h2>
      <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
        {{ step === 1 ? 'Kirish ma\'lumotlarini tanlang' : 'Haqiqiy summani tasdiqlang' }}
      </p>
    </div>

    <!-- 1-QADAM: KASSA VA XODIMNI TANLASH -->
    <div v-if="step === 1" class="w-full max-w-sm space-y-4">
      <!-- Kassa Tanlash -->
      <div class="space-y-2">
        <Select 
        label ="Kassa"
          v-model="selectedRegister" 
          :options="cashRegisters"
          labelKey="name"
          valueKey="id"
        >
        
        </Select>
      </div>

      <!-- Xodim Tanlash -->
      <div class="space-y-2">
        <Select 
        label ="Kassir"
          v-model="selectedStaff" 
          :options="staffMembers"
          labelKey="name"
          valueKey="id"
        >
        
        </Select>
      </div>

      <Button 

        @click="step = 2" 
        :disabled="!selectedRegister || !selectedStaff"
        label="Davom etish" 
        rightIcon="fas fa-arrow-right"
        class="w-full"
      >Davom etish</Button>
    </div>

    <!-- 2-QADAM: QOLDIQ PULNI KIRITISH -->
    <div v-if="step === 2" class="w-full max-w-sm space-y-6">
      <div class="bg-indigo-500/5 p-6 rounded-[32px] border border-indigo-500/10 text-center">
        <p class="text-[10px] font-black text-indigo-500 uppercase mb-2">Tizimdagi qoldiq:</p>
        <h3 class="text-2xl font-black text-slate-800 dark:text-white">
          {{ selectedRegister?.balance || '0' }} <span class="text-xs opacity-50">UZS</span>
        </h3>
      </div>

      <div class="space-y-2">
        <Input 
        label="Haqiqiy naqt pul"
          type="number" 
          v-model="initialBalance"
          placeholder="0.00"
          isFormatted
          clearable
          suffix="sum"
        />
      </div>

      <div class="flex gap-3 justify-between">
        <Button variant="danger" leftIcon="fas fa-arrow-left"  size="sm" @click="step = 1">Orqaga</Button>
        <Button variant="primary" leftIcon="fas fa-check"  size="sm" @click="startShift" >Smenani ochish</Button>
      </div>
    </div>

  </div>

 
</div>

    <!-- B. AKTIV KONTENT (SMENA OCHIQ) -->
<div v-else class="pb-24 animate-fade-in p-4">
  
  <!-- 1. KASSA TAB -->
  <div v-if="activeTab === 'kassa'" class="space-y-8">
    
    <!-- Asosiy Balans Kartasi -->
    <div class="relative group overflow-hidden bg-slate-900 dark:bg-indigo-600 p-8 rounded-[45px] shadow-2xl shadow-indigo-500/20">
      <!-- Orqa fondagi dekorativ doiralar -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      
      <div class="relative z-10">
        <div class="flex justify-between items-center">
          <div class="space-y-1">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/60">Jami tushum</p>
            <h2 class="text-4xl font-black text-white tracking-tighter">
              {{ totalBalance.toLocaleString() }} 
              <span class="text-base font-medium opacity-50 ml-1">UZS</span>
            </h2>
          </div>
          <div class="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
            <i class="fas fa-wallet text-xl text-white"></i>
          </div>
        </div>

        <!-- To'lov turlari bo'yicha taqsimot -->
        <div class="mt-10 grid grid-cols-2 gap-4">
          <div class="bg-white/5 backdrop-blur-md p-4 rounded-[28px] border border-white/5">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              <p class="text-[9px] uppercase font-black text-indigo-100/50 tracking-wider">Naqd pul</p>
            </div>
            <p class="text-xl font-bold text-white">{{ (totalBalance * 0.4).toLocaleString() }}</p>
          </div>
          
          <div class="bg-white/5 backdrop-blur-md p-4 rounded-[28px] border border-white/5">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
              <p class="text-[9px] uppercase font-black text-indigo-100/50 tracking-wider">Terminal</p>
            </div>
            <p class="text-xl font-bold text-white">{{ (totalBalance * 0.3).toLocaleString() }}</p>
          </div>
            <div class="bg-white/5 backdrop-blur-md p-4 rounded-[28px] border border-white/5">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
              <p class="text-[9px] uppercase font-black text-indigo-100/50 tracking-wider">Balans</p>
            </div>
            <p class="text-xl font-bold text-white">{{ (totalBalance * 0.2).toLocaleString() }}</p>
          </div>
            <div class="bg-white/5 backdrop-blur-md p-4 rounded-[28px] border border-white/5">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-1.5 h-1.5 rounded-full bg-red-400"></div>
              <p class="text-[9px] uppercase font-black text-indigo-100/50 tracking-wider">Nasiya</p>
            </div>
            <p class="text-xl font-bold text-white">{{ (totalBalance * 0.1).toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tezkor Harakatlar (Maxsus Button komponentidan foydalanish) -->
    <div class="grid grid-cols-4 gap-4 px-1">
      <div class="flex flex-col items-center gap-2">
              <Button @click="addTransaction('in')" variant="success" icon="fas fa-arrow-up"/>

        <span class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Kirim</span>
      </div>

      <div class="flex flex-col items-center gap-2">
        <Button @click="addTransaction('out')" variant="danger" icon="fas fa-arrow-down"/>
        <span class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Chiqim</span>

      </div>

      <div class="flex flex-col items-center gap-2">
              <Button @click="printReport('X')" variant="warning" icon="fas fa-print"/>

        <span class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">X-Report</span>
      </div>

      <div class="flex flex-col items-center gap-2">
                    <Button @click="addTransaction('in')" variant="primary" icon="fas fa-chart-pie"/>

        <span class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Stat</span>
      </div>
    </div>

    <!-- Tranzaksiyalar Ro'yxati -->
    <div class="space-y-4">
      <div class="flex justify-between items-end px-2">
        <div>
          <h3 class="text-lg font-black text-slate-800 dark:text-white leading-none">Harakatlar</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bugungi amallar</p>
        </div>
        <button class="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-full">Barchasi</button>
      </div>

      <div class="space-y-3">
        <div v-for="tx in filteredTransactions" :key="tx.id" 
          class="group p-5 bg-white dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-white/5 flex justify-between items-center transition-all active:scale-[0.98]">
          
          <div class="flex items-center gap-4">
            <div :class="tx.type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'" 
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg">
              <i :class="tx.type === 'in' ? 'fas fa-arrow-down-left' : 'fas fa-arrow-up-right'"></i>
            </div>
            
            <div>
              <p class="text-sm font-black text-slate-700 dark:text-slate-200">{{ tx.title }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ tx.time }}</span>
                <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                <span class="text-[9px] font-black text-indigo-500 uppercase tracking-tight">{{ tx.method }}</span>
              </div>
            </div>
          </div>

          <div class="text-right">
            <p :class="tx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'" class="text-base font-black tracking-tighter">
              {{ tx.type === 'in' ? '+' : '-' }} {{ tx.amount.toLocaleString() }}
            </p>
          </div>
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
import { Button,Input, Header, GlobalRefresher, SegmentTabs,Select } from '../../UI/UI'; // UI yo'lingizni tekshiring
import { vibrate, notify } from '../../utils/index.util';

// STATE
const isShiftOpen = ref(false);
const activeTab = ref('kassa'); // Boshlang'ich tab 'kassa' bo'lishi kerak
const searchQuery = ref('');
const showCloseModal = ref(false);
const totalBalance = ref(12450000);
// Tanlovlar uchun ma'lumotlar
const cashRegisters = ref([
  { id: 1, name: 'Asosiy Kassa', balance: 1250000 },
  { id: 2, name: 'VIP Zal Kassasi', balance: 450000 },
  { id: 3, name: 'Dostavka (Kuryer)', balance: 0 }
]);

const staffMembers = ref([
  { id: 101, name: 'Alijon Valiyev', role: 'Kassir' },
  { id: 102, name: 'Sardor Ikromov', role: 'Admin' }
]);

// Tanlov holatlari
const selectedRegister = ref(null);
const selectedStaff = ref(null);
const initialBalance = ref(0);
const step = ref(1); // 1: Tanlov, 2: Qoldiq kiritish

// Smenani ochish funksiyasi
const startShift = () => {
  if (!selectedRegister.value || !selectedStaff.value) {
    notify("Kassa va xodimni tanlang", "error");
    return;
  }
  
  vibrate('heavy');
  isShiftOpen.value = true;
  notify(`Smena ochildi: ${selectedRegister.value.name}`, "success");
};
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