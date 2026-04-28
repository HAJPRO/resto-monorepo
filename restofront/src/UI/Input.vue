<script setup>
import { computed, ref, useAttrs, useSlots, watch } from 'vue';

defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: { type: [String, Number, Object], default: '' },
  type: { type: String, default: 'text' },
  id: { type: String, default: () => `input-${Math.random().toString(36).substr(2, 9)}` },
  size: { 
    type: String, 
    default: 'middle',
    validator: (v) => ['small', 'middle', 'large'].includes(v)
  },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  help: { type: String, default: '' },
  error: { type: [String, Boolean], default: false },
  rules: { type: Array, default: () => [] },
  success: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  isFormatted: { type: Boolean, default: false }, // Yangi: Sonlarni formatlash uchun
  iconPre: { type: String, default: '' },
  iconPost: { type: String, default: '' },
  rows: { type: [String, Number], default: 3 },
  suffix: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'clear', 'focus', 'blur', 'enter', 'change']);
const attrs = useAttrs();
const slots = useSlots();

const inputRef = ref(null);
const fileInputRef = ref(null);
const isFocused = ref(false);
const showPassword = ref(false);
const fileName = ref('');

// --- FORMATTING LOGIC ---
const formatNumber = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  const parts = val.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join('.');
};

const unformatNumber = (val) => {
  if (typeof val === 'number') return val;
  return val.toString().replace(/\s/g, '').replace(/,/g, '.');
};

const displayValue = computed(() => {
  if (props.isFormatted && props.type === 'number') {
    return formatNumber(props.modelValue);
  }
  return props.modelValue;
});

// --- VALIDATION LOGIC ---
const internalError = ref(false);
const runValidation = (value) => {
  if (props.rules && props.rules.length > 0) {
    for (const rule of props.rules) {
      const result = rule(value);
      if (result !== true) {
        internalError.value = result;
        return false;
      }
    }
  }
  internalError.value = false;
  return true;
};

const validate = () => runValidation(props.modelValue);
const resetValidation = () => { internalError.value = false; };
defineExpose({ validate, resetValidation });

// --- CONFIGURATIONS ---
const sizeConfig = computed(() => {
  const configs = {
    small: { h: 'min-h-[38px]', font: 'text-[12px]', icon: 'text-sm', rounded: 'rounded-xl' },
    middle: { h: 'min-h-[46px]', font: 'text-[14px]', icon: 'text-base', rounded: 'rounded-2xl' },
    large: { h: 'min-h-[54px]', font: 'text-[16px]', icon: 'text-lg', rounded: 'rounded-[22px]' }
  };
  return configs[props.size] || configs.middle;
});

const hasContent = computed(() => {
  if (props.type === 'file') return !!fileName.value;
  return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined;
});

const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) return 'text';
  if (props.isFormatted && props.type === 'number') return 'text'; // Formatlash uchun text rejim kerak
  return props.type;
});

const getAutoIcon = () => {
  const icons = { 
    email: 'fa-regular fa-envelope', tel: 'fa-solid fa-phone', 
    date: 'fa-regular fa-calendar', search: 'fa-solid fa-magnifying-glass', 
    password: 'fa-solid fa-shield-halved' 
  };
  return icons[props.type] || null;
};

// --- STYLES ---
const wrapperClasses = computed(() => [
  'relative flex items-center w-full transition-all duration-300 border shadow-sm group/wrapper',
  'bg-white dark:bg-slate-950',
  sizeConfig.value.rounded,
  props.type === 'textarea' ? 'items-start min-h-[100px]' : 'items-center',
  (props.error || internalError.value) ? 'border-rose-400 ring-4 ring-rose-500/10' : 
  props.success ? 'border-emerald-400 ring-4 ring-emerald-500/10' : 
  isFocused.value ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-indigo-100 dark:shadow-none' : 
  'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
  (props.disabled || props.loading) ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50' : ''
]);

const labelClasses = computed(() => {
  const hasPrefix = !!slots.prefix || !!props.iconPre || !!getAutoIcon();
  const leftPadding = hasPrefix ? (props.size === 'small' ? 'left-9' : 'left-10') : 'left-4';
  return [
    'absolute font-bold transition-all duration-200 select-none z-10 pointer-events-none tracking-wide uppercase text-[10px]',
    'bg-white dark:bg-slate-950 px-1.5 rounded',
    (isFocused.value || hasContent.value || props.type === 'date')
      ? `-top-2.5 ${leftPadding} text-indigo-600 dark:text-indigo-400`
      : `top-1/2 -translate-y-1/2 ${leftPadding} text-slate-400`,
    (props.error || internalError.value) ? '!text-rose-500' : ''
  ];
});

// --- HANDLERS ---
const handleInput = (e) => {
  let value = e.target.value;
  if (props.isFormatted && props.type === 'number') {
    const cleanValue = value.replace(/[^0-9.,]/g, '');
    const numericValue = unformatNumber(cleanValue);
    const finalValue = numericValue === '' ? '' : Number(numericValue);
    emit('update:modelValue', finalValue);
    e.target.value = formatNumber(numericValue); // Vizual formatlash
    if (internalError.value) runValidation(finalValue);
  } else {
    emit('update:modelValue', value);
    if (internalError.value) runValidation(value);
  }
};

