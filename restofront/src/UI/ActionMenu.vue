<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import draggable from 'vuedraggable';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { 
  addOutline, 
  cartOutline, 
  bookmarkOutline, 
  walletOutline, 
  ellipsisVertical, 
  ellipsisHorizontal,
  reorderTwoOutline
} from 'ionicons/icons';

const props = defineProps({
  items: { type: Array, required: true },
  title: { type: String, default: 'Amallar' },
  draggable: { type: Boolean, default: false },
  direction: { type: String, default: 'vertical' },
  minimal: { type: Boolean, default: false }
});

const emit = defineEmits(['reorder']);

const isOpen = ref(false);
const triggerRef = ref(null);
const menuRef = ref(null);
const isMobile = ref(false);
const menuStyles = ref({ top: '0px', left: '0px', transformOrigin: 'top right' });

const localItems = ref([...props.items]);
watch(() => props.items, (newVal) => { localItems.value = [...newVal]; }, { deep: true });

const checkScreen = () => { 
  isMobile.value = window.innerWidth < 768; 
  if (isOpen.value && !isMobile.value) calculatePosition();
};

onMounted(() => {
  checkScreen();
  window.addEventListener('resize', checkScreen);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreen);
  document.body.style.overflow = '';
});

const calculatePosition = async () => {
  if (!triggerRef.value || isMobile.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  await nextTick();
  const menuRect = menuRef.value ? menuRef.value.getBoundingClientRect() : { width: 256, height: 200 };

  let top = rect.bottom + 8;
  let left = rect.left + rect.width - menuRect.width;
  
  if (top + menuRect.height > viewportHeight) top = rect.top - menuRect.height - 8;
  if (left < 10) left = 10;

  menuStyles.value = { top: `${top}px`, left: `${left}px` };
};

const toggleMenu = async () => {
  if (!isOpen.value) {
    await Haptics.impact({ style: ImpactStyle.Light });
    isOpen.value = true;
    await nextTick();
    if (!isMobile.value) calculatePosition();
    document.body.style.overflow = 'hidden';
  } else {
    closeMenu();
  }
};

const closeMenu = () => {
  isOpen.value = false;
  document.body.style.overflow = '';
};

const handleAction = async (item) => {
  await Haptics.notification({ type: 'SUCCESS' });
  if (item.onClick) item.onClick();
  closeMenu();
};

// Mobil menyuni pastga tortib yopish (Swipe Logic)
let touchStart = 0;
const onTouchStart = (e) => { touchStart = e.touches[0].clientY; };
const onTouchMove = (e) => {
  const touchEnd = e.touches[0].clientY;
  if (touchEnd - touchStart > 100) closeMenu(); 
};
</script>

<template>
  <div class="inline-block">
    <button
      ref="triggerRef"
      @click.stop="toggleMenu"
      type="button"
      :class="[
        'flex items-center justify-center transition-all duration-300 active:scale-75',
        minimal 
          ? 'w-10 h-10 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400' 
          : 'w-11 h-11 rounded-[14px] bg-white dark:bg-slate-800 text-slate-600 shadow-sm border border-slate-100 dark:border-white/5'
      ]"
    >
      <i :class="[
        'fa-solid transition-all duration-300 text-lg',
        direction === 'vertical' ? 'fa-ellipsis-vertical' : 'fa-ellipsis',
        isOpen ? 'text-indigo-500 rotate-90 scale-110' : ''
      ]"></i>
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isOpen" @click="closeMenu" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"></div>
      </Transition>

      <Transition :name="isMobile ? 'slide-up' : 'premium-dropdown'">
        <div
          v-if="isOpen"
          ref="menuRef"
          :style="!isMobile ? menuStyles : {}"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          :class="[
            'fixed z-[9999] bg-white dark:bg-slate-900 shadow-2xl border-slate-100 dark:border-slate-800 overflow-hidden',
            isMobile 
              ? 'inset-x-0 bottom-0 rounded-t-[2.5rem] p-6 pb-safe border-t' 
              : 'w-64 rounded-[2rem] p-2 border'
          ]"
        >
          <div v-if="isMobile" class="flex flex-col items-center mb-6">
            <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
            <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">{{ title }}</h4>
          </div>

          <div v-else class="px-4 py-2 mb-1 flex justify-between items-center border-b border-slate-50 dark:border-slate-800/50">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{{ title }}</h4>
          </div>

          <div :class="['space-y-2 overflow-y-auto custom-menu-scroll', isMobile ? 'max-h-[60vh]' : 'max-h-[400px]']">
            <draggable 
              v-model="localItems" 
              item-key="label"
              :disabled="!props.draggable"
              handle=".drag-handle"
              @start="Haptics.impact({ style: ImpactStyle.Medium })"
              @end="emit('reorder', localItems)"
              ghost-class="ghost-item"
              class="space-y-2 px-0.5"
            >
              <template #item="{ element: item }">
                <div 
                  class="group flex items-center rounded-[18px] transition-all duration-200 active:scale-[0.97]"
                  :class="item.variant === 'danger' ? 'bg-red-50/50 dark:bg-red-950/10' : 'bg-slate-50/50 dark:bg-slate-800/40'"
                >
                  <div v-if="props.draggable" class="drag-handle pl-4 pr-1 py-5 text-slate-300 active:text-indigo-500 transition-colors">
                    <i class="fa-solid fa-grip-vertical text-xs"></i>
                  </div>

                  <button @click.stop="handleAction(item)" class="flex-1 flex items-center gap-4 p-3.5 text-left outline-none">
                    <div :class="[
                      'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-active:scale-90 border border-white dark:border-white/5',
                      item.variant === 'danger' ? 'bg-white text-red-600' : 'bg-white dark:bg-slate-800 text-slate-500'
                    ]">
                      <i :class="[item.icon, 'text-base']"></i>
                    </div>

                    <div class="flex flex-col min-w-0">
                      <span :class="['text-[15px] font-bold tracking-tight', item.variant === 'danger' ? 'text-red-600' : 'text-slate-700 dark:text-slate-200']">
                        {{ item.label }}
                      </span>
                      <span v-if="item.description" class="text-[11px] text-slate-400 truncate tracking-tight">{{ item.description }}</span>
                    </div>
                  </button>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Safe area padding for modern iPhones */
.pb-safe { padding-bottom: calc(max(1.5rem, env(safe-area-inset-bottom))); }

/* Drag & Drop Ghost Effect */
.ghost-item { opacity: 0.4; background: #6366f1 !important; border-radius: 18px; transform: scale(1.02); }

/* Desktop Dropdown Animation */
.premium-dropdown-enter-active { transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); }
.premium-dropdown-enter-from { opacity: 0; transform: translateY(-10px) scale(0.95); }

/* Mobile Slide Up Animation */
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }

/* Overlay Fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Internal Custom Scroll */
.custom-menu-scroll::-webkit-scrollbar { width: 4px; }
.custom-menu-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.dark .custom-menu-scroll::-webkit-scrollbar-thumb { background: #334155; }

@media (max-width: 768px) {
  .custom-menu-scroll { scrollbar-width: none; }
  .custom-menu-scroll::-webkit-scrollbar { display: none; }
}
</style>