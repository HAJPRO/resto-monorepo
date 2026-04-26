<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { DepartmentStore } from "../../../stores/index.store.js"; 
import { Button, Select, Modal, Input } from "../../../UI/UI.js";

const store = DepartmentStore();
const { isModal, model, modalAction } = storeToRefs(store);

const touched = ref(false);
const formRefs = ref({});

// Bo'lim holati uchun variantlar
const statusOptions = [
  { label: "Faol", value: "active" },
  { label: "Noaktiv", value: "inactive" },
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

    const success = await store.Create(payload);
    
    if (success) {
      isModal.value = false;
      touched.value = false;
    }
  } catch (err) {
    console.error("Bo'limni saqlashda xatolik:", err);
  }
};
</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction.action === 'edit' ? 'Bo\'limni tahrirlash' : 'Bo\'lim qo\'shish'"
    :icon="modalAction.action === 'edit' ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus-circle'"
    width="500px"
  >
    <div class="grid grid-cols-12 gap-x-5 gap-y-4 py-6 px-2">
      
      <div class="col-span-12">
        <Input 
          :ref="el => formRefs.name = el"
          required
          v-model="model.name"
          :rules="[v => !!v || 'Bo\'lim nomini kiriting']"
          label="Bo'lim nomi"
          placeholder="Masalan: Buxgalteriya yoki Ishlab chiqarish" 
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Input 
          :ref="el => formRefs.code = el"
          v-model="model.code"
          label="Bo'lim kodi"
          placeholder="Masalan: B-01"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Select 
          :ref="el => formRefs.status = el"
          v-model="model.status"
          label="Holati"
          :options="statusOptions"
          placeholder="Tanlang"
        />
      </div>

      <div class="col-span-12">
        <Input 
          :ref="el => formRefs.manager = el"
          v-model="model.manager"
          label="Mas'ul shaxs (Rahbar)"
          placeholder="F.I.SH." 
        />
      </div>

      <div class="col-span-12">
        <Input 
          v-model="model.description"
          label="Izoh (Majburiy emas)"
          placeholder="Bo'lim haqida qisqacha ma'lumot..." 
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