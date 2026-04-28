<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { MenuStore, CategoryStore } from "../../stores/index.store"; 
import { Button, Select, Modal, Input, TextArea, Upload, Keyboard } from "../../UI/UI";
import { getBase64 } from "../../utils/imageUploaderOptins/useImageUploader";
import { restaurantOutline } from 'ionicons/icons';

const store_menu = MenuStore();
const store_category = CategoryStore();

const { isModal, model, modalAction } = storeToRefs(store_menu);
const { categories } = storeToRefs(store_category);

// O'lchov birliklari ro'yxati
const unitOptions = [
  { label: 'Porsiya', value: 'portion' },
  { label: 'Kosa', value: 'bowl' },
  { label: 'Tovoq', value: 'plate' },
  { label: 'Nafariya', value: 'person' },
  { label: 'Chashka', value: 'cup' },
  { label: 'Stakan', value: 'glass' },
  { label: 'Bo\'lak', value: 'slice' },
  { label: 'Dona', value: 'pcs' },
  { label: 'Kilogramm', value: 'kg' },
  { label: 'Gramm', value: 'g' },
  { label: 'Litr', value: 'l' },
  { label: 'Milli litr', value: 'ml' }
];

const statusOptions = [
  { label: "Sotuvda bor", value: "active" },
  { label: "Tugagan", value: "out_of_stock" },
  { label: "Yashirin", value: "hidden" },
];

const formRefs = ref([]);
const touched = ref(false);

// Klaviatura mantiqi
const keyboardShow = ref(false);
const activeField = ref(null); // 'price' yoki 'discount_price'

const openKeyboard = (field) => {
  activeField.value = field;
  keyboardShow.value = true;
};

const keyboardValue = computed({
  get: () => model.value[activeField.value]?.toString() || '',
  set: (val) => {
    if (activeField.value) {
      model.value[activeField.value] = val;
    }
  }
});

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
      
      <div class="flex flex-col gap-1.5">
        <Upload 
          v-model="model.image"
          type="image"
          :multiple="false"
          label="Taom rasmi"
          accept="image/*"
          rounded="rounded-[2rem]"
          class="w-full h-[180px] shadow-sm" 
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <Input 
          :ref="el => formRefs[0] = el"
          required
          v-model="model.name"
          :rules="[v => !!v || 'Taom nomini kiriting']"
          label="Taom nomi"
          placeholder="Masalan: Lavash, Osh..." 
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <Select 
          :ref="el => formRefs[3] = el"
          v-model="model.unit"
          label="O'lchov birligi"
          :options="unitOptions" 
          placeholder="Birlikni tanlang"
          required
          searchable
          :rules="[v => !!v || 'Birlikni tanlang']"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <Input 
            :ref="el => formRefs[1] = el"
            required
            :model-value="model.price"
            readonly
            @click="openKeyboard('price')"
            :rules="[v => !!v || 'Narxni kiriting']"
            label="Narxi (UZS)"
            placeholder="35000"
            class="cursor-pointer"
            isFormatted
          >
            <template #append v-if="activeField === 'price' && keyboardShow">
              <span class="w-1 h-5 bg-indigo-500 animate-pulse"></span>
            </template>
          </Input>
        </div>
        <div class="flex flex-col gap-1.5">
          <Input 
            :ref="el => formRefs[2] = el"
            :model-value="model.discount_price"
            
            @click="openKeyboard('discount_price')"
            label="Chegirma narxi"
            placeholder="Ixtiyoriy..."
            class="cursor-pointer"
            clearable
            isFormatted
          >
            <template #append v-if="activeField === 'discount_price' && keyboardShow">
              <span class="w-1 h-5 bg-indigo-500 animate-pulse"></span>
            </template>
          </Input>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
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
        </div>
        <div class="flex flex-col gap-1.5">
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
      </div>

      <div class="flex flex-col gap-1.5">
        <TextArea 
          :ref="el => formRefs[6] = el"
          v-model="model.description"
          label="Tavsif"
          placeholder="Taom tarkibi va h.k."
          counter
          maxlength="300"
          :rules="[v => !!v || 'Tavsif yozish majburiy']"
        />
      </div>
    </div>

    <template #footer>
      <div class="py-1 px-4 flex gap-2">
        <Button 
          leftIcon="fa-solid fa-xmark"
          variant="danger"
          size="sm"
          @click="isModal = false"
        >
          Bekor qilish
        </Button>
        <Button 
          @click="Save()"
          size="sm"
          leftIcon="fas fa-check"
          class="!bg-indigo-600 hover:!bg-indigo-700 shadow-lg shadow-indigo-200"
        >
          {{ modalAction === 'edit' ? 'O\'zgartirish' : 'Saqlash' }}
        </Button>
      </div>
    </template>

    <Keyboard 
      v-model="keyboardValue" 
      :show="keyboardShow" 
      @close="keyboardShow = false; activeField = null" 
    />
  </Modal>
</template>

<style scoped>
/* Kerakli qo'shimcha stillar */
.cursor-pointer :deep(input) {
  cursor: pointer;
}
</style>