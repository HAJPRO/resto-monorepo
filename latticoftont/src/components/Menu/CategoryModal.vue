<template>
  <ion-modal 
    :is-open="isCategoryOpen" 
    @didDismiss="isCategoryOpen = false"
    :initial-breakpoint="0.6" 
    :breakpoints="[0, 0.6, 1]"
    handle-behavior="cycle"
    class="category-custom-modal"
    style="--z-index: 100;"
  >
    <ion-content class="bg-slate-50 dark:bg-slate-900" :scroll-y="true">
      
      <div class="sticky top-0 z-[100] bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <i class="fa-solid fa-layer-group text-sm"></i>
          </div>
          <div>
            <h2 class="text-lg font-black uppercase tracking-tight dark:text-white text-slate-800 leading-none">Kategoriyalar</h2>
            <p class="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{{ categories?.length }} ta bo'lim</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            @click="store_menu.isCategoryEditModal = true; store_menu.isCategoryOpen = false;"
            class="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl active:scale-90 transition-all shadow-md shadow-indigo-500/20"
          >
            <i class="fa-solid fa-plus text-sm"></i>
          </button>
          
          <button 
            @click="isCategoryOpen = false" 
            class="w-10 h-10 flex items-center justify-center bg-slate-200/50 dark:bg-slate-800 rounded-xl text-slate-500 active:scale-90 transition-all"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div class="p-6 grid grid-cols-2 gap-4 pb-20">
        <div 
          v-for="cat in categories" 
          :key="cat.id"
          class="group relative overflow-hidden bg-white dark:bg-slate-800/50 p-5 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm active:scale-[0.97] transition-all duration-300"
        >
          <div class="absolute top-3 right-3 z-20 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button 
              @click.stop="handleEditCategory(cat)"
              class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <i class="fa-solid fa-pen text-[10px]"></i>
            </button>

            <button 
              @click.stop="handleDeleteCategory(cat)"
              class="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:text-rose-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <i class="fa-solid fa-trash-can text-[10px]"></i>
            </button>
          </div>

          <div @click="handleCategorySelect(cat.id)" class="relative z-10 cursor-pointer">
            <div :class="['w-14 h-14 rounded-[22px] flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 shadow-inner', 'bg-indigo-50 dark:bg-indigo-500/10']">
              <i :class="['fa-solid', cat.icon, 'text-2xl text-indigo-600 dark:text-indigo-400']"></i>
            </div>

            <div class="space-y-1">
              <span class="block text-[13px] font-black uppercase tracking-tight dark:text-white text-slate-800 leading-tight">
                {{ cat.name }}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="w-1 h-1 rounded-full bg-indigo-500"></span>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {{ cat.count || 0 }} ta mahsulot
                </span>
              </div>
            </div>
          </div>

          <i :class="['fa-solid', cat.icon, 'absolute -right-4 -bottom-4 text-7xl opacity-[0.03] dark:opacity-[0.07] rotate-12 pointer-events-none transition-transform group-hover:scale-125']"></i>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { IonModal, IonContent } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { MenuStore } from "../../stores/Menu/menu.store";

const store_menu = MenuStore();
const { isCategoryOpen, categories } = storeToRefs(store_menu);

const emit = defineEmits(['select', 'add', 'edit', 'delete']);

// 1. Kategoriyani tanlash
const handleCategorySelect = async (categoryId) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  emit('select', categoryId);
  isCategoryOpen.value = false;
};

// 2. Yangi kategoriya qo'shish
const handleAddCategory = async () => {
  await Haptics.impact({ style: ImpactStyle.Medium });
  emit('add');
  // Masalan: openAddCategoryModal();
};

// 3. Kategoriyani tahrirlash
const handleEditCategory = async (category) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  emit('edit', category);
};

// 4. Kategoriyani o'chirish
const handleDeleteCategory = async (category) => {
  await Haptics.notification({ type: NotificationType.Warning });
  // O'chirishdan oldin tasdiqlash mantiqi shu yerda bo'ladi
  emit('delete', category);
};
</script>

<style scoped>
/* Modal Dizayni */
.category-custom-modal {
  --border-radius: 38px;
  --backdrop-opacity: 0.5;
  --backdrop-filter: blur(8px);
}

/* Modal ustidagi surish chizig'i (Handle) */
.category-custom-modal::part(handle) {
  background: var(--ion-color-step-300, #cbd5e1);
  width: 45px;
  height: 5px;
  margin-top: 10px;
  border-radius: 10px;
}

/* Scroll bo'lganda header orqasini to'g'irlash */
ion-content {
  --padding-top: 0;
  --background: transparent;
}

/* Hover effektlari (Desktop uchun) */
@media (min-width: 640px) {
  .group:hover {
    border-color: rgba(79, 70, 229, 0.3);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }
}
</style>