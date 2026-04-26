<template>
  <div class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[4px]" @mousedown.self="$emit('close')">
    <div class="datepicker-card relative flex flex-col md:flex-row w-full max-w-[760px] bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-t-[32px] sm:rounded-[32px] overflow-hidden select-none">
      
      <div class="w-full md:w-[200px] p-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto no-scrollbar bg-slate-50/50 dark:bg-slate-900/40 relative z-[11]">
        <h3 class="hidden md:block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-4 mt-2 px-3">Sana filtri</h3>
        
        <button v-for="filter in quickFilters" :key="filter.value"
                @click="handleFilterClick(filter.value)"
                class="filter-tab-btn whitespace-nowrap"
                :class="activeFilter === filter.value ? 'active-tab' : 'inactive-tab'">
          <span>{{ filter.label }}</span>
          <i v-if="activeFilter === filter.value" class="fas fa-check-circle text-[11px] ml-1"></i>
        </button>
      </div>

      <div class="flex-1 flex flex-col h-full max-h-[85vh] md:max-h-[620px] bg-white dark:bg-[#1a1c23] relative z-[11]">
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 pt-6">
          
          <transition name="fade">
            <div v-if="activeFilter === 'thisYear'" class="mb-6 animate-in fade-in zoom-in-95 duration-300">
              <div class="flex items-center gap-3 mb-4 px-1">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Yilni tanlang</span>
                <div class="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
              </div>
              <div class="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1 py-1">
                <button v-for="y in extendedYears" :key="y" 
                        @click="updateSpecificYear(y)"
                        class="mini-grid-btn"
                        :class="selectedSpecificYear === y ? 'active-item' : 'inactive-item'">
                  {{ y }}
                </button>
              </div>
            </div>
          </transition>

          <transition name="fade">
            <div v-if="activeFilter === 'thisMonth'" class="mb-6 animate-in fade-in zoom-in-95 duration-300">
              <div class="flex items-center gap-3 mb-4 px-1">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Oyni tanlang</span>
                <div class="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
              </div>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button v-for="(m, i) in months" :key="m" 
                        @click="updateSpecificMonth(i)"
                        class="mini-grid-btn text-[11px]"
                        :class="selectedSpecificMonth === i ? 'active-item' : 'inactive-item'">
                  {{ m }}
                </button>
              </div>
            </div>
          </transition>

          <div class="mt-2">
            <div class="flex justify-between items-center mb-6">
              <button @click="prevMonth" class="nav-btn transition-active"><i class="fas fa-chevron-left text-xs"></i></button>
              <div class="flex flex-col items-center">
                <span class="text-base font-black text-slate-800 dark:text-slate-100 leading-none uppercase tracking-tighter">{{ months[viewDate.getMonth()] }}</span>
                <span class="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">{{ viewDate.getFullYear() }}</span>
              </div>
              <button @click="nextMonth" class="nav-btn transition-active"><i class="fas fa-chevron-right text-xs"></i></button>
            </div>

            <div class="grid grid-cols-7 mb-2">
              <span v-for="day in ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']" :key="day" 
                    class="text-[9px] font-black text-slate-300 dark:text-slate-600 text-center uppercase tracking-widest py-2">{{ day }}</span>
            </div>

            <div class="grid grid-cols-7 gap-y-1 touch-none" @mouseup="onMouseUp" @touchend="onMouseUp">
              <div v-for="(date, index) in calendarDays" :key="index"
                   :data-date="date.toISOString()"
                   class="day-wrapper relative h-10 sm:h-11 flex items-center justify-center cursor-pointer group"
                   :class="getRangeClass(date)"
                   @mousedown="onMouseDown(date)"
                   @mouseenter="onMouseEnter(date)"
                   @touchstart.prevent="handleTouchStart(date)"
                   @touchmove.prevent="handleTouchMove($event)">
                
                <div class="day-content relative z-[2] w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[13px] font-bold rounded-full transition-all duration-200"
                     :class="getDayStatusClass(date)">
                  {{ date.getDate() }}
                  <span v-if="isToday(date)" class="today-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#1a1c23]">
          <div class="flex gap-3">
            <button @click="$emit('close')" class="btn-secondary">Bekor qilish</button>
            <button @click="confirmRange" :disabled="!range.start || !range.end" class="btn-primary">
              Tanlash 
              <span v-if="range.start && range.end" class="ml-1 opacity-70 font-medium">({{ totalDaysSelected }} kun)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  initialRange: Object,
  initialFilter: { type: String, default: 'today' }
});

const emit = defineEmits(['selected', 'close']);
const currentYear = new Date().getFullYear();

const viewDate = ref(new Date());
const range = ref({ start: null, end: null });
const activeFilter = ref(props.initialFilter);
const selectedSpecificYear = ref(currentYear);
const selectedSpecificMonth = ref(new Date().getMonth());
const isDraggingRange = ref(false);

const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
const quickFilters = [
  { label: 'Bugun', value: 'today' }, { label: 'Kecha', value: 'yesterday' },
  { label: 'Hafta', value: 'thisWeek' }, { label: 'Oy', value: 'thisMonth' },
  { label: 'Yil', value: 'thisYear' }, { label: 'Oraliq', value: 'custom' }
];

onMounted(() => {
  if (props.initialRange?.start && props.initialRange?.end) {
    range.value = { 
      start: new Date(props.initialRange.start), 
      end: new Date(props.initialRange.end) 
    };
    viewDate.value = new Date(range.value.start);
    activeFilter.value = props.initialFilter;
  } else {
    handleFilterClick(props.initialFilter);
  }
});

