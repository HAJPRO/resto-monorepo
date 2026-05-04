<template>
  <transition name="premium-fade">
    <div 
      v-if="show" 
      class="flex items-center justify-center overflow-hidden transition-all duration-500"
      :class="[
        backdrop ? 'backdrop-blur-md bg-white/60 dark:bg-[#020617]/70' : 'bg-transparent',
        fullScreen ? 'fixed inset-0 z-[9999]' : 'absolute inset-0 z-[100] rounded-[inherit]'
      ]"
    >
      <div 
        class="relative flex flex-col items-center p-6 text-center transition-transform duration-500"
        :style="{ transform: `scale(${scaleValue})` }"
      >
        <div 
          class="absolute bg-indigo-500/20 rounded-full blur-[60px] animate-pulse"
          :style="{ width: size * 1.5 + 'px', height: size * 1.5 + 'px' }"
        ></div>
        
        <div class="relative mb-4" :style="{ width: size + 'px', height: size + 'px' }">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle 
              class="text-slate-200 dark:text-slate-800" 
              cx="50" cy="50" r="45" stroke-width="4" fill="none" stroke="currentColor" 
            />
            <circle 
              class="text-indigo-600 dark:text-indigo-400 transition-all duration-700 ease-out" 
              cx="50" cy="50" r="45" stroke-width="5" fill="none" stroke="currentColor" 
              stroke-linecap="round"
              :stroke-dasharray="283"
              :stroke-dashoffset="283 - (283 * progress) / 100"
            />
          </svg>
          
          <div class="absolute inset-0 flex items-center justify-center">
            <span 
              class="font-black text-slate-800 dark:text-white tabular-nums leading-none"
              :style="{ fontSize: size * 0.22 + 'px' }"
            >
              {{ Math.round(progress) }}<span :style="{ fontSize: '0.6em' }">%</span>
            </span>
          </div>
        </div>

        <div class="relative max-w-[200px] sm:max-w-[300px]">
          <h4 
            class="uppercase tracking-[0.2em] font-black text-indigo-600 dark:text-indigo-400 animate-pulse"
            :style="{ fontSize: Math.max(10, size * 0.12) + 'px' }"
          >
            {{ title }}
          </h4>
          <p 
            v-if="subtitle" 
            class="mt-1 font-medium italic text-slate-400 dark:text-slate-500 leading-tight"
            :style="{ fontSize: Math.max(9, size * 0.1) + 'px' }"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  title: { type: String, default: 'Yuklanmoqda' },
  subtitle: { type: String, default: 'Tizim tayyorlanmoqda...' },
  backdrop: { type: Boolean, default: true },
  fullScreen: { type: Boolean, default: false },
  size: { type: Number, default: 110 },
});

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const updateWidth = () => windowWidth.value = window.innerWidth;

const scaleValue = computed(() => windowWidth.value < 640 ? 0.8 : 1);

onMounted(() => window.addEventListener('resize', updateWidth));
onUnmounted(() => window.removeEventListener('resize', updateWidth));
</script>

<style scoped>
.premium-fade-enter-active, .premium-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.2s linear;
}
.premium-fade-enter-from, .premium-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>