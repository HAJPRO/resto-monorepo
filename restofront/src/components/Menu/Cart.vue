<template>
  <ion-page>

    <Modal
      v-model="isCartOpen"
      :title="model._id ? 'Tahrirlash' : 'Savat'"
      icon="fa-solid fa-cart-shopping"
      @close="isCartOpen = false"
    >
      <div class="space-y-4">
        <div class=" mt-0 top-[-20px] z-[100] mb-6 p-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[20px] flex gap-1 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] mx-2">
          <button
            v-for="tab in ['items', 'settings']"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'relative flex-1 py-2 rounded-[16px] text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2',
              activeTab === tab 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            ]"
          >
            <i :class="[tab === 'items' ? 'fa-solid fa-layer-group' : 'fa-solid fa-gear', 'text-[13px]']"></i>
            <span>{{ tab === "items" ? "Buyurtmalar" : "Sozlamalar" }}</span>
          </button>
        </div>

        <div v-if="activeTab === 'items'" class="space-y-4 animate-fade-in">
          <div v-if="cartItems.length > 0" class="flex items-center justify-between px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Taomlar ({{ totalItemsCount }} ta)</span>
            <Button @click="goToMenu()" size="sm" variant="secondary" class="!h-8 !text-[9px] !rounded-xl border-dashed">
              <i class="fa-solid fa-plus-circle mr-1"></i> Qo'shish
            </Button>
          </div>

          <div v-if="cartItems.length > 0" class="space-y-3 h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            <div v-for="item in cartItems" :key="item.id" class="bg-white dark:bg-slate-900 rounded-[28px] p-2 flex gap-4 items-center border border-slate-100 dark:border-white/5">
              <img :src="item.image" class="w-16 h-16 rounded-[20px] object-cover bg-slate-100" />
              <div class="flex-1 min-w-0">
                <div class="flex justify-between">
                  <h4 class="text-sm font-black truncate dark:text-white text-slate-800 uppercase">{{ item.name }}</h4>
                  <button @click="handleRemove(item.id)" class="text-slate-300 hover:text-rose-500 transition-all"><i class="fa-solid fa-trash-can text-xs"></i></button>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <p class="text-[13px] font-black text-indigo-600">{{ (item.price * item.quantity).toLocaleString() }} <span class="text-[9px] opacity-40">uzs</span></p>
                  <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                    <button @click="handleUpdateQty(item.id, -1)" class="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center active:scale-75"><i class="fa-solid fa-minus text-[10px]"></i></button>
                    <span class="text-xs font-black min-w-[24px] text-center dark:text-white">{{ item.quantity }}</span>
                    <button @click="handleUpdateQty(item.id, 1)" class="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center active:scale-90"><i class="fa-solid fa-plus text-[10px]"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="py-20 text-center">
            <i class="fa-solid fa-basket-shopping text-4xl text-slate-200 mb-4 block"></i>
            <p class="text-slate-400 text-xs font-bold uppercase">Savat bo'sh</p>
          </div>
        </div>

        <div v-if="activeTab === 'settings'" class="space-y-6 animate-fade-in">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div @click="store_menu.toggleService()"  class="bg-slate-50 dark:bg-slate-800/40 rounded-[28px] p-3 flex items-center justify-between border border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-100 transition-colors">
              <div class="flex items-center gap-2">
              <div 
  :class="[
    'w-10 h-10 rounded-xl flex items-center justify-center transition-all', 
    feeModel.status === 'active' 
      ? 'bg-indigo-600 text-white cursor-pointer active:scale-95' 
      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 grayscale'
  ]"
  :disabled="feeModel.status !== 'active'"
>
  <i class="fa-solid fa-utensils text-xs"></i>
</div>
                <div>
                  <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Xizmat ({{ feeModel.status==='active'?feeModel.percentage:0 }})%</span>
                  <p class="text-[13px] font-black dark:text-white">{{ feeModel.status==='active' ? calculateServiceFee : "0" }}</p>
                </div>
              </div>
             <div 
  @click="feeModel.status === 'active' && (isServiceActive = !isServiceActive)"
  :class="[
    'w-11 h-6 rounded-full relative transition-all duration-300', 
    // Faol holat ranglari
    feeModel.status === 'active' 
      ? (isServiceActive ? 'bg-indigo-600 cursor-pointer' : 'bg-slate-300 dark:bg-slate-600 cursor-pointer') 
      : 'bg-slate-200 dark:bg-slate-800 cursor-not-allowed opacity-50' // Disabled holati
  ]"
