<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { CounterpartyStore } from "../../stores/index.store"; // Store nomi o'zgardi
import { Button, Select, Modal, Input, Upload } from "../../UI/UI";
import { getBase64 } from "../../utils/imageUploaderOptins/useImageUploader";

const store_counterparty = CounterpartyStore();
const { isModal, model, modalAction } = storeToRefs(store_counterparty);

const touched = ref(false);
const formRefs = ref({});

// Kontragent turlari (Yuridik yoki Jismoniy shaxs)
const typeOptions = [
  { label: "Jismoniy shaxs", value: "individual" },
  { label: "Yuridik shaxs (Kompaniya)", value: "legal_entity" },
];

// Kontragent holati
const statusOptions = [
  { label: "Aktiv", value: "active" },
  { label: "Bloklangan", value: "blocked" },
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
      balance: Number(model.value.balance || 0), 
      // modalAction endi string bo'lishi mumkin (Store o'zgarishiga qarab)
      action: typeof modalAction.value === 'string' ? modalAction.value : modalAction.value.action
    };

    if (payload.action === 'edit') payload._id = model.value._id;

    if (model.value.image instanceof File) {
      payload.image = await getBase64(model.value.image);
    }

    const success = await store_counterparty.createOrUpdate(payload);
    
    if (success) {
      isModal.value = false;
      touched.value = false;
    }
  } catch (err) {
    console.error("Kontragentni saqlashda xatolik:", err);
  }
};
</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction === 'edit' || modalAction.action === 'edit' ? 'Kontragentni tahrirlash' : 'Kontragent qo\'shish'"
    :icon="modalAction === 'edit' || modalAction.action === 'edit' ? 'fa-solid fa-address-card' : 'fa-solid fa-user-plus'"
    width="650px"
  >
    <div class="grid grid-cols-12 gap-x-5 gap-y-4 py-4 px-1">
      
      <div class="col-span-12 flex flex-col items-center mb-2">
        <Upload 
          v-model="model.image"
          type="image"
          :multiple="false"
          label="Kontragent logotipi / rasmi"
          accept="image/*"
          class="w-full h-[180px] shadow-sm rounded-3xl" 
        />
      </div>

      <div class="col-span-12">
        <Input 
          :ref="el => formRefs.name = el"
          required
          v-model="model.name"
          :rules="[v => !!v || 'Nomni kiriting']"
          label="Kontragent nomi / F.I.SH"
          placeholder="Masalan: 'Artel MCHJ' yoki 'Ali Valiyev'" 
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Input 
          :ref="el => formRefs.phone = el"
          v-model="model.phone"
          label="Telefon raqami"
          placeholder="+998 XX XXX XX XX"
          required
          :rules="[v => !!v || 'Telefon raqam majburiy']"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Select 
          :ref="el => formRefs.type = el"
          v-model="model.type"
          label="Kontragent turi"
          :options="typeOptions" 
          required
          :rules="[v => !!v || 'Turni tanlang']"
          placeholder="Tanlang"
        />
      </div>

      <div class="col-span-12">
        <Input 
          v-model="model.address"
          label="Yuridik manzil"
          placeholder="Viloyat, shahar, ko'cha, uy..." 
          left-icon="fas fa-location-dot"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Input 
          v-model="model.balance"
          type="number"
          label="Boshlang'ich balans (Saldo)"
          placeholder="0" 
          left-icon="fas fa-wallet"
          suffix="UZS"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Select 
          v-model="model.status"
          label="Holati"
          :options="statusOptions" 
          placeholder="Aktiv"
        />
      </div>

      <div class="col-span-12">
        <Input 
          v-model="model.comment"
          label="Qo'shimcha izoh"
          placeholder="Hamkorlik shartlari yoki boshqa ma'lumotlar..." 
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
          {{ (modalAction === 'edit' || modalAction.action === 'edit') ? 'Yangilash' : 'Saqlash' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>