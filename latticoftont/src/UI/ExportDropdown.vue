<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useLanguage } from "../Language/composables/useLanguage";
const { t } = useLanguage();
const props = defineProps({
  size: { type: String, default: 'md' },
  label: { type: String, default: 'Export' },
  icon: { type: String, default: 'fa-solid fa-file-export' }
});

const emit = defineEmits(['select']);

const isOpen = ref(false);
const containerRef = ref(null);
const dropdownRef = ref(null); // Dropdown o'zini o'lchash uchun
const isMobile = ref(false);
const coords = ref({ top: 0, left: 0, width: 288 }); // 288px = w-72

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// --- SMART POSITIONING ---
const updatePosition = async () => {
  if (isMobile.value || !isOpen.value || !containerRef.value) return;
  
  await nextTick(); // DOM rasmga tushishini kutish
  const rect = containerRef.value.getBoundingClientRect();
  const screenWidth = window.innerWidth;
  const dropdownWidth = 288; // w-72
  
  let left = rect.left;
  
  // Agar dropdown o'ng tomondan ekranga sig'masa, uni chapga surish
  if (left + dropdownWidth > screenWidth) {
    left = screenWidth - dropdownWidth - 16; // 16px chekka masofa
  }

  coords.value = {
    top: rect.bottom + 8,
    left: left
  };
};

const toggle = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await updatePosition();
  }
};

const handleSelect = (id) => {
  emit('select', id);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (isOpen.value && !isMobile.value && containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', () => {
    checkMobile();
    updatePosition();
  });
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('click', handleClickOutside);
});

// Theme va Size Configuration o'zgarishsiz qoladi...
const exportOptions = [
  { id: 'excel', label: t('planning.excel_export'), description: t('planning.description_excel'), icon: 'fa-solid fa-file-excel', theme: 'emerald', badge: 'PRO' },
  { id: 'pdf', label: t('planning.pdf_export'), description: t('planning.description_pdf'), icon: 'fa-solid fa-file-pdf', theme: 'rose' }
];

const sizeClasses = {
  sm: { btn: 'px-3 py-1 text-[11px] h-8', icon: 'text-sm', chevron: 'text-[8px]' },
  md: { btn: 'px-4 py-1.5 text-[13px] h-10', icon: 'text-base', chevron: 'text-[10px]' },
  lg: { btn: 'px-5 py-2 text-[15px] h-12', icon: 'text-xl', chevron: 'text-[12px]' }
};

const getThemeClasses = (theme) => {
  const themes = {
    emerald: { item: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-100', iconBox: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600', text: 'group-hover/item:text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    rose: { item: 'hover:bg-rose-50/50 dark:hover:bg-rose-900/10 hover:border-rose-100', iconBox: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600', text: 'group-hover/item:text-rose-700', badge: 'bg-rose-100 text-rose-700' }
  };
  return themes[theme] || themes.emerald;
};
</script>

<template>
  <div class="relative inline-block text-left" ref="containerRef">
    
    <button 
      @click.stop="toggle" 
      :class="[
        sizeClasses[props.size].btn,
        isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-300 dark:border-slate-600',
        'md:w-auto w-10 md:rounded-xl rounded-full'
      ]"
      class="group relative bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center active:scale-95 shadow-sm outline-none"
    >
      <div class="flex items-center gap-2.5">
        <i :class="[props.icon, sizeClasses[props.size].icon, isOpen ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500']" class="transition-colors"></i> 
        <span class="tracking-wide hidden md:block">{{ props.label }}</span>
        <i class="fa-solid fa-chevron-down transition-transform duration-300 hidden md:block" :class="[sizeClasses[props.size].chevron, isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400']"></i>
      </div>
    </button>
    
    <Teleport to="body">
      <transition name="fade">
        <div v-if="isOpen && isMobile" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998]" @click="isOpen = false"></div>
      </transition>

      <transition :name="isMobile ? 'sheet-slide' : 'dropdown-pop'">
        <div 
          v-if="isOpen" 
          ref="dropdownRef"
          :style="!isMobile ? { position: 'fixed', top: coords.top + 'px', left: coords.left + 'px', zIndex: 9999 } : { zIndex: 9999 }"
          :class="[
            isMobile 
              ? 'fixed bottom-0 left-0 right-0 w-full rounded-t-[2.5rem] p-6 pb-10 max-h-[85vh] overflow-y-auto' 
              : 'w-72 rounded-[2rem] p-2 border'
          ]"
          class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-100 dark:border-slate-700 select-none shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
        >
          <div v-if="isMobile" class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 flex-shrink-0"></div>

          <div class="px-4 py-2 mb-1 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
            <span class="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">{{ t('planning.export_format') }}</span>
          </div>

          <div :class="isMobile ? 'grid grid-cols-1 gap-3' : 'space-y-1'">
            <button v-for="opt in exportOptions" :key="opt.id" @click="handleSelect(opt.id)"
              class="w-full text-left p-3 rounded-2xl flex items-center gap-4 transition-all group/item border border-transparent outline-none"
              :class="getThemeClasses(opt.theme).item"
            >
              <div class="w-12 h-12 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xl md:text-lg shadow-sm transition-transform duration-300 group-hover/item:scale-110"
                :class="getThemeClasses(opt.theme).iconBox"
              >
                <i :class="opt.icon"></i>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                   <span class="font-bold text-slate-700 dark:text-slate-200 text-sm md:text-sm truncate" :class="getThemeClasses(opt.theme).text">
                     {{ opt.label }}
                   </span>
                   <span v-if="opt.badge" class="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase" :class="getThemeClasses(opt.theme).badge">
                     {{ opt.badge }}
                   </span>
                </div>
                <div class="text-[11px] md:text-[10px] text-slate-400 font-medium truncate">{{ opt.description }}</div>
              </div>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Avvalgi animatsiyalar saqlanadi */
.dropdown-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dropdown-pop-leave-active { transition: all 0.2s ease-in; }
.dropdown-pop-enter-from { opacity: 0; transform: scale(0.95) translateY(-10px); }

.sheet-slide-enter-active, .sheet-slide-leave-active { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.sheet-slide-enter-from, .sheet-slide-leave-to { transform: translateY(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Scrollbar dizayni (mobil uchun) */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>