<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { TransactionStore } from '../../stores/index.store'; 
import { Button, Header, GlobalRefresher, EmptyState } from "../../UI/UI";
import { vibrate } from "../../utils/index.util";
// import dayjs from 'dayjs'; // Sanani chiroyli formatlash uchun

const store = TransactionStore();
const { transactions, loading } = storeToRefs(store);
const searchQuery = ref("");

// Qidiruv mantiqi (Mijoz ismi yoki izoh bo'yicha)
const filteredTransactions = computed(() => {
  if (!searchQuery.value) return transactions.value;
  const q = searchQuery.value.toLowerCase();
  return transactions.value.filter(t => 
    t.customerId?.name?.toLowerCase().includes(q) || 
    t.description?.toLowerCase().includes(q) ||
    t.type?.toLowerCase().includes(q)
  );
});

// Tranzaksiya turlariga qarab vizual stillar
const getTrxStyle = (type) => {
  const styles = {
    payment: { 
      icon: 'fa-solid fa-arrow-down-left', 
      bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100', 
      text: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600',
      dotBg: 'bg-emerald-600',
      prefix: '+' 
    },
    surplus: { 
      icon: 'fa-solid fa-wallet', 
      bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100', 
      text: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
      dotBg: 'bg-blue-600',
      prefix: '+' 
    },
    debt: { 
      icon: 'fa-solid fa-arrow-up-right', 
      bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-100', 
      text: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600',
      dotBg: 'bg-rose-600',
      prefix: '-' 
    },
    refund: { 
      icon: 'fa-solid fa-rotate-left', 
      bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100', 
      text: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
      dotBg: 'bg-amber-600',
      prefix: '-' 
    }
  };
  return styles[type] || styles.payment;
};

const getTrxLabel = (type) => {
  const labels = {
    payment: 'To\'lov',
    surplus: 'Qaytim',
    debt: 'Nasiya',
    refund: 'Qaytarildi'
  };
  return labels[type] || type;
};

const formatPrice = (val) => new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
// const formatDate = (date) => dayjs(date).format('DD.MM.YYYY · HH:mm');

const refreshData = async (event) => {
  vibrate('light');
  await store.GetAll(true);
  if (event) event.target.complete();
};

const handleFilter = () => {
  vibrate('medium');
  // Bu yerda filtr ochish mantiqi (masalan, Action Sheet)
};

onMounted(() => store.GetAll());
</script>
<template>
  <ion-page class="bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <Header 
      title="Tranzaksiyalar" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="Mijoz yoki izoh bo'yicha qidirish..."
    >
      <template #actions>
        <Button @click="handleFilter" icon="fas fa-filter" size="sm" class="!bg-slate-100 !text-slate-600 dark:!bg-slate-800 dark:!text-slate-400" />
      </template>
    </Header>

    <ion-content :fullscreen="true" class="ion-padding --background: transparent">
      <GlobalRefresher @refresh="refreshData" />

      <div v-if="loading && transactions.length === 0" class="space-y-4 px-1">
        <div v-for="i in 5" :key="i" class="h-32 w-full bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse border border-slate-50 dark:border-slate-800"></div>
      </div>

      <div v-else-if="filteredTransactions.length > 0" class="space-y-4 pb-24 px-3 mt-2">
        <div 
          v-for="(trx, index) in filteredTransactions" 
          :key="trx._id"
          class="group relative bg-white dark:bg-slate-900 rounded-[2.2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col gap-3 active:scale-[0.98] transition-all duration-300 animate-slide-up"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="flex items-center gap-4">
            <div class="shrink-0">
              <div :class="[
                'w-14 h-14 rounded-[1.2rem] flex items-center justify-center border shadow-sm transition-colors',
                getTrxStyle(trx.type).bg
              ]">
                <i :class="[getTrxStyle(trx.type).icon, 'text-xl']"></i>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                    {{ trx.customerId?.name || 'Umumiy Mijoz' }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {{ (trx.createdAt) }}
                    </span>
                  </div>
                </div>
                
                <div class="text-right">
                  <p :class="['text-base font-black', getTrxStyle(trx.type).text]">
                    {{ getTrxStyle(trx.type).prefix }}{{ formatPrice(trx.amount) }}
                  </p>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">
                    {{ trx.method }} orqali
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/50">
            <div class="flex items-center gap-2 max-w-[70%]">
              <i class="fa-solid fa-quote-left text-[10px] opacity-40 text-slate-500"></i>
              <span class="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate italic">
                {{ trx.description || 'Izoh qoldirilmagan' }}
              </span>
            </div>

            <div :class="['flex items-center gap-1.5 px-3 py-1 rounded-full', getTrxStyle(trx.type).badgeBg]">
              <div :class="['w-1.5 h-1.5 rounded-full', getTrxStyle(trx.type).dotBg]"></div>
              <span class="text-[10px] font-black uppercase tracking-wider">
                {{ getTrxLabel(trx.type) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else title="Tranzaksiyalar topilmadi" icon="fa-solid fa-file-invoice-dollar" />
    </ion-content>
  </ion-page>
</template>