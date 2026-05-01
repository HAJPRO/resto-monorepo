<template>
  <ion-page class="bg-[#f8fafc] dark:bg-[#020617]">
    <Modal />
    
    <Header 
      title="Stollar" 
      searchable 
      v-model="searchQuery"
      searchPlaceholder="Stol raqami bo'yicha izlash..."
    >
      <template #actions>
        <BaseTabs 
          v-model="activeStatus" 
          :tabs="statusFilters"
          @change="onCategoryChange"
        />

        <Button 
          @click="store.ModalAction({action:'create'})" 
          icon="fas fa-plus" 
          size="sm" 
        />
      </template>
    </Header>

    <ion-content :fullscreen="true">
      <GlobalRefresher @refresh="refreshData" />
      
      <div class="max-w-[1600px] mx-auto px-4 py-8 pb-32">
        <div v-if="store.loading && !tabels.length" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div v-for="i in 8" :key="i" class="h-52 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[32px]"></div>
        </div>

        <div v-else-if="filteredTables.length > 0" 
             class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          
       <div 
  v-for="table in filteredTables" 
  :key="table._id"
  :class="[
    'group relative flex flex-col justify-between p-5 min-h-[240px] rounded-[35px] transition-all duration-500 cursor-pointer active:scale-95 overflow-hidden border-2',
    getStatusTheme(table).bgClass,
    getStatusTheme(table).borderClass
  ]"
>
  <div :class="['absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.05] transition-transform duration-700 group-hover:scale-150', getStatusTheme(table).dot]"></div>

  <div class="flex justify-between items-center z-10 w-full">
    <span class="text-[9px] font-black opacity-40 uppercase tracking-[1.5px] leading-none">
      {{ table.zoneId ?  table.zoneId.name : `No'malum zona` }}
    </span>
    
    <div class="flex items-center gap-2">
      <div v-if="getActiveBookingsCount(table) > 0" class="flex items-center gap-1 px-1.5 py-0.5 bg-white/50 dark:bg-slate-800/50 rounded-lg">
        <i class="fa-solid fa-calendar-check text-[8px] text-indigo-500"></i>
        <span class="text-[9px] font-black text-slate-700 dark:text-slate-200">{{ getActiveBookingsCount(table) }}</span>
      </div>
      
      <ActionMenu 
        :items="getTableActions(table)" 
        @click.stop 
        minimal 
        direction="horizontal"
        class="-mr-2"
      />
    </div>
  </div>

  <div class="flex flex-col gap-1 z-10">
    <h3 :class="['text-md font-black tracking-tighter leading-none mb-1', getStatusTheme(table).text]">
      {{ table.number }}
    </h3>

    <div v-if="table.cartId" class="space-y-1">
      <div v-if="table.cartId.staffId" class="flex items-center gap-1.5">
        <div :class="['w-4 h-4 rounded-full flex items-center justify-center text-[7px] bg-white/30 shadow-sm', getStatusTheme(table).text]">
          <i class="fas fa-user-tie"></i>
        </div>
        <span :class="['text-[11px] font-bold tracking-tight truncate max-w-[100px]', getStatusTheme(table).text]">
          {{ table.cartId.staffId.firstname }}
        </span>
      </div>

      <div v-if="table.cartId.customerId" class="flex items-center gap-1.5">
        <div class="w-4 h-4 rounded-full flex items-center justify-center text-[7px] bg-emerald-500/10 text-emerald-600 shadow-sm">
          <i class="fas fa-user"></i>
        </div>
        <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
          {{ table.cartId.customerId.name }}
        </span>
      </div>
    </div>

    <div v-else>
      <span class="text-[10px] font-bold text-slate-400/60 uppercase tracking-tighter italic">Stol bo'sh</span>
    </div>
  </div>

 <div class="flex flex-col items-center justify-center py-2 z-10 min-h-[80px]">
  
  <div v-if="getActiveBookingTimer(table)" class="flex flex-col items-center bg-rose-500/10 dark:bg-rose-500/20 px-4 py-2 rounded-[20px] border border-rose-500/20 animate-in zoom-in">
    <div class="flex items-center gap-1.5 mb-1">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
      </span>
      <span class="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-widest">Kutilmoqda</span>
    </div>
    <div class="text-2xl font-black font-mono tracking-tighter text-rose-600 dark:text-rose-400">
      {{ getActiveBookingTimer(table) }}
    </div>
    <div class="text-[8px] font-bold text-rose-500/70 uppercase">daqiqadan so'ng</div>
  </div>

  <div v-else-if="table.status === '2'" class="flex flex-col items-center text-center">
    <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center mb-1 shadow-sm transition-transform group-hover:scale-110', getStatusTheme(table).iconBox]">
      <i class="fa-solid fa-bookmark text-xl"></i>
    </div>
    <div v-if="table.bookings?.[0]" class="flex flex-col">
       <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
         {{ new Date(table.bookings[0].booking_time).getHours() }}:{{ String(new Date(table.bookings[0].booking_time).getMinutes()).padStart(2, '0') }}
       </span>
       <span class="text-[9px] font-bold opacity-50 truncate max-w-[80px]">
         {{ table.bookings[0].client_name }}
       </span>
    </div>
  </div>

