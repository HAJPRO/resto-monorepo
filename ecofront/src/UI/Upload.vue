<script setup>
import { ref, computed } from 'vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const props = defineProps({
  modelValue: { type: [Object, File, String, Array], default: null },
  type: { 
    type: String, 
    default: 'image', 
    validator: (v) => ['file', 'image'].includes(v) 
  },
  multiple: { type: Boolean, default: false },
  label: { type: String, default: '' },
  accept: { type: String, default: 'image/*' },
  maxSize: { type: Number, default: 10 }, // MB
  error: { type: [String, Boolean], default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  progress: { type: Number, default: 0 }, 
  rounded: { type: String, default: 'rounded-[2.5rem]' } // Default yumshoq burchaklar
});

const emit = defineEmits(['update:modelValue', 'change', 'remove']);

const fileInput = ref(null);
const isDragging = ref(false);
const previewModal = ref(null);

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const resolveUrl = (file) => {
  if (!file) return '';
  if (file instanceof File) return URL.createObjectURL(file);
  if (typeof file === 'string') {
    if (file.startsWith('http') || file.startsWith('data:image')) return file;
    return `${API_URL.replace(/\/+$/, '')}/${file.replace(/^\/+/, '')}`;
  }
  return '';
};

const handleFiles = async (newFiles) => {
  if (props.disabled || props.loading) return;
  
  await Haptics.impact({ style: ImpactStyle.Light });
  let filesArray = Array.from(newFiles).filter(f => f.size <= props.maxSize * 1024 * 1024);

  if (props.multiple) {
    const updatedList = [...(Array.isArray(props.modelValue) ? props.modelValue : []), ...filesArray];
    emit('update:modelValue', updatedList);
    emit('change', updatedList);
  } else {
    emit('update:modelValue', filesArray[0]);
    emit('change', filesArray[0]);
  }
};

const removeFile = async (index) => {
  await Haptics.impact({ style: ImpactStyle.Medium });
  if (props.multiple && Array.isArray(props.modelValue)) {
    const updatedList = props.modelValue.filter((_, i) => i !== index);
    emit('update:modelValue', updatedList);
    emit('remove', index);
  } else {
    emit('update:modelValue', null);
    emit('remove', 0);
  }
};

const imagePreviews = computed(() => {
  if (!props.modelValue) return [];
  const vals = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue];
  return vals.map(file => resolveUrl(file)).filter(u => u !== '');
});
</script>

<template>
  <div class="flex flex-col w-full gap-2 font-sans group/upload-container overflow-visible">
    <div v-if="label" class="flex justify-between items-end px-3 mb-1">
      <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
        {{ label }}
      </label>
      <span v-if="maxSize && !modelValue" class="text-[9px] font-bold text-slate-300">MAX {{ maxSize }}MB</span>
    </div>

    <div
      @dragover.prevent="!(disabled || loading) && (isDragging = true)"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="isDragging = false; handleFiles($event.dataTransfer.files)"
      :class="[
        'relative group transition-all duration-700 border-2 border-dashed flex items-center justify-center overflow-hidden',
        // Rasm va Single holatida 4:3 nisbat (aspect-ratio) qo'shildi
        type === 'image' && !multiple ? 'aspect-[4/3] w-full ' + rounded : 'min-h-[150px] rounded-[2rem]',
        isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950',
        error ? 'border-rose-400 bg-rose-50/20 shadow-lg shadow-rose-500/5' : 'hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10',
        disabled || loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <input 
        type="file" 
        ref="fileInput" 
        class="hidden" 
        :multiple="multiple" 
        :accept="accept" 
        @change="handleFiles($event.target.files)" 
      />

      <div v-if="loading" class="absolute inset-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
        <div class="relative w-16 h-16 flex items-center justify-center">
          <svg class="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="3" fill="transparent" class="text-slate-100 dark:text-slate-800"/>
            <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="3" fill="transparent" 
              stroke-dasharray="175.8" :stroke-dashoffset="175.8 - (175.8 * progress) / 100" class="text-indigo-600 transition-all duration-500 stroke-round"/>
          </svg>
          <span class="absolute text-[11px] font-black text-indigo-600">{{ progress }}%</span>
        </div>
        <p class="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Yuklanmoqda...</p>
      </div>

      <div 
        v-if="(!modelValue || (Array.isArray(modelValue) && modelValue.length === 0)) && !loading" 
        @click="fileInput.click()" 
        class="flex flex-col items-center gap-4 p-8 text-center"
      >
        <div class="w-16 h-16 rounded-[24px] bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 border border-slate-100 dark:border-slate-800 shadow-inner overflow-hidden">
          <i :class="['fa-solid', type === 'image' ? 'fa-image' : 'fa-cloud-arrow-up', 'text-2xl']"></i>
        </div>
        <div class="space-y-1">
          <span class="block text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {{ multiple ? 'Rasmlarni yuklash' : 'Rasm tanlang' }}
          </span>
          <span class="block text-[9px] font-medium text-slate-400 tracking-wide uppercase">
            PNG, JPG yoki WEBP
          </span>
        </div>
      </div>

      <template v-else-if="type === 'image' && !multiple && !loading">
        <img 
          :src="imagePreviews[0]" 
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          @error="(e) => e.target.src = '/no-image.png'"
        />
        
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 z-10 p-4">
          <button @click.stop="previewModal = { url: imagePreviews[0] }" class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-indigo-600 transition-all hover:-translate-y-1 shadow-xl">
            <i class="fa-solid fa-expand text-lg"></i>
          </button>
          <button @click.stop="fileInput.click()" class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-indigo-600 transition-all hover:-translate-y-1 shadow-xl">
            <i class="fa-solid fa-camera-rotate text-lg"></i>
          </button>
          <button @click.stop="removeFile(0)" class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl text-white flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all hover:-translate-y-1 shadow-xl">
            <i class="fa-solid fa-trash-can text-lg"></i>
          </button>
        </div>
      </template>

      <div v-else-if="type === 'image' && multiple && !loading" class="w-full p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 z-10">
        <div v-for="(img, idx) in imagePreviews" :key="idx" class="relative aspect-square rounded-[1.5rem] overflow-hidden group/item shadow-sm border border-slate-100 dark:border-slate-800">
          <img :src="img" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-all flex items-center justify-center gap-2">
            <button @click.stop="removeFile(idx)" class="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center text-[10px] hover:scale-110"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <button @click.stop="fileInput.click()" class="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-slate-50 transition-all duration-300">
          <i class="fa-solid fa-plus text-xl"></i>
        </button>
      </div>
    </div>

    <Transition name="slide-up">
      <div v-if="error" class="flex items-center gap-2 px-3 mt-1">
        <i class="fa-solid fa-circle-exclamation text-rose-500 text-[10px] animate-bounce"></i>
        <p class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ error }}</p>
      </div>
    </Transition>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="previewModal" class="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6" @click="previewModal = null">
          <button class="absolute top-8 right-8 w-14 h-14 flex items-center justify-center rounded-3xl bg-white/10 text-white hover:bg-rose-500 transition-all duration-300 active:scale-90">
            <i class="fa-solid fa-xmark text-2xl"></i>
          </button>
          <img :src="previewModal.url" class="max-w-full max-h-full rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 transition-transform duration-500 object-contain" @click.stop />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.stroke-round { stroke-linecap: round; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(-10px); }

.fade-enter-active, .fade-leave-active { transition: all 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; backdrop-filter: blur(0px); }

/* Custom scrollbar yashirish */
::-webkit-scrollbar { display: none; }
</style>