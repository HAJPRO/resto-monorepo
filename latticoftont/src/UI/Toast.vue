<script setup>
import { useToast } from './utils/useToast.js';
const { toasts, remove } = useToast();

const variants = {
  success: {
    icon: 'fa-solid fa-check-circle',
    iconColor: 'text-emerald-500',
    bar: 'bg-emerald-500'
  },
  danger: {
    icon: 'fa-solid fa-circle-exclamation',
    iconColor: 'text-rose-500',
    bar: 'bg-rose-500'
  },
  info: {
    icon: 'fa-solid fa-circle-info',
    iconColor: 'text-blue-500',
    bar: 'bg-blue-500'
  },
  warning: {
    icon: 'fa-solid fa-triangle-exclamation',
    iconColor: 'text-amber-500',
    bar: 'bg-amber-500'
  }
};
</script>

<template>
  <div class="fixed top-[env(safe-area-inset-top,20px)] left-0 right-0 z-[99999] pointer-events-none flex flex-col items-center px-4 gap-2">
    
    <TransitionGroup name="toast">
      <div 
        v-for="item in toasts" 
        :key="item.id"
        @click="remove(item.id)"
        class="pointer-events-auto relative w-full max-w-[400px] bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden active:scale-95 transition-transform duration-200"
      >
        <div class="flex items-center p-3 gap-3">
          <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm" 
               :class="variants[item.type]?.iconColor">
            <i :class="variants[item.type]?.icon" class="text-lg"></i>
          </div>

          <div class="flex-1 min-w-0 text-left">
            <h4 v-if="item.title" class="text-[13px] font-bold text-slate-900 dark:text-white leading-none mb-1">
              {{ item.title }}
            </h4>
            <p class="text-[12px] font-medium text-slate-600 dark:text-slate-400 leading-tight line-clamp-2">
              {{ item.message }}
            </p>
          </div>

          <div class="pr-1 opacity-40">
            <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 h-[2px] w-full bg-slate-100 dark:bg-white/5">
          <div 
            class="h-full origin-left animate-progress"
            :class="variants[item.type]?.bar"
            :style="{ animationDuration: `${item.duration}ms` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>

  </div>
</template>

<style scoped>
/* Progress Animation */
@keyframes progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
.animate-progress {
  animation-name: progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

/* Mobile Friendly Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s cubic-bezier(0.2, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.toast-move {
  transition: transform 0.4s ease;
}
</style>