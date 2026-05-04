<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'YANGI STOL' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'fa-solid fa-cart-shopping' },
  width: { type: String, default: '500px' }, // Default Desktop kenglik
  height: { type: String, default: 'auto' },
  closeOnBackdrop: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'close']);

const modalRef = ref(null);
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

const staticZIndex = 1000;
const currentZIndex = ref(staticZIndex);
const isDragging = ref(false);
const isResizing = ref(false);

// Xatolikni oldini olish uchun aniq boshlang'ich qiymatlar
const position = ref({ x: 0, y: 0 });
const size = ref({ width: '500px', height: 'auto' });

// --- UNIVERSAL MOSLASHUVCHANLIK VA MARKAZLASHTIRISH LOGIKASI ---
const adjustToScreen = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;

  const isMobile = windowWidth.value < 768;
  const isTablet = windowWidth.value >= 768 && windowWidth.value < 1024;

  let finalWidth;
  if (isMobile) {
    // Mobil: Ekran kengligining 94%i, lekin 320pxdan kam emas
    finalWidth = Math.max(windowWidth.value * 0.94, 320);
  } else if (isTablet) {
    // Planshet: Qat'iy 600px
    finalWidth = 600;
  } else {
    // Desktop: Props kengligi, lekin 450pxdan kam emas
    finalWidth = Math.max(parseInt(props.width), 450);
  }

  // Kenglik hech qachon ekrandan chiqib ketmasligi kerak
  finalWidth = Math.min(finalWidth, windowWidth.value * 0.98);
  
  size.value = { 
    width: `${finalWidth}px`, 
    height: props.height === 'auto' ? 'auto' : props.height 
  };

  // Har safar ochilganda default positionni 0 qilib markazda qoldiramiz.
  position.value = { x: 0, y: 0 };
};

const focusModal = () => {
  const allModals = document.querySelectorAll('.modal-root-adaptive');
  let maxZ = staticZIndex;
  allModals.forEach(el => {
    const z = parseInt(window.getComputedStyle(el).zIndex);
    if (z > maxZ) maxZ = z;
  });
  currentZIndex.value = maxZ + 2;
};

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

// --- UNIVERSAL DRAG (Mouse & Touch) ---
let startX, startY;
const initDrag = (e) => {
  if (e.target.closest('.drag-handle') && !e.target.closest('button')) {
    focusModal();
    isDragging.value = true;
    const ev = e.type.includes('touch') ? e.touches[0] : e;
    startX = ev.clientX - position.value.x;
    startY = ev.clientY - position.value.y;

    const moveEvent = e.type.includes('touch') ? 'touchmove' : 'mousemove';
    const stopEvent = e.type.includes('touch') ? 'touchend' : 'mouseup';

    const doMove = (me) => {
      if (!isDragging.value) return;
      if (me.cancelable) me.preventDefault();
      const mev = me.type.includes('touch') ? me.touches[0] : me;
      position.value = { x: mev.clientX - startX, y: mev.clientY - startY };
    };

    const stopMove = () => {
      isDragging.value = false;
      document.removeEventListener(moveEvent, doMove);
      document.removeEventListener(stopEvent, stopMove);
    };

    document.addEventListener(moveEvent, doMove, { passive: false });
    document.addEventListener(stopEvent, stopMove);
  }
};

// --- UNIVERSAL RESIZE (Mouse & Touch) ---
const initResize = (e) => {
  focusModal();
  isResizing.value = true;
  const ev = e.type.includes('touch') ? e.touches[0] : e;
  const initialWidth = modalRef.value.offsetWidth;
  const initialHeight = modalRef.value.offsetHeight;
  const initialX = ev.clientX;
  const initialY = ev.clientY;

  const moveEvent = e.type.includes('touch') ? 'touchmove' : 'mousemove';
  const stopEvent = e.type.includes('touch') ? 'touchend' : 'mouseup';

  const doResize = (rev) => {
    if (!isResizing.value) return;
    if (rev.cancelable) rev.preventDefault();
    const rEv = rev.type.includes('touch') ? rev.touches[0] : rev;
    size.value = { 
      // Minimal kenglikni 320px qilib belgilaymiz
      width: `${Math.max(320, initialWidth + (rEv.clientX - initialX))}px`, 
      height: `${Math.max(200, initialHeight + (rEv.clientY - initialY))}px` 
    };
  };

  const stopResize = () => {
    isResizing.value = false;
    document.removeEventListener(moveEvent, doResize);
    document.removeEventListener(stopEvent, stopResize);
  };

  document.addEventListener(moveEvent, doResize, { passive: false });
  document.addEventListener(stopEvent, stopResize);
};

