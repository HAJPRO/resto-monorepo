<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, useSlots, watch, useAttrs } from 'vue';

defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: { type: [String, Number, Object, Array], default: null },
  options: { type: Array, default: () => [] },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  iconKey: { type: String, default: 'icon' },
  
  // Rejimlar
  multiple: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  allowAdd: { type: Boolean, default: false },
  
  // Kontent & Dizayn
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Tanlang...' },
  iconPre: { type: String, default: '' },
  dropdownWidth: { type: String, default: 'trigger' },
  size: { type: String, default: 'middle', validator: (v) => ['small', 'middle', 'large'].includes(v) },
  
  // Holatlar
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: [Boolean, String], default: false },
  success: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  rules: { type: Array, default: () => [] },
  
  // Matnlar
  noDataText: { type: String, default: "Ma'lumot topilmadi" },
  addText: { type: String, default: "yangi element sifatida qo'shish" }
});

const emit = defineEmits(['update:modelValue', 'change', 'add', 'clear', 'blur', 'focus']);
const slots = useSlots();
const attrs = useAttrs();

// --- SIZE CONFIG (Input bilan bir xil) ---
const sizeConfig = computed(() => {
  const configs = {
    small: { h: 'min-h-[38px]', font: 'text-[12px]', icon: 'text-sm', rounded: 'rounded-xl' },
    middle: { h: 'min-h-[46px]', font: 'text-[14px]', icon: 'text-base', rounded: 'rounded-2xl' },
    large: { h: 'min-h-[54px]', font: 'text-[16px]', icon: 'text-lg', rounded: 'rounded-[22px]' }
  };
  return configs[props.size] || configs.middle;
});

const isOpen = ref(false);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const searchInputRef = ref(null);
const searchQuery = ref('');
const dropdownPlacement = ref('bottom');

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

watch(() => props.modelValue, (newVal) => {
  if (internalError.value) runValidation(newVal);
});

// --- STYLES (Input komponenti bilan bir xil mantiq) ---
const wrapperClasses = computed(() => [
  'relative flex items-center w-full transition-all duration-300 border shadow-sm group/wrapper px-4 gap-3 cursor-pointer select-none',
  'bg-white dark:bg-slate-950',
  sizeConfig.value.rounded,
  sizeConfig.value.h,
  (props.error || internalError.value) ? 'border-rose-400 ring-4 ring-rose-500/10' : 
  props.success ? 'border-emerald-400 ring-4 ring-emerald-500/10' : 
  isOpen.value ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-indigo-100 dark:shadow-none' : 
  'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
  (props.disabled || props.loading) ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50' : ''
]);

const hasValue = computed(() => {
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '';
});

const labelClasses = computed(() => {
  const hasPrefix = !!slots.prefix || !!props.iconPre;
  const leftPadding = hasPrefix ? (props.size === 'small' ? 'left-9' : 'left-10') : 'left-4';

  return [
    'absolute font-bold transition-all duration-200 select-none z-10  tracking-wide uppercase text-[10px]',
    'bg-white dark:bg-slate-800 px-1.5 rounded',
    (isOpen.value || hasValue.value)
      ? `-top-2.5 ${leftPadding} text-indigo-600 dark:text-indigo-400`
      : `top-1/2 -translate-y-1/2 ${leftPadding} text-slate-400`,
    (props.error || internalError.value) ? '!text-rose-500' : ''
  ];
});

// --- POSITION LOGIC ---
const updatePosition = () => {
  if (!triggerRef.value || !isOpen.value || !dropdownRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const dropdownHeight = dropdownRef.value.offsetHeight;
  const windowHeight = window.innerHeight;
  
  const spaceBelow = windowHeight - rect.bottom;
  const spaceAbove = rect.top;
  
  dropdownPlacement.value = (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) ? 'top' : 'bottom';
  dropdownRef.value.style.width = props.dropdownWidth === 'trigger' ? `${rect.width}px` : props.dropdownWidth;
  dropdownRef.value.style.left = `${rect.left}px`;
  
  if (dropdownPlacement.value === 'bottom') {
    dropdownRef.value.style.top = `${rect.bottom + 6}px`;
    dropdownRef.value.style.bottom = 'auto';
  } else {
    dropdownRef.value.style.bottom = `${windowHeight - rect.top + 6}px`;
    dropdownRef.value.style.top = 'auto';
  }
};

const handleScroll = () => isOpen.value && updatePosition();

const open = () => {
  if (!props.disabled && !props.loading) {
    isOpen.value = true;
    emit('focus');
    nextTick(() => {
      updatePosition();
      searchInputRef.value?.focus();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updatePosition);
    });
  }
};

