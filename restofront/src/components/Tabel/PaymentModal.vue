<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { TabelStore } from "../../stores/index.store"; 
import { Button, Modal, Input } from "../../UI/UI"; 

const store_tabel = TabelStore();
const { isPaymentModal, model_payment, activeTable } = storeToRefs(store_tabel);
console.log(activeTable.value);

const activeTab = ref('single'); 
const selectedMethod = ref('cash');

const formatPrice = (v) => new Intl.NumberFormat('uz-UZ').format(v || 0) + " so'm";

const cart = computed(() => activeTable.value?.cartId || {});
const grandTotal = computed(() => cart.value.finalTotal || 0);
const customerBalance = computed(() => cart.value?.customerId?.balance || 0);

// JAMI TO'LANGAN SUMMA (Balansni ham qo'shdik)
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

// TEZKOR REJIMDA AVTOMATIK TO'LDIRISH
watch([activeTab, selectedMethod, isPaymentModal], () => {
  if (activeTab.value === 'single' && isPaymentModal.value) {
    const methods = ['cash', 'card', 'terminal', 'debt', 'balance'];
    methods.forEach(m => {
      if (m === selectedMethod.value) {
        // Agar balans tanlansa, jami hisob va mavjud balansning kichigini oladi
        model_payment.value[m] = m === 'balance' 
          ? Math.min(grandTotal.value, customerBalance.value) 
          : grandTotal.value;
      } else {
        model_payment.value[m] = 0;
      }
    });
  }
}, { immediate: true });

// Yakunlashga tayyorlik tekshiruvi
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
    :title="`Stol №${activeTable?.number}`"
  >
    <div class="bg-slate-100 dark:bg-slate-950 rounded-xl p-3 space-y-4">
      
      <div class="grid grid-cols-2 gap-3">
       <div class="flex items-center gap-3 p-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[22px] border border-white dark:border-white/5 shadow-sm transition-all duration-300">
  
  <div class="relative shrink-0">
    <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
      <i class="fa-solid fa-user-gear text-white text-sm"></i>
    </div>
    <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
  </div>

  <div class="flex flex-col min-w-0 flex-1">
    <div class="flex items-center justify-between gap-2 mb-0.5">
      <span class="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate tracking-tight">
        {{ cart?.staffId?.firstname || 'Admin' }}
      </span>
      <span class="text-[7px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
        Xodim
      </span>
    </div>
    
    <div class="flex items-center gap-1.5">
      <i class="fa-solid fa-star text-[9px] text-amber-400"></i>
      <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none">
        Xizmat ko'rsatmoqda
      </span>
    </div>
  </div>
</div>

       <div v-if="cart?.customerId" 
     class="flex items-center gap-3 p-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[22px] border border-white dark:border-white/5 shadow-sm transition-all duration-300">
  
  <div class="relative shrink-0">
    <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
      <i class="fa-solid fa-user-tie text-white text-sm"></i>
    </div>
    <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
  </div>

  <div class="flex flex-col min-w-0 flex-1">
    <div class="flex items-center justify-between gap-2 mb-0.5">
      <span class="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate tracking-tight">
        {{ cart?.customerId?.name }}
      </span>
      <span class="text-[7px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md">
        Mijoz
      </span>
    </div>
    
    <div class="flex items-center gap-1.5">
      <i class="fa-solid fa-wallet text-[9px] text-slate-400"></i>
      <span class="text-[10px] font-bold tracking-tight"
            :class="customerBalance < 0 ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'">
        {{ formatPrice(customerBalance) }}
      </span>
    </div>
  </div>
