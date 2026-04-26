<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { MenuStore } from "../../stores/index.store"; 
import { Button, Select, Modal, Input, TextArea, Upload } from "../../UI/UI";
import { getBase64 } from "../../utils/imageUploaderOptins/useImageUploader"; // Funksiyani import qildik
const store_menu = MenuStore();
// modelAction va model Pinia store'dan kelmoqda
const { isModal, model, modalAction } = storeToRefs(store_menu);

const categoryOptions = [
  { label: "Sho'rvalar", value: "soups" },
  { label: "Asosiy taomlar", value: "main_dishes" },
  { label: "Salatlar", value: "salads" },
  { label: "Ichimliklar", value: "drinks" },
  { label: "Desertlar", value: "desserts" }
];

const statusOptions = [
  { label: "Sotuvda bor", value: "active" },
  { label: "Tugagan", value: "out_of_stock" },
  { label: "Yashirin", value: "hidden" },
];

const formRefs = ref([]);
const touched = ref(false); // Validatsiya xatolarini ko'rsatish uchun

const Save = async () => {
  touched.value = true;
  const results = formRefs.value.map(ref => ref?.validate ? ref.validate() : true);
  if (results.includes(false) || !model.value.image) return;

  try {
    // 1. Toza JSON payload tayyorlaymiz
    const payload = {
      name: model.value.name,
      price: Number(model.value.price),
      category: model.value.category,
      status: model.value.status,
      description: model.value.description,
      discount_price: Number(model.value.discount_price || 0),
      action: modalAction.value
    };

    if (modalAction.value === 'edit') payload._id = model.value._id;

    // 2. Rasmni Base64 ga aylantirish
    if (model.value.image instanceof File) {
      payload.image = await getBase64(model.value.image);
    } else {
      payload.image = model.value.image; 
    }

    // 3. Store'ga yuborish (FormData obyekti emas, PAYLOAD obyektini o'zini beryapmiz)
    await store_menu.Create(payload);
    
    isModal.value = false;
    touched.value = false;
  } catch (err) {
    console.error("Xatolik:", err);
  }
};
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
          :error="touched && !model.image ? 'Rasm yuklash majburiy' : false"
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

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <Input 
            :ref="el => formRefs[1] = el"
            required
            v-model="model.price"
            :rules="[v => !!v || 'Narxni kiriting']"
            type="number"
            label="Narxi (UZS)"
            placeholder="35000" 
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Input 
            :ref="el => formRefs[2] = el"
            v-model="model.discount_price"
            type="number" 
            label="Chegirma narxi"
            placeholder="Ixtiyoriy..." 
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <Select 
            :ref="el => formRefs[3] = el"
            v-model="model.category"
            label="Kategoriya"
            :options="categoryOptions" 
            placeholder="Tanlang"
            required
            :rules="[v => !!v || 'Kategoriyani tanlang']"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Select 
            :ref="el => formRefs[4] = el"
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
          :ref="el => formRefs[5] = el"
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
          class="!bg-indigo-600 hover:!bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          {{ modalAction === 'edit' ? 'O\'zgartirish' : 'Saqlash' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>