>
  <div :class="[
    'w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm', 
    isServiceActive ? 'left-6' : 'left-1'
  ]"></div>
</div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800/40 rounded-[28px] p-3 border border-slate-100 dark:border-white/5 flex items-center gap-3">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0', discountPercent > 0 ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400']">
                <i class="fa-solid fa-percent text-xs"></i>
              </div>
              <div class="flex-1">
                <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Chegirma (%)</span>
                <input type="number" v-model="discountPercent" class="w-full bg-transparent text-sm font-black outline-none dark:text-white border-none focus:ring-0 p-0" placeholder="0" min="0" max="100" />
              </div>
            </div>
          </div>

          <div class="p-1 bg-slate-100 dark:bg-slate-800/50 rounded-[22px] flex gap-1">
            <button v-for="type in ['table', 'takeaway']" :key="type" @click="orderType = type" :class="['flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2', orderType === type ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400']">
              <i :class="type === 'table' ? 'fa-solid fa-chair' : 'fa-solid fa-bag-shopping'"></i>
              {{ type === 'table' ? 'Stolga' : 'Olib ketish' }}
            </button>
          </div>
          <div class="grid grid-cols-1 gap-4">
            <div v-if="orderType === 'table'" class="grid grid-cols-1 md:grid-cols-1 gap-4 animate-fade-in">
<Select 
  v-model="selectedTable" 
  size="small" 
  label="Stol Tanlang" 
  :options="tabels" 
  labelKey="number" 
  valueKey="number" 
  searchable 
  placeholder="Stol raqami..."
>
  <template #option="{ option }">
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-3">
        <div 
          :class="[
            'w-10 h-10 rounded-xl flex flex-col items-center justify-center border-2 transition-all',
            option.status === '0' 
              ? 'border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' 
              : 'border-rose-500/20 bg-rose-50 text-rose-600 dark:bg-rose-500/10'
          ]"
        >
          <span class="text-[10px] uppercase font-black leading-none">№</span>
          <span class="text-sm font-black">{{ option.number }}</span>
        </div>

        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-700 dark:text-slate-200">
            {{ option.position }}
          </span>
          <span class="text-[10px] text-slate-400 font-medium">
            <i class="fa-solid fa-users mr-1"></i> {{ option.capacity || 4 }}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-1">
        <span 
          :class="[
            'px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border',
            option.status === '0'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
          ]"
        >
          {{ option.status === '0' ? 'Bo\'sh' : 'Band' }}
        </span>
       
      </div>
    </div>
  </template>
</Select>
        
            </div>
                <Select 
  v-model="selectedCustomer" 
  :options="customers" 
  label="Mijozni tanlang"
  labelKey="name" 
  valueKey="_id"
  searchable
  clearable
  size="small" 

>
  <template #option="{ option }">
    <div class="flex items-center justify-between w-full ">
      <div class="flex flex-col">
        <span class="text-sm font-bold text-slate-700 dark:text-slate-200">
          {{ option.name }}
        </span>
        <span class="text-[10px] text-slate-400">tel: {{ option.phone }}</span>
      </div>

      <div class="text-right">
        <p :class="option.balance < 0 ? 'text-rose-500' : 'text-emerald-500'" class="text-[12px] font-black">
          {{ new Intl.NumberFormat('uz-UZ').format(option.balance) }}
          <span class="text-[9px] opacity-70">UZS</span>
        </p>
        <p class="text-[9px] text-slate-400 uppercase tracking-tighter">Balans</p>
      </div>
    </div>
  </template>
</Select>
          <Select 
  v-model="selectedStaff" 
  size="small" 
  label="Mas'ul Ofitsiant" 
  :options="employees" 
  labelKey="firstname" 
  valueKey="_id" 
  searchable 
  placeholder="Ofitsiantni tanlang..."
  clearable
