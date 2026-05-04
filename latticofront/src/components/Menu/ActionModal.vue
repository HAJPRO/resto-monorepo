<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { MenuStore, CategoryStore } from "../../stores/index.store"; 
import { Button, Select, Modal, Input, TextArea, Upload } from "../../UI/UI";
import { getBase64 } from "../../utils/imageUploaderOptins/useImageUploader";

const store_menu = MenuStore();
const store_category = CategoryStore();

const { isModal, model, modalAction } = storeToRefs(store_menu);
const { categories } = storeToRefs(store_category);

// O'lchov birliklari ro'yxati
const unitOptions = [
  { label: 'Porsiya', value: 'portion' },
  { label: 'Kosa', value: 'bowl' },
  { label: 'Tovoq', value: 'plate' },
  { label: 'Dona', value: 'pcs' },
  { label: 'Stakan', value: 'glass' },
  { label: 'Kilogramm', value: 'kg' },
  { label: 'Litr', value: 'l' }
];

const statusOptions = [
  { label: "Sotuvda bor", value: "active" },
  { label: "Tugagan", value: "out_of_stock" },
  { label: "Yashirin", value: "hidden" },
];

const formRefs = ref([]);
const touched = ref(false);

const Save = async () => {
  touched.value = true;
  const results = formRefs.value.map(ref => ref?.validate ? ref.validate() : true);
  if (results.includes(false)) return;

  try {
    const payload = {
      name: model.value.name,
      unit: model.value.unit,
      price: Number(model.value.price),
      category: model.value.category,
      status: model.value.status,
      description: model.value.description,
      discount_price: Number(model.value.discount_price || 0),
      // Ombor logikasi
      is_stock: !!model.value.is_stock,
      quantity: model.value.is_stock ? Number(model.value.quantity || 0) : 0,
      action: modalAction.value
    };

    if (modalAction.value === 'edit') payload._id = model.value._id;

    if (model.value.image instanceof File) {
      payload.image = await getBase64(model.value.image);
    } else {
      payload.image = model.value.image || null;
    }

    await store_menu.Create(payload);
    isModal.value = false;
    touched.value = false;
  } catch (err) {
    console.error("Saqlashda xatolik:", err);
  }
};

onMounted(async () => {
  await store_category.GetAll();
});
</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction === 'edit' ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'"
    :icon="modalAction === 'edit' ? 'fa-solid fa-utensils' : 'fa-solid fa-plus'"
  >
    <div class="space-y-5 pb-4 px-1 mt-3">
      
      <!-- 1. Rasm yuklash -->
      <Upload 
        v-model="model.image"
        type="image"
        label="Taom rasmi"
        accept="image/*"
        rounded="rounded-[2rem]"
        class="w-full h-[180px] shadow-sm" 
      />

      <!-- 2. Nomi va Birligi -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          :ref="el => formRefs[0] = el"
          required
          v-model="model.name"
          :rules="[v => !!v || 'Taom nomini kiriting']"
          label="Taom nomi"
          placeholder="Lavash, Osh..." 
        />
        <Select 
          :ref="el => formRefs[3] = el"
          v-model="model.unit"
          label="O'lchov birligi"
          :options="unitOptions" 
          placeholder="Birlik"
          required
          :rules="[v => !!v || 'Birlikni tanlang']"
        />
      </div>

      <!-- 3. Narxlar -->
      <div class="grid grid-cols-2 gap-4">
        <Input 
          :ref="el => formRefs[1] = el"
          required
          v-model="model.price"
          type="number"
          label="Narxi (UZS)"
          placeholder="35000"
          :rules="[v => !!v || 'Narxni kiriting']"
        />
        <Input 
          :ref="el => formRefs[2] = el"
          v-model="model.discount_price"
          type="number"
          label="Chegirma narxi"
          placeholder="Ixtiyoriy..."
        />
      </div>

      <!-- 4. Ombor logikasi -->
      <!-- Shart: Yangi mahsulot bo'lsa ko'rinadi, editda faqat is_stock: true bo'lganlar ko'rinadi -->
      <div 
        v-if="modalAction !== 'edit' || model.is_stock"
        class="p-4 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10"
      >
        <div 
          class="flex items-center justify-between"
          :class="modalAction === 'edit' ? 'cursor-not-allowed' : 'cursor-pointer'"
          @click="modalAction !== 'edit' ? model.is_stock = !model.is_stock : null"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-indigo-500">
              <i class="fa-solid fa-boxes-stacked"></i>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-700 dark:text-slate-200">Ombor hisobi</span>
              <span class="text-[11px] text-slate-400 italic">Soni hisoblanadigan mahsulotlar uchun</span>
            </div>
          </div>
          <input 
            type="checkbox" 
            v-model="model.is_stock" 
            :disabled="modalAction === 'edit'"
            @click.stop
            class="w-5 h-5 accent-indigo-600" 
          />
        </div>

        <Transition name="expand">
          <div v-if="model.is_stock" class="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5">
            <Input 
              :ref="el => formRefs[7] = el"
              required
              v-model="model.quantity"
              type="number"
              label="Mavjud miqdor (Qoldiq)"
              placeholder="Masalan: 100"
              :disabled="modalAction === 'edit'"
              :hint="modalAction === 'edit' ? 'Qoldiqni tahrirlash cheklangan' : 'Ilk kirim miqdorini yozing'"
              :rules="[v => (model.is_stock ? !!v : true) || 'Miqdorni kiriting']"
              class="disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800"
            />
          </div>
        </Transition>
      </div>

      <!-- 5. Kategoriya va Status -->
      <div class="grid grid-cols-2 gap-4">
        <Select 
          :ref="el => formRefs[4] = el"
          v-model="model.category"
          label="Kategoriya"
          :options="categories" 
          labelKey="name"
          valueKey="name"
          placeholder="Tanlang"
          required
          :rules="[v => !!v || 'Kategoriyani tanlang']"
        />
        <Select 
          :ref="el => formRefs[5] = el"
          v-model="model.status"
          label="Holati"
          :options="statusOptions" 
          placeholder="Holat"
          required
          :rules="[v => !!v || 'Holatni tanlang']"
        />
      </div>

      <!-- 6. Tavsif -->
      <TextArea 
        :ref="el => formRefs[6] = el"
        v-model="model.description"
        label="Tavsif"
        placeholder="Taom tarkibi va boshqalar..."
        counter
        maxlength="300"
        :rules="[v => !!v || 'Tavsif majburiy']"
      />
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="py-1 px-2 flex gap-3">
        <Button 
        size="sm"
          variant="danger"
          @click="isModal = false"
          leftIcon="fa-solid fa-xmark"
          
        >
          Bekor qilish

          </Button>
        <Button 
        size="sm"
          @click="Save()"
          variant="primary"
          class="flex-1 !bg-indigo-600 hover:!bg-indigo-700 shadow-lg shadow-indigo-200 text-white font-bold"
        >
          {{ modalAction === 'edit' ? 'O\'zgartirish' : 'Saqlash' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 120px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>