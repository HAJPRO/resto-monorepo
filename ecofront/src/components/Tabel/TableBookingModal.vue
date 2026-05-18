<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { TabelStore } from "../../stores/index.store"; 
import { Button, Select, Modal, Input, TextArea } from "../../UI/UI";

const store_tabel = TabelStore();
const { isBookingModal, bookingModel, waitersOptions, tableBookings } = storeToRefs(store_tabel);

const formRefs = ref([]);
const activeTab = ref('form');
const now = ref(new Date());

// --- REAL-TIME TIMER ---
let liveTimer;
onMounted(() => {
  liveTimer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(liveTimer);
});

// --- FORMATTING FUNCTIONS ---

const formatDateTimeFull = (date) => {
  if (!date) return '---';
  return new Date(date).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).replace(/\//g, '.');
};

const formatBookingDetailed = (date) => {
  if (!date) return '---';
  const d = new Date(date);
  const datePart = d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
  const timePart = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  return `${datePart}, ${timePart}`;
};

const getBookingStatusInfo = (booking) => {
  if (booking.status === 'cancelled') return { text: "Bekor qilingan", class: "text-rose-500 bg-rose-50 dark:bg-rose-500/10", percent: 0 };
  if (booking.status === 'completed') return { text: "Yakunlangan", class: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10", percent: 100 };
  
  const target = new Date(booking.booking_time);
  const diff = target - now.value;

  if (diff < 0) return { text: "Vaqti o'tib ketgan", class: "text-slate-400 bg-slate-100 dark:bg-slate-800", percent: 100 };

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (hours > 0) {
    return { text: `${hours}s ${minutes}m ${seconds}s qoldi`, class: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10", percent: 60 };
  }
  return { text: `${minutes}m ${seconds}s qoldi`, class: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 animate-pulse", percent: 90 };
};

const getStatusClass = (status) => {
  const styles = {
    'pending': 'bg-amber-100 text-amber-600 ring-amber-500/20',
    'confirmed': 'bg-emerald-100 text-emerald-600 ring-emerald-500/20',
    'cancelled': 'bg-rose-100 text-rose-600 ring-rose-500/20',
  };
  return styles[status] || 'bg-slate-100 text-slate-500';
};

// --- ACTIONS ---

const SaveBooking = async () => {
  const results = formRefs.value.map(r => r?.validate());
  if (results.includes(false)) return;
  try {
    await store_tabel.CreateBooking(bookingModel.value);
    activeTab.value = 'list';
    await store_tabel.GetTableBookings(bookingModel.value._id);
  } catch (err) { console.error(err); }
};

const CancelBooking = async (id) => {
  if (confirm("Bekor qilinsinmi?")) {
    await store_tabel.UpdateBookingStatus(id, 'cancelled');
    await store_tabel.GetTableBookings(bookingModel.value._id);
  }
};

const ConfirmBooking = async (id) => {
  await store_tabel.UpdateBookingStatus(id, 'confirmed');
  await store_tabel.GetTableBookings(bookingModel.value._id);
};

watch(activeTab, async (val) => {
  if (val === 'list' && bookingModel.value._id) await store_tabel.GetTableBookings(bookingModel.value._id);
});
</script>

<template>
  <Modal v-model="isBookingModal" :title="`Stol #${bookingModel.number} nazorati`" icon="fa-solid fa-utensils">
    <div class="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-6">
      <button @click="activeTab = 'form'" :class="activeTab === 'form' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500'" class="flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-2">
        <i class="fa-solid fa-plus-circle"></i> BAND QILISH
      </button>
      <button @click="activeTab = 'list'" :class="activeTab === 'list' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500'" class="flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-2 relative">
        <i class="fa-solid fa-list-ul"></i> RO'YXAT
        <span v-if="tableBookings?.length" class="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">{{ tableBookings.length }}</span>
      </button>
    </div>

    <div class="pb-24 px-1">
      <div v-if="activeTab === 'form'" class="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <Input :ref="el => formRefs[0] = el" required error="Mijoz ismini kiritish shart!" v-model="bookingModel.client_name" label="Mijoz" placeholder="F.I.Sh" leftIcon="fa-solid fa-user" size="small" />
        <div class="grid grid-cols-2 gap-4">
          <Input  :ref="el => formRefs[1] = el" required error="Mijoz telefon raqamini kiritish shart!" size="small"  v-model="bookingModel.phone" label="Telefon" placeholder="+998" leftIcon="fa-solid fa-phone" />
          <Input size="small" v-model="bookingModel.guests_count" type="number" label="Kishilar" leftIcon="fa-solid fa-users" />
        </div>
        <div class="p-4 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input :ref="el => formRefs[2] = el" required error="Bron vaqtini kiritish shart!" size="small" v-model="bookingModel.booking_time" type="datetime-local" label="Bron vaqti" />
          <Select v-model="bookingModel.waiter_id" label="Ofitsiant" :options="waitersOptions" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <Input size="small" v-model="bookingModel.prepayment" type="number" label="Oldindan to'lov" suffix="sum" />
          <Select size="small" v-model="bookingModel.payment_method" label="To'lov turi" :options="[{label:'Naqd', value:'cash'},{label:'Karta', value:'card'}]" />
        </div>
        <TextArea size="small" v-model="bookingModel.description" label="Izoh" />
      </div>

      <div v-else class="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div v-if="!tableBookings?.length" class="text-center py-20 opacity-30 italic">Bronlar mavjud emas</div>
        
        <div v-for="item in tableBookings" :key="item._id" class="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-5 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
          <div :class="getStatusClass(item.status)" class="absolute top-0 right-0 px-5 py-1.5 rounded-bl-[1.5rem] text-[10px] font-black uppercase tracking-widest">{{ item.status }}</div>

          <div class="flex items-center gap-4 mb-5 mt-2">
            <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none"><i class="fa-solid fa-user-check"></i></div>
            <div>
              <h4 class="text-lg font-black text-slate-800 dark:text-white leading-none mb-1">{{ item.client_name }}</h4>
              <p class="text-[10px] font-bold text-slate-400">Tuzildi: {{ formatDateTimeFull(item.createdAt) }}</p>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-4 mb-5 border border-slate-100 dark:border-slate-700">
            <div class="flex justify-between items-end mb-2">
              <div class="flex flex-col">
                <span class="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Bron qilingan vaqt</span>
                <span class="text-sm font-black text-slate-700 dark:text-white font-mono uppercase">{{ formatBookingDetailed(item.booking_time) }}</span>
              </div>
              <div :class="getBookingStatusInfo(item).class" class="px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2">
                <span class="relative flex h-2 w-2"><span class="animate-ping absolute h-full w-full rounded-full bg-current opacity-75"></span><span class="relative h-2 w-2 rounded-full bg-current"></span></span>
                {{ getBookingStatusInfo(item).text }}
              </div>
            </div>
            <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
              <div :class="getBookingStatusInfo(item).class" class="h-full bg-current transition-all duration-1000" :style="{ width: getBookingStatusInfo(item).percent + '%' }"></div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-5 px-1">
            <div class="text-center"><p class="text-[8px] font-black text-slate-400 uppercase">Mehmonlar</p><p class="text-xs font-black">{{ item.guests_count }} kishi</p></div>
            <div class="text-center"><p class="text-[8px] font-black text-slate-400 uppercase">Oldindan to'lov</p><p class="text-xs font-black text-emerald-600 font-mono">{{ item.prepayment?.toLocaleString() }}</p></div>
            <div class="text-center"><p class="text-[8px] font-black text-slate-400 uppercase">Ofitsiant</p><p class="text-xs font-black truncate">{{ item.waiter_id?.name || '---' }}</p></div>
          </div>

          <div class="flex gap-2">
            <button v-if="item.status !== 'cancelled'" @click="CancelBooking(item._id)" class="flex-1 py-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-[10px] font-black hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest">Bekor qilish</button>
            <button v-if="item.status === 'pending'" @click="ConfirmBooking(item._id)" class="flex-[2] py-3 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-black hover:shadow-xl transition-all uppercase tracking-[0.2em]">Tasdiqlash</button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="p-1 flex justify-end gap-3 w-full bg-transparent ">
        <Button leftIcon="fas fa-xmark" variant="danger" @click="isBookingModal = false" size="sm">Yopish</Button>
        <Button leftIcon="fas fa-check" v-if="activeTab === 'form'" @click="SaveBooking()" size="sm">Saqlash</Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.font-mono { font-family: 'JetBrains Mono', 'Roboto Mono', monospace; }
.animate-in { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>