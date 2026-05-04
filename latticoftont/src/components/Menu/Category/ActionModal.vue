<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { CategoryStore } from "../../../stores/index.store.js"; 
import { Button, Select, Modal, Input, Upload } from "../../../UI/UI.js";
import { getBase64 } from "../../../utils/imageUploaderOptins/useImageUploader";

const store = CategoryStore();
const { isModal, model, modalAction } = storeToRefs(store);

const touched = ref(false);
const formRefs = ref({});

// Kategoriya turlari
const typeOptions = [
  { label: "Taomlar", value: "food" },
  { label: "Ichimliklar", value: "drink" },
  { label: "Desertlar", value: "dessert" },
  { label: "Boshqa", value: "other" },
];

const validateAll = () => {
  let isValid = true;
  Object.values(formRefs.value).forEach((el) => {
    if (el?.validate && !el.validate()) isValid = false;
  });
  return isValid;
};

const onSave = async () => {
  touched.value = true;
  
  if (!validateAll()) return;

  try {
    const payload = {
      ...model.value,
      action: modalAction.value.action
    };

    if (modalAction.value.action === 'edit') payload._id = model.value._id;

    // Rasmni Base64 ga o'tkazish (agar yangi rasm yuklangan bo'lsa)
    if (model.value.image instanceof File) {
      payload.image = await getBase64(model.value.image);
    }

    const success = await store.Create(payload);
    
    if (success) {
      isModal.value = false;
      touched.value = false;
    }
  } catch (err) {
    console.error("Kategoriyani saqlashda xatolik:", err);
  }
};
</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction.action === 'edit' ? 'Kategoriyani tahrirlash' : 'Kategoriya qo\'shish'"
    :icon="modalAction.action === 'edit' ? 'fa-solid fa-layer-group' : 'fa-solid fa-folder-plus'"
  >
    <div class="grid grid-cols-12 gap-x-5 gap-y-4 py-4 px-2">
      
      <div class="col-span-12 flex flex-col items-center mb-2">
        <Upload 
          v-model="model.image"
          type="image"
          label="Kategoriya rasmi"
          :error="touched && !model.image ? 'Rasm yuklash majburiy' : false"
          class="w-full h-[160px]" 
        />
      </div>

      <div class="col-span-12 md:col-span-8">
        <Input 
          :ref="el => formRefs.name = el"
          required
          v-model="model.name"
          :rules="[v => !!v || 'Nomni kiriting']"
          label="Kategoriya nomi"
          placeholder="Masalan: Issiq taomlar" 
        />
      </div>

      <div class="col-span-12 md:col-span-4">
        <Input 
          :ref="el => formRefs.order = el"
          v-model="model.order"
          type="number"
          label="Tartib #"
          placeholder="1"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Select 
          :ref="el => formRefs.type = el"
          v-model="model.type"
          label="Turi"
          :options="typeOptions"
          required
          :rules="[v => !!v || 'Turini tanlang']"
          placeholder="Tanlang"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Select 
          v-model="model.isAvailable"
          label="Holati"
          :options="[{label: 'Sotuvda faol', value: true}, {label: 'Vaqtincha yopiq', value: false}]"
        />
      </div>

    </div>

    <template #footer>
      <div class="flex gap-2 px-4">
        <Button 
          variant="danger"
          @click="isModal = false"
          size="sm"
          left-icon="fas fa-xmark"
        >
          Bekor qilish
        </Button>
        <Button
          variant="primary" 
          @click="onSave"
          size="sm"
          left-icon="fas fa-check"
        >
          {{ modalAction.action === 'edit' ? 'Yangilash' : 'Saqlash' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>