>
  <template #option="{ option }">
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-3">
        <div class="relative">
          <img 
            :src="option.image || 'https://ui-avatars.com/api/?name=' + option.firstname" 
            class="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
          />
          <span v-if="option.isOnline" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </div>

        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-800 dark:text-slate-100">
            {{ option.firstname }} {{ option.lastname }}
          </span>
          <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            {{ option.position || option.role }}
          </span>
        </div>
      </div>

      <div v-if="option.phone" class="text-right">
        <span class="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
          #{{ option.phone.slice(-4) }}
        </span>
      </div>
    </div>
  </template>
</Select>
            <TextArea v-model="orderComment" placeholder="Izohlar bo'lsa kiriting..." label="Buyurtma uchun izoh..." />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="w-full space-y-2">
          <div class="grid grid-cols-3 gap-2 px-2 border-b border-slate-100 dark:border-white/5 pb-2">
            <div><p class="text-[9px] font-black text-slate-400 uppercase mb-1">Summa</p><p class="text-[12px] font-bold dark:text-white">{{ currentSubtotal.toLocaleString() }}</p></div>
            <div class="text-center"><p class="text-[9px] font-black text-indigo-500 uppercase mb-1">Xizmat</p><p class="text-[12px] font-bold text-indigo-600">+{{ calculateServiceFee.toLocaleString() }}</p></div>
            <div class="text-right"><p class="text-[9px] font-black text-rose-500 uppercase mb-1">Chegirma</p><p class="text-[12px] font-bold text-rose-600">-{{ calculateDiscountAmount.toLocaleString() }}</p></div>
          </div>
          <div class="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-500/5 p-4 rounded-[24px]">
            <div>
              <p class="text-slate-400 text-[10px] font-black uppercase mb-1">Jami To'lov</p>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{{ finalTotal.toLocaleString() }}</span>
                <span class="text-[10px] font-black text-indigo-600 uppercase ml-1">uzs</span>
              </div>
            </div>
            <Button @click="handleSaveOrder()" size="sm" leftIcon="fas fa-check" :loading="loading" :disabled="!isReadyToOrder">
              <span class="text-[11px] font-black uppercase tracking-widest">{{ model._id ? 'Yangilash' : 'Saqlash' }}</span>
            </Button>
          </div>
        </div>
      </template>
    </Modal>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { MenuStore, TabelStore,EmployeeStore,CustomerStore,FeeStore } from "../../stores/index.store";
import { Select, Button, Modal, TextArea } from "../../UI/UI";
import { useRouter } from 'vue-router';

const router = useRouter();
const store_menu = MenuStore();
const store_tabel = TabelStore();
const store_employee = EmployeeStore();
const store_customer = CustomerStore();
const store_fee = FeeStore();

const {
  cartItems, isCartOpen, totalItemsCount, currentSubtotal, calculateServiceFee,
  calculateDiscountAmount, finalTotal, isReadyToOrder, isServiceActive,
  discountPercent, orderType, selectedTable, selectedStaff, orderComment,
  selectedCustomer, loading, model
} = storeToRefs(store_menu);
const { tabels } = storeToRefs(store_tabel);
const {employees } = storeToRefs(store_employee);
const { customers } = storeToRefs(store_customer);
const { model: feeModel } = storeToRefs(store_fee);
const activeTab = ref("items");


onMounted(async () => {
  await store_tabel.GetAll();
  await store_employee.GetAll();
  await store_customer.GetAll();
  await store_fee.GetFee();
});

const handleUpdateQty = async (id, change) => {
  store_menu.updateCartQty({ id, change });
  await Haptics.impact({ style: ImpactStyle.Light });
};

const handleRemove = async (id) => {
  store_menu.removeFromCart(id);
  await Haptics.impact({ style: ImpactStyle.Medium });
};

const handleSaveOrder = async () => {
  await Haptics.notification({ type: NotificationType.Success });
  await store_menu.CreateOrder();
};

const goToMenu = () => {
  isCartOpen.value = false;
  router.push({ name: 'menu' });
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>