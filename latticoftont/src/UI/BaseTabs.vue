<template>
  <div class="inline-block select-none">
    <div class="relative inline-flex">
      <Button 
        icon="fas fa-filter"
        size="sm"
        @click="openDrawer"
        
      />
      
      <span 
        v-if="isSelected && !isOpen" 
        class="absolute -top-1 -right-1 flex h-2.5 w-2.5"
      >
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 border-2 border-white dark:border-slate-950"></span>
      </span>
    </div>

    <Teleport to="body">
      <transition name="drawer-fade">
        <div v-if="isOpen" class="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center p-0 sm:p-6">
          
          <div 
            class="absolute inset-0 bg-slate-950/40 backdrop-blur-[8px] transition-all" 
            @click="closeDrawer"
          ></div>
          
          <transition name="drawer-slide">
            <div 
              v-if="isOpen"
              class="relative w-full max-w-[420px] bg-white dark:bg-[#0f172a] sm:rounded-[32px] rounded-t-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[85vh] border-t sm:border border-slate-100 dark:border-slate-800"
            >
              <div class="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing" @click="closeDrawer">
                <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full transition-colors group-hover:bg-slate-300"></div>
              </div>

              <div class="px-6 py-4 flex justify-between items-center">
                <div class="flex flex-col">
                  <h4 class="text-[12px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Filtrlash</h4>
                  <p class="text-[10px] text-slate-400 font-medium italic">Tartibni o'zgartirish uchun ushlab sudrang</p>
                </div>
                <button 
                  @click="closeDrawer" 
                  class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="flex-1 overflow-y-auto px-4 py-2 pb-12 custom-scrollbar">
                <draggable 
                  v-model="draggableTabs" 
                  item-key="id"
                  handle=".drag-handle"
                  :animation="300"
                  ghost-class="ghost-item"
                  drag-class="dragging-item"
                  class="flex flex-col gap-2"
                  @start="onDragStart"
                  @end="onDragEnd"
                >
                  <template #item="{ element: tab }">
                    <div
                      class="group flex items-center justify-between p-3 rounded-[22px] transition-all duration-200 border-2 relative"
                      :class="modelValue === tab.id 
                        ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500/20' 
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'"
                    >
                      <div class="flex items-center gap-3 flex-1">
                        <div class="drag-handle w-8 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 transition-colors">
                          <i class="fas fa-grip-vertical"></i>
                        </div>

                        <div 
                          @click="selectTab(tab.id)"
                          class="flex items-center gap-4 cursor-pointer flex-1 py-1"
                        >
                          <div 
                            class="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300"
                            :class="modelValue === tab.id 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
                          >
                            <i :class="tab.icon || 'fas fa-layer-group'" class="text-base"></i>
                          </div>
                          
                          <span class="text-[15px] font-bold tracking-tight" 
                            :class="modelValue === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'">
                            {{ tab.label }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="flex items-center pr-2">
                        <div v-if="modelValue === tab.id" class="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                        <i v-else class="fas fa-chevron-right text-[10px] text-slate-300"></i>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Button } from '../UI/UI';
import draggable from 'vuedraggable';

const props = defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: [String, Number], required: true }
});

const emit = defineEmits(['update:modelValue', 'change', 'reorder']);
const isOpen = ref(false);

const draggableTabs = ref([...props.tabs]);

watch(() => props.tabs, (newTabs) => {
  draggableTabs.value = [...newTabs];
}, { deep: true });

const isSelected = computed(() => {
  if (!props.tabs.length) return false;
  return props.modelValue !== props.tabs[0].id;
});

const openDrawer = async () => {
  isOpen.value = true;
  document.body.classList.add('overflow-hidden');
  try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
};

const closeDrawer = () => {
  isOpen.value = false;
  document.body.classList.remove('overflow-hidden');
};

const onDragStart = async () => {
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
};

const onDragEnd = () => {
  emit('reorder', draggableTabs.value);
};

const selectTab = async (id) => {
  if (props.modelValue !== id) {
    emit('update:modelValue', id);
    emit('change', id);
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  }
  setTimeout(closeDrawer, 150);
};

onUnmounted(() => {
  document.body.classList.remove('overflow-hidden');
});
</script>

<style scoped>
.ghost-item {
  opacity: 0.3;
  background: #eef2ff !important;
  border: 2px dashed #6366f1 !important;
}

.dragging-item {
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
  z-index: 50;
  cursor: grabbing !important;
}

/* Sudrash paytida butun qatorni qimirlatish silliqligi */
.flex-col-move {
  transition: transform 0.3s ease;
}

/* Animations... */
.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 0.4s; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .drawer-slide-enter-active { transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1); }
  .drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateY(100%); }
}

@media (min-width: 641px) {
  .drawer-slide-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .drawer-slide-enter-from { transform: scale(0.85) translateY(40px); opacity: 0; }
}

.custom-scrollbar::-webkit-scrollbar { display: none; }
</style>