<button 
  @click.stop="getStatusConfig(table).action()"
  class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
>
  <ion-icon 
    :icon="getStatusConfig(table).icon" 
    :class="getStatusConfig(table).color"
    class="text-lg"
  />
</button>
</div>

<div v-if="table.status === '2' && !table.cartId" class="flex items-center justify-between w-full pt-2 border-t border-indigo-500/5">
  <div class="flex flex-col">
    <span class="text-[8px] font-bold opacity-40 uppercase">Mehmonlar</span>
    <div class="flex items-center gap-1">
      <i class="fa-solid fa-user-group text-[9px] text-indigo-400"></i>
      <span class="text-[11px] font-black text-indigo-600">{{ table.bookings?.[0]?.guests_count || table.capacity }}</span>
    </div>
  </div>
  
  <button 
    @click.stop="handleStartOrder(table)"
    class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-90 shadow-md shadow-indigo-200 dark:shadow-none"
  >
    Ochish
  </button>
</div>

  <div class="flex items-end justify-between z-10 pt-2 border-t border-slate-500/5">
    <div>
      <div v-if="table.cartId?.items?.length > 0">
        <p class="text-[8px] font-bold opacity-40 uppercase tracking-wider mb-0.5">Jami hisob</p>
        <p :class="['text-[13px] font-black tracking-tight', getStatusTheme(table).text]">
          {{ table.cartId?.finalTotal?.toLocaleString() }} 
          <span class="text-[9px] font-medium opacity-60">UZS</span>
        </p>
      </div>
      <div v-else class="flex items-center gap-1 text-slate-400">
        <i class="fa-solid fa-users text-[9px]"></i>
        <span class="text-[10px] font-bold">{{ table.capacity || 4 }}</span>
      </div>
    </div>

    <button 
  @click="store.PaymentModalAction(table)"
  class="relative flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm active:scale-90 transition-all duration-200 group"
>
 
  <i class="fa-solid fa-file-invoice-dollar text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors text-md"></i>
  
  <div class="absolute inset-0 bg-slate-100 dark:bg-white/5 opacity-0 group-active:opacity-100 rounded-2xl transition-opacity"></div>
</button>
  </div>
</div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-20">
          <EmptyState title="Stollar topilmadi" description="Qidiruv mezonlariga mos keladigan stol mavjud emas." />
        </div>
      </div>
    </ion-content>

    <div v-if="isCartOpen && selectedTable"> 
      <CartModal :tableInfo="selectedTable" @close="isCartOpen = false" />
    </div>
    <TableBookingModal />
    <Footer />
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { storeToRefs } from "pinia";

