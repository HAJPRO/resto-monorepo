<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import draggable from 'vuedraggable';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const props = defineProps({
  items: { type: Array, required: true },
  title: { type: String, default: 'Amallar' },
  draggable: { type: Boolean, default: false },
  direction: { type: String, default: 'vertical' },
  minimal: { type: Boolean, default: false },
  // Button bilan bir xil o'lcham tizimi
  size: { 
    type: String, 
    default: 'md', 
    validator: (v) => ['sm', 'md', 'lg'].includes(v) 
  }
});

const emit = defineEmits(['reorder']);

const isOpen = ref(false);
const triggerRef = ref(null);
const menuRef = ref(null);
const isMobile = ref(false);
const menuStyles = ref({ top: '0px', left: '0px', transformOrigin: 'top right' });

const localItems = ref([...props.items]);
watch(() => props.items, (newVal) => { localItems.value = [...newVal]; }, { deep: true });

// --- BUTTON BILAN BIR XIL O'LCHAM VA RADIUSLAR ---
const sizeConfig = computed(() => {
  const configs = {
    sm: {
      height: 'h-[38px]', // Button sm bilan bir xil
      triggerWidth: 'w-[38px]',
      triggerIcon: 'text-xs',
      radius: 'rounded-lg',
      menuWidth: 'w-56',
      itemPadding: 'p-2',
      iconBox: 'w-8 h-8 rounded-md',
      label: 'text-[12px]'
    },
    md: {
      height: 'h-[48px]', // Button md bilan bir xil
      triggerWidth: 'w-[48px]',
      triggerIcon: 'text-[13px]',
      radius: 'rounded-xl',
      menuWidth: 'w-64',
      itemPadding: 'p-3',
      iconBox: 'w-10 h-10 rounded-lg',
      label: 'text-[14px]'
    },
    lg: {
      height: 'h-[58px]', // Button lg bilan bir xil
      triggerWidth: 'w-[58px]',
      triggerIcon: 'text-sm',
      radius: 'rounded-2xl',
      menuWidth: 'w-72',
      itemPadding: 'p-4',
      iconBox: 'w-12 h-12 rounded-xl',
      label: 'text-[16px]'
    }
  };
  return configs[props.size] || configs.md;
});

// --- EKRAN VA POZITSIYA MANTIQLARI ---
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
  await Haptics.notification({ type: item.variant === 'danger' ? NotificationType.Warning : NotificationType.Success });
  if (item.onClick) item.onClick();
  closeMenu();
};
</script>

<template>
  <div class="inline-block">
    <!-- Trigger Button: Button komponenti bilan vizual 100% bir xil -->
    <button
      ref="triggerRef"
      @click.stop="toggleMenu"
      type="button"
      :class="[
        'flex items-center justify-center font-semibold transition-all duration-300 active:scale-[0.95] border shadow-sm',
        sizeConfig.height,
        sizeConfig.triggerWidth,
        sizeConfig.radius,
        minimal 
          ? 'bg-transparent border-transparent hover:bg-slate-100 text-slate-400' 
          : 'bg-indigo-600 dark:bg-indigo-600 text-white border-slate-100 dark:border-white/5'
      ]"
    >
      <i :class="[
        'fa-solid transition-all duration-300',
        direction === 'vertical' ? 'fa-ellipsis-vertical' : 'fa-ellipsis',
        isOpen ? 'text-white rotate-90 scale-110' : '',
        sizeConfig.triggerIcon
      ]"></i>
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isOpen" @click="closeMenu" class="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[9998]"></div>
      </Transition>

      <Transition :name="isMobile ? 'slide-up' : 'premium-dropdown'">
        <div
          v-if="isOpen"
          ref="menuRef"
          :style="!isMobile ? menuStyles : {}"
          :class="[
            'fixed z-[9999] bg-white dark:bg-slate-950 shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden',
            isMobile 
              ? 'inset-x-0 bottom-0 rounded-t-[2rem] p-6 pb-safe' 
              : `${sizeConfig.radius} p-2 ${sizeConfig.menuWidth}`
          ]"
        >
          <!-- Menu Header -->
          <div class="px-3 py-2 mb-2 flex justify-between items-center border-b border-slate-50 dark:border-white/5">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ title }}</h4>
          </div>

          <!-- Draggable Items -->
          <div :class="['space-y-1 overflow-y-auto custom-menu-scroll', isMobile ? 'max-h-[60vh]' : 'max-h-[400px]']">
            <draggable 
              v-model="localItems" 
              item-key="label"
              :disabled="!props.draggable"
              handle=".drag-handle"
              @start="Haptics.impact({ style: ImpactStyle.Medium })"
              @end="emit('reorder', localItems)"
              ghost-class="ghost-item"
            >
              <template #item="{ element: item }">
                <div 
                  class="group flex items-center transition-all duration-200 active:scale-[0.98] mb-1"
                  :class="[
                    sizeConfig.radius,
                    item.variant === 'danger' ? 'hover:bg-red-50 dark:hover:bg-red-950/30' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  ]"
                >
                  <!-- Drag Handle -->
                  <div v-if="props.draggable" class="drag-handle pl-3 pr-1 text-slate-300 hover:text-indigo-500 cursor-grab">
                    <i class="fa-solid fa-grip-vertical text-[10px]"></i>
                  </div>

                  <button @click.stop="handleAction(item)" :class="['flex-1 flex items-center gap-3 text-left outline-none', sizeConfig.itemPadding]">
                    <!-- Icon Box -->
                    <div :class="[
                      'flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110',
                      sizeConfig.iconBox,
                      item.variant === 'danger' 
                        ? 'bg-red-500 text-white border-transparent' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-white/5'
                    ]">
                      <i :class="[item.icon, 'text-base']"></i>
                    </div>

                    <!-- Label & Desc -->
                    <div class="flex flex-col min-w-0">
                      <span :class="['font-bold tracking-tight transition-colors', sizeConfig.label, item.variant === 'danger' ? 'text-red-600' : 'text-slate-700 dark:text-slate-200']">
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
/* Button komponenti bilan bir xil animatsiya va stillar */
.premium-dropdown-enter-active { 
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); 
}
.premium-dropdown-enter-from { 
  opacity: 0; 
  transform: translateY(-10px) scale(0.95); 
}

.slide-up-enter-active, .slide-up-leave-active { 
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1); 
}
.slide-up-enter-from, .slide-up-leave-to { 
  transform: translateY(100%); 
}

.ghost-item { 
  opacity: 0.5; 
  background: #f1f5f9 !important; 
}

.pb-safe { padding-bottom: calc(max(1rem, env(safe-area-inset-bottom))); }

.custom-menu-scroll::-webkit-scrollbar { width: 4px; }
.custom-menu-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>