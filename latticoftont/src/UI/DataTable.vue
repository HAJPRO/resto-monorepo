<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useLanguage } from '../Language/composables/useLanguage' // O'zingiz yaratgan composable
import {EmptyState} from '../UI/UI'

// 1. Global tildan foydalanish
const { t } = useLanguage() 

// --- PROPS ---
const props = defineProps({
  items: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] }, 
  showIndex: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  searchValue: { type: String, default: '' },
  itemsPerPage: { type: Number, default: 15 }
})

// --- EMITS ---
const emit = defineEmits(['sort-change', 'page-change', 'size-change', 'row-click', 'clear-filter', 'header-setting'])

// --- STATE ---
const pageSize = ref(props.itemsPerPage)
const currentPage = ref(1)
const hoveredColumn = ref(null)
const showPageSizeMenu = ref(false)
const sortConfig = ref({ key: null, direction: 'asc' })
const pageSizeMenuRef = ref(null)

// --- CLICK OUTSIDE LOGIC ---
const handleClickOutside = (event) => {
  if (showPageSizeMenu.value && pageSizeMenuRef.value && !pageSizeMenuRef.value.contains(event.target)) {
    showPageSizeMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// --- WATCHERS ---
watch(() => props.searchValue, () => { currentPage.value = 1 })
watch(() => props.itemsPerPage, (newVal) => { pageSize.value = newVal })

// --- HELPERS ---
const getNestedValue = (obj, path) => {
  if (!obj || !path) return '';
  return path.split('.').reduce((o, k) => (o || {})[k], obj);
}

// --- COMPUTED ---
const processedData = computed(() => {
  let data = [...props.items]
  if (sortConfig.value.key) {
    data.sort((a, b) => {
      const valA = getNestedValue(a, sortConfig.value.key)
      const valB = getNestedValue(b, sortConfig.value.key)
      if (valA === valB) return 0
      if (valA == null) return 1
      if (valB == null) return -1
      const comparison = valA > valB ? 1 : -1
      return sortConfig.value.direction === 'asc' ? comparison : -comparison
    })
  }
  return data
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return processedData.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(props.items.length / pageSize.value) || 1)

// --- ACTIONS ---
const handleSort = (key) => {
  if (!key) return
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
  emit('sort-change', sortConfig.value)
}

const setPageSize = (size) => {
  pageSize.value = size
  currentPage.value = 1
  showPageSizeMenu.value = false
  emit('size-change', size)
}

const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
    emit('page-change', p)
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden relative z-0">
    
    <div class="flex-1 overflow-auto custom-scrollbar relative">
      <table class="w-full text-left border-collapse" :style="{ minWidth: '100%' }">
        <thead class="bg-indigo-50 dark:bg-slate-900 sticky top-0 z-[50] text-[12px] text-center font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide shadow-sm">
          <tr>
            <th v-if="showIndex" class="th-fixed left-0 text-center w-12 z-[60]" @mouseenter="hoveredColumn = 'index'" @mouseleave="hoveredColumn = null">
              {{ t('common.no_index') }}
            </th>
            <th v-for="(col, index) in columns" :key="col.key"
                :class="['p-4 border-r border-b border-indigo-200 dark:border-slate-700 transition-colors group whitespace-nowrap', col.fixed === 'right' ? 'sticky right-0 z-[50] bg-indigo-50 dark:bg-slate-900 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]' : '', col.sortable ? 'cursor-pointer hover:bg-indigo-100' : '']"
                :style="{ width: col.width, minWidth: col.width, textAlign: col.align || 'left' }"
                @click="col.sortable && handleSort(col.key)"
                @mouseenter="hoveredColumn = index" @mouseleave="hoveredColumn = null">
              <div class="flex items-center gap-2" :class="{'justify-center': col.align === 'center', 'justify-end': col.align === 'right'}">
                <template v-if="col.key === 'actions'">
                   <button @click.stop="$emit('header-setting')" class="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded active:scale-95">
                     <i class="fa-solid fa-gear text-lg animate-spin-slow-hover"></i>
                   </button>
                </template>
                <template v-else>{{ col.label }}</template>
                
                <div v-if="col.sortable && col.key !== 'actions'" class="flex flex-col text-[8px] leading-[3px] text-indigo-300 group-hover:text-indigo-500">
                  <i class="fa-solid fa-caret-up" :class="{'text-indigo-600': sortConfig.key === col.key && sortConfig.direction === 'asc'}"></i>
                  <i class="fa-solid fa-caret-down" :class="{'text-indigo-600': sortConfig.key === col.key && sortConfig.direction === 'desc'}"></i>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody v-if="paginatedData.length > 0" class="text-sm font-medium divide-y divide-slate-100 dark:divide-slate-700">
          <tr v-for="(row, rowIndex) in paginatedData" :key="row.id || rowIndex" class="group transition-colors duration-150 ease-in-out bg-white dark:bg-slate-800 hover:bg-indigo-50/30" @click="$emit('row-click', row)">
            <td v-if="showIndex" class="td-fixed left-0 text-center font-bold text-slate-500 z-[30]" :class="{'!bg-indigo-50': hoveredColumn === 'index'}">
              {{ (currentPage - 1) * pageSize + rowIndex + 1 }}
            </td>
            <td v-for="(col, colIndex) in columns" :key="col.key"
                :class="['p-3 border-r border-b border-slate-200 dark:border-slate-700 transition-colors', col.fixed === 'right' ? 'sticky right-0 z-20 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)]' : '', hoveredColumn === colIndex ? 'bg-indigo-50/50 dark:bg-slate-700' : '', (col.fixed === 'right' && hoveredColumn !== colIndex) ? 'bg-white dark:bg-slate-800' : '']"
                :style="{ textAlign: col.align || 'left' }">
              <slot :name="col.key" :row="row" :index="rowIndex">{{ getNestedValue(row, col.key) }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-if="paginatedData.length === 0 && !loading" :search-term="searchValue" @action="$emit('clear-filter')" />
    </div>

    <div v-if="paginatedData.length > 0" class="flex-none bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 z-40 relative shadow-sm">
      
      <div class="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        <div class="flex items-center gap-2">
          <span class="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 px-2.5 py-1 rounded-md font-bold text-sm">
            {{ props.items.length }}
          </span>
          <span class="text-slate-600 dark:text-slate-400">{{ t('common.total') }}</span>
        </div>
        
        <div class="h-5 w-px bg-slate-200 dark:bg-slate-700"></div>
        
        <div class="relative" ref="pageSizeMenuRef">
          <button 
            @click.stop="showPageSizeMenu = !showPageSizeMenu" 
            class="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm active:scale-95 font-semibold"
          >
            <span>{{ pageSize }} / {{ t('common.page_per') }}</span>
            <i class="fa-solid fa-chevron-up text-[10px] transition-transform duration-200" :class="{'rotate-180': showPageSizeMenu}"></i>
          </button>
          
          <transition name="dropdown-up">
            <div v-if="showPageSizeMenu" class="absolute bottom-full left-0 mb-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden p-1 z-50">
              <button 
                v-for="size in [10, 15, 20, 50, 100]" 
                :key="size" 
                @click="setPageSize(size)" 
                class="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors"
                :class="pageSize === size 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                {{ size }} {{ t('common.units') }} 
                <i v-if="pageSize === size" class="fa-solid fa-check text-indigo-600 dark:text-indigo-400"></i>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <div class="flex items-center gap-2 select-none">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm">
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
        <div class="flex items-center gap-1">
          <button v-for="p in totalPages" :key="p" @click="changePage(p)" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all" :class="currentPage === p ? 'bg-indigo-600 dark:bg-indigo-50 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'" v-show="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)">
            {{ p }}
          </button>
        </div>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="h-8 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.th-fixed { @apply sticky border-r border-b border-indigo-200 dark:border-slate-700 bg-indigo-50 dark:bg-slate-900 p-4 shadow-[2px_0_5px_-2px_rgba(0,1,1,1)]; }
.td-fixed { @apply sticky border-r border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800   shadow-[2px_0_5px_-2px_rgba(0,1,1,1)]; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #818cf8; }
.group:hover .animate-spin-slow-hover { animation: spin 3s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.dropdown-up-enter-active, .dropdown-up-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.dropdown-up-enter-from, .dropdown-up-leave-to { opacity: 0; transform: translateY(10px) scale(0.95); }
</style>