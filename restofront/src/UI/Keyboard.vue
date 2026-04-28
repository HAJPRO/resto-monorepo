<template>
  <Transition name="slide-up">
    <div v-if="show" class="fixed inset-x-0 bottom-0 z-[999] bg-white/95 dark:bg-slate-900/98 backdrop-blur-3xl border-t border-slate-200/60 dark:border-white/10 pb-10 pt-2 px-6 shadow-[0_-25px_60px_rgba(0,0,0,0.15)] rounded-t-[45px]">
      
      <div class="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto my-4 mb-6"></div>

      <div class="max-w-md mx-auto">
        <div class="relative group mb-6">
          <div class="bg-slate-50 dark:bg-slate-800/40 rounded-[28px] p-5 border border-slate-100 dark:border-white/5 transition-all duration-300 group-focus-within:border-indigo-500">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kiritish maydoni</span>
              
              <button 
                v-if="modelValue && modelValue !== '0'"
                @click="onClearAll"
                class="w-6 h-6 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
              >
                <ion-icon :icon="closeOutline" class="text-lg" />
              </button>
            </div>

            <div class="flex items-baseline justify-end mt-2 overflow-hidden">
              <span class="text-4xl font-black text-slate-900 dark:text-white transition-all tracking-tight">
                {{ formatNumber(modelValue) || '0' }}
              </span>
              <div class="w-1 h-8 bg-indigo-500 ml-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          <button 
            v-for="amount in ['+1000', '+5000', '+10000', '+50000']" 
            :key="amount"
            @click="onQuickAdd(amount)"
            class="whitespace-nowrap px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100/50 dark:border-indigo-500/20 active:scale-95 transition-all"
          >
            {{ amount }}
          </button>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <button 
            v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9']" 
            :key="num"
            @click="onKeyClick(num)"
            class="h-[72px] rounded-[24px] bg-white dark:bg-slate-800/50 text-slate-800 dark:text-white text-2xl font-bold shadow-sm border border-slate-100 dark:border-white/5 active:scale-90 active:bg-slate-50 dark:active:bg-slate-800 transition-all"
          >
            {{ num }}
          </button>

          <button @click="onKeyClick('.')" class="h-[72px] rounded-[24px] text-slate-500 dark:text-slate-400 text-2xl font-bold flex items-center justify-center">.</button>
          
          <button @click="onKeyClick('0')" class="h-[72px] rounded-[24px] bg-white dark:bg-slate-800/50 text-slate-800 dark:text-white text-2xl font-bold border border-slate-100 dark:border-white/5 active:scale-90 transition-all">0</button>

          <button 
            @click="onDelete"
            class="h-[72px] rounded-[24px] bg-slate-50 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center active:scale-90 transition-all"
          >
            <ion-icon :icon="backspaceOutline" class="text-2xl" />
          </button>

          <button 
            @click="$emit('close')"
            class="col-span-3 h-16 rounded-[24px] bg-slate-900 dark:bg-indigo-600 text-white text-base font-black shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
          >
            Tayyor 
            <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ion-icon :icon="chevronForwardOutline" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { backspaceOutline, closeOutline, chevronForwardOutline } from 'ionicons/icons';

const props = defineProps({
  show: Boolean,
  modelValue: [String, Number]
});

const emit = defineEmits(['update:modelValue', 'close']);

// Raqamlarni chiroyli formatlash (1000 -> 1 000)
const formatNumber = (val) => {
  if (!val) return '0';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const onKeyClick = (key) => {
  let current = props.modelValue?.toString() || '';
  if (key === '.' && current.includes('.')) return;
  if (current === '0' && key !== '.') {
    emit('update:modelValue', key);
  } else {
    emit('update:modelValue', current + key);
  }
};

const onQuickAdd = (amount) => {
  const valueToAdd = parseInt(amount.replace('+', ''));
  const current = parseInt(props.modelValue) || 0;
  emit('update:modelValue', (current + valueToAdd).toString());
};

const onClearAll = () => {
  emit('update:modelValue', '');
};

const onDelete = () => {
  let current = props.modelValue?.toString() || '';
  emit('update:modelValue', current.slice(0, -1));
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(110%);
}
</style>