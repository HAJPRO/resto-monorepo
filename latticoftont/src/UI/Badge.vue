<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Badge ichidagi matn (yoki slot ishlatish mumkin)
  text: { type: String, default: '' },
  
  // Rang variantlari: indigo, emerald, rose, amber, blue, slate, violet
  variant: { type: String, default: 'indigo' },
  
  // O'lcham: sm, md, lg
  size: { type: String, default: 'md' },
  
  // Kontur varianti (border bilan)
  outline: { type: Boolean, default: false },
  
  // Doira shakli (pulse effekti uchun)
  dot: { type: Boolean, default: false },

  // Ikonka (ixtiyoriy)
  icon: { type: String, default: '' }
});

const themeClasses = computed(() => {
  const themes = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    slate: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    violet: 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
  };
  
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2.5 py-1 text-[10px]',
    lg: 'px-3 py-1.5 text-[11px]',
  };

  return `${themes[props.variant]} ${sizes[props.size]} ${props.outline ? 'border' : 'border-transparent'}`;
});
</script>

<template>
  <div 
    :class="[
      'inline-flex items-center justify-center font-black uppercase tracking-widest rounded-lg transition-all duration-300',
      themeClasses
    ]"
  >
    <span v-if="dot" class="relative flex h-2 w-2 mr-1.5">
      <span :class="['animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', `bg-${variant}-400`]"></span>
      <span :class="['relative inline-flex rounded-full h-2 w-2', `bg-${variant}-500`]"></span>
    </span>

    <i v-if="icon" :class="[icon, 'mr-1.5 opacity-70']"></i>

    <slot>{{ text }}</slot>
  </div>
</template>

<style scoped>
/* Kerak bo'lsa qo'shimcha animatsiyalar */
</style>