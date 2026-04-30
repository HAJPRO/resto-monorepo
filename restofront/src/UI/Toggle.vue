<script setup>
import { computed } from 'vue';
import { vibrate } from '../utils/index.util';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'primary' // 'primary', 'success', 'danger', 'warning'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md' // 'sm', 'md', 'lg'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const toggle = () => {
  if (props.disabled) return;
  vibrate("light");
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

// Ranglar palitrasi
const colorClasses = computed(() => {
  const colors = {
    primary: 'peer-checked:bg-indigo-600',
    success: 'peer-checked:bg-emerald-500',
    danger: 'peer-checked:bg-rose-500',
    warning: 'peer-checked:bg-amber-500',
  };
  return colors[props.color] || colors.primary;
});

// O'lchamlar
const sizeClasses = computed(() => {
  const sizes = {
    sm: { container: 'w-8 h-4.5', dot: 'w-3.5 h-3.5', translate: 'peer-checked:translate-x-3.5' },
    md: { container: 'w-11 h-6', dot: 'w-5 h-5', translate: 'peer-checked:translate-x-5' },
    lg: { container: 'w-14 h-7.5', dot: 'w-6.5 h-6.5', translate: 'peer-checked:translate-x-6.5' }
  };
  return sizes[props.size] || sizes.md;
});
</script>

<template>
  <label 
    class="inline-flex items-center cursor-pointer select-none group"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    @click.prevent="toggle"
  >
    <div class="relative">
      <input 
        type="checkbox" 
        :checked="modelValue" 
        class="sr-only peer" 
        :disabled="disabled"
      >
      
      <div 
        :class="[
          sizeClasses.container,
          colorClasses,
          'bg-slate-200 dark:bg-slate-700 rounded-full transition-all duration-300 ease-in-out border-2 border-transparent shadow-inner'
        ]"
      ></div>
      
      <div 
        :class="[
          sizeClasses.dot,
          sizeClasses.translate,
          'absolute left-0.5 top-0.5 bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md flex items-center justify-center'
        ]"
      >
        <div v-if="modelValue" class="w-1 h-1 rounded-full bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </div>
    
    <span v-if="label" class="ml-3 text-[13px] font-bold text-slate-600 dark:text-slate-300">
      {{ label }}
    </span>
  </label>
</template>

<style scoped>
/* Aktiv bo'lganda thumbning cho'zilishi (Slick effect) */
.group:active .relative div:last-child {
  width: calc(1.25rem + 4px); /* MD o'lcham uchun biroz cho'zilish */
}

/* Dark mode uchun maxsus soya */
.dark .shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}
</style>