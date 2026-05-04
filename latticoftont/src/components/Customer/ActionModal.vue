<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { CustomerStore } from "../../stores/index.store"; 
import { Button, Select, Modal, Input, Upload } from "../../UI/UI";
import { getBase64 } from "../../utils/imageUploaderOptins/useImageUploader";

const store_customer = CustomerStore();
const { isModal, model, modalAction } = storeToRefs(store_customer);

const touched = ref(false);
const formRefs = ref({});

// Mijoz toifalari (Loyalty program uchun)
const categoryOptions = [
  { label: "Yangi mijoz", value: "new" },
  { label: "Doimiy", value: "regular" },
  { label: "VIP", value: "vip" },
];

// Mijoz holati
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
      action: modalAction.value.action
    };

    if (modalAction.value.action === 'edit') payload._id = model.value._id;

    // Rasm ixtiyoriy bo'lishi mumkin
    if (model.value.image instanceof File) {
      payload.image = await getBase64(model.value.image);
    }

    const success = await store_customer.Create(payload);
    
    if (success) {
      isModal.value = false;
      touched.value = false;
    }
  } catch (err) {
    console.error("Mijozni saqlashda xatolik:", err);
  }
};
</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction.action === 'edit' ? 'Mijozni tahrirlash' : 'Mijoz qo\'shish'"
    :icon="modalAction.action === 'edit' ? 'fa-solid fa-user-gear' : 'fa-solid fa-user-plus'"
    width="650px"
  >
    <div class="grid grid-cols-12 gap-x-5 gap-y-4 py-4 px-1">
      
      <div class="col-span-12 flex flex-col items-center mb-2">
        <Upload 
          v-model="model.image"
          type="image"
          :multiple="false"
          label="Mijoz rasmi"
          accept="image/*"
          class="w-full h-[180px] shadow-sm rounded-3xl" 
        />
      </div>

      <div class="col-span-12">
        <Input 
          :ref="el => formRefs.name = el"
          required
          v-model="model.name"
          :rules="[v => !!v || 'Ismni kiriting']"
          label="Mijozning to'liq ismi (F.I.SH)"
          placeholder="Masalan: Ali Valiyev" 
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
          :ref="el => formRefs.category = el"
          v-model="model.category"
          label="Toifasi"
          :options="categoryOptions" 
          required
          :rules="[v => !!v || 'Toifani tanlang']"
          placeholder="Tanlang"
        />
      </div>

      <div class="col-span-12">
        <Input 
          v-model="model.address"
          label="Yashash manzili (Yetkazib berish uchun)"
          placeholder="Ko'cha nomi, uy raqami..." 
          left-icon="fas fa-location-dot"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Input 
          v-model="model.balance"
          type="number"
          label="Boshlang'ich balans (UZS)"
          placeholder="0" 
          left-icon="fas fa-wallet"
          suffix="Sum"
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Select 
          v-model="model.status"
          label="Mijoz holati"
          :options="statusOptions" 
          placeholder="Aktiv"
        />
      </div>

      <div class="col-span-12">
        <Input 
          v-model="model.comment"
          label="Izoh"
          placeholder="Mijoz haqida qo'shimcha ma'lumot..." 
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