import { TabelStore, MenuStore } from "../../stores/index.store";
import { Button, BaseTabs, Header, GlobalRefresher, ActionMenu, EmptyState, LoadingState } from "../../UI/UI";
import Footer from '../../partials/Footer.vue';
import Modal from '../../components/Tabel/ActionModal.vue';
import CartModal from '../../components/Menu/Cart.vue';
import TableBookingModal from './TableBookingModal.vue';

import { 
  addOutline, cartOutline, bookmarkOutline, walletOutline, constructOutline 
} from 'ionicons/icons';

const router = useRouter();
const store = TabelStore();
const store_menu = MenuStore();
const { tabels } = storeToRefs(store);
const { isCartOpen } = storeToRefs(store_menu);

const searchQuery = ref("");
const activeStatus = ref('all');
const selectedTable = ref(null);
const now = ref(new Date());

let liveInterval = null;
onMounted(() => {
  store.GetAll();
  liveInterval = setInterval(() => { now.value = new Date(); }, 1000);
});

onUnmounted(() => { if (liveInterval) clearInterval(liveInterval); });

const refreshData = async (event) => {
  await store.GetAll();
  if (event) event.target.complete();
};

const getActiveBookingsCount = (table) => {
  if (!table.bookings) return 0;
  return table.bookings.filter(b => new Date(b.booking_time) > now.value).length;
};

const getActiveBookingTimer = (table) => {
  if (!table.bookings?.length) return null;
  const closest = table.bookings
    .map(b => ({
      time: new Date(b.booking_time),
      diff: new Date(b.booking_time).getTime() - now.value.getTime()
    }))
    .filter(b => b.diff > 0 && b.diff <= 3600000) // 1 soat ichida
    .sort((a, b) => a.diff - b.diff)[0];

  if (closest) {
    const min = Math.floor(closest.diff / 60000);
    const sec = Math.floor((closest.diff % 60000) / 1000);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }
  return null;
};

const getStatusTheme = (table) => {
  if (getActiveBookingTimer(table)) {
    return { 
      bgClass: 'bg-rose-50/50 dark:bg-rose-950/10', 
      borderClass: 'border-rose-200 dark:border-rose-900 ring-4 ring-rose-500/5',
      text: 'text-rose-600 dark:text-rose-400',
      iconBox: 'bg-rose-100 dark:bg-rose-900 text-rose-600',
      dot: 'bg-rose-500'
    };
  }

  const themes = {
    '0': { // Bo'sh
      bgClass: 'bg-white dark:bg-slate-900', 
      borderClass: 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 shadow-sm',
      text: 'text-slate-900 dark:text-white',
      iconBox: 'bg-slate-50 dark:bg-slate-800 text-slate-400',
      dot: 'bg-emerald-500'
    },
    '1': { // Band
      bgClass: 'bg-rose-50/30 dark:bg-rose-500/5', 
      borderClass: 'border-rose-100 dark:border-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      iconBox: 'bg-rose-100/50 dark:bg-rose-500/20 text-rose-500',
      dot: 'bg-rose-500'
    },
    '2': { // Bron
      bgClass: 'bg-indigo-50/30 dark:bg-indigo-500/5', 
      borderClass: 'border-indigo-100 dark:border-indigo-500/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      iconBox: 'bg-indigo-100/50 dark:bg-indigo-500/20 text-indigo-500',
      dot: 'bg-indigo-500'
    },
    '3': { // Hisob kutilmoqda
      bgClass: 'bg-amber-50/30 dark:bg-amber-500/5', 
      borderClass: 'border-amber-100 dark:border-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      iconBox: 'bg-amber-100/50 dark:bg-amber-500/20 text-amber-500',
      dot: 'bg-amber-500'
    }
  };
  return themes[table.status] || themes['0'];
};