const handleBlur = (e) => {
  isFocused.value = false;
  runValidation(props.modelValue);
  emit('blur', e);
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    fileName.value = file.name;
    emit('update:modelValue', file);
    emit('change', file);
    runValidation(file);
  }
};

const triggerFile = () => !props.disabled && fileInputRef.value?.click();

const clear = () => {
  emit('update:modelValue', '');
  fileName.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
  internalError.value = false;
  emit('clear');
};
</script>

<template>
  <div class="flex flex-col w-full group/input">
    <div :class="wrapperClasses" @click="type === 'file' ? triggerFile() : null">
      
      <label v-if="label" :class="labelClasses">
        {{ label }} <span v-if="required" class="text-rose-500">*</span>
      </label>

      <div 
        v-if="$slots.prefix || iconPre || getAutoIcon()"
        class="flex items-center justify-center shrink-0 transition-all duration-300 pl-4"
        :class="[
          sizeConfig.icon,
          isFocused ? 'text-indigo-500 scale-110' : (internalError ? 'text-rose-400' : 'text-slate-400'),
          { 'pt-4': type === 'textarea' }
        ]"
      >
        <slot name="prefix">
          <i :class="iconPre || getAutoIcon()"></i>
        </slot>
      </div>

      <div class="relative flex-1 flex items-center min-w-0">
        <div v-if="type === 'file'" class="w-full flex items-center justify-between gap-2 px-4 select-none">
          <span :class="[sizeConfig.font, fileName ? 'text-slate-700 dark:text-slate-200 font-bold' : 'text-slate-400 italic']" class="truncate">
            {{ fileName || placeholder || 'Faylni tanlang...' }}
          </span>
          <span class="shrink-0 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-500/20">
            Browse
          </span>
        </div>

        <component
          :is="type === 'textarea' ? 'textarea' : 'input'"
          v-else
          ref="inputRef"
          :id="id"
          :type="inputType"
          :value="displayValue"
          :placeholder="isFocused ? placeholder : ''"
          :disabled="disabled || loading"
          :readonly="readonly"
          :rows="rows"
          class="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 font-bold text-slate-700 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 transition-all"
          :class="[
             sizeConfig.font, 
             type === 'textarea' ? 'py-4 px-4 resize-none' : sizeConfig.h + ' pl-4 pr-10',
             attrs.class 
          ]"
          v-bind="attrs"
          @input="handleInput"
          @focus="isFocused = true; emit('focus')"
          @blur="handleBlur"
          @keydown.enter="emit('enter')"
        />

        <transition name="fade">
          <button 
            v-if="clearable && hasContent && !disabled && !loading"
            @click.stop="clear"
            type="button"
            class="absolute right-2 p-1 rounded-full text-slate-300 hover:text-rose-500 transition-colors"
          >
            <i class="fa-solid fa-circle-xmark text-sm"></i>
          </button>
        </transition>
      </div>

      <div class="flex items-center gap-2 shrink-0 pr-4 ml-1">
        <i v-if="loading" class="fa-solid fa-spinner fa-spin text-indigo-500" :class="sizeConfig.icon"></i>

        <button 
          v-if="type === 'password' && !disabled"
          @click.stop="showPassword = !showPassword"
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <i :class="[showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye', sizeConfig.icon]"></i>
        </button>

        <span v-if="suffix" class="text-[10px] font-black text-slate-400 uppercase select-none tracking-widest">{{ suffix }}</span>

        <i v-if="(error || internalError) && !loading" class="fa-solid fa-circle-exclamation text-rose-500 animate-pulse" :class="sizeConfig.icon"></i>
        <i v-if="success && !loading" class="fa-solid fa-circle-check text-emerald-500" :class="sizeConfig.icon"></i>
      </div>

      <input v-if="type === 'file'" ref="fileInputRef" type="file" class="hidden" @change="handleFileChange" />
    </div>

    <div class="min-h-[20px] pt-1 px-2">
      <transition name="msg">
        <p v-if="error || internalError" class="text-[10px] font-bold text-rose-500 flex items-center gap-1">
          <span class="w-1 h-1 bg-rose-500 rounded-full"></span> 
          {{ typeof (error || internalError) === 'string' ? (error || internalError) : 'Majburiy maydon' }}
        </p>
        <p v-else-if="help" class="text-[10px] font-medium text-slate-400 italic">
          {{ help }}
        </p>
      </transition>
    </div>
  </div>
</template>

<style scoped>
input, textarea, button { outline: none !important; box-shadow: none !important; }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }
input::placeholder { font-weight: 500; font-style: italic; opacity: 0.6; }

.msg-enter-active, .msg-leave-active { transition: all 0.3s ease; }
.msg-enter-from, .msg-leave-to { opacity: 0; transform: translateX(-10px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.8); }

input:-webkit-autofill {
  -webkit-text-fill-color: inherit;
  -webkit-box-shadow: 0 0 0px 1000px transparent inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>