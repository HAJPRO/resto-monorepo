<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617] select-none">
    <!-- 1. HEADER -->
    <Header 
      :title="isShiftOpen ? 'Kassa nazorati' : 'Kassa Smenasi'" 
      :searchable="isShiftOpen" 
      v-model="searchQuery" 
    >
      <template #actions v-if="isShiftOpen">
        <Button @click="openClosingModal" icon="fas fa-power-off" color="danger" size="sm" />
      </template>
    </Header>

    <!-- 2. NAVIGATSIYA (Faqat smena ochiq bo'lsa) -->
    <div v-if="isShiftOpen" class="sticky top-0 z-[100] bg-inherit">
      <SegmentTabs :tabs="Tabs" v-model="activeTab" />
    </div>

    <ion-content :fullscreen="true" class="ion-padding">
      <GlobalRefresher @refresh="refreshData" />

      <!-- 3. YUKLANISH HOLATI (Sakrashga qarshi filtr) -->
      <div v-if="pageLoading" class="flex flex-col items-center justify-center h-full">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="text-[10px] mt-4 text-slate-400 font-black uppercase tracking-widest animate-pulse">
          Ma'lumotlar sinxronlanmoqda...
        </p>
      </div>

      <template v-else>
        <!-- A. SMENA YOPIQ (OCHISH EKRANI) -->
        <div v-if="!isShiftOpen" class="flex flex-col h-full animate-fade-in">
          <div class="flex-1 flex flex-col items-center justify-center px-6">
            <div class="relative mb-8 text-center">
              <div class="absolute inset-0 bg-indigo-500/10 blur-[50px] rounded-full animate-pulse"></div>
              <div class="relative w-20 h-20 bg-white dark:bg-slate-800 rounded-[30px] shadow-xl flex items-center justify-center border border-white dark:border-slate-700 mx-auto">
                <i :class="step === 1 ? 'fas fa-door-closed' : 'fas fa-calculator'" class="text-2xl text-indigo-500"></i>
              </div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-6">
                {{ step === 1 ? 'Yangi Smena' : 'Kassa Qoldig\'i' }}
              </h2>
            </div>

            <!-- STEP 1: Tanlov -->
            <div v-if="step === 1" class="w-full max-w-sm space-y-4">
              <Select label="Kassa Nuqtasi" v-model="selectedRegister" :options="cashRegisters" labelKey="name" valueKey="id" />
              <Select disabled label="Mas'ul Kassir" v-model="selectedStaff" :options="userStore.users" labelKey="fullname" valueKey="_id" />
              <Button @click="step = 2" :disabled="!selectedRegister || !selectedStaff" class="w-full mt-4" rightIcon="fas fa-arrow-right"> Davom etish </Button>
            </div>

            <!-- STEP 2: Balans -->
            <div v-if="step === 2" class="w-full max-w-sm space-y-6">
              <div class="p-6 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 text-center">
                <p class="text-[9px] font-black text-indigo-500 uppercase mb-1">Eslatma</p>
                <p class="text-xs text-slate-500 font-medium">Kassadagi naqd pulni sanab kiriting</p>
              </div>
              <Input label="Haqiqiy naqd pul" v-model="initialBalance" type="number" isFormatted placeholder="0.00" />
              <div class="flex gap-3">
                <Button variant="secondary" class="flex-1" @click="step = 1">Orqaga</Button>
                <Button variant="primary" class="flex-[2]" @click="handleStartShift" :loading="cashStore.loading">Smenani Ochish</Button>
              </div>
            </div>
          </div>
        </div>

        <!-- B. AKTIV SMENA (KASSA ASOSIY EKRANI) -->
        <div v-else class="pb-24 animate-fade-in p-4">
        
          <div v-if="activeTab === 'cash'" class="space-y-8">
            <!-- Balans Vidjeti -->
            
<div class="relative bg-slate-900 dark:bg-indigo-700 p-8 rounded-[45px]  overflow-hidden group">
  <!-- Dekorativ element -->
  <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

  <div class="relative z-10">
    <div class="flex justify-between items-start mb-6">
      <div>
        <p class="text-[10px] font-black uppercase text-indigo-200/50 tracking-[0.2em] mb-1">Kassadagi Real Naqd Pul</p>
        <h2 class="text-5xl font-black text-white italic tracking-tighter">
          {{ summary.totalInVault.toLocaleString() }} <span class="text-sm font-normal opacity-40 italic">UZS</span>
        </h2>
      </div>
      <div class="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full backdrop-blur-md">
        <span class=" font-black text-emerald-400 uppercase tracking-widest text-[8px]">Smena Ochiq</span>
      </div>
    </div>

    <!-- Moliya taqsimoti (Grid 3 ustunli) -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <div v-for="item in distribution" :key="item.label" 
           class="bg-white/5 backdrop-blur-xl p-4 rounded-[28px] border border-white/10 hover:bg-white/10 transition-all">
        <div class="flex items-center gap-2 mb-2">
          <div :class="`w-8 h-8 rounded-xl ${item.color}/20 flex items-center justify-center text-[12px] ${item.color.replace('bg-', 'text-')}`">
            <i :class="item.icon"></i>
          </div>
          <p class="text-[9px] uppercase font-black text-white/50 tracking-wider leading-none">{{ item.label }}</p>
        </div>
        <p class="text-base font-black text-white leading-none tracking-tight">
          {{ item.value.toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- Statistik Progress Bar -->
    <div class="mt-8 space-y-2">
      <div class="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/40 px-1">
        <span>Sotuvlar Strukturasi (Ulish)</span>
        <span class="text-indigo-300">Naqd / Karta / Qarz</span>
      </div>
      <div class="h-3 w-full bg-white/5 rounded-full overflow-hidden flex p-0.5 border border-white/5">
        <div class="h-full bg-emerald-400 rounded-full transition-all duration-1000" :style="{ width: statsPercents.cash + '%' }"></div>
        <div class="h-full bg-blue-400 rounded-full mx-0.5 transition-all duration-1000" :style="{ width: statsPercents.card + '%' }"></div>
        <div class="h-full bg-amber-400 rounded-full transition-all duration-1000" :style="{ width: statsPercents.debt + '%' }"></div>
      </div>
      
      <!-- Pastki Legend (Izoh) -->
      <div class="flex flex-wrap gap-4 mt-2 px-1">
        <div v-for="type in [
          {l: 'Naqd', c: 'bg-emerald-400', v: statsPercents.cash},
          {l: 'Karta', c: 'bg-blue-400', v: statsPercents.card},
          {l: 'Qarz', c: 'bg-amber-400', v: statsPercents.debt}
        ]" :key="type.l" class="flex items-center gap-1.5">
          <div :class="`w-1.5 h-1.5 rounded-full ${type.c}`"></div>
          <span class="text-[8px] font-bold text-white/60 uppercase">{{ type.l }}: {{ type.v.toFixed(0) }}%</span>
        </div>
      </div>
    </div>
  </div>
</div>

            <!-- Tezkor Amallar -->
            <!-- <div class="grid grid-cols-4 gap-4 px-2">
              <div v-for="act in quickActions" :key="act.label" class="flex flex-col items-center gap-3 text-center">
                <Button @click="act.action" :variant="act.variant" :icon="act.icon" size="md" />
                <span class="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{{ act.label }}</span>
              </div>
            </div> -->
  <header class="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md pb-1 pt-4 ">
  <!-- Asosiy Qator (Sarlavha + Status) -->
  <div class="flex items-center justify-between px-1 mb-2">
    <div class="flex items-center gap-3">
      <!-- iOS uslubidagi nafis indikator -->
      <div class="h-8 w-1.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
      
      <div class="flex flex-col">
        <h1 class="text-xl font-[1000] text-slate-900 dark:text-white tracking-tight leading-none">
          Harakatlar<span class="text-indigo-500">.</span>
        </h1>
        <!-- Kichik analitika (faqat kerakli ma'lumot) -->
        <div class="flex items-center gap-1.5 mt-1">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {{ filteredActions.length }} ta
          </span>
        </div>
      </div>
    </div>

    <!-- O'ng tomondagi ixcham harakatlar (iOS uslubida) -->
    <div class="flex items-center gap-2">
      <div v-for="act in quickActions" :key="act.label" class="flex flex-col items-center gap-3 text-center">
                <Button @click="act.action" :variant="act.variant" :icon="act.icon" size="sm" />
                <span class="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{{ act.label }}</span>
              </div>
     
    </div>
  </div>

  <!-- SegmentTabs: Android/iOS "Sticky Tab" uslubi -->
  <div v-if="isShiftOpen" class="px-1">
    <div class="p-1 bg-slate-200/50 dark:bg-white/[0.03] backdrop-blur-xl rounded-[20px] border border-slate-300/20 dark:border-white/5 shadow-inner">
      <SegmentTabs 
        :tabs="actionTabs" 
        v-model="activeActionTab" 
        class="!mb-0" 
      />
    </div>
  </div>
</header>
<div class="grid gap-3">
  <div v-for="item in filteredActions" :key="item._id" 
    class="group relative p-4 bg-white dark:bg-slate-900/40 rounded-[28px] flex justify-between items-center border border-slate-100 dark:border-white/[0.05] transition-all duration-300 hover:ring-2 hover:ring-indigo-500/20 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10">
    
    <div class="flex items-center gap-5">
      <!-- Ikonka: Holatga qarab dinamik ranglar -->
      <div :class="[
        item.isOrder ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20' : catMap[item.type].colorClass,
        'w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-transparent transition-transform group-hover:scale-110'
      ]">
        <i :class="item.isOrder ? (item.orderType === 'table' ? 'fas fa-utensils' : 'fas fa-shopping-cart') : catMap[item.type].icon"></i>
      </div>

      <!-- Matn qismi -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <p class="text-[15px] font-[800] text-slate-800 dark:text-slate-100 leading-none">
            {{ item.displayTitle }}
          </p>
          <span v-if="item.isOrder" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[9px] font-black text-slate-400 uppercase">
            ID: {{ item._id.slice(-4).toUpperCase() }}
          </span>
        </div>
        
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            <i class="far fa-clock opacity-70"></i> {{ item.displayTime }}
          </span>
          <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <span class="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest">
            {{ item.isOrder ? item.paymentMethodLabel : 'Operatsiya' }}
          </span>
        </div>
      </div>
    </div>

    <!-- O'ng tomon: Summa va Analitika -->
    <div class="text-right flex flex-col items-end gap-1">
      <div class="flex items-center gap-1.5">
        <span v-if="item.type === 'out'" class="text-[10px] font-black text-rose-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Chiqim</span>
        <p :class="(item.type === 'out') ? 'text-rose-500' : 'text-emerald-500'" 
           class="text-lg font-[1000] tracking-tighter leading-none">
          {{ item.type === 'out' ? '-' : '+' }}{{ item.displayAmount?.toLocaleString() }}
          <span class="text-[10px] font-medium opacity-60 ml-0.5">UZS</span>
        </p>
      </div>
      
      <!-- Servis to'lovi va Status Badge -->
      <div class="flex items-center gap-1.5">
        <div v-if="item.isOrder && item.serviceFeeAmount > 0" 
             class="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
          <span class="text-[8px] font-black uppercase">Servis:</span>
          <span class="text-[9px] font-black">{{ item.serviceFeeAmount?.toLocaleString() }}</span>
        </div>
        
        <div :class="item.isOrder ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-50 dark:bg-white/5 text-slate-400'"
             class="px-2 py-0.5 rounded-lg border border-transparent text-[8px] font-black uppercase tracking-widest">
          {{ item.isOrder ? 'Sotuv' : 'Kassa' }}
        </div>
      </div>
    </div>
  </div>
  <!-- Empty State (Ma'lumot bo'sh bo'lgan holat) -->
<div v-if="filteredActions.length === 0" 
     class="relative overflow-hidden py-20 px-6 flex flex-col items-center justify-center text-center bg-white/30 dark:bg-slate-900/20 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all">
  
  <!-- Dekorativ fon elementlari -->
  <div class="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
  <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>

  <!-- Animatsiyali Ikonka -->
  <div class="relative mb-6">
    <div class="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-4xl text-slate-300 dark:text-slate-700 animate-pulse">
      <i class="fas fa-folder-open"></i>
    </div>
    <!-- Kichik dekorativ zarrachalar -->
    <div class="absolute -top-2 -right-2 w-6 h-6 bg-amber-400/20 rounded-full flex items-center justify-center text-[10px] text-amber-500">
      <i class="fas fa-search"></i>
    </div>
  </div>

  <!-- Matnlar -->
  <div class="max-w-[280px] space-y-2">
    <h3 class="text-xl font-[900] text-slate-800 dark:text-slate-200 tracking-tight">
      Hozircha hech narsa yo'q
    </h3>
    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
      Siz tanlagan filtr yoki bo'lim bo'yicha ma'lumotlar topilmadi
    </p>
  </div>

  <!-- Harakat tugmasi (ixtiyoriy) -->
  <button v-if="activeActionTab !== 'all'" 
          @click="activeActionTab = 'all'"
          class="mt-8 px-6 py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-500/10">
    Barcha harakatlarni ko'rish
  </button>
</div>
</div>
          </div>
        </div>
      </template>
    </ion-content>

    <!-- 4. MODALLAR -->
    <Modal v-model="showCloseModal" title="Smenani Yakunlash" size="sm">
      <div class="p-6 space-y-4">
        <div class="p-6 bg-indigo-600 rounded-[32px] text-white shadow-xl">
          <span class="font-bold text-xs uppercase opacity-80">Tizim bo'yicha qoldiq:</span>
          <h3 class="text-2xl font-black mt-1">{{ currentTotalBalance?.toLocaleString() }} UZS</h3>
        </div>
        <Input label="Haqiqiy naqd pul (Sanalgan)" v-model="closingActualCash" type="number" isFormatted placeholder="0.00" />
        <Button @click="handleCloseShift" :loading="cashStore.loading" variant="danger" class="w-full font-black py-4">SMENANI YOPISH</Button>
      </div>
    </Modal>

    <Modal v-model="showTxModal" :title="txType === 'in' ? 'Kirim Qilish' : 'Chiqim Qilish'" size="sm">
      <div class="space-y-4 p-4">
        <Input label="Summa" v-model="txForm.amount" type="number" isFormatted />
        <Input label="Sabab/Izoh" v-model="txForm.reason" placeholder="Masalan: Inkassatsiya" />
        <Button @click="submitTransaction" :loading="cashStore.loading" :variant="txType === 'in' ? 'success' : 'danger'" class="w-full">Tasdiqlash</Button>
      </div>
    </Modal>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { IonPage, IonContent, IonSpinner } from '@ionic/vue';
import { Button, Input, Header, GlobalRefresher, SegmentTabs, Select, Modal } from '../../UI/UI';
import { vibrate, notify } from '../../utils/index.util';
import { CashStore, UserStore } from '../../stores/index.store';
import { jwtDecode } from "jwt-decode";
import { reload } from 'ionicons/icons';
import router from '../../router';

const cashStore = CashStore();
const userStore = UserStore();

// UI STATES
const pageLoading = ref(true); 
const activeTab = ref('cash');
const step = ref(1);
const searchQuery = ref('');
const showCloseModal = ref(false);
const showTxModal = ref(false);
const activeActionTab = ref('all');

// FORM STATES
const selectedRegister = ref('MAIN_01');
const selectedStaff = ref(null);
const initialBalance = ref(0);
const closingActualCash = ref(0);
const txType = ref('in');
const txForm = reactive({ amount: 0, reason: '' });

// STATIC DATA
const cashRegisters = [{ id: 'MAIN_01', name: 'Asosiy Kassa' }];
const actionTabs = [{ id: 'all', label: 'Barchasi' }, {id:'orders', label: 'Buyurtmalar'}, { id: 'in', label: 'Kirim' }, { id: 'out', label: 'Chiqim' }];
const catMap = { 
  in: { icon: 'fas fa-arrow-trend-up', colorClass: 'text-emerald-500 bg-emerald-500/5', label: 'Kirim' }, 
  out: { icon: 'fas fa-arrow-trend-down', colorClass: 'text-rose-500 bg-rose-500/5', label: 'Chiqim' } 
};

// COMPUTED
const isShiftOpen = computed(() => !!cashStore.currentShift && cashStore.currentShift.status === 'open');
const currentTotalBalance = computed(() => cashStore.financialSummary.totalInVault || 0);

const summary = computed(() => cashStore.financialSummary);

const distribution = computed(() => [
  { label: 'Naqd Savdo', value: summary.value.cash, color: 'bg-emerald-400', icon: 'fas fa-money-bill-wave' },
  { label: 'Plastik (Card)', value: summary.value.card, color: 'bg-blue-400', icon: 'fas fa-credit-card' },
  { label: 'Nasiya (Qarz)', value: summary.value.debt, color: 'bg-amber-400', icon: 'fas fa-handshake-slash' },
  { label: 'Kirim (Kassa)', value: summary.value.in, color: 'bg-indigo-400', icon: 'fas fa-plus-circle' },
  { label: 'Chiqim (Xarajat)', value: summary.value.out, color: 'bg-rose-400', icon: 'fas fa-minus-circle' },
  { label: 'Boshlang\'ich', value: summary.value.starting, color: 'bg-slate-400', icon: 'fas fa-vault' }
]);

const statsPercents = computed(() => {
  const total = summary.value.cash + summary.value.card + summary.value.debt || 1;
  return {
    cash: (summary.value.cash / total) * 100,
    card: (summary.value.card / total) * 100,
    debt: (summary.value.debt / total) * 100
  };
});

const filteredActions = computed(() => {
  const shift = cashStore.currentShift;
  if (!shift) return [];

  const allActions = [
    // 1. Kassa tranzaksiyalari (Kirim/Chiqim)
    ...(shift.transactions || []).map(tx => ({
      ...tx,
      isOrder: false,
      displayTitle: tx.reason || (tx.type === 'in' ? 'Kirim' : 'Chiqim'),
      displayAmount: tx.amount,
      displayTime: new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sortDate: new Date(tx.createdAt)
    })),

    // 2. Yopilgan buyurtmalar (Sotuvlar)
    ...(shift.closedOrderIds || []).map(order => {
      // To'lov turini aniqlash (Cash, Card yoki Mixed)
      const payTypes = order.payments?.map(p => p.type) || [];
      const paymentLabel = payTypes.includes('cash') && payTypes.includes('card') 
        ? 'Aralash' 
        : (payTypes[0] === 'cash' ? 'Naqd' : 'Karta');

      return {
        ...order,
        isOrder: true,
        type: 'orders',
        // Buyurtma sarlavhasi (Masalan: Stol #5 yoki Oddiy savdo)
        displayTitle: order.orderType === 'table' ? `Stol #${order.tableId?.slice(-3)}` : 'Tezkor Savdo',
        displayAmount: order.finalTotal, // Yakuniy summa (xizmat haqi bilan)
        displayTime: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentMethodLabel: paymentLabel,
        sortDate: new Date(order.createdAt)
      };
    })
  ];

  // Tab bo'yicha filtrlash
  let filtered = allActions;
  if (activeActionTab.value !== 'all') {
    filtered = allActions.filter(item => item.type === activeActionTab.value);
  }

  // Qidiruv (Sarlavha yoki ID bo'yicha)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.displayTitle.toLowerCase().includes(q) || 
      item._id.toLowerCase().includes(q)
    );
  }

  return filtered.sort((a, b) => b.sortDate - a.sortDate);
});

// ACTIONS
const handleStartShift = async () => {
  try {
    vibrate('medium');
    await cashStore.openShift({ 
      cashierId: selectedStaff.value, 
      startingBalance: Number(initialBalance.value), 
      registerId: selectedRegister.value 
    });
    notify("Smena muvaffaqiyatli ochildi", "success");
  } catch (e) { 
    notify(e.response?.data?.message || "Xatolik yuz berdi", "error"); 
  }
};

const handleCloseShift = async () => {
  try {
    vibrate('heavy');
    await cashStore.closeShift({ actualCash: Number(closingActualCash.value) });
    showCloseModal.value = false;
    step.value = 1;
    notify("Smena yopildi va hisobot saqlandi", "warning");
    router.push({ name: 'home' });
    
  } catch (e) { 
    notify("Yopishda xatolik", "error");
  }
};

const submitTransaction = async () => {
  if (txForm.amount <= 0) return notify("Summani kiriting", "error");
  try {
    await cashStore.addTransaction({ ...txForm, type: txType.value, amount: Number(txForm.amount) });
    showTxModal.value = false;
    txForm.amount = 0;
    txForm.reason = '';
    notify("Tranzaksiya bajarildi", "success");
  } catch (e) { console.error(e); }
};

const openTxModal = (type) => { txType.value = type; showTxModal.value = true; };
const openClosingModal = () => { 
  closingActualCash.value = currentTotalBalance.value; 
  showCloseModal.value = true; 
};

const refreshData = async (done) => { 
  await cashStore.checkActiveShift(); 
  done(); 
};

const quickActions = [
  { label: 'Kirim', icon: 'fas fa-plus', variant: 'success', action: () => openTxModal('in') },
  { label: 'Chiqim', icon: 'fas fa-minus', variant: 'danger', action: () => openTxModal('out') },
  { label: 'X-Report', icon: 'fas fa-receipt', variant: 'warning', action: () => {} },
  { label: 'Yopish', icon: 'fas fa-power-off', variant: 'primary', action: openClosingModal }
];

const Tabs = [
  { id: 'cash', label: 'Kassa', routeName: 'cash', icon: 'fas fa-wallet' }, 
  { id: 'order', label: 'Buyurtmalar', routeName: 'order', icon: 'fas fa-shopping-cart' },
  { id: 'tables', label: 'Stollar', routeName: 'tables', icon: 'fas fa-table' },
  { id: 'report', label: 'Hisobotlar', routeName: 'report', icon: 'fas fa-chart-bar' }

];

// LIFECYCLE
onMounted(async () => {
  try {
    pageLoading.value = true;
    
    // 1. Birinchi navbatda aktiv smenani tekshiramiz
    await cashStore.checkActiveShift();
    
    // 2. Kerakli qo'shimcha ma'lumotlar
    await userStore.GetAll();
    
    // 3. Kassirni aniqlash
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      selectedStaff.value = decoded?._id || decoded?.id;
    }
  } catch (e) {
    console.error("Initsializatsiya xatosi:", e);
  } finally {
    // Hammasi tayyor bo'lgach loadingni o'chiramiz
    pageLoading.value = false; 
  }
});
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.custom-scroll::-webkit-scrollbar { width: 3px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
</style>