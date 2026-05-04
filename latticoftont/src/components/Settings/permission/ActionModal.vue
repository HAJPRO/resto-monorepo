<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { PermissionStore } from "../../../stores/index.store.js"; 
import { Button, Modal, Input,TextArea } from "../../../UI/UI.js";

const store = PermissionStore();
const { isModal, model, modalAction } = storeToRefs(store);

const touched = ref(false);
const formRefs = ref({});

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
    const success = await store.Save(model.value);
    if (success) {
      isModal.value = false;
      touched.value = false;
    }
  } catch (err) {
    console.error("Xatolik:", err);
  }
};
</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction.action === 'edit' ? 'Ruxsatnomani tahrirlash' : 'Yangi ruxsatnoma'"
    :icon="modalAction.action === 'edit' ? 'fa-solid fa-key' : 'fa-solid fa-plus-circle'"
    width="500px"
  >
    <div class="grid grid-cols-12 gap-y-4 py-6 px-2">
      
      <div class="col-span-12">
        <Input 
          :ref="el => formRefs.name = el"
          required
          v-model="model.name"
          :rules="[v => !!v || 'Nomni kiriting']"
          label="Ruxsatnoma nomi"
          placeholder="Masalan: Foydalanuvchilarni o'chirish" 
        />
      </div>

      <div class="col-span-12">
        <Input 
          :ref="el => formRefs.value = el"
          required
          v-model="model.value"
          :rules="[v => !!v || 'Tizim kalitini kiriting']"
          label="Tizim kaliti (Value)"
          placeholder="Masalan: user:delete"
          :disabled="modalAction.action === 'edit'"
          :help="modalAction.action === 'edit' ? 'Tizim kalitini o\'zgartirib bo\'lmaydi' : ''"
        />
      </div>

      <div class="col-span-12">
        <TextArea
          v-model="model.description"
          label="Izoh"
          placeholder="Ushbu ruxsatnoma nima vazifa bajarishi haqida..." 
          rows="3"
        />
      </div>

    </div>

    <template #footer>
      <div class="flex justify-end gap-2 px-4 w-full">
        <Button variant="secondary" @click="isModal = false" size="sm">
          Bekor qilish
        </Button>
        <Button variant="primary" @click="onSave" size="sm" left-icon="fas fa-check">
          {{ modalAction.action === 'edit' ? 'Yangilash' : 'Saqlash' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>