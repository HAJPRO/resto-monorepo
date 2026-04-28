<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617]">
    <Header title="Menyu" searchable v-model="searchQuery" searchPlaceholder="Taom izlash...">
      <template #actions>
        <Button @click="store_menu.isCategoryOpen = true" icon="fas fa-list" size="sm" variant="secondary" />
        <Button @click="store_menu.ModalAction({ action: 'create' })" icon="fas fa-plus" size="sm" />
      </template>
    </Header>

    <ion-content :fullscreen="true" class="ion-padding-bottom">
      <GlobalRefresher />
      
      <div class="max-w-full mx-auto px-4 mb-40 mt-3">
        <div v-if="!store_menu.loading && filteredFoods.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         <div 
  v-for="food in filteredFoods" 
  :key="food._id" 
  :class="['group bg-white dark:bg-slate-900 rounded-[30px] p-3 border transition-all duration-500 flex gap-4 items-center relative overflow-hidden', 
  getItemCount(food._id) > 0 ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/10' : 'border-slate-100 dark:border-white/5 shadow-sm']"
>
  <div class="relative w-24 h-24 flex-none overflow-hidden rounded-[22px] bg-slate-100 dark:bg-slate-800">
    <img v-if="food.image" :src="food.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div v-else class="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
      <ion-icon :icon="restaurantOutline" class="text-3xl" />
    </div>
    <button v-if="getItemCount(food._id) > 0" @click.stop="store_menu.updateCartQty({ id: food._id, change: -getItemCount(food._id) })" 
      class="absolute inset-0 bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
      <ion-icon :icon="trashOutline" class="text-2xl" />
    </button>
  </div>

  <div class="flex-1 min-w-0">
    <div class="flex justify-between items-start mb-0.5">
      <h3 class="text-[15px] font-black text-slate-800 dark:text-white truncate uppercase">{{ food.name }}</h3>
      <span v-if="food.unit" class="flex-none text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 ml-2">
        {{ food.unit }}
      </span>
    </div>

    <p class="text-[11px] text-slate-400 line-clamp-1 mb-2">{{ food.description || 'Mazali taom' }}</p>

    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <span class="text-[14px] font-black text-indigo-600 dark:text-indigo-400 leading-none">
          {{ food.price.toLocaleString() }} <small class="text-[9px]">UZS</small>
        </span>
       
      </div>

      <div class="flex items-center">
        <div v-if="getItemCount(food._id) > 0" class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-[14px] p-1 gap-1 border border-slate-200 dark:border-white/5">
          <button @click="handleUpdateQty(food._id, -1)" class="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-white flex items-center justify-center active:scale-75 shadow-sm">
            <ion-icon :icon="removeOutline" />
          </button>
          
          <div class="flex flex-col items-center min-w-[32px]">
            <span class="text-xs font-black dark:text-white leading-none">{{ getItemCount(food._id) }}</span>
            <span class="text-[8px] text-slate-400 uppercase font-medium">{{ food.unit || 'pcs' }}</span>
          </div>

          <button @click="handleUpdateQty(food._id, 1)" class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center active:scale-75 shadow-sm">
            <ion-icon :icon="addOutline" />
          </button>
        </div>

        <button v-else @click="handleAddToCart(food)" class="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center active:scale-90 shadow-lg">
          <ion-icon :icon="addOutline" class="text-xl" />
        </button>
      </div>
    </div>
  </div>
</div>
        </div>

        <div v-else-if="store_menu.loading">
          <LoadingState />
        </div>
        <div v-else>
          <EmptyState :searchTerm="searchQuery" @action="searchQuery = ''; activeCategory = 0" />
        </div>
      </div>

      <div v-if="store_menu.totalItemsCount > 0" class="fixed bottom-24 left-4 right-4 z-40 animate-slide-up cursor-pointer" @click="store_menu.isCartOpen = true">
        <div class="bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-white/10 overflow-hidden ring-1 ring-black/5">
          <div class="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  Asosiy: <span class="text-slate-900 dark:text-slate-200">{{ store_menu.currentSubtotal.toLocaleString() }}</span>
                </span>
              </div>
              <div v-if="store_menu.isServiceActive" class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20">
                <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                  Xizmat: <span class="font-black">+{{ store_menu.calculateServiceFee.toLocaleString() }}</span>
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 dark:bg-indigo-600 shadow-lg">
              <span class="text-[9px] font-black text-white uppercase tracking-widest">{{ store_menu.totalItemsCount }} TA</span>
            </div>
          </div>

          <div class="p-4 flex items-center justify-between gap-3">
            <div class="flex-1">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Jami To'lov</p>
              <div class="flex items-baseline gap-1">
                <span class="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{{ store_menu.finalTotal.toLocaleString() }}</span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">uzs</span>
              </div>
            </div>
            <Button size="sm" leftIcon="fas fa-shopping-basket" class="!bg-indigo-600 !rounded-2xl !h-12 !px-6">
              <span class="font-black uppercase tracking-wider text-[11px]">Savat</span>
            </Button>
          </div>
        </div>
      </div>
    </ion-content>

    <CategoryModal @select="handleCategoryFilter" />
    <CartModal />
    <Footer class="z-50" />
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { IonPage, IonContent, IonIcon } from "@ionic/vue";
import { addOutline, removeOutline, restaurantOutline, trashOutline } from "ionicons/icons";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { MenuStore } from "../../stores/index.store";
import { storeToRefs } from "pinia";
import { Button, Header, GlobalRefresher, EmptyState, LoadingState } from "../../UI/UI";
import Footer from "../../partials/Footer.vue";
import CartModal from "./Cart.vue";
import CategoryModal from "./CategoryModal.vue";

const store_menu = MenuStore();
const { menus, cartItems } = storeToRefs(store_menu);

const searchQuery = ref("");
const activeCategory = ref('all');

// --- FILTRLASH ---
const filteredFoods = computed(() => {
  if (!menus.value) return [];
  
  return menus.value.filter((f) => {
    const matchCat = activeCategory.value === 'all' ? true : f.category === activeCategory.value;
    const matchSearch = f.name?.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCat && matchSearch;
  });
});

const handleCategoryFilter = (categoryKey) => {
  activeCategory.value = categoryKey;
};

// --- SAVAT BILAN ISHLASH ---
const getItemCount = (id) => {
  const item = cartItems.value.find(i => i.id === id || i._id === id);
  return item ? item.quantity : 0;
};

const handleAddToCart = async (food) => {
  store_menu.addToCart({
    id: food._id,
    name: food.name,
    price: food.price,
    image: food.image
  });
  await Haptics.impact({ style: ImpactStyle.Medium });
};

const handleUpdateQty = async (id, change) => {
  store_menu.updateCartQty({ id, change });
  await Haptics.impact({ style: ImpactStyle.Light });
};

onMounted(async () => {
  await store_menu.GetAll();
  await store_menu.GetAllCategories();
});
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Taomlar gridi uchun qo'shimcha go'zallik */
.group:active {
  transform: scale(0.98);
}
</style>