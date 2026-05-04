<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617]">
    <!-- HEADER -->
    <Header
      title="Kirimi qilish"
      searchable
      v-model="searchQuery"
      searchPlaceholder="Mahsulot izlash..."
    >
      <template #actions>
        <div class="relative group" @click="store_insert.isCartOpen = true">
          <Button icon="fas fa-shopping-cart" size="sm" variant="secondary" />
          <span
            v-if="kirimItems.length"
            class="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black ring-2 ring-white dark:ring-slate-900 animate-bounce"
          >
            {{ kirimItems.length }}
          </span>
        </div>
      </template>
    </Header>

    <ion-content :fullscreen="true" class="ion-padding-bottom">
      <GlobalRefresher />

      <div class="max-w-full mx-auto px-4 mb-40 mt-3">
        <!-- MAHSULOTLAR RO'YXATI -->
        <div
          v-if="!store_insert.loading && filteredFoods.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="product in filteredFoods"
            :key="product._id"
            :class="[
              'group bg-white dark:bg-slate-900 rounded-[30px] p-3 border transition-all duration-500 flex gap-4 items-center relative overflow-hidden',
              getInKirim(product._id)
                ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/10'
                : 'border-slate-100 dark:border-white/5 shadow-sm',
            ]"
          >
            <!-- Mahsulot Rasmi -->
            <div
              class="relative w-20 h-20 flex-none overflow-hidden rounded-[22px] bg-slate-100 dark:bg-slate-800"
            >
              <img
                v-if="product.image"
                :src="product.image"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-slate-300"
              >
                <i class="fas fa-box text-2xl"></i>
              </div>
            </div>

            <!-- Mahsulot Ma'lumotlari -->
            <div class="flex-1 min-w-0">
              <h3
                class="text-[14px] font-black text-slate-800 dark:text-white truncate uppercase mb-1"
              >
                {{ product.name }}
              </h3>
              <div class="flex items-center justify-between">
                <div
                  v-if="getInKirim(product._id)"
                  class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-[14px] p-1 gap-1 border border-slate-200 dark:border-white/5"
                >
                  <button
                    @click="updateKirimQty(product, -1)"
                    class="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center active:scale-75 shadow-sm"
                  >
                    <i class="fas fa-minus text-[10px]"></i>
                  </button>
                  <input
                    type="number"
                    :value="getInKirim(product._id).kirimQty"
                    @input="(e) => setKirimQty(product, e.target.value)"
                    class="w-10 bg-transparent text-center text-[13px] font-black dark:text-white border-none outline-none"
                  />
                  <button
                    @click="updateKirimQty(product, 1)"
                    class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center active:scale-75 shadow-sm"
                  >
                    <i class="fas fa-plus text-[10px]"></i>
                  </button>
                </div>
                <Button
                  v-else
                  size="sm"
                  icon="fas fa-plus"
                  @click="addToKirim(product)"
                />
                <span class="text-[12px] font-black text-indigo-600"
                  >{{ product.price.toLocaleString() }} UZS</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- MODAL (SAVATCHA) -->
    <Modal
      v-model="store_insert.isCartOpen"
      title="Kirim hujjati"
      icon="fa-solid fa-file-invoice"
    >
      <div class="space-y-4">
        <!-- TABS -->
        <div
          class="p-1 bg-slate-100 dark:bg-slate-800 rounded-[20px] flex gap-1"
        >
          <button
            v-for="t in [
              { id: 'items', l: 'Mahsulotlar', i: 'fa-boxes' },
              { id: 'settings', l: 'Sozlamalar', i: 'fa-cog' },
            ]"
            :key="t.id"
            @click="activeTab = t.id"
            :class="[
              'flex-1 py-2.5 rounded-[16px] text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2',
              activeTab === t.id
                ? 'bg-white dark:bg-slate-700 text-green-500 shadow-sm'
                : 'text-slate-400',
            ]"
          >
            <i :class="['fas', t.i]"></i> {{ t.l }}
          </button>
        </div>

        <!-- 1-TAB: ITEMS -->
        <div
          v-if="activeTab === 'items'"
          class="space-y-3 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar"
        >
          <div
            v-for="item in kirimItems"
            :key="item._id"
            class="bg-white dark:bg-slate-900 rounded-[26px] p-4 border dark:border-white/5 shadow-sm space-y-4"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"
                >
                  <i class="fas fa-box"></i>
                </div>
                <div>
                  <h4 class="text-[13px] font-black uppercase leading-none">
                    {{ item.name }}
                  </h4>
                  <small
                    class="text-[10px] text-slate-400 font-bold uppercase"
                    >{{ item.unit || "dona" }}</small
                  >
                </div>
              </div>
              <button
                @click="store_insert.removeFromKirim(item._id)"
                class="text-rose-500/50 hover:text-rose-500 p-2"
              >
                <i class="fas fa-trash-can"></i>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <Input
                label="Kirim miqdori"
                type="number"
                v-model="item.kirimQty"
                isFormatted
                size="small"
              />
              <Input
                label="Tannarx (Dona)"
                type="number"
                v-model="item.costPrice"
                @input="calcMarkup(item, 'cost')"
                isFormatted
                size="small"
                class="!text-indigo-600 font-bold"
              />
              <Input
                label="Natsenka %"
                type="number"
                v-model="item.markup"
                @input="calcMarkup(item, 'markup')"
                isFormatted
                size="small"
                class="!text-orange-500 font-bold"
              />
              <Input
                label="Sotuv Narxi"
                type="number"
                v-model="item.sellPrice"
                @input="calcMarkup(item, 'sell')"
                isFormatted
                size="small"
                class="!text-emerald-600 font-bold"
              />
            </div>

            <div
              class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-50 dark:border-white/5"
            >
              <div
                class="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-dashed border-slate-200 dark:border-white/5"
              >
                <p class="text-[8px] font-bold text-slate-400 uppercase">
                  Jami Tannarx
                </p>
                <p
                  class="text-[11px] font-black text-slate-700 dark:text-white"
                >
                  {{
                    (
                      parseFloat(item.kirimQty || 0) *
                      parseFloat(item.costPrice || 0)
                    ).toLocaleString()
                  }}
                  <small class="opacity-50">UZS</small>
                </p>
              </div>
              <div
                class="bg-emerald-50/50 dark:bg-emerald-500/5 p-2 rounded-xl border border-dashed border-emerald-100 dark:border-emerald-500/10"
              >
                <p class="text-[8px] font-bold text-emerald-500 uppercase">
                  Jami Sotuv
                </p>
                <p
                  class="text-[11px] font-black text-emerald-600 dark:text-emerald-400"
                >
                  {{
                    (
                      parseFloat(item.kirimQty || 0) *
                      parseFloat(item.sellPrice || 0)
                    ).toLocaleString()
                  }}
                  <small class="opacity-50">UZS</small>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2-TAB: SETTINGS -->
        <div
          v-if="activeTab === 'settings'"
          class="space-y-5 py-2 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar"
        >
          <div class="grid grid-cols-1 gap-4">
            
              <Select 
  v-model="form.counterpartyId" 
  :options="counterparties" 
  label="Kontragent"
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
              size="sm"
              label="Ombor"
              v-model="form.warehouseId"
              :options="warehouses"
              labelKey="name"
              valueKey="_id"
              searchable
            />
          </div>

          <hr class="border-slate-100 dark:border-white/5" />

          <div class="space-y-4">
            <h3
              class="text-[11px] font-black uppercase text-indigo-500 flex items-center gap-2"
            >
              <i class="fas fa-wallet"></i> To'lov ma'lumotlari
            </h3>

            <Select
              size="sm"
              label="To'lov turi"
              v-model="form.paymentType"
              :options="paymentTypes"
              labelKey="name"
              valueKey="_id"
            />

            <div
              v-if="!['mixed', 'debt'].includes(form.paymentType)"
              class="animate-fade-in"
            >
              <Input
                label="To'lanayotgan summa"
                type="number"
                v-model="form.paidAmount"
                isFormatted
                class="!text-emerald-600 font-black"
              />
            </div>

            <div
              v-if="form.paymentType === 'mixed'"
              class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] space-y-3 border border-dashed border-slate-200 dark:border-white/5 animate-fade-in"
            >
              <div class="grid grid-cols-2 gap-3">
                <Input
                  label="Naqd"
                  type="number"
                  v-model="form.mixedPayments.cash"
                  isFormatted
                />
                <Input
                  label="Karta"
                  type="number"
                  v-model="form.mixedPayments.card"
                  isFormatted
                />
                <Input
                  label="Terminal"
                  type="number"
                  v-model="form.mixedPayments.terminal"
                  isFormatted
                />
                <Input
                  label="Balans"
                  type="number"
                  v-model="form.mixedPayments.balance"
                  isFormatted
                />
                <Input
                  label="Qarz"
                  type="number"
                  v-model="form.mixedPayments.debt"
                  isFormatted
                />
              </div>
            </div>

            <div
              v-if="remainingDebt > 0"
              class="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex justify-between items-center border border-rose-100 dark:border-rose-500/20"
            >
              <span
                class="text-[10px] font-bold text-rose-500 uppercase tracking-tight"
                >To'lov qoldig'i:</span
              >
              <span class="text-xs font-black text-rose-600"
                >{{ remainingDebt.toLocaleString() }} UZS</span
              >
            </div>
          </div>

          <TextArea
            v-model="form.comment"
            label="Izoh"
            placeholder="Hujjat uchun qo'shimcha ma'lumot..."
          />
        </div>
      </div>

      <!-- FOOTER -->
      <template #footer>
        <div
          class="p-4 bg-slate-900 w-full rounded-[30px] shadow-2xl space-y-3"
        >
          <div
            class="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5"
          >
            <div class="flex flex-col">
              <span class="text-[8px] font-bold text-slate-400 uppercase"
                >Kutilayotgan Foyda</span
              >
              <span class="text-sm font-black text-orange-400">
                +{{ (totalSellSumma - totalKirimSumma).toLocaleString() }}
              </span>
            </div>
            <div class="text-right flex flex-col">
              <span class="text-[8px] font-bold text-slate-400 uppercase"
                >Sotuv Summasi</span
              >
              <span class="text-sm font-black text-emerald-400">
                {{ totalSellSumma.toLocaleString() }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <div class="flex flex-col">
              <span
                class="text-[9px] font-bold text-slate-500 uppercase leading-none mb-1"
                >Jami Kirim</span
              >
              <span class="text-lg font-black text-white leading-none">
                {{ totalKirimSumma.toLocaleString() }}
              </span>
            </div>
            <Button
              size="sm"
              @click="handleSave"
              :loading="submitting"
              :disabled="kirimItems.length === 0"
              variant="primary"
              class="!rounded-2xl !px-10"
            >
              Yakunlash
            </Button>
          </div>
        </div>
      </template>
    </Modal>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import {
  MenuStore,
  InsertStore,
  CounterpartyStore,
} from "../../../stores/index.store";
import { storeToRefs } from "pinia";
import {
  Button,
  Header,
  GlobalRefresher,
  Modal,
  Select,
  Input,
  TextArea,
  Toast,
  
} from "../../../UI/UI";

// Stores
const store_insert = InsertStore();
const store_menu = MenuStore();
const store_counterparty = CounterpartyStore();
const { kirimItems } = storeToRefs(store_insert);
const { menus } = storeToRefs(store_menu);
const { counterparties } = storeToRefs(store_counterparty);

// State
const searchQuery = ref("");
const activeTab = ref("items");
const submitting = ref(false);

const suppliers = ref([
  { _id: "1", name: "Premium Meat LLC" },
  { _id: "2", name: "Fresh Vegetables" },
]);
const warehouses = ref([
  { _id: "w1", name: "Asosiy Sklad" },
  { _id: "w2", name: "Bar Skladi" },
]);

const paymentTypes = ref([
  { _id: "cash", name: "Naqd pul" },
  { _id: "card", name: "Plastik karta" },
  { _id: "terminal", name: "Terminal" },
  { _id: "debt", name: "Qarz (Nasiya)" },
  { _id: "balance", name: "Shaxsiy balansdan" },
  { _id: "mixed", name: "Aralash to'lov" },
]);

const form = ref({
  counterpartyId: null,
  warehouseId: null,
  paymentType: "cash",
  paidAmount: 0,
  comment: "",
  mixedPayments: { cash: 0, card: 0, terminal: 0, balance: 0, debt: 0 },
});

// --- CALCULATIONS ---
const totalKirimSumma = computed(() =>
  kirimItems.value.reduce(
    (sum, item) =>
      sum + parseFloat(item.kirimQty || 0) * parseFloat(item.costPrice || 0),
    0,
  ),
);

const totalSellSumma = computed(() =>
  kirimItems.value.reduce(
    (sum, item) =>
      sum + parseFloat(item.kirimQty || 0) * parseFloat(item.sellPrice || 0),
    0,
  ),
);

const remainingDebt = computed(() => {
  const total = totalKirimSumma.value;
  if (form.value.paymentType === "mixed") {
    const paid = Object.values(form.value.mixedPayments).reduce(
      (a, b) => a + (parseFloat(b) || 0),
      0,
    );
    return Math.max(0, total - paid);
  } else if (form.value.paymentType === "debt") {
    return total;
  }
  return Math.max(0, total - (parseFloat(form.value.paidAmount) || 0));
});

// Natsenka va Sotuv narxi mantiqi (Rasmda ko'ringan xato shu yerda tuzatildi)
const calcMarkup = (item, type) => {
  // 1. Probeller va harflarni olib tashlab, raqamga aylantiramiz
  const cleanNum = (val) => {
    if (typeof val === "number") return val;
    return (
      parseFloat(
        String(val || 0)
          .replace(/\s/g, "")
          .replace(/,/g, ""),
      ) || 0
    );
  };

  const cost = cleanNum(item.costPrice);
  const markup = parseFloat(item.markup) || 0;
  const sell = cleanNum(item.sellPrice);

  if (type === "cost" || type === "markup") {
    // Tannarx yoki natsenka o'zgarganda sotuvni hisoblash
    if (cost > 0) {
      item.sellPrice = Math.round(cost * (1 + markup / 100));
    } else if (cost === 0 && markup > 0) {
      // Tannarx 0 bo'lsa, sotuvni ham 0 qoldiramiz yoki markupga tegmaymiz
      item.sellPrice = 0;
    }
  } else if (type === "sell") {
    // Sotuv narxi o'zgarganda natsenkani hisoblash
    if (cost > 0) {
      // To'g'ri formula: ((18000 - 12000) / 12000) * 100 = 50%
      const res = ((sell - cost) / cost) * 100;
      item.markup = parseFloat(res.toFixed(2));
    } else {
      item.markup = 0;
    }
  }
};

// To'lov turi o'zgarganda paidAmountni avtomatik to'ldirish
watch(
  () => form.value.paymentType,
  (val) => {
    if (val === "debt") form.value.paidAmount = 0;
    else if (val !== "mixed") form.value.paidAmount = totalKirimSumma.value;
  },
);

// --- ACTIONS ---
const getInKirim = (id) => kirimItems.value.find((i) => i._id === id);

const addToKirim = async (product) => {
  store_insert.addToKirim({
    ...product,
    kirimQty: 1,
    costPrice: Math.round(product.price * 0.8),
    sellPrice: product.price,
    markup: 25,
  });
  await Haptics.impact({ style: ImpactStyle.Medium });
};

const updateKirimQty = (product, change) => {
  store_insert.updateKirimQty(product._id, change);
  Haptics.impact({ style: ImpactStyle.Light });
};

const setKirimQty = (product, val) => {
  store_insert.setManualKirimQty(product._id, parseFloat(val) || 0);
};

const filteredFoods = computed(() =>
  menus.value.filter((f) =>
    f.name?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
);

const handleSave = async () => {
  // 1. Validatsiya
  if (kirimItems.value.length === 0) {
    return;
  }
  if (!form.value.counterpartyId || !form.value.warehouseId) {
    activeTab.value = "settings";
    return;
  }

  submitting.value = true;
  
  try {
    // 2. Backend kutayotgan formatga o'tkazish (Payload tayyorlash)
    const payload = {
      counterpartyId: form.value.counterpartyId,
      warehouseId: form.value.warehouseId,
      paymentType: form.value.paymentType,
      paidAmount: form.value.paymentType === 'mixed' ? 0 : parseFloat(form.value.paidAmount),
      mixedPayments: form.value.paymentType === 'mixed' ? form.value.mixedPayments : null,
      comment: form.value.comment,
      // Mahsulotlar ro'yxati
      items: kirimItems.value.map(item => ({
        productId: item._id,
        quantity: parseFloat(item.kirimQty),
        costPrice: parseFloat(item.costPrice),
        markup: parseFloat(item.markup),
        sellPrice: parseFloat(item.sellPrice),
        totalCost: parseFloat(item.kirimQty) * parseFloat(item.costPrice),
        totalSell: parseFloat(item.kirimQty) * parseFloat(item.sellPrice),
      })),
      totalSellAmount: totalSellSumma.value,
      totalCostAmount: totalKirimSumma.value,
    };

    // 3. API ga yuborish
    const response = await store_insert.submitKirim(payload);

    if (response) {
      await Haptics.notification({ type: NotificationType.Success });
      
      // 4. Formani tozalash
      store_insert.kirimItems = [];
      store_insert.isCartOpen = false;
      resetForm();
    }
  } catch (error) {
    console.error("Saqlashda xatolik:", error);
    await Haptics.notification({ type: NotificationType.Error });
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  // Agar menyular hali yuklanmagan bo'lsa, ularni yuklaymiz
  if (menus.value.length === 0) {
    store_menu.GetAll();
  }
  
  // Kontragentlarni har doim yangilash yoki shartga ko'ra yuklash
  store_counterparty.getAll();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
