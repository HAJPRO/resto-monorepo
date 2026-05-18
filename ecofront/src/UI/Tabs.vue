<template>
  <div class="tabs-container w-full">
    <div :class="[
      'flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl gap-1 sticky top-0 z-40 backdrop-blur-md border border-slate-200/50 dark:border-white/5',
      containerClass
    ]">
      <button 
        v-for="tab in items" 
        :key="tab.id"
        @click="$emit('update:modelValue', tab.id)"
        :class="[
          'flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group',
          modelValue === tab.id 
            ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm scale-[1.02]' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        ]"
      >
        <ion-icon 
          v-if="tab.icon" 
          :icon="tab.icon" 
          :class="['text-sm transition-transform duration-300', modelValue === tab.id ? 'scale-110' : 'group-hover:scale-110']"
        ></ion-icon>
        
        <span>{{ tab.label }}</span>

        <span 
          v-if="tab.badge !== undefined" 
          :class="[
            'ml-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold',
            modelValue === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
          ]"
        >
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <div class="tab-content mt-4">
      <transition 
        name="fade-slide" 
        mode="out-in"
      >
        <div :key="modelValue" class="animate-content">
          <slot :name="modelValue"></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true }, // joriy aktiv tab ID
  items: { 
    type: Array, 
    required: true // [{id: 'items', label: 'Buyurtmalar', icon: fastFoodOutline, badge: 5}]
  },
  containerClass: { type: String, default: '' }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>