</div>
      </div>

      <div class="relative overflow-hidden bg-indigo-600 rounded-[32px] p-6 shadow-xl group">
       <div class="grid grid-cols-1 gap-1.5 border-b border-white/10 pb-3">
            <div class="flex justify-between items-center text-[10px] font-bold  tracking-widest text-indigo-100/60">
              <span>Taomlar</span>
              <span>{{ formatPrice(cart.subtotal) }}</span>
            </div>
            
            <div v-if="cart.serviceFeeAmount > 0" class="flex justify-between items-center text-[10px] font-bold  tracking-widest text-indigo-100">
              <span class="flex items-center gap-1.5">
                Xizmat  <span class="bg-white/20 px-1 rounded text-[8px]">{{ cart.serviceFeePercent }}%</span>
              </span>
              <span>+ {{ formatPrice(cart.serviceFeeAmount) }}</span>
            </div>

            <div v-if="cart.discountAmount > 0" class="flex justify-between items-center text-[10px] font-bold  tracking-widest text-emerald-300">
              <span class="flex items-center gap-1.5">
                Chegirma <span class="bg-emerald-400/20 px-1 rounded text-[8px]">{{ cart.discountPercent }}%</span>
              </span>
              <span>- {{ formatPrice(cart.discountAmount) }}</span>
            </div>
          </div>
        <div class="relative z-10 flex justify-between items-end">
        
          <div class="space-y-1">
          
            <p class="text-[10px] font-black text-indigo-100/80 uppercase tracking-[0.2em]">Jami to'lov</p>
            <h2 class="text-4xl font-black text-white tracking-tighter">
              {{ formatPrice(grandTotal) }}
            </h2>
          </div>
          <i class="fa-solid fa-receipt text-5xl text-white/10 rotate-12"></i>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex p-1.5 bg-slate-200/50 dark:bg-slate-900 rounded-2xl">
          <button 
            v-for="t in [{id:'single', n:'Tezkor', i:'fa-bolt'}, {id:'mixed', n:'Aralash', i:'fa-layer-group'}]" :key="t.id"
            @click="activeTab = t.id"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
            :class="activeTab === t.id ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-400'"
          >
            <i class="fa-solid" :class="t.i"></i> {{ t.n }}
          </button>
        </div>

        <div v-if="activeTab === 'single'" class="grid grid-cols-5 gap-2 fade-in">
          <button 
            v-for="(val, key) in {cash: 'Naqd', card: 'Karta', terminal: 'Term', debt: 'Qarz', balance: 'Balans'}" :key="key"
            v-show="key !== 'balance' || customerBalance > 0"
            @click="selectedMethod = key"
            class="flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all"
            :class="selectedMethod === key ? 'bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'"
          >
            <i class="fa-solid text-sm" :class="{
              'fa-money-bill-1': key==='cash', 'fa-credit-card': key==='card', 
              'fa-print': key==='terminal', 'fa-handshake': key==='debt', 'fa-wallet': key==='balance'
            }"></i>
            <span class="text-[8px] font-black uppercase">{{ val }}</span>
          </button>
        </div>

        <div v-if="activeTab === 'mixed'" class="grid grid-cols-2 gap-3 fade-in">
          <div v-for="f in [
            {k:'cash', l:'Naqd', i:'fa-wallet', c:'indigo'}, 
            {k:'card', l:'Karta', i:'fa-credit-card', c:'blue'}, 
            {k:'terminal', l:'Term', i:'fa-print', c:'slate'}, 
            {k:'debt', l:'Nasiya', i:'fa-clock', c:'rose'},
            {k:'balance', l:'Balans', i:'fa-vault', c:'amber'}
          ]" :key="f.k" 
            v-show="f.k !== 'balance' || customerBalance > 0"
            class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            <div class="flex items-center justify-between mb-1">
              <label class="text-[9px] font-black uppercase text-slate-400">{{ f.l }}</label>
              <span v-if="f.k === 'balance'" class="text-[8px] font-bold text-amber-500">{{ formatPrice(customerBalance) }}</span>
            </div>
            <Input 
              v-model="model_payment[f.k]" 
              type="number" 
              @focus="$event.target.select()"
              clearable
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full px-2">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500"
               :class="remaining <= 0 ? 'bg-emerald-500 border-emerald-500 text-white rotate-[360deg]' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-300'">
            <i class="fa-solid" :class="remaining <= 0 ? 'fa-check' : 'fa-receipt'"></i>
          </div>

          <div class="flex flex-col">
            <span class="text-[9px] font-black uppercase tracking-widest" :class="surplus > 0 ? 'text-emerald-500' : 'text-slate-400'">
              {{ surplus > 0 ? "Mijoz balansiga (Qaytim)" : "Qoldiq" }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-sm font-black tracking-tighter" :class="surplus > 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'">
                {{ surplus > 0 ? `+ ${formatPrice(surplus)}` : formatPrice(remaining) }}
              </span>
              <div v-if="remaining > 0" class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
            </div>
          </div>
        </div>

        <Button 
          @click="onFinish"
          :variant="isReady ? 'primary' : 'disabled'"
          leftIcon="fas fa-check"
          size="sm"
          :class="isReady ? 'shadow-indigo-200 scale-105' : 'opacity-30'"
        >
          <span class="font-black uppercase tracking-widest text-xs">
            {{ isReady ? 'Yakunlash' : 'To\'ldiring' }}
          </span>
        </Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>