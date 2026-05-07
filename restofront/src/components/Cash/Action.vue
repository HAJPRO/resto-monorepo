<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617] select-none">
    <!-- 1. HEADER -->
    <Header 
      :title="isShiftOpen ? activeTabLabel : 'Kassa'" 
      :searchable="isShiftOpen" 
      v-model="searchQuery" 
    >
      <template #actions v-if="isShiftOpen">
        <Button 
          @click="showCloseModal = true" 
          icon="fas fa-power-off" 
          color="danger" 
          size="sm" 
        />
      </template>
    </Header>

    <!-- 2. NAVIGATSIYA TABLARI -->
    <div v-if="isShiftOpen" class="sticky top-0 z-[100] bg-inherit">
      <SegmentTabs :tabs="Tabs" v-model="activeTab" />
    </div>

    <!-- 3. ASOSIY KONTENT -->
    <ion-content :fullscreen="true" class="ion-padding">
      <GlobalRefresher @refresh="refreshData" />

      <!-- A. SMENA YOPIQ (OCHISH EKRANI) -->
      <div v-if="!isShiftOpen" class="flex flex-col h-full bg-slate-50 dark:bg-[#020617] animate-fade-in">
        <div class="flex-1 flex flex-col items-center justify-center px-6">
          
          <div class="relative mb-8 text-center">
            <div class="absolute inset-0 bg-indigo-500/10 blur-[50px] rounded-full animate-pulse"></div>
            <div class="relative w-20 h-20 bg-white dark:bg-slate-800 rounded-[30px] shadow-xl flex items-center justify-center border border-white dark:border-slate-700 mx-auto">
              <i :class="step === 1 ? 'fas fa-door-closed' : 'fas fa-calculator'" class="text-2xl text-indigo-500"></i>
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-6">
              {{ step === 1 ? 'Yangi Smena' : 'Kassa Qoldig\'i' }}
            </h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {{ step === 1 ? 'Tizimni ishga tushirish' : 'Naqd pul miqdorini tasdiqlang' }}
            </p>
          </div>

          <!-- STEP 1: TANLASH -->
          <div v-if="step === 1" class="w-full max-w-sm space-y-4">
            <Select label="Kassa" v-model="selectedRegister" :options="cashRegisters" labelKey="name" valueKey="id" />
            <Select label="Mas'ul Xodim" v-model="selectedStaff" :options="staffMembers" labelKey="name" valueKey="id" />
            <Button 
              @click="step = 2" 
              :disabled="!selectedRegister || !selectedStaff"
              class="w-full mt-4"
              rightIcon="fas fa-arrow-right"
            >
              Davom etish
            </Button>
          </div>

          <!-- STEP 2: TASDIQLASH -->
          <div v-if="step === 2" class="w-full max-w-sm space-y-6">
            <div class="p-6 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 text-center">
              <p class="text-[9px] font-black text-indigo-500 uppercase mb-1">Tizimdagi joriy qoldiq</p>
              <h3 class="text-xl font-black text-slate-800 dark:text-white">
                {{ (selectedRegisterData?.balance || 0).toLocaleString() }} UZS
              </h3>
            </div>

            <Input 
              label="Haqiqiy naqd pul (Kassada)"
              v-model="initialBalance"
              type="number"
              isFormatted
              placeholder="0.00"
            />

            <div class="flex gap-3">
              <Button variant="secondary" class="flex-1" leftIcon="fas fa-arrow-left" @click="step = 1">Orqaga</Button>
              <Button variant="primary" class="flex-[2]" @click="startShift">Smenani Ochish</Button>
            </div>
          </div>
        </div>
      </div>

      <!-- B. AKTIV SMENA (KASSA EKRANI) -->
      <div v-else class="pb-24 animate-fade-in p-4">
        <div v-if="activeTab === 'cash'" class="space-y-8">
          
          <!-- Balans Vidjeti -->
          <div class="relative bg-slate-900 dark:bg-indigo-600 p-8 rounded-[45px] shadow-2xl overflow-hidden group">
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <p class="text-[10px] font-black uppercase text-indigo-200/50 tracking-[0.2em] mb-1">Kassadagi jami mablag'</p>
            <h2 class="text-4xl font-black text-white italic tracking-tighter">
              {{ totalBalance.toLocaleString() }} <span class="text-sm font-normal opacity-40">UZS</span>
            </h2>
            
            <div class="mt-8 grid grid-cols-2 gap-3">
              <div v-for="item in distribution" :key="item.label" class="bg-white/10 backdrop-blur-md p-4 rounded-[24px] border border-white/5">
                <div class="flex items-center gap-2 mb-1">
                  <div :class="`w-1.5 h-1.5 rounded-full ${item.color}`"></div>
                  <p class="text-[8px] uppercase font-bold text-white/60 tracking-wider">{{ item.label }}</p>
                </div>
                <p class="text-base font-black text-white">{{ item.value.toLocaleString() }}</p>
              </div>
            </div>
          </div>

          <!-- Tezkor Tugmalar -->
          <div class="grid grid-cols-4 gap-4 px-2">
            <div v-for="act in quickActions" :key="act.label" class="flex flex-col items-center gap-3">
              <Button @click="act.action" :variant="act.variant" :icon="act.icon" size="md" />
              <span class="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{{ act.label }}</span>
            </div>
          </div>

       <div class="space-y-6">
  <!-- Sarlavha: Professional Minimalist -->