const close = () => {
  isOpen.value = false;
  searchQuery.value = '';
  runValidation(props.modelValue);
  window.removeEventListener('scroll', handleScroll, true);
  window.removeEventListener('resize', updatePosition);
  emit('blur');
};

// --- DATA LOGIC ---
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options;
  const q = searchQuery.value.toLowerCase().trim();
  return props.options.filter(opt => 
    Object.values(opt).some(val => val && String(val).toLowerCase().includes(q))
  );
});

const selectedOptions = computed(() => {
  if (!hasValue.value) return props.multiple ? [] : null;
  const values = props.multiple ? (Array.isArray(props.modelValue) ? props.modelValue : []) : [props.modelValue];
  const found = props.options.filter(opt => values.some(v => String(v) === String(opt[props.valueKey])));
  return props.multiple ? found : (found[0] || null);
});

const isSelected = (option) => {
  const val = option[props.valueKey];
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.includes(val);
  return String(props.modelValue) === String(val);
};

const handleSelect = (option) => {
  const val = option[props.valueKey];
  if (props.multiple) {
    const res = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const idx = res.indexOf(val);
    if (idx > -1) res.splice(idx, 1);
    else res.push(val);
    emit('update:modelValue', res);
    emit('change', res);
  } else {
    emit('update:modelValue', val);
    emit('change', option);
    close();
  }
};

const handleClear = () => {
  const emptyValue = props.multiple ? [] : null;
  emit('update:modelValue', emptyValue);
  emit('change', emptyValue);
  emit('clear');
};

onMounted(() => {
  document.addEventListener('mousedown', (e) => {
    if (!triggerRef.value?.contains(e.target) && !dropdownRef.value?.contains(e.target)) close();
  });
});
</script>

