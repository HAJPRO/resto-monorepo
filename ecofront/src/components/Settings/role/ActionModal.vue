<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { RoleStore, PermissionStore } from "../../../stores/index.store.js"; 
import { Button, Modal, Input, TextArea, Select } from "../../../UI/UI.js"; // Select qo'shildi
import { vibrate } from "../../../utils/index.util";

const roleStore = RoleStore();
const permStore = PermissionStore();

const { isModal, model, modalAction } = storeToRefs(roleStore);
const { permissions } = storeToRefs(permStore); // Mavjud barcha ruxsatnomalar

const touched = ref(false);
const formRefs = ref({});

// --- PERMISSIONLARNI SELECT UCHUN FORMATLASH ---
const permissionOptions = computed(() => {
  return permissions.value.map(p => ({
    name: p.name,       // Label sifatida
    value: p._id,      // ID sifatida
    subTitle: p.value  // Kichik yozuv (masalan: user:create)
  }));
});

const validateAll = () => {
  let isValid = true;
  Object.values(formRefs.value).forEach((el) => {
    if (el?.validate && !el.validate()) isValid = false;
  });
  return isValid;
};

const onSave = async () => {
  vibrate("medium");
  touched.value = true;
  
  if (!validateAll()) return;

  try {
    const success = await roleStore.Save();
    if (success) {
      isModal.value = false;
      touched.value = false;
    }
  } catch (err) {
    console.error("Saqlashda xatolik:", err);
  }
};

// Modal ochilganda ruxsatnomalar yuklanmagan bo'lsa yuklab olish
onMounted(async () => {
  if (permissions.value.length === 0) {
    await permStore.GetAll();
  }
});
</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction.action === 'edit' ? 'Rolni tahrirlash' : 'Yangi rol yaratish'"
    :icon="modalAction.action === 'edit' ? 'fa-solid fa-user-shield' : 'fa-solid fa-plus-circle'"
    width="550px"
  >
    <div class="grid grid-cols-12 gap-y-5 py-6 px-3">
      
      <div class="col-span-12">
        <Input 
          :ref="el => formRefs.name = el"
          required
          v-model="model.name"
          :rules="[v => !!v || 'Rol nomini kiriting']"
          label="Rol nomi"
          placeholder="Masalan: Buxgalter" 
          icon-pre="fas fa-id-card"
        />
      </div>

      <div class="col-span-12">
        <Input 
          :ref="el => formRefs.value = el"
          required
          v-model="model.value"
          :rules="[v => !!v || 'Tizim kalitini kiriting']"
          label="Tizim kaliti (Unique Value)"
          placeholder="Masalan: accountant"
          :disabled="modalAction.action === 'edit'"
          icon-pre="fas fa-code"
          :help="modalAction.action === 'edit' ? 'Rol kalitini o\'zgartirish xavfsizlikka ta\'sir qilishi mumkin' : ''"
        />
      </div>

      <div class="col-span-12">
        <Select 
          :ref="el => formRefs.permissions = el"
          v-model="model.permissions"
          :options="permissionOptions"
          label="Biriktirilgan huquqlar"
          valueKey="value"
          labelKey="name"
          placeholder="Huquqlarni tanlang..."
          
          multiple
          searchable
          chips
          icon-pre="fas fa-key"
          :rules="[v => v.length > 0 || 'Kamida bitta huquq tanlanishi shart']"
        />
        <p class="text-[10px] text-slate-400 mt-1 ml-1">
          <i class="fas fa-info-circle mr-1"></i> 
          Ushbu rolga ega foydalanuvchilar tanlangan huquqlardan foydalana oladilar.
        </p>
      </div>

      <div class="col-span-12">
        <TextArea
          v-model="model.description"
          label="Rol tavsifi"
          placeholder="Ushbu rol kimlar uchun va nimalarga ruxsat beradi..." 
          rows="3"
          icon-pre="fas fa-align-left"
        />
      </div>

    </div>

    <template #footer>
      <div class="flex justify-end gap-3 px-4 w-full pb-2">
        <Button variant="secondary" @click="isModal = false" size="sm" class="!px-6">
          Bekor qilish
        </Button>
        <Button variant="primary" @click="onSave" size="sm" class="!px-8" left-icon="fas fa-save">
          {{ modalAction.action === 'edit' ? 'Yangilash' : 'Saqlash' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
/* Modal ichidagi elementlar uchun Apple-style nafislik */
:deep(.ui-input-label) {
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
</style>