<div class="px-2 py-1 flex items-center justify-between bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5  ">
  <!-- Chap tomon: Sarlavha va Indikator -->
  <div class="flex items-center gap-3">
    <!-- Vertikal minimalist chiziq -->
    <div class="w-[4px] h-6 bg-indigo-500 rounded-full"></div>
    
    <div class="flex flex-col">
      <h3 class="text-xl font-[900] text-slate-800 dark:text-white tracking-tight leading-tight uppercase">
        Harakatlar
      </h3>
      <!-- Kichik live-status -->
     
    </div>
  </div>

  <!-- O'ng tomon: Statistik badge -->
  <div class="flex flex-col items-end gap-1">
    <div class="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Bugun:</span>
      <span class="text-xs font-black text-indigo-500 dark:text-indigo-400">
        {{ filteredTransactions.length }}
      </span>
    </div>
  </div>
</div>

  <!-- Segmented Tabs (Filtr) -->
  <div class="bg-transparent px-2 rounded-2xl ">
    <SegmentTabs 
      :tabs="actionTabs" 
      v-model="activeActionTab" 
      variant="light"
    />
  </div>

 <!-- Tranzaksiyalar Ro'yxati Konteyneri -->
<div class="">
  <div 
    class="custom-scroll max-h-[500px] overflow-y-auto pr-2 -mr-2 space-y-2"
  >
    <!-- Bo'sh holat (Minimalist) -->
    <div v-if="filteredTransactions.length === 0" 
         class="py-12 text-center rounded-[30px] border border-dashed border-slate-200 dark:border-white/10">
      <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Ma'lumot mavjud emas</p>
    </div>

    <!-- Ro'yxat Elementi -->
    <div 
      v-for="tx in filteredTransactions" 
      :key="tx.id" 
      class="group relative p-2 bg-white/50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] rounded-[24px] flex justify-between items-center transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-white/5"
    >
      <div class="flex items-center gap-4">
        <!-- Minimal Ikonka (Aylanashaklida emas, kvadratroq zamonaviy) -->
        <div 
          :class="`text-${catMap[tx.category].color}-500 bg-${catMap[tx.category].color}-500/5`" 
          class="w-12 h-12 rounded-[18px] flex items-center justify-center text-lg transition-transform group-hover:scale-110"
        >
          <i :class="catMap[tx.category].icon"></i>
        </div>

        <div class="flex flex-col gap-0.5">
          <p class="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight line-clamp-1">
            {{ tx.title }}
          </p>
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ tx.time }}</span>
            <span class="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10"></span>
            <span class="text-[9px] font-black text-indigo-500/60 uppercase">{{ tx.method }}</span>
          </div>
        </div>
      </div>

      <!-- Summa va Tip Indikatori -->
      <div class="flex flex-col items-end">
        <p 
          :class="tx.type === 'in' ? 'text-emerald-500' : 'text-rose-500'" 
          class="text-base font-[900] tracking-tighter"
        >
          {{ tx.type === 'in' ? '+' : '-' }}{{ tx.amount.toLocaleString() }}
        </p>
        <!-- Yupqa pastki chiziq o'rniga kichik status nuqtasi -->
        <div :class="`w-1.5 h-1.5 rounded-full bg-${catMap[tx.category].color}-500 mt-1`"></div>
      </div>
    </div>
  </div>
