<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { TabelStore, PrinterStore } from "../../stores/index.store"; 
import { Button, Modal } from "../../UI/UI"; // Keyboard olib tashlandi

const store_tabel = TabelStore();
const store_printer = PrinterStore();
const { isPaymentModal, model_payment, activeTable } = storeToRefs(store_tabel);

// Rejimlar boshqaruvi
const activeTab = ref('single'); 
const selectedMethod = ref('cash');

// --- PRICE FORMATTING & CALCULATIONS ---
const formatPrice = (v) => new Intl.NumberFormat('uz-UZ').format(v || 0) + " so'm";

const cart = computed(() => activeTable.value?.cartId ? activeTable.value?.cartId : activeTable.value  || {});
const grandTotal = computed(() => cart.value.finalTotal || 0);
const customerBalance = computed(() => cart.value?.customerId?.balance || 0);

// Barcha to'lov turlari yig'indisi
const totalPaid = computed(() => {
  const p = model_payment.value;
  return (Number(p.cash) || 0) + 
         (Number(p.card) || 0) + 
         (Number(p.terminal) || 0) + 
         (Number(p.debt) || 0) +
         (Number(p.balance) || 0);
});

const remaining = computed(() => Math.max(0, grandTotal.value - totalPaid.value));
const surplus = computed(() => Math.max(0, totalPaid.value - grandTotal.value));

// --- AUTO-FILL WATCHER (Tezkor rejim uchun) ---
watch([activeTab, selectedMethod, isPaymentModal], () => {
  if (activeTab.value === 'single' && isPaymentModal.value) {
    const methods = ['cash', 'card', 'terminal', 'debt', 'balance'];
    methods.forEach(m => {
      if (m === selectedMethod.value) {
        model_payment.value[m] = m === 'balance' 
          ? Math.min(grandTotal.value, customerBalance.value) 
          : grandTotal.value;
      } else {
        model_payment.value[m] = 0;
      }
    });
  }
}, { immediate: true });

// --- VALIDATION ---
const isReady = computed(() => {
  const isAmountMet = totalPaid.value >= grandTotal.value || model_payment.value.debt > 0;
  const isCustomerNeeded = (model_payment.value.debt > 0 || model_payment.value.balance > 0);
  const isCustomerSelected = isCustomerNeeded ? !!(cart.value.customerId || model_payment.value.customerId) : true;
  
  return isAmountMet && isCustomerSelected;
});

const onFinish = async () => {
  if (!isReady.value) return;
  await store_tabel.SubmitPayment();
};
</script>

