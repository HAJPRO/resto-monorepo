<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { EmployeeStore } from "../../../stores/index.store"; 
import { Button, Select, Modal, Input, Upload } from "../../../UI/UI";
import { getBase64 } from "../../../utils/imageUploaderOptins/useImageUploader";

const store_employe = EmployeeStore();
const { isModal, model, modalAction } = storeToRefs(store_employe);

const touched = ref(false);
const formRefs = ref({});

const roleOptions = [
  { label: "Adminstrator", value: "admin" },
  { label: "Menejer", value: "manager" },
  { label: "Oshpaz", value: "chef" },
  { label: "Ofitsiant", value: "waiter" },
  { label: "Kuryer", value: "delivery" },
];

const genderOptions = [
  { label: "Erkak", value: "male" },
  { label: "Ayol", value: "female" },
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
  // Validatsiya: Formlar va Rasm mavjudligini tekshirish
  if (!validateAll() || !model.value.image) {
    return;
  }

  try {
    const payload = {
      ...model.value,
      // Maoshni raqamga o'tkazish, bo'sh bo'lsa 0
      salary: Number(model.value.salary || 0), 
      action: modalAction.value
    };

    if (modalAction.value.action === 'edit') payload._id = model.value._id;

    // Rasm fayl bo'lsa Base64 ga o'girish, aks holda borini yuborish (string bo'lsa)
    if (model.value.image instanceof File) {
      payload.image = await getBase64(model.value.image);
    }

    // TO'G'RI: store instansiyasi orqali chaqirish
    const success = await store_employe.Create(payload);
    
    if (success) {
      isModal.value = false;
      touched.value = false;
    }
  } catch (err) {
    console.error("Xodimni saqlashda xatolik:", err);
  }
};
</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction === 'edit' ? 'Xodimni tahrirlash' : 'Xodim qo\'shish'"
    :icon="modalAction === 'edit' ? 'fa-solid fa-user-pen' : 'fa-solid fa-user-plus'"
    width="650px"
  >
    <div class="grid grid-cols-12 gap-x-5 gap-y-4 py-4 px-1">
      
      <div class="col-span-12 flex flex-col items-center mb-2">
        <Upload 
          v-model="model.image"
          type="image"
          :multiple="false"
          label="Xodim rasmi"
          :error="touched && !model.image ? 'Rasm yuklash majburiy' : false"
          accept="image/*"
          class="w-full h-[180px] shadow-sm" 
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Input 
          :ref="el => formRefs.firstname = el"
          required
          v-model="model.firstname"
          :rules="[v => !!v || 'Ismni kiriting']"
          label="Ism"
          placeholder="Masalan: Ali" 
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Input 
          :ref="el => formRefs.lastname = el"
          required
          v-model="model.lastname"
          :rules="[v => !!v || 'Familiyani kiriting']"
          label="Familiya"
          placeholder="Masalan: Valiyev" 
        />
      </div>
 <div class="col-span-12 md:col-span-6">
        <Input 
          :ref="el => formRefs.gender = el"
          v-model="model.age"
          label="Yoshi"
          required
          :rules="[v => !!v || 'Yoshini kiriting']"
          placeholder="21"
        />
      </div>
    

      <div class="col-span-12 md:col-span-6">
        <Select 
          :ref="el => formRefs.gender = el"
          v-model="model.gender"
          label="Jinsi"
          :options="genderOptions" 
          required
          :rules="[v => !!v || 'Jinsini tanlang']"
          placeholder="Tanlang"
        />
      </div>
        <div class="col-span-12 md:col-span-6">
        <Select 
          :ref="el => formRefs.department = el"
          v-model="model.department"
          label="Bo'lim"
          :options="roleOptions" 
          required
          :rules="[v => !!v || 'Bo\'limini tanlang']"
          placeholder="Tanlang"
        />
      </div>
          <div class="col-span-12 md:col-span-6">
        <Select 
          :ref="el => formRefs.position = el"
          v-model="model.position"
          label="Lavozimi"
          :options="roleOptions" 
          required
          :rules="[v => !!v || 'Lavozimni tanlang']"
          placeholder="Tanlang"
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
        <Input 
          :ref="el => formRefs.salary = el"
          v-model="model.salary"
          type="number"
          label="Oylik maoshi (UZS)"
          placeholder="5 000 000" 
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