</div>
</div>
        </div>

        <!-- Boshqa tablar uchun placeholder -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-slate-300">
          <i class="fas fa-spinner fa-spin text-2xl mb-4"></i>
          <p class="font-black uppercase text-[10px] tracking-widest">Sahifaga o'tilmoqda...</p>
        </div>
      </div>
    </ion-content>

    <!-- Z-REPORT MODAL (UI MODAL) -->
    <Modal v-model="showCloseModal" title="Smenani Yakunlash" size="sm" no-padding>
      <div class="p-6 bg-slate-50/50 dark:bg-slate-950/50">
        <div class="text-center py-4">
          <div class="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-rose-500/20">
            <i class="fas fa-power-off text-2xl"></i>
          </div>
          <h3 class="text-xl font-black uppercase tracking-tighter italic text-slate-800 dark:text-white">Z-Hisobot</h3>
        </div>

        <div class="space-y-3">
          <div class="p-6 bg-indigo-600 rounded-[32px] text-white shadow-xl flex justify-between items-center relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <span class="font-bold text-xs uppercase tracking-wider opacity-80">Jami yopilish:</span>
            <span class="text-2xl font-black tracking-tighter">{{ totalBalance.toLocaleString() }} UZS</span>
          </div>

          <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 flex justify-between italic">
            <span class="text-[10px] font-bold text-slate-400 uppercase">Smena vaqti:</span>
            <span class="text-[10px] font-black text-slate-600 dark:text-slate-300">{{ shiftStartTime }}</span>
          </div>
        </div>

        <p class="text-[9px] text-center text-slate-400 font-bold mt-6 px-4 uppercase tracking-tighter">
          * Diqqat: Smena yopilgandan so'ng kassa balansi nolga tushiriladi.
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3 w-full p-2 bg-white dark:bg-slate-900">
          <Button @click="showCloseModal = false" variant="secondary" class="flex-1">Bekor qilish</Button>
          <Button @click="closeShift" variant="danger" class="flex-[2] font-black">Smenani Yopish</Button>
        </div>
      </template>
    </Modal>
  </ion-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent } from '@ionic/vue';
import { Button, Input, Header, GlobalRefresher, SegmentTabs, Select, Modal } from '../../UI/UI';
import { vibrate, notify } from '../../utils/index.util';
import { OrderStore } from '../../stores/index.store';
const router = useRouter();
const orderStore = OrderStore();

// --- HOLATLAR (STATE) ---
const isShiftOpen = ref(false);
const activeTab = ref('cash');
const searchQuery = ref('');
const showCloseModal = ref(false);
const step = ref(1);
const initialBalance = ref(0);
const totalBalance = ref(12450000);
const shiftStartTime = ref('');

const selectedRegister = ref(null);
const selectedStaff = ref(null);

// --- TABLAR KONFIGURATSIYASI ---
const Tabs = [
  { id: 'cash', label: 'Asosiy', icon: 'fas fa-wallet' },
  { id: 'order', label: 'Buyurtmalar', routerName: 'order', icon: 'fas fa-shopping-basket' },
  { id: 'tables', label: 'Stollar', routerName: 'tables', icon: 'fas fa-chair' },
  { id: 'statistic', label: 'Hisobotlar', routerName: 'statistic', icon: 'fas fa-chart-bar' },
];

// --- 1. MOUNTED: AVVALGI HOLATNI TEKSHIRISH ---
onMounted(() => {
  const savedStatus = localStorage.getItem('pos_shift_status');
  if (savedStatus === 'open') {
    isShiftOpen.value = true;
    shiftStartTime.value = localStorage.getItem('pos_shift_start_time') || '';
  }
});

// --- 2. START SHIFT (SMENANI OCHISH) ---
const startShift = () => {
  if (!selectedRegister.value || !selectedStaff.value) return;

  vibrate('heavy');
  
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  shiftStartTime.value = now;

  // Xotiraga saqlash (Refresh qilsa ham yo'qolmaydi)
  isShiftOpen.value = true;
  localStorage.setItem('pos_shift_status', 'open');
  localStorage.setItem('pos_shift_start_time', now);
  
  notify("Smena muvaffaqiyatli ochildi", "success");
};