<template>
  <Modal
    v-model="isPaymentModal"
    size="md"
    no-padding
    :title="`Stol №${activeTable?.number ? activeTable.number : activeTable?.tableId || '---'}`"
  >
    <div class="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 space-y-5 pb-12">
      
      <div class="grid grid-cols-2 gap-3">
        <div class="flex items-center gap-3 p-2 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 transition-all group">
          <div class="relative shrink-0">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200/50 dark:border-white/10">
              <i class="fa-solid fa-user-gear text-indigo-500/80 text-sm"></i>
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate tracking-tight uppercase">
                {{ cart?.staffId?.firstname || 'Admin' }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <div class="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10">
                <i class="fa-solid fa-shield-halved text-[7px] text-indigo-500 mr-1"></i>
                <span class="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                  Xizmatda
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="cart?.customerId" class="flex items-center gap-3 p-2 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 transition-all group">
          <div class="relative shrink-0">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200/50 dark:border-white/10 group-hover:scale-105 transition-transform duration-300">
              <i class="fa-solid fa-user-tie text-slate-600 dark:text-slate-300 text-sm"></i>
            </div>
            <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate tracking-tight uppercase">
                {{ cart?.customerId?.name }}
              </span>
              <span class="text-[7px] font-black bg-amber-100 dark:bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                {{ cart?.customerId?.status }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <div class="flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10">
                <i class="fa-solid fa-wallet text-[8px]" 
                   :class="customerBalance < 0 ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'"></i>
              </div>
              <span class="text-[10px] font-bold tracking-tight leading-none"
                    :class="customerBalance < 0 ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'">
                {{ formatPrice(customerBalance) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="relative overflow-hidden bg-slate-900 dark:bg-indigo-600 rounded-[40px] p-8 shadow-2xl group transition-all duration-500">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div class="relative z-10 flex flex-col gap-4">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <p class="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">To'lov summasi</p>
              <h2 class="text-4xl font-black text-white tracking-tighter">
                {{ formatPrice(grandTotal) }}
              </h2>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <i class="fa-solid fa-receipt text-xl text-white"></i>
            </div>
          </div>
          <div class="flex gap-4 pt-4 border-t border-white/10 text-[9px] font-black text-white/60 uppercase tracking-widest">
            <span>Taom: {{ formatPrice(cart.subtotal) }}</span>
            <span v-if="cart.serviceFeeAmount > 0">Xizmat: +{{ cart.serviceFeePercent }}%</span>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex p-1.5 bg-slate-200/50 dark:bg-slate-900 rounded-[22px]">
          <button 
            v-for="t in [{id:'single', n:'Tezkor', i:'fa-bolt-lightning'}, {id:'mixed', n:'Aralash', i:'fa-layer-group'}]" :key="t.id"
            @click="activeTab = t.id"
            class="flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300"
            :class="activeTab === t.id ? 'bg-white dark:bg-slate-800 shadow-lg text-indigo-600' : 'text-slate-400'"
          >
            <i class="fa-solid" :class="t.i"></i> {{ t.n }}
          </button>
        </div>

        <div v-if="activeTab === 'single'" class="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button 
            v-for="(val, key) in {cash: 'Naqd Pul', card: 'Plastik Karta', terminal: 'Terminal', debt: 'Nasiya (Qarz)', balance: 'Mijoz Balansi'}" :key="key"
            v-show="key !== 'balance' || customerBalance > 0"
            @click="selectedMethod = key"
            class="flex items-center justify-between px-5 py-4 rounded-[22px] border transition-all duration-300 group"
            :class="selectedMethod === key 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-500 hover:border-indigo-200'"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                   :class="selectedMethod === key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500'">
                <i class="fa-solid text-lg" :class="{
                  'fa-money-bill-wave': key==='cash', 
                  'fa-credit-card': key==='card', 
                  'fa-cash-register': key==='terminal', 
                  'fa-handshake-angle': key==='debt', 
                  'fa-wallet': key==='balance'
                }"></i>
              </div>
              <div class="flex flex-col items-start">
                <span class="text-xs font-black uppercase tracking-wider">{{ val }}</span>
                <span v-if="key === 'balance'" class="text-[9px] opacity-70">{{ formatPrice(customerBalance) }} mavjud</span>
              </div>
            </div>
            <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                 :class="selectedMethod === key ? 'border-white bg-white text-indigo-600' : 'border-slate-200 dark:border-slate-700'">
              <i v-if="selectedMethod === key" class="fa-solid fa-check text-[10px]"></i>
            </div>
          </button>
        </div>

        <div v-if="activeTab === 'mixed'" class="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div v-for="f in [
            {k:'cash', l:'Naqd Pul', i:'fa-money-bill-1', desc: 'Kassaga naqd qabul qilish'}, 
            {k:'card', l:'Plastik Karta', i:'fa-credit-card', desc: 'Humo / UzCard orqali'}, 
            {k:'terminal', l:'Terminal', i:'fa-print', desc: 'Bank terminali orqali'}, 
            {k:'debt', l:'Nasiya (Qarz)', i:'fa-clock', desc: 'Mijoz hisobiga qarz yozish'},
            {k:'balance', l:'Mijoz Balansi', i:'fa-vault', desc: 'Mijozning ichki hamyonidan'}
          ]" :key="f.k" 
            v-show="f.k !== 'balance' || customerBalance > 0"
            class="relative overflow-hidden p-4 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 transition-all duration-300 group"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <i class="fa-solid text-lg" :class="f.i"></i>
                </div>
                <div class="flex flex-col">
                  <label class="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {{ f.l }}
                  </label>
                  <span class="text-[9px] text-slate-400 font-medium tracking-tight">
                    {{ f.k === 'balance' ? `Mavjud: ${formatPrice(customerBalance)}` : f.desc }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end">
                <input 
                  type="number" 
                  v-model.number="model_payment[f.k]"
                  class="w-32 bg-transparent text-right text-lg font-black tracking-tighter text-slate-900 dark:text-white focus:outline-none placeholder-slate-300"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full px-2 py-2">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-700"
               :class="remaining <= 0 ? 'bg-emerald-500 border-emerald-500 text-white rotate-[360deg]' : 'bg-white dark:bg-slate-900 border-slate-100 text-slate-300'">
            <i class="fa-solid" :class="remaining <= 0 ? 'fa-check text-lg' : 'fa-spinner fa-spin text-sm'"></i>
          </div>

          <div class="flex flex-col">
            <span class="text-[10px] font-black  tracking-[0.1em]" :class="surplus > 0 ? 'text-emerald-500' : 'text-slate-400'">
              {{ surplus > 0 ? "Balansga o'tadi" : "To'lov qoldig'i" }}
            </span>
            <span class="text-sm font-black tracking-tighter" :class="surplus > 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'">
              {{ surplus > 0 ? `+ ${formatPrice(surplus)}` : formatPrice(remaining) }}
            </span>
          </div>
        </div>

        <Button 
          @click="onFinish"
          size="small"
          :variant="isReady ? 'primary' : 'disabled'"
          :class="isReady ? 'shadow-2xl shadow-indigo-500/40 scale-105 active:scale-95' : 'opacity-30'"
        >
          <div class="flex items-center gap-3">
            <span class="font-black uppercase tracking-widest text-xs">
              {{ isReady ? `To'lov` : 'Kutilmoqda' }}
            </span>
            <i v-if="isReady" class="fa-solid fa-arrow-right-long group-hover:translate-x-1 transition-transform"></i>
          </div>
        </Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.animate-in {
  animation-delay: 0.1s;
}

/* Chrome, Safari, Edge, Opera uchun input spinnerni olib tashlash */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox uchun input spinnerni olib tashlash */
input[type=number] {
  -moz-appearance: textfield;
}
</style>