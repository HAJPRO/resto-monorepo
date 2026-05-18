<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617]">
    <Header 
      title="Buyurtmalar" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="ID, taom yoki izoh..."
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
            :variant="selectedRange ? 'primary' : 'primary'" 
          />
        </div>
      </template>
    </Header>

    <ion-content :fullscreen="true" class="ion-padding" id="order-content">
      <GlobalRefresher @refresh="refreshOrders" />
      
      <div class="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-2xl mb-4 gap-1 sticky top-0 z-20 backdrop-blur-md border border-white/10">
        <button 
          v-for="tab in orderTypes" 
          :key="tab.id"
          @click="handleTabChange(tab.id)"
          :class="[
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all duration-300 relative',
            selectedType === tab.id 
              ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:bg-white/50 dark:hover:bg-white/5'
          ]"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
          
          <span 
            v-if="orderCounts[tab.id] > 0"
            :class="[
              'ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold min-w-[18px] text-center transition-colors duration-300',
              selectedType === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            ]"
          >
            {{ orderCounts[tab.id] }}
          </span>
        </button>
      </div>
      
      <LoadingState v-if="loading && !orders.length" />
      
      <EmptyState 
        v-else-if="filteredOrders.length === 0" 
        title="Buyurtmalar topilmadi" 
        :description="searchQuery ? 'Qidiruv bo\'yicha natija yo\'q' : 'Tanlangan vaqt oralig\'ida buyurtmalar mavjud emas.'"
      />

      <div v-else class="space-y-6 pb-10 mt-3">
        <div 
          v-for="(order, index) in filteredOrders" 
          :key="order._id" 
          class="animate-slide-up"
          :style="{ animationDelay: `${(index % 10) * 0.1}s` }"
        >
          <div class="bg-white dark:bg-slate-900 rounded-[35px] p-5 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden">
            <div :class="['absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-5', order.orderType === 'takeaway' ? 'bg-rose-500' : 'bg-indigo-500']"></div>

            <div class="flex justify-between items-start mb-5 relative z-10">
              <div class="flex items-center gap-3">
                <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center text-lg', order.orderType === 'takeaway' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600']">
                  <i :class="order.orderType === 'takeaway' ? 'fas fa-bag-shopping animate-bounce' : 'fas fa-chair animate-bounce'"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black dark:text-white uppercase tracking-tighter"> 
                    № : {{ order.tableId?.number || "Saboy" }}
                  </h3>
                  <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{{ formatDate(order.createdAt) }}</p>
                </div>
              </div>
              <div :class="['status-badge', getStatusClass(order.status)]">
                <i :class="getStatusIcon(order.status)"></i>
                <span>{{ getStatusLabel(order.status) }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-5 border-b border-slate-50 dark:border-white/5 pb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                  <i class="fas fa-user-tie"></i>
                </div>
                <div class="truncate">
                  <p class="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Ofitsiant</p>
                  <p class="text-[11px] font-bold dark:text-slate-200 truncate">{{ order.staffId?.firstname }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 border-l border-slate-50 dark:border-white/5 pl-4">
                <div class="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-xs text-emerald-600">
                  <i class="fas fa-user text-[10px]"></i>
                </div>
                <div class="truncate">
                  <p class="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Mijoz</p>
                  <p class="text-[11px] font-bold dark:text-slate-200 truncate">{{ order.customerId?.name || 'Mehmon' }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-4 mb-6">
              <div 
                v-for="item in order.items" 
                :key="item.name" 
                class="group flex justify-between items-start bg-slate-50/50 dark:bg-white/5 p-3 rounded-2xl border border-transparent transition-all"
              >
                <div class="flex gap-3">
                  <div class="flex flex-col items-center justify-center min-w-[36px] h-[36px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-white/10">
                    <span class="text-[12px] font-black text-indigo-600">{{ item.quantity }}</span>
                    <span class="text-[8px] font-bold text-slate-400 uppercase">ta</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-tight">{{ item.name }}</span>
                    <span class="text-[10px] font-medium text-slate-400">{{ (item.price || 0).toLocaleString() }}</span>
                  </div>
                </div>
                <span class="text-[13px] font-black text-slate-700 dark:text-slate-200">
                  {{ (item.subtotal || (item.quantity * item.price)).toLocaleString() }}
                </span>
              </div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800/40 rounded-[25px] p-4 space-y-2 mb-5">
              <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Buyurtma</span>
                <span>{{ (order.subtotal || 0).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                <span>Xizmat ({{ order.serviceFeePercent || 0 }}%)</span>
                <span>+{{ (order.serviceFeeAmount || 0).toLocaleString() }}</span>
              </div>
               <div class="flex justify-between text-[10px] font-black text-red-500 uppercase tracking-widest">
                <span>Chegirma ({{ discountPercent || 0}}%)</span>
                <span>-{{ (order.discountAmount || 0).toLocaleString() }}</span>
              </div>
            </div>

            <div class="flex justify-between items-end">
              <div>
                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">To'lov miqdori</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-black dark:text-white tracking-tighter">{{ (order.finalTotal || 0).toLocaleString() }}</span>
                  <span class="text-[10px] font-black text-indigo-600 uppercase">UZS</span>
                </div>
              </div>
              <div class="flex gap-2">
                <Button @click="handlePrint(order)" icon="fas fa-print" variant="secondary" class="!rounded-2xl !w-12 !h-12" />
                <Button v-if="order.status === 'pending'" @click="store_tabel.PaymentModalAction(order)" icon="fas fa-arrow-right" class="!rounded-2xl !px-6 !h-12 shadow-lg shadow-indigo-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!store_order.hasMore">
        <ion-infinite-scroll-content loading-spinner="crescent" loading-text="Yuklanmoqda..."></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <PaymentModal />
    <Footer class="z-50" />
    
    <div v-if="datePic" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <DateRangePicker 
        :initialRange="selectedRange"
        @selected="handleDateFilter" 
        @close="datePic = false" 
      />
    </div>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { IonPage, IonContent, IonInfiniteScroll, IonInfiniteScrollContent } from "@ionic/vue";
import { OrderStore, TabelStore,PrinterStore } from "../../stores/index.store";
import { storeToRefs } from "pinia";
import { Button, Header, GlobalRefresher, EmptyState, LoadingState, DateRangePicker } from "../../UI/UI";
import Footer from "../../partials/Footer.vue";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import PaymentModal from "../Tabel/PaymentModal.vue";

const store_order = OrderStore();
const store_tabel = TabelStore();
const store_printer = PrinterStore();
const { orders, loading } = storeToRefs(store_order);

const searchQuery = ref("");
const datePic = ref(false);
const selectedRange = ref(null);
const selectedType = ref("all");

const orderTypes = [
  { id: 'all', label: 'Hammasi', icon: 'fas fa-list' },
  { id: 'table', label: 'Zalda', icon: 'fas fa-chair' },
  { id: 'takeaway', label: 'Saboy', icon: 'fas fa-bag-shopping' }
];

// Dastlabki yuklash va Refresh
const refreshOrders = async (event) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  await store_order.GetAll(true, selectedRange.value); 
  if (event) event.target.complete();
};

// Sana filtri
const handleDateFilter = async (range) => {
  await Haptics.impact({ style: ImpactStyle.Medium });
  selectedRange.value = range;
  datePic.value = false;
  await store_order.GetAll(true, range);
};

// Filtrni tozalash
const clearFilter = async () => {
  selectedRange.value = null;
  await store_order.GetAll(true);
};

// Tab almashtirish
const handleTabChange = async (id) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  selectedType.value = id;
};

// Pagination (Load More)
const loadMore = async (event) => {
  await store_order.GetAll(false, selectedRange.value);
  event.target.complete();
};

// Filtr va Qidiruv mantiqi
const filteredOrders = computed(() => {
  // orders.value massiv ekanligiga 100% ishonch hosil qilamiz
  const baseOrders = Array.isArray(orders.value) ? orders.value : [];
  
  let result = [...baseOrders];

  if (selectedType.value !== 'all') {
    result = result.filter(o => o.orderType === selectedType.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(o => 
      o._id.toLowerCase().includes(q) || 
      o.staffId?.firstname?.toLowerCase().includes(q) ||
      o.items?.some(item => item.name.toLowerCase().includes(q))
    );
  }
  return result;
});

// Dinamik Statuslar
const getStatusLabel = (s) => ({ pending: 'Kutilmoqda', active: 'Jarayonda', completed: 'Yakunlandi', cancelled: 'Bekor', debt: 'Qarz' }[s] || s);
const getStatusIcon = (s) => ({ pending: 'fas fa-clock', active: 'fas fa-fire', completed: 'fas fa-check-double', cancelled: 'fas fa-ban', debt: 'fas fa-handshake' }[s] || 'fas fa-info');
const getStatusClass = (s) => `status-${s}`;

// Buyurtmalar soni
const orderCounts = computed(() => ({
  all: orders.value?.length || 0,
  table: orders.value?.filter(o => o.orderType === 'table').length || 0,
  takeaway: orders.value?.filter(o => o.orderType === 'takeaway').length || 0
}));

const formatDate = (d) => d ? new Date(d).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '';
const handlePrint = (order) => {
  store_printer.handlePrint(order);
};

onMounted(() => store_order.GetAll(true));
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.status-badge { @apply inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm; }
.status-pending { @apply bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20; }
.status-active { @apply bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20; }
.status-completed { @apply bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20; }
.status-cancelled { @apply bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20; }
.status-debt { @apply bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20; }

ion-content { --background: transparent; }
</style>