const handleFilterClick = (type) => {
  activeFilter.value = type;
  if (type === 'custom') return;
  const now = new Date();
  if (type === 'thisMonth') updateSpecificMonth(now.getMonth());
  else if (type === 'thisYear') updateSpecificYear(now.getFullYear());
  else applyStandardFilter(type);
};

const applyStandardFilter = (type) => {
  const now = new Date();
  let start = new Date(); let end = new Date();
  start.setHours(0,0,0,0); end.setHours(23,59,59,999);
  
  if (type === 'yesterday') { 
    start.setDate(now.getDate() - 1); 
    end.setDate(now.getDate() - 1); 
  } else if (type === 'thisWeek') { 
    const day = now.getDay(); 
    start.setDate(now.getDate() - day); 
    end.setDate(now.getDate() + (6 - day)); 
  } else if (type === 'today') {
    // start va end allaqachon bugunga sozlangan
  }
  
  range.value = { start, end };
  viewDate.value = new Date(start);
};

const updateSpecificMonth = (m) => {
  selectedSpecificMonth.value = m;
  const y = viewDate.value.getFullYear();
  range.value = { start: new Date(y, m, 1), end: new Date(y, m + 1, 0, 23, 59, 59) };
  viewDate.value = new Date(y, m, 1);
};

const updateSpecificYear = (y) => {
  selectedSpecificYear.value = y;
  range.value = { start: new Date(y, 0, 1), end: new Date(y, 11, 31, 23, 59, 59) };
  viewDate.value = new Date(y, viewDate.value.getMonth(), 1);
};

const calendarDays = computed(() => {
  const start = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 42 }, () => {
    const d = new Date(start); start.setDate(start.getDate() + 1); return d;
  });
});

const totalDaysSelected = computed(() => {
  if (!range.value.start || !range.value.end) return 0;
  const diff = Math.abs(range.value.end - range.value.start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
});

const onMouseDown = (date) => {
  isDraggingRange.value = true;
  activeFilter.value = 'custom';
  range.value = { start: new Date(date), end: null };
};

const onMouseEnter = (date) => { if (isDraggingRange.value && range.value.start) range.value.end = new Date(date); };
const onMouseUp = () => {
  isDraggingRange.value = false;
  if (range.value.start && range.value.end && range.value.start > range.value.end) 
    [range.value.start, range.value.end] = [range.value.end, range.value.start];
};

const handleTouchStart = (date) => onMouseDown(date);
const handleTouchMove = (e) => {
  if (!isDraggingRange.value) return;
  const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
  const wrap = el?.closest('.day-wrapper');
  if (wrap) {
    const dStr = wrap.getAttribute('data-date');
    if (dStr) onMouseEnter(new Date(dStr));
  }
};

const getRangeClass = (date) => {
  const d = new Date(date).setHours(0,0,0,0);
  const s = range.value.start?.setHours(0,0,0,0);
  const e = range.value.end?.setHours(0,0,0,0);
  if (d === s && !e) return 'is-selected-only';
  if (s && e && d >= s && d <= e) {
    return `is-in-range ${d === s ? 'range-start' : ''} ${d === e ? 'range-end' : ''}`;
  }
  return '';
};

const getDayStatusClass = (date) => {
  const d = new Date(date).setHours(0,0,0,0);
  const s = range.value.start?.getTime();
  const e = range.value.end?.getTime();
  const isSelected = (s && e && d >= s && d <= e) || d === s;
  return {
    'text-white': isSelected,
    'opacity-20': date.getMonth() !== viewDate.value.getMonth(),
    'text-slate-700 dark:text-slate-200': date.getMonth() === viewDate.value.getMonth() && !isSelected
  };
};

const confirmRange = () => {
  if (range.value.start && range.value.end) {
    const fmt = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    emit('selected', { start: fmt(range.value.start), end: fmt(range.value.end), label: activeFilter.value });
  }
};

const isToday = (d) => d.toDateString() === new Date().toDateString();
const prevMonth = () => viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1);
const nextMonth = () => viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1);
const extendedYears = computed(() => Array.from({ length: 15 }, (_, i) => currentYear - i));
</script>

<style scoped>
.datepicker-card { animation: slideUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.15); }
@keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

.filter-tab-btn { @apply md:w-full px-4 py-3 text-[12px] font-black rounded-xl transition-all duration-300 flex justify-between items-center mb-1 outline-none; }
.active-tab { @apply bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 md:translate-x-1; }
.inactive-tab { @apply text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60; }

.mini-grid-btn { @apply py-2 px-1 font-black rounded-xl border text-[11px] transition-all duration-200 outline-none; }
.active-item { @apply bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105; }
.inactive-item { @apply bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 dark:text-slate-400; }

.nav-btn { @apply h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300; }
.transition-active { @apply active:scale-90 transition-transform; }

/* Range Styling */
.is-in-range { @apply bg-indigo-50 dark:bg-indigo-500/10; }
.range-start { @apply rounded-l-full bg-indigo-600 !important; }
.range-end { @apply rounded-r-full bg-indigo-600 !important; }
.is-selected-only .day-content { @apply bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30; }

.today-dot { @apply absolute bottom-1.5 w-1 h-1 rounded-full bg-indigo-500; }

.btn-secondary { @apply py-4 px-6 text-[11px] font-black rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95 transition-all outline-none; }
.btn-primary { @apply flex-1 py-4 text-[11px] font-black rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-40 outline-none; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-slate-700 rounded-full; }

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>