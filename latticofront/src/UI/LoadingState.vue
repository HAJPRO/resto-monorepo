<script setup>
defineProps({
  title: { type: String, default: "Yuklanmoqda..." },
  description: { type: String, default: "" }
});
</script>

<template>
  <div class="loading-stage">
    <div class="main-content">
      
      <div class="visual-box">
        <div class="orbit-ring"></div>
        
        <div class="core-card">
          <svg class="w-6 h-6 text-indigo-500/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 7V17C4 18.6569 7.58172 20 12 20C16.4183 20 20 18.6569 20 17V7M4 7C4 8.65685 7.58172 10 12 10C16.4183 10 20 8.65685 20 7M4 7C4 5.34315 7.58172 4 12 4C16.4183 4 20 5.34315 20 4M12 10V20" />
          </svg>
        </div>
      </div>

      <div class="text-center">
        <h3 class="status-title">{{ title }}</h3>
        
        <div class="progress-track">
          <div class="progress-bar"></div>
        </div>

        <p class="status-desc">{{ description }}</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.loading-stage {
  @apply flex items-center justify-center w-full py-24;
}

.main-content {
  @apply flex flex-col items-center w-64;
}

/* Visuals */
.visual-box {
  @apply relative w-20 h-20 mb-8 flex items-center justify-center;
}

.orbit-ring {
  @apply absolute inset-0 border-[1px] border-slate-200 dark:border-white/5 rounded-full;
  border-top-color: theme('colors.indigo.500/40');
  animation: spin 2s linear infinite;
}

.core-card {
  @apply w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 
         flex items-center justify-center shadow-sm;
}

/* Text & Progress */
.status-title {
  @apply text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-5;
}

.progress-track {
  @apply w-12 h-[1px] bg-slate-100 dark:bg-white/5 mx-auto mb-5 overflow-hidden relative;
}

.progress-bar {
  @apply absolute inset-y-0 left-0 w-full bg-indigo-500/40;
  animation: slide 1.5s infinite cubic-bezier(0.65, 0, 0.35, 1);
}

.status-desc {
  @apply text-[11px] font-medium text-slate-300 dark:text-slate-600 tracking-wide italic;
}

/* Optimized Animations (Hardware Accelerated) */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Ambient light for depth */
:deep(.dark) .loading-stage {
  background: radial-gradient(circle at center, rgba(99, 102, 241, 0.03) 0%, transparent 70%);
}
</style>