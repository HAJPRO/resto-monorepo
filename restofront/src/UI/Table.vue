<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {EmptyState} from '../UI/UI'


const props = defineProps({
  items: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] }, 
  showIndex: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  searchValue: { type: String, default: '' },
  itemsPerPage: { type: Number, default: 15 }
})

const emit = defineEmits(['sort-change', 'page-change', 'size-change', 'row-click', 'clear-filter', 'header-setting'])

const pageSize = ref(props.itemsPerPage)
const currentPage = ref(1)
const showPageSizeMenu = ref(false)
const sortConfig = ref({ key: null, direction: 'asc' })
const pageSizeMenuRef = ref(null)

const handleClickOutside = (event) => {
  if (showPageSizeMenu.value && pageSizeMenuRef.value && !pageSizeMenuRef.value.contains(event.target)) {
    showPageSizeMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const getNestedValue = (obj, path) => {
  if (!obj || !path) return '';
  return path.split('.').reduce((o, k) => (o || {})[k], obj);
}

// --- PROFESSIONAL SUMMARY LOGIC ---
const summaryData = computed(() => {
  const sums = {}
  props.columns.forEach((col, index) => {
    // 1. Birinchi ustun uchun sarlavha
    if (index === 0) {
      sums[col.key] = col.footerLabel || 'JAMI'
      return
    }

    // 2. Faqat showSum true bo'lgan ustunlarni hisoblash
    if (col.showSum) {
      const total = props.items.reduce((acc, item) => {
        let val = getNestedValue(item, col.key)
        
        // --- STRINGDAN RAQAMGA O'GIRISH (BO'SHLIQLARNI TOZALASH) ---
        if (typeof val === 'string') {
          // Bo'shliqlarni, vergullarni tozalash (10 000 -> 10000)
          val = val.replace(/\s+/g, '').replace(/,/g, '.')
        }
        
        const num = parseFloat(val)
        return acc + (isNaN(num) ? 0 : num)
      }, 0)
      sums[col.key] = total
    } else {
      sums[col.key] = ''
    }
  })
  return sums
})

const hasFooter = computed(() => props.columns.some(col => col.showSum || col.footerLabel))

// --- DATA PROCESSING ---
const processedData = computed(() => {
  let data = [...props.items]
  if (sortConfig.value.key) {
    data.sort((a, b) => {
      const valA = getNestedValue(a, sortConfig.value.key)
      const valB = getNestedValue(b, sortConfig.value.key)
      if (valA === valB) return 0
      const res = valA > valB ? 1 : -1
      return sortConfig.value.direction === 'asc' ? res : -res
    })
  }
  return data
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return processedData.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(props.items.length / pageSize.value) || 1)

const handleSort = (key) => {
  if (!key) return
  sortConfig.value.direction = (sortConfig.value.key === key && sortConfig.value.direction === 'asc') ? 'desc' : 'asc'
  sortConfig.value.key = key
  emit('sort-change', sortConfig.value)
}

const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden relative">
    
    <div class="flex-1 overflow-auto custom-scrollbar relative min-h-0">
      <table class="w-full text-left border-separate border-spacing-0">
        
        <thead class="sticky top-0 z-[100]">
          <tr class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
            <th v-if="showIndex" class="th-fixed left-0 w-14 text-center border-b border-slate-200 dark:border-slate-800 py-3.5 bg-white dark:bg-slate-900">
                <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">#</span>
            </th>
            <th v-for="col in columns" :key="col.key"
                :class="[
                  'py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 transition-colors',
                  col.sortable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800' : '',
                  col.fixed === 'right' ? 'sticky right-0 z-[101] border-l bg-white/95 dark:bg-slate-900/95 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)]' : ''
                ]"
                :style="{ width: col.width, minWidth: col.width, textAlign: col.align || 'left' }"
                @click="col.sortable && handleSort(col.key)">
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody v-if="paginatedData.length > 0" class="text-sm">
          <tr v-for="(row, rowIndex) in paginatedData" :key="row._id || rowIndex" class="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer" @click="$emit('row-click', row)">
            <td v-if="showIndex" class="td-fixed left-0 text-center font-mono text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:bg-inherit transition-colors">
              {{ (currentPage - 1) * pageSize + rowIndex + 1 }}
            </td>
            <td v-for="col in columns" :key="col.key"
                :class="['py-3 px-4 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:bg-inherit transition-colors', col.fixed === 'right' ? 'sticky right-0 z-[50] border-l shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)]' : '']"
                :style="{ textAlign: col.align || 'left' }">
              <slot :name="col.key" :row="row" :index="rowIndex">{{ getNestedValue(row, col.key) }}</slot>
            </td>
          </tr>
        </tbody>

        <tfoot v-if="hasFooter && paginatedData.length > 0" class="sticky bottom-0 z-[110]">
          <tr class="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)]">
            <td v-if="showIndex" class="td-fixed-footer left-0 py-3.5 text-center bg-slate-100 dark:bg-slate-800 border-t-2">
              <span class="text-slate-500 font-black text-xs">∑</span>
            </td>
            <td v-for="col in columns" :key="'foot-' + col.key"
                :class="[
                  'py-3.5 px-4 font-black text-slate-900 dark:text-white border-t-2',
                  col.fixed === 'right' ? 'sticky right-0 z-[111] bg-slate-100 dark:bg-slate-800 border-l' : ''
                ]"
                :style="{ textAlign: col.align || 'left' }">
              <template v-if="col.showSum">
                <span class="text-indigo-600 dark:text-indigo-400 font-mono text-[14px] tabular-nums">
                  {{ typeof summaryData[col.key] === 'number' ? summaryData[col.key].toLocaleString() : summaryData[col.key] }}
                </span>
              </template>
              <template v-else>
                <span class="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                  {{ summaryData[col.key] }}
                </span>
              </template>
            </td>
          </tr>
        </tfoot>
      </table>
      <EmptyState v-if="paginatedData.length === 0 && !loading" :search-term="searchValue" @action="$emit('clear-filter')" />
    </div>

    <div v-if="paginatedData.length > 0" class="flex-none bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-4 z-[120]">
        <div class="flex items-center gap-6 text-sm text-slate-500">
            <span class="font-medium text-xs uppercase text-slate-400">Jami: <span class="text-slate-900 dark:text-white font-black">{{ props.items.length }}</span> ta</span>
        </div>
        <div class="flex items-center gap-1">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="w-8 h-8 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition-all"><i class="fa-solid fa-chevron-left text-xs"></i></button>
            <button v-for="p in totalPages" :key="p" @click="changePage(p)" class="w-8 h-8 rounded-lg text-xs font-black transition-all" :class="currentPage === p ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-100'" v-show="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)">{{ p }}</button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="w-8 h-8 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition-all"><i class="fa-solid fa-chevron-right text-xs"></i></button>
        </div>
    </div>
  </div>
</template>

<style scoped>
table { border-collapse: separate !important; }
.th-fixed { @apply sticky left-0 z-[101]; }
.td-fixed { @apply sticky left-0 z-[51]; }
.td-fixed-footer { @apply sticky left-0 z-[111]; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300; }
</style>