<script setup>
import { ref, computed, watch, useSlots, useAttrs } from 'vue';

defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  error: { type: [Boolean, String], default: false },
  success: { type: Boolean, default: false },
  rows: { type: Number, default: 4 },
  rules: { type: Array, default: () => [] }, // <--- Validatsiya qoidalari
  counter: { type: Boolean, default: false },
  maxlength: { type: [Number, String], default: null },
  iconPre: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'clear']);
const slots = useSlots();
const attrs = useAttrs();

const isFocused = ref(false);
const internalError = ref(false);

// --- VALIDATION LOGIC ---
const runValidation = (value) => {
  if (props.rules && props.rules.length > 0) {
    for (const rule of props.rules) {
      const result = rule(value);
      if (result !== true) {
        internalError.value = result; // Xato xabarini saqlash
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

// Qiymat o'zgarganda xatoni qayta tekshirish (agar xato bo'lsa)
watch(() => props.modelValue, (newVal) => {
  if (internalError.value) runValidation(newVal);
});

// --- STYLES ---
const wrapperClasses = computed(() => [
  'relative flex w-full transition-all duration-300 border shadow-sm group/wrapper px-4 py-3 min-h-[100px]',
  'bg-white dark:bg-slate-950 rounded-[22px]',
  (props.error || internalError.value) ? 'border-rose-400 ring-4 ring-rose-500/10' : 
  props.success ? 'border-emerald-400 ring-4 ring-emerald-500/10' : 
  isFocused.value ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-indigo-100 dark:shadow-none' : 
  'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
  (props.disabled) ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50' : ''
]);

const labelClasses = computed(() => {
  const hasIcon = !!slots.prefix || !!props.iconPre;
  const leftPadding = hasIcon ? 'left-10' : 'left-4';

  return [
    'absolute font-bold transition-all duration-200 select-none z-10 pointer-events-none tracking-wide uppercase text-[10px]',
    'bg-white dark:bg-slate-800 px-1.5 rounded',
    (isFocused.value || props.modelValue)
      ? `-top-2.5 ${leftPadding} text-indigo-600 dark:text-indigo-400`
      : `top-4 ${leftPadding} text-slate-400`,
    (props.error || internalError.value) ? '!text-rose-500' : ''
  ];
});

const handleInput = (e) => {
  emit('update:modelValue', e.target.value);
};

const handleClear = () => {
  emit('update:modelValue', '');
  emit('clear');
  if (internalError.value || props.required) runValidation('');
};

const onFocus = (e) => {
  isFocused.value = true;
  emit('focus', e);
};

const onBlur = (e) => {
  isFocused.value = false;
  runValidation(props.modelValue); // Focus yo'qolganda tekshirish
  emit('blur', e);
};
</script>

<template>
  <div class="flex flex-col w-full group/input font-sans antialiased">
    
    <div :class="wrapperClasses">
      
      <label v-if="label" :class="labelClasses">
        {{ label }} <span v-if="required" class="text-rose-500">*</span>
      </label>

      <div v-if="$slots.prefix || iconPre" 
        class="flex items-start pt-0.5 justify-center shrink-0 transition-all duration-300 mr-3"
        :class="[
          isFocused ? 'text-indigo-500' : (internalError ? 'text-rose-400' : 'text-slate-400')
        ]"
      >
        <slot name="prefix"><i :class="[iconPre, 'text-lg']"></i></slot>
      </div>

      <textarea
        v-bind="attrs"
        :value="modelValue"
        :rows="rows"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :placeholder="isFocused ? placeholder : ''"
        @input="handleInput"
        @focus="onFocus"
        @blur="onBlur"
        class="flex-1 bg-transparent border-none outline-none text-[14px] font-normal text-slate-700 dark:text-slate-100 placeholder:text-slate-300 placeholder:italic resize-none custom-scrollbar"
      ></textarea>

      <div class="flex flex-col items-center gap-2 ml-2 shrink-0">
        <transition name="fade">
          <button 
            v-if="clearable && modelValue && !disabled && !readonly" 
            @click="handleClear" 
            type="button" 
            class="p-1 rounded-full text-slate-300 hover:text-rose-500 transition-all active:scale-90"
          >
            <i class="fa-solid fa-circle-xmark text-base"></i>
          </button>
        </transition>

        <i v-if="error || internalError" class="fa-solid fa-circle-exclamation text-rose-500 animate-pulse text-base"></i>
        <i v-if="success && !internalError" class="fa-solid fa-circle-check text-emerald-500 text-base"></i>
      </div>
    </div>

    <div class="flex justify-between items-start min-h-[20px] pt-1 px-2">
      <transition name="msg">
        <p v-if="error || internalError" class="text-[10px] font-bold text-rose-500 flex items-center gap-1">
          <span class="w-1 h-1 bg-rose-500 rounded-full"></span> 
          {{ typeof (error || internalError) === 'string' ? (error || internalError) : 'Majburiy maydon' }}
        </p>
      </transition>

      <span v-if="counter && maxlength" class="ml-auto text-[10px] font-black tracking-widest text-slate-400 uppercase">
        {{ modelValue?.length || 0 }} / {{ maxlength }}
      </span>
    </div>

  </div>
</template>

<style scoped>
/* Scrollbar dizayni */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }

/* Animatsiyalar */
.msg-enter-active, .msg-leave-active { transition: all 0.3s ease; }
.msg-enter-from, .msg-leave-to { opacity: 0; transform: translateX(-10px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.8); }

textarea {
  line-height: 1.5;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
</style>