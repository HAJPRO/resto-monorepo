<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617]">
    <Header 
      title="Kirimlar" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="ID, mahsulot yoki kontragent..."
    >
      <template #actions>
        <div class="flex gap-2">
          <Button 
            v-if="selectedRange" 
            @click="clearFilter" 
            icon="fas fa-times" 
            size="sm" 
            variant="danger" 
            class="scale-90"
          />
          <Button 
            @click="datePic = !datePic" 
            icon="fas fa-calendar-alt" 
            size="sm" 
            variant="primary" 
          />
        </div>
      </template>
    </Header>

    <ion-content :fullscreen="true" class="ion-padding">
      <GlobalRefresher @refresh="refreshInserts" />
      
      <!-- To'lov holati bo'yicha Tablar -->
      <div class="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-2xl mb-4 gap-1 sticky top-0 z-20 backdrop-blur-md border border-white/10">
        <button 
          v-for="tab in insertTabs" 
          :key="tab.id"
          @click="selectedStatus = tab.id"
          :class="[
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all duration-300',
            selectedStatus === tab.id 
              ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:bg-white/50 dark:hover:bg-white/5'
          ]"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>
      
      <LoadingState v-if="loading && !inserts.length" />
      
      <EmptyState 
        v-else-if="filteredInserts.length === 0" 
        title="Kirimlar topilmadi" 
        :description="searchQuery ? 'Qidiruv bo\'yicha natija yo\'q' : 'Hozircha hech qanday kirim qilinmagan.'"
      />

      <div v-else class="space-y-6 pb-10 mt-3">
        <div 
          v-for="(insert, index) in filteredInserts" 
          :key="insert._id" 
          class="animate-slide-up"
          :style="{ animationDelay: `${(index % 10) * 0.1}s` }"
        >
          <div class="bg-white dark:bg-slate-900 rounded-[35px] p-5 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden">
            <!-- Background bezak -->
            <div class="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-5 bg-emerald-500"></div>

            <div class="flex justify-between items-start mb-5 relative z-10">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                  <i class="fas fa-truck-loading animate-pulse"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black dark:text-white uppercase tracking-tighter"> 
                    {{ insert.docNumber || 'Kirim' }}
                  </h3>
                  <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{{ formatDate(insert.createdAt) }}</p>
                </div>
              </div>
              <div :class="['status-badge', getStatusClass(insert.paymentType)]">
                <i :class="getStatusIcon(insert.paymentType)"></i>
                <span>{{ getStatusLabel(insert.paymentType) }}</span>
              </div>
            </div>

            <!-- Kontragent va Ombor ma'lumotlari -->
            <div class="grid grid-cols-2 gap-4 mb-5 border-b border-slate-50 dark:border-white/5 pb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                  <i class="fas fa-handshake"></i>
                </div>
                <div class="truncate">
                  <p class="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Yetkazib beruvchi</p>
                  <p class="text-[11px] font-bold dark:text-slate-200 truncate">{{ insert.counterpartyId?.name || 'Noma\'lum' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 border-l border-slate-50 dark:border-white/5 pl-4">
                <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-xs text-blue-600">
                  <i class="fas fa-warehouse text-[10px]"></i>
                </div>
                <div class="truncate">
                  <p class="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Ombor</p>
                  <p class="text-[11px] font-bold dark:text-slate-200 truncate">{{ insert.warehouseId || 'Asosiy ombor' }}</p>
                </div>
              </div>
            </div>

            <!-- Mahsulotlar Ro'yxati -->
            <div class="space-y-3 mb-6">
              <div 
                v-for="item in insert.items" 
                :key="item._id" 
                class="flex justify-between items-center bg-slate-50/50 dark:bg-white/5 p-3 rounded-2xl border border-transparent"
              >
                <div class="flex gap-3 items-center">
                  <div class="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-white/10 text-center min-w-[40px]">
                    <span class="text-[11px] font-black text-emerald-600">{{ item.quantity }}</span>
                    <span class="text-[8px] font-bold text-slate-400 ml-1 uppercase">{{ item.unit || 'ta' }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-bold text-slate-700 dark:text-slate-200 leading-tight">{{ item.productId?.name || item.name }}</span>
                    <span class="text-[9px] font-medium text-slate-400">Tannarx: {{ (item.costPrice || 0).toLocaleString() }}</span>
                  </div>
                </div>
                <span class="text-[12px] font-black text-slate-700 dark:text-slate-200">
                  {{ (item.totalCost || (item.quantity * item.costPrice)).toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- Jami summa -->
            <div class="flex justify-between items-end">
              <div>
                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Jami Kirim Summasi</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-black dark:text-white tracking-tighter text-emerald-600">
                    {{ (insert.totalCostAmount || 0).toLocaleString() }}
                  </span>
                  <span class="text-[10px] font-black text-slate-400 uppercase">UZS</span>
                </div>
              </div>
              <div class="flex gap-2">
                <Button @click="handlePrint(insert)" icon="fas fa-file-invoice" variant="secondary" class="!rounded-2xl !w-12 !h-12" />
                <Button icon="fas fa-eye" variant="primary" class="!rounded-2xl !px-6 !h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!store_insert.hasMore">
        <ion-infinite-scroll-content loading-spinner="crescent"></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { IonPage, IonContent, IonInfiniteScroll, IonInfiniteScrollContent } from "@ionic/vue";
import { InsertStore } from "../../../stores/index.store"; // Kirimlar uchun Store bo'lishi kerak
import { storeToRefs } from "pinia";
import { Button, Header, GlobalRefresher, EmptyState, LoadingState, DateRangePicker } from "../../../UI/UI";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const store_insert = InsertStore();
const { inserts, loading } = storeToRefs(store_insert);

const searchQuery = ref("");
const datePic = ref(false);
const selectedRange = ref(null);
const selectedStatus = ref("all");

const insertTabs = [
  { id: 'all', label: 'Hammasi', icon: 'fas fa-layer-group' },
  { id: 'cash', label: 'Naqd', icon: 'fas fa-money-bill-wave' },
  { id: 'debt', label: 'Nasiya', icon: 'fas fa-hand-holding-usd' },
  { id: 'mixed', label: 'Aralash', icon: 'fas fa-pie-chart' }
];

const refreshInserts = async (event) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  await store_insert.GetAll(true, selectedRange.value); 
  if (event) event.target.complete();
};

const handleDateFilter = async (range) => {
  selectedRange.value = range;
  datePic.value = false;
  await store_insert.GetAll(true, range);
};

const clearFilter = async () => {
  selectedRange.value = null;
  await store_insert.GetAll(true);
};

const filteredInserts = computed(() => {
  let result = Array.isArray(inserts.value) ? [...inserts.value] : [];

  if (selectedStatus.value !== 'all') {
    result = result.filter(i => i.paymentType === selectedStatus.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(i => 
      i.docNumber?.toLowerCase().includes(q) || 
      i.counterpartyId?.name?.toLowerCase().includes(q) ||
      i.items?.some(item => item.productId?.name?.toLowerCase().includes(q))
    );
  }
  return result;
});

// Statuslar mantiqi
const getStatusLabel = (s) => ({ cash: 'Naqd', card: 'Plastik', debt: 'Nasiya', mixed: 'Aralash', unpaid: 'To\'lanmagan' }[s] || s);
const getStatusIcon = (s) => ({ cash: 'fas fa-money-bill', card: 'fas fa-credit-card', debt: 'fas fa-user-clock', mixed: 'fas fa-random', unpaid: 'fas fa-exclamation-circle' }[s] || 'fas fa-info');
const getStatusClass = (s) => `status-${s}`;

const formatDate = (d) => d ? new Date(d).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }) : '';
const handlePrint = (i) => console.log("Printing Insert:", i.docNumber);
const loadMore = async (event) => {
  await store_insert.GetAll(false, selectedRange.value);
  event.target.complete();
};

onMounted(() => store_insert.GetAll(true));
</script>

<style scoped>
/* Orders bilan bir xil animatsiyalar */
.animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.status-badge { @apply inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm; }
.status-cash { @apply bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20; }
.status-card { @apply bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20; }
.status-debt { @apply bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20; }
.status-mixed { @apply bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20; }

ion-content { --background: transparent; }
</style>