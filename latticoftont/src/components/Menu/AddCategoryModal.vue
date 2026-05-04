<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { MenuStore } from "../../stores/index.store"; 
import { Button, Modal, Input, Upload } from "../../UI/UI";
import { getBase64 } from "../../utils/imageUploaderOptins/useImageUploader";

const store_menu = MenuStore();
// model va modalAction store'da kategoriyaga mos obyekt bo'lishi kerak
const { isCategoryEditModal, categoryModel, categoryModalAction } = storeToRefs(store_menu);

const formRefs = ref([]);
const touched = ref(false);

const SaveCategory = async () => {
  touched.value = true;
  
  // Validatsiya
  const results = formRefs.value.map(ref => ref?.validate ? ref.validate() : true);
  if (results.includes(false) || !categoryModel.value.image) return;

  try {
    const payload = {
      name: categoryModel.value.name,
      icon: categoryModel.value.icon || 'fa-solid fa-utensils', // Standart ikonka
      action: categoryModalAction.value
    };

    if (categoryModalAction.value === 'edit') payload._id = categoryModel.value._id;

    // Rasmni Base64 ga aylantirish
    if (categoryModel.value.image instanceof File) {
      payload.image = await getBase64(categoryModel.value.image);
    } else {
      payload.image = categoryModel.value.image; 
    }

    // Store'dagi kategoriyalar uchun mo'ljallangan action'ni chaqiramiz
    // Masalan: store_menu.CreateCategory(payload)
    await store_menu.CreateCategory(payload);
    
    isCategoryEditModal.value = false;
    touched.value = false;
  } catch (err) {
    console.error("Kategoriyani saqlashda xatolik:", err);
  }
};
</script>

<template>
  <Modal
    v-model="isCategoryEditModal"
    :title="categoryModalAction === 'edit' ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya qo\'shish'"
    :icon="categoryModalAction === 'edit' ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-folder-plus'"
  >
    <div class="space-y-5 pb-4 px-1 mt-3">
      
      <div class="flex flex-col gap-1.5">
        <Upload 
          v-model="categoryModel.image"
          type="image"
          :multiple="false"
          label="Kategoriya rasmi"
          :error="touched && !categoryModel.image ? 'Rasm yuklash majburiy' : false"
          accept="image/*"
          rounded="rounded-[1.5rem]"
          class="w-full h-[150px] shadow-sm" 
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <Input 
          :ref="el => formRefs[0] = el"
          required
          v-model="categoryModel.name"
          :rules="[v => !!v || 'Kategoriya nomini kiriting']"
          label="Kategoriya nomi"
          placeholder="Masalan: Sho'rvalar, Ichimliklar..." 
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <Input 
          v-model="categoryModel.icon"
          label="Ikonka klassi (Ixtiyoriy)"
          placeholder="Masalan: fa-solid fa-burger" 
        />
        <p class="text-[10px] text-slate-400 px-1 italic">
          FontAwesome ikonka klassini kiriting. Standart: fa-utensils
        </p>
      </div>

    </div>

    <template #footer>
      <div class="py-1 px-4 flex gap-2">
        <Button 
          leftIcon="fa-solid fa-xmark"
          variant="danger"
          size="sm"
          @click="isCategoryEditModal = false"
        >
          Bekor qilish
        </Button>
        <Button 
          @click="SaveCategory()"
          size="sm"
          leftIcon="fas fa-check"
          class="!bg-indigo-600 hover:!bg-indigo-700 shadow-lg shadow-indigo-200"
        >
          {{ categoryModalAction === 'edit' ? 'O\'zgartirish' : 'Saqlash' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>