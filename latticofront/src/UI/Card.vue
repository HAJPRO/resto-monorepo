<template>
  <div 
    class="bg-white dark:bg-slate-800 rounded-[24px] sm:rounded-[32px] 
           border border-slate-100 dark:border-white/5 
           shadow-sm hover:shadow-md transition-all duration-300 
           overflow-hidden w-full relative"
  >
    <!-- Card Header -->
    <div v-if="title || $slots.header" class="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-50 dark:border-white/5">
      <slot name="header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div v-if="icon" class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <i :class="icon"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                {{ title }}
              </h3>
              <p v-if="subtitle" class="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                {{ subtitle }}
              </p>
            </div>
          </div>
          <div v-if="$slots.actions" class="flex items-center gap-2">
            <slot name="actions" />
          </div>
        </div>
      </slot>
    </div>

    <!-- Card Body -->
    <div 
      :class="[
        noPadding ? 'p-0' : 'p-5 sm:p-6',
        bodyClass
      ]"
    >
      <slot />
    </div>

    <!-- Card Footer -->
    <div v-if="$slots.footer" class="px-5 py-4 sm:px-6 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  noPadding: { type: Boolean, default: false },
  bodyClass: { type: String, default: '' }
});
</script>

<style scoped>
/* Mobile-first hover effekti faqat sichqoncha bor qurilmalarda ishlaydi */
@media (underline: hover) {
  .hover\:shadow-md:hover {
    transform: translateY(-2px);
  }
}
</style>