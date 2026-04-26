<script setup>
import { ref } from 'vue';

const isOpen = ref(false);
const options = ref({
  title: 'Ishonchingiz komilmi?',
  message: '',
  confirmText: 'Tasdiqlash',
  cancelText: 'Bekor qilish',
  variant: 'danger', // 'danger' | 'primary' | 'warning'
});

let resolvePromise;

const open = (config) => {
  options.value = { ...options.value, ...config };
  isOpen.value = true;
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const confirm = () => {
  isOpen.value = false;
  resolvePromise(true);
};

const cancel = () => {
  isOpen.value = false;
  resolvePromise(false);
};

// Tashqaridan chaqirish uchun metodni eksport qilamiz
defineExpose({ open });
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="isOpen" class="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        
        <div class="w-full sm:max-w-[400px] overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl transition-all flex flex-col">
          
          <div class="p-6 sm:p-8 flex flex-col items-center text-center overflow-y-auto max-h-[60vh]">
            <div :class="[
              'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 text-2xl sm:text-3xl transition-transform duration-500 scale-110',
              options.variant === 'danger' ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10' : 
              options.variant === 'warning' ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10' : 
              'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10'
            ]">
              <i :class="['fa-solid', 
                options.variant === 'danger' ? 'fa-trash-can' : 
                options.variant === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-check']">
              </i>
            </div>

            <h3 class="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">
              {{ options.title }}
            </h3>
            <p class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              {{ options.message }}
            </p>
          </div>

          <div class="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-2 sm:gap-3">
            <button @click="cancel" class="flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all">
              {{ options.cancelText }}
            </button>
            <button @click="confirm" :class="[
              'flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white shadow-lg transition-all active:scale-95',
              options.variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 
              options.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 
              'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'
            ]">
              {{ options.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-fade-enter-active, .dialog-fade-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; transform: scale(0.9) translateY(20px); }
</style>