// --- 3. CLOSE SHIFT (SMENANI YOPISH) ---
const closeShift = () => {
  vibrate('heavy');
  
  // Xotirani tozalash
  isShiftOpen.value = false;
  localStorage.removeItem('pos_shift_status');
  localStorage.removeItem('pos_shift_start_time');
  
  // UI Reset
  showCloseModal.value = false;
  step.value = 1;
  selectedRegister.value = null;
  selectedStaff.value = null;
  activeTab.value = 'cash';
  
  notify("Smena yopildi. Z-Report tayyorlanmoqda", "warning");
};

// --- WATCH: NAVIGATSIYA ---
watch(activeTab, (newVal) => {
  const tab = Tabs.find(t => t.id === newVal);
  if (tab?.routerName) {
    vibrate('light');
    router.push({ name: tab.routerName });
    
    // Agar foydalanuvchi orqaga qaytsa, tab yana 'cash' holatiga kelishi uchun:
    setTimeout(() => { activeTab.value = 'cash' }, 500);
  }
});

// --- DATA MOCKUP ---
const cashRegisters = [
  { id: 1, name: 'Asosiy Kassa', balance: 1250000 },
  { id: 2, name: 'Bar Kassasi', balance: 450000 }
];

const staffMembers = [
  { id: 101, name: 'Umidaxon (Kassir)' },
  { id: 102, name: 'Sherzodbek (Admin)' }
];


// --- COMPUTED ---
const activeTabLabel = computed(() => Tabs.find(t => t.id === activeTab.value)?.label || 'Kassa');
const selectedRegisterData = computed(() => cashRegisters.find(r => r.id === selectedRegister.value));
const distribution = [
  { label: 'Naqd pul', value: 8500000, color: 'bg-emerald-400' },
  { label: 'Plastik (UzCard)', value: 3950000, color: 'bg-amber-400' }
];

const quickActions = [
  { label: 'Kirim', icon: 'fas fa-plus', variant: 'success', action: () => notify('Kirim oynasi', 'info') },
  { label: 'Chiqim', icon: 'fas fa-minus', variant: 'danger', action: () => notify('Chiqim oynasi', 'info') },
  { label: 'X-Report', icon: 'fas fa-receipt', variant: 'warning', action: () => notify('X-Hisobot chop etilmoqda', 'success') },
  { label: 'Yopish', icon: 'fas fa-power-off', variant: 'primary', action: () => { showCloseModal.value = true } }
];
// 1. Tablar sozlamasi
const actionTabs = [
  { id: 'all', label: 'Barchasi' },
  { id: 'order', label: 'Buyurtmalar' },
  { id: 'income', label: 'Kirimlar' },
  { id: 'expense', label: 'Chiqimlar' }
];
const activeActionTab = ref('all');

const catMap = {
  order: { icon: 'fas fa-shopping-bag', color: 'indigo', label: 'Buyurtma' },
  income: { icon: 'fas fa-arrow-trend-up', color: 'emerald', label: 'Kirim' },
  expense: { icon: 'fas fa-receipt', color: 'rose', label: 'Chiqim' }
};

// 2. Store'dan ma'lumotni formatlash va filtrlash
const filteredTransactions = computed(() => {
  const allData = (orderStore.orders || []).map(item => ({
    id: item._id,
    title: item.category === 'expense' ? item.description : `Buyurtma #${item.orderType || item.orderType}`,
    time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
    amount: item.finalTotal || item.finalTotal || 0,
    type: item.type || 'in', 
    category: item.category || 'order', // 'order', 'income', 'expense'
    method: item.paymentMethod || 'Naqd'
  }));

  if (activeActionTab.value === 'all') return allData;
  return allData.filter(tx => tx.category === activeActionTab.value);
});
const refreshData = (done) => setTimeout(() => { done(); notify("Yangilandi", "success"); }, 1000);
onMounted(() => {
  orderStore.GetAll();
});
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Sticky Tablar uchun maxsus soya */
.sticky { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
/* Custom Scrollbar dizayni */
.custom-scroll::-webkit-scrollbar {
  width: 4px; /* Yupqa scrollbar */
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.4); /* Slate-300 rangi shaffoflik bilan */
  border-radius: 20px;
  transition: all 0.3s ease;
}

.dark .custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05); /* Dark mode uchun oqimtir shaffof */
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5); /* Hover bo'lganda indigo rangi */
}

/* Scroll bo'lganda elementlar qisilishining oldini olish */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(203, 213, 225, 0.4) transparent;
}
</style>