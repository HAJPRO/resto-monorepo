<script setup>
import { watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Panel' },
  subtitle: { type: String, default: 'Ma\'lumotlarni boshqarish' },
  placement: { type: String, default: 'right' }, // right, left
  maxWidth: { type: String, default: '500px' }, // Istalgan o'lcham (px, %, vw)
  showFooter: { type: Boolean, default: true },
  closeOnEsc: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'cancel']);

const close = () => {
  emit('update:modelValue', false);
  emit('cancel');
};

// ESC tugmasi orqali yopish
const handleEsc = (e) => {
  if (props.closeOnEsc && e.key === 'Escape' && props.modelValue) close();
};

watch(() => props.modelValue, (val) => {
  if (val) {
    document.body.classList.add('drawer-open');
    window.addEventListener('keydown', handleEsc);
  } else {
    document.body.classList.remove('drawer-open');
    window.removeEventListener('keydown', handleEsc);
  }
});

onUnmounted(() => {
  document.body.classList.remove('drawer-open');
  window.removeEventListener('keydown', handleEsc);
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="modelValue" 
      class="fixed inset-0 z-[1000] flex overflow-hidden" 
      role="dialog" 
      aria-modal="true"
    >
      <Transition
        appear
        enter-active-class="ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          class="absolute inset-0 bg-transparent backdrop-blur-[2px] transition-opacity" 
          @click="close" 
        />
      </Transition>

      <div 
        :class="[
          'fixed inset-y-0 flex transition-transform duration-500 ease-in-out',
          placement === 'right' ? 'right-0' : 'left-0'
        ]"
        :style="{ width: '100%', maxWidth: maxWidth }"
      >
        <Transition
          appear
          :enter-from-class="placement === 'right' ? 'translate-x-full' : '-translate-x-full'"
          enter-to-class="translate-x-0"
          :leave-to-class="placement === 'right' ? 'translate-x-full' : '-translate-x-full'"
          class="duration-500"
        >
          <div 
            class="flex h-full w-full flex-col bg-white/90 dark:bg-[#0f172a]/90 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-l dark:border-white/5"
            @click.stop
          >
            
            <div class="flex items-center justify-between px-8 py-7 border-b dark:border-white/[0.03]">
              <div class="space-y-1.5">
                <h2 class="text-2xl font-black text-slate-900 dark:text-white leading-none italic uppercase tracking-tighter">
                  {{ title }}
                </h2>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
                  {{ subtitle }}
                </p>
              </div>
              
              <button 
                @click="close" 
                class="group w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-red-500 hover:text-white transition-all active:scale-90"
              >
                <svg class="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-8 py-6 custom-drawer-scroll select-text">
              <slot />
            </div>

            <div 
              v-if="showFooter" 
              class="px-8 py-6 border-t dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]"
            >
              <slot name="footer-actions" />
            </div>

          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<style>
/* Global klasslar */
body.drawer-open {
  overflow: hidden !important;
  padding-right: 5px; /* Skrollbar yo'qolganda sahifa siljib ketmasligi uchun */
}
</style>

<style scoped>
/* Scrollbar dizayni */
.custom-drawer-scroll::-webkit-scrollbar { 
  width: 4px; 
}
.custom-drawer-scroll::-webkit-scrollbar-track { 
  background: transparent; 
}
.custom-drawer-scroll::-webkit-scrollbar-thumb {
  background: #10b981; 
  border-radius: 10px;
  opacity: 0.5;
}

/* Glassmorphism effekti */
.dark .custom-drawer-scroll::-webkit-scrollbar-thumb { 
  background: rgba(16, 185, 129, 0.4); 
}

/* Transitsiya vaqtlari uchun yordamchi */
.duration-500 {
  transition-duration: 500ms;
}
</style>