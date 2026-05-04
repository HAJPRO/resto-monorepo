<script setup>
/**
 * EmptyState.vue - Ma'lumot topilmaganda chiqadigan premium komponent.
 */
import { computed } from 'vue';

const props = defineProps({
  searchTerm: { type: String, default: '' },
  // title: { type: String, default: "Hmm, bu yerda hech narsa yo'q..." },
  description: { type: String, default: "So'rovingiz bo'yicha ma'lumot topilmadi." },
  actionLabel: { type: String, default: "Qidiruvni tozalash" },
  imageType: { type: String, default: 'search' }
});

const emit = defineEmits(['action']);

const handleAction = () => {
  emit('action');
};
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full min-h-[450px] md:min-h-[500px] p-6 text-center rounded-[32px] bg-transparent dark:bg-transparent-900/50 border border-transparent transition-all duration-500 hover:border-indigo-100 dark:hover:border-indigo-900/30 group">
    
    <div class="relative w-40 h-40 md:w-52 md:h-52 mb-8 perspective-1000">
      <div class="absolute inset-0 bg-indigo-500/10 rounded-full blur-[60px] animate-pulse-slow"></div>

      <img 
        src="../../assets/not_search.avif" 
        alt="No Data" 
        class="w-full h-full object-contain drop-shadow-2xl animate-float relative z-10 rounded-full"
      />

      <div class="absolute -top-2 -right-2 animate-bounce-slow z-20">
        <div class="bg-white dark:bg-slate-800 p-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
          <i class="fa-solid fa-question text-xl text-amber-500 font-bold"></i>
        </div>
      </div>
      
      <div class="absolute -bottom-4 -left-4 animate-ping-slow z-0 opacity-50">
        <div class="w-10 h-10 bg-indigo-400/20 rounded-full"></div>
      </div>
    </div>

    <div class="relative z-10 max-w-sm">
      <h3 class="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
        {{ title }}
      </h3>
      
      <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 px-4">
        <span v-if="searchTerm" class="inline-block bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 mr-1 italic">
          "{{ searchTerm }}"
        </span>
        {{ description }}
      </p>

      <button 
        v-if="actionLabel"
        @click="handleAction"
        class="group relative inline-flex items-center justify-center gap-3 px-10 py-4 rounded-[20px] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[13px] uppercase tracking-widest shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 active:scale-95 overflow-hidden"
      >
        <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        <i class="fa-solid fa-rotate-left group-hover:-rotate-180 transition-transform duration-700"></i>
        <span>{{ actionLabel }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
}
.animate-float { animation: float 6s ease-in-out infinite; }

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.animate-bounce-slow { animation: bounce-slow 3.5s ease-in-out infinite; }

@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.group-hover\:animate-shimmer { animation: shimmer 2s infinite; }

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(0.9); }
  50% { opacity: 0.6; transform: scale(1.2); }
}
.animate-pulse-slow { animation: pulse-slow 5s ease-in-out infinite; }

@keyframes ping-slow {
  75%, 100% { transform: scale(2); opacity: 0; }
}
.animate-ping-slow { animation: ping-slow 4s cubic-bezier(0, 0, 0.2, 1) infinite; }
</style>