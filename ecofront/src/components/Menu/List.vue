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
            getItemCount(food._id) > 0 ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/10' : 'border-slate-100 dark:border-white/5 shadow-sm',
            (food.is_stock && food.quantity <= 0) ? 'opacity-60 grayscale' : '']"
          >
            <div v-if="food.is_stock" class="absolute top-2 right-12 z-10">
              <span :class="['text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter', 
                food.quantity > 5 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200']">
                {{ food.quantity <= 0 ? 'Tugagan' : 'Bor: ' + food.quantity }}
              </span>
            </div>

            <div class="relative w-24 h-24 flex-none overflow-hidden rounded-[22px] bg-slate-100 dark:bg-slate-800">
              <img v-if="food.image" :src="food.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                <ion-icon :icon="restaurantOutline" class="text-3xl" />
              </div>
              
              <div v-if="getItemCount(food._id) > 0" class="absolute inset-0 bg-indigo-600/20 backdrop-blur-[1px] flex items-center justify-center">
                <span class="bg-indigo-600 text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-lg">
                  {{ getItemCount(food._id) }} {{ food.unit || 'ta' }}
                </span>
              </div>

              <div v-if="food.is_stock && food.quantity <= 0" class="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                <span class="text-white text-[9px] font-black rotate-12 border border-white px-2 py-0.5 uppercase">Mavjud emas</span>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start mb-0.5">
                <h3 class="text-[15px] font-black text-slate-800 dark:text-white truncate uppercase">{{ food.name }}</h3>
              </div>

              <p class="text-[11px] text-slate-400 line-clamp-1 mb-2">{{ food.description || 'Mazali taom' }}</p>

              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-[14px] font-black text-indigo-600 dark:text-indigo-400 leading-none">
                    {{ food.price.toLocaleString() }} <small class="text-[9px]">UZS</small>
                  </span>
                  <span class="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Standart narx</span>
                </div>

                <div class="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    icon="fas fa-plus" 
                    :disabled="food.is_stock && food.quantity <= 0"
                    @click="openOrderModal(food)" 
                    class="!rounded-[14px]"
                  />

                  <ActionMenu
                    size="sm"
                    :items="getMenuActions(food)" 
                    @click.stop 
                  >
                    <i class="fas fa-ellipsis-h text-slate-400"></i>
                  </ActionMenu>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="store_menu.loading">
          <LoadingState />
        </div>
        <div v-else>
          <EmptyState :searchTerm="searchQuery" @action="searchQuery = ''; activeCategory = 'all'" />
        </div>
      </div>

      <div v-if="store_menu.totalItemsCount > 0" class="fixed bottom-24 left-4 right-4 z-40 animate-slide-up cursor-pointer" @click="store_menu.isCartOpen = true">
        <div class="bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-white/10 overflow-hidden ring-1 ring-black/5">
          <div class="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Buyurtma:</span>
              <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{{ store_menu.totalItemsCount }} xil mahsulot</span>
            </div>
            <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-600 text-white">
               <i class="fas fa-eye text-[8px]"></i>
              <span class="text-[9px] font-black uppercase tracking-widest">Ko'rish</span>
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

    <Modal
      v-model="isOrderModal"
      size="sm"
      :title="selectedFood?.name || 'Buyurtma'"
    >
      <div class="p-5 space-y-6">
        <div class="space-y-2">
          <Input 
            v-model="orderForm.price" 
            type="number" 
            placeholder="Narxni kiriting" 
            isFormatted
            autofocus 
            label="Sotuv narxi (so'm)"
            suffix="sum"
            
          />
        </div>

        <div class="space-y-2">
          <Input 
            v-model="orderForm.qty" 
            type="number" 
            placeholder="Miqdorini kiriting" 
            isFormatted
            label="Miqdori"
          />
          <p v-if="selectedFood?.is_stock" class="text-[9px] text-amber-600 font-black uppercase ml-1 tracking-tighter">
            Hozirgi qoldiq: {{ selectedFood.quantity }} {{ selectedFood.unit }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2 w-full justify-end">
          <Button @click="isOrderModal = false" variant="danger" leftIcon="fas fa-xmark" size="sm">
            Bekor qilish
          </Button>
          <Button @click="handleAddToCart" leftIcon="fas fa-check" variant="primary" size="sm">
            Savatga qo'shish
          </Button>
        </div>
      </template>
    </Modal>

    <CategoryModal @select="handleCategoryFilter" />
    <CartModal />
    <Footer class="z-50" />
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { IonPage, IonContent, IonIcon } from "@ionic/vue";
import { restaurantOutline } from "ionicons/icons";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { MenuStore } from "../../stores/index.store";
import { storeToRefs } from "pinia";
import { Button, Header, GlobalRefresher, EmptyState, LoadingState, ActionMenu, Modal, Input } from "../../UI/UI";
import Footer from "../../partials/Footer.vue";
import CartModal from "./Cart.vue";
import CategoryModal from "./CategoryModal.vue";

// --- STORE ---
const store_menu = MenuStore();
const { menus, cartItems } = storeToRefs(store_menu);

// --- STATE ---
const searchQuery = ref("");
const activeCategory = ref('all');

// --- ORDER MODAL STATE ---
const isOrderModal = ref(false);
const selectedFood = ref(null);
const orderForm = ref({ price: 0, qty: 1 });

// --- FILTRLASH LOGIKASI ---
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

// --- SAVATCHADAGI MIQDORNI ANIQLASH ---
const getItemCount = (id) => {
  return cartItems.value
    .filter(i => (i.id === id || i._id === id))
    .reduce((total, item) => total + (item.cartQuantity || 0), 0);
};

// --- BUYURTMA MODALINI OCHISH ---
const openOrderModal = (food) => {
  selectedFood.value = food;
  orderForm.value = {
    price: food.price,
    qty: 1
  };
  isOrderModal.value = true;
};

// --- SAVATCHAGA QO'SHISH (UNIQUE ID BILAN) ---
const handleAddToCart = async () => {
  const food = selectedFood.value;
  const price = parseFloat(orderForm.value.price) || 0;
  const qty = parseFloat(orderForm.value.qty) || 0;

  if (price > 0 && qty > 0) {
    store_menu.addToCart({
      id: food._id,
      uniqueId: `${food._id}_${price}`, // Har xil narxlar uchun alohida qatorlar
      name: food.name,
      price: price,
      cartQuantity: qty,
      image: food.image,
      unit: food.unit,
      is_stock: food.is_stock,
      quantity: food.quantity
    });

    await Haptics.impact({ style: ImpactStyle.Medium });
    isOrderModal.value = false;
  }
};

// --- ACTION MENU ELEMENTLARI ---
const getMenuActions = (food) => [
  { label: 'Tahrirlash', icon: 'fa-solid fa-pen-to-square', onClick: () => store_menu.ModalAction({ action: 'edit', id: food._id }) },
  { label: 'O\'chirish', icon: 'fa-solid fa-trash', variant: 'danger', onClick: () => store_menu.deleteMenu(food._id) }
];

// --- INITIAL LOAD ---
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

.group:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* Chrome, Safari, Edge uchun input spinnerni olib tashlash */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>