// --- WATCHERS & LIFECYCLE ---
watch(() => props.modelValue, async (val) => {
  if (val) {
    adjustToScreen();
    // Mobilda fonni bloklash (Desktopda multitasking uchun ochiq qoladi)
    if (window.innerWidth < 1024) document.body.style.overflow = 'hidden';
    await nextTick();
    focusModal();
  } else {
    // Barcha modallar yopilganini tekshirish
    const otherModals = document.querySelectorAll('.modal-card.is-window-open').length;
    if (otherModals <= 1) document.body.style.overflow = '';
  }
});

onMounted(() => {
  window.addEventListener('resize', adjustToScreen);
  // Birinchi marta ochilganda
  if (props.modelValue) adjustToScreen();
});

onUnmounted(() => {
  window.removeEventListener('resize', adjustToScreen);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-luxe">
      <div v-if="modelValue" 
           class="modal-root-adaptive fixed inset-0 p-4 flex items-center justify-center transition-all duration-300"
           :class="windowWidth < 1024 ? 'pointer-events-auto' : 'pointer-events-none'"
           :style="{ zIndex: currentZIndex }">
        
        <div 
          v-if="windowWidth < 1024"
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-all"
          @click="closeOnBackdrop && close()"
        ></div>

        <div 
          ref="modalRef"
          class="modal-card is-window-open relative bg-slate-50 dark:bg-slate-950 flex flex-col pointer-events-auto border border-slate-200 dark:border-slate-800 shadow-2xl"
          :class="{'is-active': isDragging || isResizing}"
          :style="{ 
            transform: `translate(${position.x}px, ${position.y}px)`,
            width: size.width,
            minWidth: '320px', 
            height: size.height,
            maxWidth: '100vw',
            maxHeight: '100vh',
            GPU: 'backface-visibility: hidden'
          }"
          @mousedown="focusModal"
          @touchstart="focusModal"
        >
          <div 
            @mousedown="initDrag" 
            @touchstart="initDrag"
            class="drag-handle px-4 py-3 flex justify-between items-center select-none shrink-0 border-b border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 rounded-t-[24px] cursor-grab active:cursor-grabbing w-full gap-3"
          >
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <i :class="[icon, 'text-md']"></i>
              </div>
              <div class="overflow-hidden">
                <h3 class="text-[16px] font-bold text-slate-800 dark:text-white truncate leading-tight tracking-tight">
                  {{ title }}
                </h3>
                <p v-if="subtitle" class="text-[10px] text-indigo-500 font-bold tracking-widest mt-1 truncate uppercase">
                  {{ subtitle }}
                </p>
              </div>
            </div>
            
            <button @click="close" class="close-btn group shrink-0">
              <i class="fa-solid fa-xmark text-lg text-slate-400 group-hover:text-rose-500 transition-colors"></i>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar p-2 w-full text-slate-700 dark:text-slate-300">
            <slot />
          </div>

          <div v-if="$slots.footer" class="px-3 py-2 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 rounded-b-[24px]">
            <slot name="footer" :close="close" />
          </div>

          <div @mousedown="initResize" @touchstart="initResize" class="resize-handle group">
            <div class="w-5 h-5 border-r-[3px] border-b-[3px] border-slate-300 dark:border-slate-700 rounded-br-md group-hover:border-indigo-500 transition-colors"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-card {
  border-radius: 24px;
  will-change: transform, width, height;
}

.modal-card.is-active {
  box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.45);
  border-color: #6366f1;
}

.close-btn {
  @apply w-9 h-9 rounded-full flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all;
}

.resize-handle {
  @apply absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize flex items-end justify-end p-1 z-50;
  /* Touch qurilmalarda osonroq tutish uchun maydon biroz kengaytirilgan */
}

/* Custom Scrollbar Styling */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
  background-color: #e2e8f0; 
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1e293b; }

/* Luxe Smooth Animation */
.modal-luxe-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-luxe-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-luxe-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(40px);
  filter: blur(10px);
}
.modal-luxe-leave-to {
  opacity: 0;
  transform: scale(0.95);
  filter: blur(5px);
}
</style>