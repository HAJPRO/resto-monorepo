<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'info', 'secondary', 'success', 'danger', 'warning', 'dark'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
  },
  outline: { type: Boolean, default: false },
  rounded: { type: Boolean, default: false },
  loading: Boolean,
  disabled: Boolean,
  block: Boolean,
  href: String,
  to: [String, Object],
  type: { type: String, default: 'button' },
  
  // Iconlar
  leftIcon: String,
  rightIcon: String,
  icon: String, // Markaziy icon uchun (matnsiz holatda ishlatiladi)
});

const emit = defineEmits(['click']);
const slots = useSlots();

// Slotda matn bor yoki yo'qligini aniqlash
const hasSlot = computed(() => !!slots.default);

const componentTag = computed(() => {
  if (props.to) return 'router-link';
  if (props.href) return 'a';
  return 'button';
});

// --- STILLAR ---
const baseClasses = `
  group relative inline-flex items-center justify-center 
  font-semibold tracking-wide cursor-pointer select-none
  transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:opacity-60 disabled:cursor-not-allowed
  active:scale-[0.95] border shadow-sm overflow-hidden
`;

// O'lchamlar mantiqi: Agar matn bo'lmasa (kvadrat tugma), px- (padding) o'rniga w- (width) ishlatiladi
const sizeClasses = computed(() => {
  const isIconOnly = !hasSlot.value && (props.icon || props.leftIcon || props.loading);
  
  const sizes = {
    sm: {
      base: 'h-[38px] text-xs gap-x-1.5 rounded-lg',
      padding: 'px-4',
      square: 'w-[38px]'
    },
    md: {
      base: 'h-[48px] text-[13px] gap-x-2 rounded-xl',
      padding: 'px-6',
      square: 'w-[48px]'
    },
    lg: {
      base: 'h-[58px] text-sm gap-x-2.5 rounded-2xl',
      padding: 'px-8',
      square: 'w-[58px]'
    }
  };

  const selected = sizes[props.size] || sizes.md;
  return `${selected.base} ${isIconOnly ? selected.square : selected.padding}`;
});

const getVariantClasses = () => {
  const isOutline = props.outline;
  const palettes = {
    primary: {
      solid: 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30',
      outline: 'bg-transparent border-indigo-600 text-indigo-600 hover:bg-indigo-50'
    },
    dark: {
      solid: 'border-transparent text-white bg-slate-900 hover:bg-slate-800 shadow-slate-900/20',
      outline: 'bg-transparent border-slate-700 text-slate-700 hover:bg-slate-900 hover:text-white'
    },
    secondary: {
      solid: 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 shadow-slate-200/50',
      outline: 'bg-transparent border-slate-300 text-slate-600 hover:bg-slate-100'
    },
    success: {
      solid: 'border-transparent text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30',
      outline: 'bg-transparent border-emerald-600 text-emerald-600 hover:bg-emerald-50'
    },
    danger: {
      solid: 'border-transparent text-white bg-red-600 hover:bg-red-700 shadow-red-500/30',
      outline: 'bg-transparent border-red-600 text-red-600 hover:bg-red-50'
    },
    warning: {
      solid: 'border-transparent text-white bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
      outline: 'bg-transparent border-amber-500 text-amber-500 hover:bg-amber-50'
    },
    info: {
      solid: 'border-transparent text-white bg-sky-500 hover:bg-sky-600 shadow-sky-500/30',
      outline: 'bg-transparent border-sky-500 text-sky-500 hover:bg-sky-50'
    }
  };

  // Tanlangan variantni olish, agar topilmasa 'primary'ga qaytish (fallback)
  const selected = palettes[props.variant] || palettes.primary;
  return isOutline ? selected.outline : selected.solid;
};

const buttonClasses = computed(() => {
  return [
    baseClasses,
    sizeClasses.value,
    getVariantClasses(),
    props.rounded ? 'rounded-full' : '',
    props.block ? 'w-full flex' : '',
    props.loading ? 'cursor-wait' : ''
  ].join(' ');
});
</script>

<template>
  <component
    :is="componentTag"
    :href="href"
    :to="to"
    :type="!href && !to ? type : undefined"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <i v-if="loading" class="fa-solid fa-circle-notch fa-spin text-[1.2em]"></i>

    <template v-else>
      <i 
        v-if="icon || leftIcon" 
        :class="[icon || leftIcon, 'text-[1.2em] transition-transform group-hover:scale-110', { 'mr-2': hasSlot && leftIcon }]"
      ></i>
      
      <span v-if="hasSlot" class="relative">
        <slot />
      </span>

      <i 
        v-if="rightIcon" 
        :class="[rightIcon, 'text-[1.1em] transition-transform group-hover:translate-x-0.5 ml-2']"
      ></i>
    </template>
  </component>
</template>