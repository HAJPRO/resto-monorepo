<script setup>
import { reactive, watch, ref } from 'vue';
import Button from './Button.vue';
import Select from './Select.vue';
import Input from './Input.vue';

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  fields: { type: Array, required: true },
  initialValues: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  submitText: { type: String, default: 'Saqlash' },
  cancelText: { type: String, default: 'Bekor qilish' },
  showCancel: { type: Boolean, default: true },
  transparent: { type: Boolean, default: false } // Sidebar uchun
});

const emit = defineEmits(['submit', 'cancel', 'update:modelValue', 'add-item']);
const formData = reactive({});
const errors = reactive({});

// --- INIT ---
watch(() => props.initialValues, (newVal) => {
  if (newVal) {
    props.fields.forEach(field => {
      if (field.type !== 'divider') {
        formData[field.key] = newVal[field.key] ?? (field.defaultValue ?? '');
      }
    });
  }
}, { immediate: true, deep: true });

// --- VALIDATION ---
const validateField = (field, value) => {
  if (field.type === 'divider' || field.disabled) return null;
  const rules = field.rules || {};

  if (rules.required) {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)) {
      return 'To\'ldirish shart';
    }
  }
  
  // Custom Validator
  if (rules.validator && typeof rules.validator === 'function') {
    return rules.validator(value, formData);
  }

  return null;
};

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(k => delete errors[k]);

  props.fields.forEach(field => {
    const error = validateField(field, formData[field.key]);
    if (error) {
      errors[field.key] = error;
      isValid = false;
    }
  });
  return isValid;
};

// --- ACTIONS ---
const handleInput = (key, value) => {
  formData[key] = value;
  if (errors[key]) delete errors[key];
  emit('update:modelValue', { ...formData });
};

const handleAddNewItem = (key, value) => {
  emit('add-item', { key, value });
};

const onSubmit = () => {
  if (validateForm()) {
    emit('submit', { ...formData });
  } else {
    const container = document.getElementById('form-panel');
    container?.classList.add('shake-anim');
    setTimeout(() => container?.classList.remove('shake-anim'), 400);
  }
};
</script>

<template>
  <div 
    id="form-panel" 
    class="w-full flex flex-col h-full overflow-hidden relative transition-colors duration-300"
    :class="transparent ? 'bg-transparent' : 'bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none'"
  >
    
    <div v-if="title && !transparent" class="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md sticky top-0 z-[100]">
      <div class="flex flex-col">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">{{ title }}</h2>
        <p v-if="description" class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">{{ description }}</p>
      </div>
    </div>

    <div class="overflow-y-auto custom-scrollbar flex-1 relative" :class="transparent ? 'p-0' : 'p-8'">
      <form @submit.prevent="onSubmit" class="grid grid-cols-12 gap-x-5 gap-y-6">
        
        <template v-for="(field, index) in fields" :key="index">
          
          <div v-if="field.type === 'divider'" class="col-span-12 mt-4 mb-2 flex items-center gap-4 group">
            <span class="h-[2px] w-6 bg-indigo-500 rounded-full group-hover:w-10 transition-all duration-300"></span>
            <span class="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{{ field.label }}</span>
            <div class="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <div 
            v-else 
            :class="[`col-span-12`, `md:col-span-${field.cols || 12}`]" 
            class="relative group"
            :style="{ zIndex: fields.length - index }" 
          >
            <div class="flex flex-col gap-1.5">
              
              <div v-if="!['select', 'switch', 'checkbox'].includes(field.type)">
                <Input
                  :id="field.key"
                  :type="field.type"
                  :modelValue="formData[field.key]"
                  @update:modelValue="(val) => handleInput(field.key, val)"
                  
                  :label="field.label"
                  :placeholder="field.placeholder"
                  :help="field.help"
                  :required="field.rules?.required"
                  :disabled="field.disabled"
                  :rows="field.rows"
                  
                  :error="errors[field.key]" 
                  :success="!errors[field.key] && formData[field.key] && field.rules?.required"
                  
                  v-bind="field.props" 
                />
              </div>

              <div v-else-if="field.type === 'select'" class="flex flex-col gap-1">
                 <label class="text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ml-1" 
                        :class="errors[field.key] ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'">
                    {{ field.label }} <span v-if="field.rules?.required" class="text-rose-500">*</span>
                 </label>
                 
                 <Select
                    :modelValue="formData[field.key]"
                    @update:modelValue="(val) => handleInput(field.key, val)"
                    :options="field.options"
                    :placeholder="field.placeholder"
                    :error="!!errors[field.key]"
                    
                    v-bind="field.props" 
                    @add="(val) => handleAddNewItem(field.key, val)"
                    
                    class="w-full !h-[46px]"
                  />
                  
                  <transition name="slide-up">
                    <p v-if="errors[field.key]" class="text-[10px] font-bold text-rose-500 flex items-center gap-1 ml-1 mt-1">
                       {{ errors[field.key] }}
                    </p>
                  </transition>
              </div>

              <div v-else-if="field.type === 'switch'" 
                   class="flex items-center justify-between h-[46px] px-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer mt-5 select-none" 
                   @click="handleInput(field.key, !formData[field.key])"
                   :class="{'border-rose-300 bg-rose-50/50': errors[field.key]}">
                 
                 <label class="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer uppercase tracking-wide">{{ field.label }}</label>
                 
                 <div class="relative w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full transition-colors duration-300" 
                      :class="{'!bg-indigo-500': formData[field.key]}">
                    <div class="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 transform"
                         :class="{'translate-x-5': formData[field.key]}"></div>
                 </div>
              </div>

            </div>
          </div>
        </template>

      </form>
    </div>

    <div v-if="submitText && !transparent" class="px-8 py-5 border-t border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0 z-[100]">
      <Button 
        v-if="showCancel"
        type="button" 
        variant="ghost" 
        @click="$emit('cancel')"
        class="!h-[44px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
      >
        {{ cancelText }}
      </Button>
      <Button 
        type="button" 
        variant="primary" 
        :loading="loading"
        @click="onSubmit"
        class="!h-[44px] !px-10 shadow-lg shadow-indigo-500/20"
      >
        {{ submitText }}
      </Button>
    </div>

  </div>
</template>

<style scoped>
/* Scrollbars */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-300 dark:bg-slate-600 rounded-full; }

/* Animatsiyalar */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.2s ease-out; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(-5px); }

/* Shake Error Animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.shake-anim { animation: shake 0.3s ease-in-out; }
</style>