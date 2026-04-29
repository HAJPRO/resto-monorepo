<template>
  <Transition name="kb-smooth">
    <div v-if="show" class="fixed inset-0 z-[999] flex items-end justify-center overflow-hidden">
      
      <div class="absolute inset-0 bg-[#05070a]/90 backdrop-blur-md" @click="$emit('close')"></div>

      <div class="relative w-full sm:max-w-md bg-[#0d111b] rounded-t-[50px] shadow-[0_-20px_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] border-t border-white/5 antialiased">
        
        <div class="flex flex-col items-center pt-4 shrink-0">
          <div class="w-12 h-1 bg-slate-800 rounded-full mb-4"></div>
        </div>

        <div class="px-8 pb-12 overflow-y-auto no-scrollbar">
          
          <div class="mb-10 text-right pr-2">
            <div class="flex items-center justify-end gap-3">
              <div class="flex flex-col items-end">
                <span class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/60 mb-1">Total Amount</span>
                <h1 class="font-bold tracking-tighter text-white transition-all duration-300"
                    :class="modelValue.toString().length > 9 ? 'text-4xl' : 'text-6xl'">
                  {{ formatNumber(modelValue) || '0' }}
                </h1>
              </div>
              <div class="w-1 h-12 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse"></div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-y-8 gap-x-6 mb-10">
            <button v-for="n in ['1','2','3','4','5','6','7','8','9']" :key="n" 
              @click="onKeyClick(n)" class="kb-key-minimal">
              {{ n }}
            </button>

            <button @click="onKeyClick('.')" class="h-16 flex items-center justify-center group">
              <div class="w-2 h-2 rounded-full bg-slate-800 group-active:bg-indigo-500 transition-colors"></div>
            </button>
            
            <button @click="onKeyClick('0')" class="kb-key-minimal">0</button>

            <button @click="onDelete" class="h-16 flex items-center justify-center text-slate-600 active:text-rose-500 transition-colors">
              <i class="fa-solid fa-delete-left text-2xl"></i>
            </button>
          </div>

          <div class="flex justify-between gap-3 mb-8">
             <button v-for="amt in ['+10k', '+50k', '+100k', '+500k']" :key="amt" @click="onQuickAdd(amt)"
               class="flex-1 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[10px] font-bold text-slate-500 active:bg-indigo-600 active:text-white transition-all uppercase tracking-tighter">
               {{ amt }}
             </button>
          </div>

          <button @click="$emit('close')" 
            :disabled="modelValue == '0' || modelValue == ''"
            class="w-full h-16 rounded-3xl flex items-center justify-center gap-3 transition-all duration-500"
            :class="(modelValue != '0' && modelValue != '') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-600 opacity-40'">
            <span class="font-black uppercase tracking-[0.2em] text-xs">Tayyor</span>
            <i class="fa-solid fa-chevron-right text-xs transition-transform group-active:translate-x-1"></i>
          </button>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  modelValue: { type: [String, Number], default: '0' }
});
const emit = defineEmits(['update:modelValue', 'close']);

const formatNumber = (val) => {
  if (!val || val === '0') return '0';
  let parts = val.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join('.');
};

const onKeyClick = (key) => {
  let current = props.modelValue?.toString() || '0';
  if (key === '.' && current.includes('.')) return;
  if (current.length > 12) return; 
  if (current === '0' && key !== '.') emit('update:modelValue', key);
  else emit('update:modelValue', current + key);
};

const onQuickAdd = (amt) => {
  const val = parseInt(amt.replace(/\D/g, '')) * 1000;
  const current = parseFloat(props.modelValue.toString().replace(/\s/g, '')) || 0;
  emit('update:modelValue', (current + val).toString());
};

const onDelete = () => {
  let s = props.modelValue.toString();
  emit('update:modelValue', s.length > 1 ? s.slice(0, -1) : '0');
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.kb-key-minimal {
  @apply h-16 flex items-center justify-center text-4xl font-medium text-white 
         transition-all duration-100 select-none active:scale-75 active:text-indigo-500;
}

.kb-smooth-enter-active, .kb-smooth-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.kb-smooth-enter-from, .kb-smooth-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>