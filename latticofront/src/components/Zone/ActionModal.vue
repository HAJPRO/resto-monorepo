<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
// Store nomini ZoneStore yoki HududStore ga o'zgartirishingiz mumkin
import { ZoneStore } from "../../stores/index.store.js"; 
import { Button, Select, Modal, Input,TextArea } from "../../UI/UI.js";

const store = ZoneStore();
const { isModal, model, modalAction } = storeToRefs(store);

const touched = ref(false);
const formRefs = ref({});

// Hudud holati (masalan, VIP zallarni vaqtincha yopib qo'yish imkoniyati)
const statusOptions = [
  { label: "Ochiq (Faol)", value: "active" },
  { label: "Yopiq (Noaktiv)", value: "inactive" },
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
    console.error("Hududni saqlashda xatolik:", err);
  }
};

</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction.action === 'edit' ? 'Hududni tahrirlash' : 'Hudud qo\'shish'"
    :icon="modalAction.action === 'edit' ? 'fas fa-map-location-dot' : 'fas fa-plus'"
    width="500px"
  >
    <div class="grid grid-cols-12 gap-x-5 gap-y-4 py-6 px-2">
      
      <div class="col-span-12">
        <Input 
          :ref="el => formRefs.name = el"
          required
          v-model="model.name"
          :rules="[v => !!v || 'Hudud nomini kiriting']"
          label="Hudud (Zona) nomi"
          placeholder="Masalan: 1-qavat, VIP zal yoki Terrasa" 
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Input 
          :ref="el => formRefs.code = el"
          v-model="model.code"
          label="Hudud kodi (ID)"
          placeholder="Masalan: H-01"
          required
           :rules="[v => !!v ||  `To'ldirilishi shart!`]"
           type="Number"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Select 
          :ref="el => formRefs[2] = el"
           :rules="[v => !!v ||  `To'ldirilishi shart!`]"
          v-model="model.status"
          label="Hudud holati"
          :options="statusOptions"
          placeholder="Tanlang"
          required
          clearable
          
        />
      </div>

      <div class="col-span-12 md:col-span-6">
  <Input 
    type="number"
    v-model="model.tableCount"
    label="Stollar soni"
    placeholder="Masalan: 10" 
  />
</div>
      <div class="col-span-12 md:col-span-6">
        <Select 
          v-model="model.manager"
          label="Mas'ul shaxs"
          placeholder="F.I.SH." 
        />
      </div>

      <div class="col-span-12">
        <TextArea 
          v-model="model.description"
          maxlength="300"
          label="Hudud haqida izoh"
          placeholder="Masalan: Faqat banketlar uchun mo'ljallangan" 
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