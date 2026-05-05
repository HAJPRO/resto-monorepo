<template>
  <div class="w-full sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md ">
    <div ref="scrollContainer" class="flex overflow-x-auto no-scrollbar py-1 px-4 sm:justify-center">
      <div ref="container" class="relative flex p-1 bg-slate-100/50 dark:bg-white/5 rounded-full min-w-max sm:min-w-[500px]">
        
        <!-- Sliding Indicator -->
        <div 
          class="absolute top-1 bottom-1 left-0 bg-white dark:bg-slate-800 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] z-0"
          :style="indicatorStyle"
        ></div>

        <!-- Tab Tugmalari -->
        <button 
          v-for="(tab, index) in tabs" 
          :key="tab.id"
          :ref="el => { if (el) tabRefs[index] = el }"
          @click="selectTab(tab, index)"
          :disabled="tab.disabled"
          class="relative z-10 flex-1 flex items-center justify-center gap-2 py-1 px-4 rounded-full transition-all duration-200 outline-none select-none"
          :class="[
            isActive(tab) ? 'text-indigo-600 dark:text-white' : 'text-slate-400',
            tab.disabled ? 'opacity-30 cursor-not-allowed grayscale' : 'cursor-pointer active:scale-95'
          ]"
        >
          <i v-if="tab.disabled" class="fas fa-lock text-[8px] opacity-40"></i>
          <i v-else-if="tab.icon" :class="[tab.icon, 'text-[8px]']"></i>
          <span class="text-[9px] font-black uppercase tracking-wider">{{ tab.label }}</span>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  tabs: { type: Array, required: true }
});

const emit = defineEmits(['update:modelValue', 'change']);
const router = useRouter();
const route = useRoute();

const scrollContainer = ref(null);
const container = ref(null);
const tabRefs = ref([]);
const indicatorStyle = ref({ width: '0px', transform: 'translateX(0px)' });

const isActive = (tab) => tab.routeName ? route.name === tab.routeName : props.modelValue === tab.id;

const updateUI = () => {
  const index = props.tabs.findIndex(t => isActive(t));
  if (index === -1) return;

  const target = tabRefs.value[index];
  if (target && scrollContainer.value) {
    indicatorStyle.value = { 
      width: `${target.offsetWidth}px`, 
      transform: `translateX(${target.offsetLeft}px)` 
    };
    const offset = target.offsetLeft - (scrollContainer.value.offsetWidth / 2) + (target.offsetWidth / 2);
    scrollContainer.value.scrollTo({ left: offset, behavior: 'smooth' });
  }
};

const selectTab = (tab, index) => {
  if (tab.disabled) return;
  if (tab.routeName) router.push({ name: tab.routeName });
  emit('update:modelValue', tab.id);
  emit('change', tab);
  updateUI();
};

let ro = null;
onMounted(() => {
  nextTick(() => {
    updateUI();
    ro = new ResizeObserver(updateUI);
    if (container.value) ro.observe(container.value);
  });
});

onBeforeUnmount(() => ro?.disconnect());
watch(() => props.modelValue, () => nextTick(updateUI));
watch(() => route.name, () => nextTick(updateUI));
watch(() => props.tabs, () => nextTick(updateUI), { deep: true });
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Mobil bosinganda yengil effekt */
button:active {
  transform: scale(0.97);
  opacity: 0.8;
}
</style>