const getStatusConfig = (table) => {
  const configs = {
    '0': { 
      icon: addOutline, 
      label: 'Yangi',
      color: 'text-green-500' 
    },
    '1': { 
      icon: cartOutline, 
      label: 'Savat',
      color: 'text-red-500' 
    },
    '2': { 
      icon: bookmarkOutline, 
      label: 'Band',
      color: 'text-red-500' 
    },
    '3': { 
      icon: walletOutline, 
      label: 'Hisob',
      color: 'text-indigo-500' 
    }
  };
  
  // Status string yoki number bo'lishi ehtimolini hisobga olamiz
  const current = configs[String(table.status)] || configs['0'];
  
  return {
    ...current,
    // Funksiyani shu yerda bog'laymiz
    action: () => handleTableClick(table)
  };
};

const handleTableClick = async (table) => {
  // 1. Vibratsiya (Haptic feedback)
  await Haptics.impact({ style: ImpactStyle.Light });
  
  // 2. Mahalliy tanlangan stolni yangilash
  selectedTable.value = table;

  // Bo'sh stol (Status 0)
  if (table.status === '0' || table.status === 0) {
    store_menu.clearCart(); // Oldingi qoldiqlarni tozalash
    store_menu.selectedTable = table._id; // Butun obyektni saqlash ma'qul (ID: table._id)
    router.push({ name: 'menu' });
  } 
  // Band, Savat yoki Hisob holatidagi stol
  else {
    // MUHIM: table.cartId ichida ma'lumot borligini tekshiramiz
    if (table.cartId) {
      await store_menu.setEditOrder(table.cartId);
      isCartOpen.value = true;
    } else {
      // Agar status 0 dan farqli bo'lsa-yu, cartId bo'lmasa (xatolik holati)
      console.error("Buyurtma ma'lumotlari topilmadi");
      toast.error("Buyurtma topilmadi");
    }
  }
};

const getTableActions = (table) => [
  { label: 'Tahrirlash', icon: 'fa-solid fa-pen-to-square', onClick: () => store.ModalAction({id:table._id, action:'edit'}) },
  { label: 'Hisob berish', icon: 'fa-solid fa-calculator', onClick: () => store.PaymentModalAction(table)},
  { label: 'Bron qo\'shish', icon: 'fa-solid fa-calendar-plus', onClick: () => store.BookingModalAction(table, 'booked') },
  { label: 'Bo\'shatish', icon: 'fa-solid fa-rotate-left', variant: 'warning', onClick: () => store.Create({_id:table._id, status:'0', cartId: null}, 'edit') },
  // --- Yangi qo'shilgan maydonlar ---
  { label: 'Chek berish', icon: 'fa-solid fa-print', onClick: () => store.PrintCheck(table._id) }, // Chek chiqarish funksiyasi
  { label: 'Bekor qilish', icon: 'fa-solid fa-ban', variant: 'danger', onClick: () => store.Create({_id:table._id, status:'4', cartId: null}, 'edit') }, // Status '4' odatda bekor qilingan deb olinadi
  { label: 'O\'chirish', icon: 'fa-solid fa-trash-can', variant: 'danger', onClick: () => store.DeleteAction(table._id) }, // O'chirish amali
  // ---------------------------------

  
];

const filteredTables = computed(() => {
  if (!tabels.value) return [];
  return tabels.value.filter(t => {
    const matchStatus = activeStatus.value === 'all' || t.status === activeStatus.value;
    const matchSearch = String(t.number).toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchStatus && matchSearch;
  });
});

const statusFilters = [
  { id: 'all', label: 'Barchasi', icon: 'fas fa-th-large' },
  { id: '0', label: 'Bo\'sh', icon: 'fas fa-door-open' },
  { id: '1', label: 'Band', icon: 'fas fa-user-clock' },
  { id: '2', label: 'Bron', icon: 'fas fa-bookmark' }
];

const onCategoryChange = (id) => {
  activeStatus.value = id;
  Haptics.impact({ style: ImpactStyle.Medium });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>