<template>
  <div class="flex flex-col w-full group/input">
    
    <div ref="triggerRef" @click="isOpen ? close() : open()" :class="wrapperClasses">
      
      <label v-if="label" :class="labelClasses">
        {{ label }} <span v-if="required" class="text-rose-500">*</span>
      </label>

      <div v-if="$slots.prefix || iconPre" 
        class="flex items-center justify-center shrink-0 transition-all duration-300"
        :class="[
          sizeConfig.icon,
          isOpen ? 'text-indigo-500 scale-110' : (internalError ? 'text-rose-400' : 'text-slate-400')
        ]"
      >
        <slot name="prefix"><i :class="iconPre"></i></slot>
      </div>

      <div class="flex-1 flex items-center gap-2 overflow-hidden py-1">
        <template v-if="multiple && Array.isArray(selectedOptions)">
          <div class="flex flex-wrap gap-1.5 overflow-hidden">
            <div v-for="opt in selectedOptions" :key="opt[valueKey]"
              class="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/10 animate-in zoom-in duration-200">
              {{ opt[labelKey] }}
              <i @click.stop="handleSelect(opt)" class="fa-solid fa-xmark cursor-pointer opacity-60 hover:opacity-100 ml-1 text-[10px]"></i>
            </div>
          </div>
          <span v-if="selectedOptions.length === 0 && isOpen" class="text-slate-300 italic" :class="sizeConfig.font">{{ placeholder }}</span>
        </template>

        <template v-else>
          <div v-if="selectedOptions" class="flex items-center gap-2.5 truncate">
            <i v-if="selectedOptions[iconKey]" :class="[selectedOptions[iconKey], 'text-indigo-500']"></i>
            <span class="font-bold text-slate-700 dark:text-slate-100 truncate" :class="sizeConfig.font">{{ selectedOptions[labelKey] }}</span>
          </div>
          <span v-else-if="isOpen" class="text-slate-300 italic" :class="sizeConfig.font">{{ placeholder }}</span>
        </template>
      </div>

      <div class="flex items-center gap-2 ml-auto shrink-0">
        <i v-if="loading" class="fa-solid fa-spinner fa-spin text-indigo-500" :class="sizeConfig.icon"></i>
        
        <transition name="fade">
          <button v-if="clearable && hasValue && !disabled" @click.stop="handleClear" type="button" class="p-1 rounded-full text-slate-300 hover:text-rose-500 transition-colors">
            <i class="fa-solid fa-circle-xmark text-sm"></i>
          </button>
        </transition>

        <i :class="['fa-solid fa-chevron-down text-[10px] text-slate-300 transition-transform duration-500', isOpen ? 'rotate-180 text-indigo-500' : '']"></i>
        
        <i v-if="(error || internalError) && !loading" class="fa-solid fa-circle-exclamation text-rose-500 animate-pulse" :class="sizeConfig.icon"></i>
        <i v-if="success && !loading" class="fa-solid fa-circle-check text-emerald-500" :class="sizeConfig.icon"></i>
      </div>
    </div>

    <div class="min-h-[20px] pt-1 px-2">
      <transition name="msg">
        <p v-if="error || internalError" class="text-[10px] font-bold text-rose-500 flex items-center gap-1">
          <span class="w-1 h-1 bg-rose-500 rounded-full"></span> 
          {{ typeof (error || internalError) === 'string' ? (error || internalError) : 'Majburiy tanlov' }}
        </p>
      </transition>
    </div>

    <Teleport to="body">
      <transition name="pop">
        <div v-if="isOpen" ref="dropdownRef" 
          class="fixed z-[99999] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[24px] overflow-hidden">
          
          <div v-if="searchable" class="p-3 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/50">
            <div class="relative group">
              <input ref="searchInputRef" v-model="searchQuery" class="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-1.5 pl-10 pr-4 text-sm focus:border-indigo-500/50 dark:text-white transition-all shadow-sm outline-none" placeholder="Qidiruv..." @click.stop />
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-xs"></i>
            </div>
          </div>

          <ul class="flex-1 overflow-y-auto p-2 custom-scrollbar max-h-[300px]">
             <li v-if="filteredOptions.length === 0" class="py-8 px-6 text-center">
                <div v-if="allowAdd && searchQuery.trim()" class="flex flex-col items-center gap-3 animate-in zoom-in">
                   <p class="text-sm font-bold text-slate-700 dark:text-slate-200 italic">"{{ searchQuery }}"</p>
                   <button @click="handleAdd" type="button" class="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                      {{ addText }}
                   </button>
                </div>
                <div v-else class="opacity-30 flex flex-col items-center">
                  <i class="fa-solid fa-box-open text-2xl mb-2"></i>
                  <p class="text-[10px] font-black uppercase tracking-widest">{{ noDataText }}</p>
                </div>
             </li>

          <li v-for="opt in filteredOptions" :key="opt[valueKey]" @mousedown.stop.prevent="handleSelect(opt)""
    :class="[
      'flex items-center justify-between px-4 py-3 mb-1.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group/item',
      isSelected(opt) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    ]"
>
  <div class="flex items-center gap-3 z-10 w-full">
    <div v-if="multiple" class="w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all shrink-0"
      :class="isSelected(opt) ? 'bg-white border-white' : 'border-slate-300 group-hover/item:border-indigo-500'">
      <i v-if="isSelected(opt)" class="fa-solid fa-check text-[8px] text-indigo-600 font-black"></i>
    </div>

    <slot name="option" :option="opt">
      <i v-if="opt[iconKey]" :class="opt[iconKey]" class="opacity-80"></i>
      <span class="text-sm font-bold tracking-tight">{{ opt[labelKey] }}</span>
    </slot>
  </div>
  
  <i v-if="!multiple && isSelected(opt)" class="fa-solid fa-circle-check text-white text-lg animate-in zoom-in"></i>
</li>
          </ul>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }

.pop-enter-active { animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { animation: pop-in 0.2s reverse ease-in; }

@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.msg-enter-active, .msg-leave-active { transition: all 0.3s ease; }
.msg-enter-from, .msg-leave-to { opacity: 0; transform: translateX(-10px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.8); }
</style>