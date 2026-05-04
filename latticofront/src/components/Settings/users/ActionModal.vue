<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { UserStore, RoleStore } from "../../../stores/index.store.js"; 
import { Button, Modal, Input, Select, Toggle,Upload,TextArea } from "../../../UI/UI.js";
import { vibrate } from "../../../utils/index.util";

const userStore = UserStore();
const roleStore = RoleStore();

const { isModal, model, modalAction, loading } = storeToRefs(userStore);
const { roles } = storeToRefs(roleStore);

const touched = ref(false);
const formRefs = ref({});

// --- ROLLARNI SELECT UCHUN FORMATLASH ---
const roleOptions = computed(() => {
  return roles.value.map(r => ({
    name: r.name,
    value: r._id,
    subTitle: r.value
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

  const success = await userStore.Save(model.value);
  
};

onMounted(async () => {
  if (roles.value.length === 0) {
    await roleStore.GetAll();
  }
});
</script>

<template>
  <Modal
    v-model="isModal"
    :title="modalAction.action === 'edit' ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'"
    :icon="modalAction.action === 'edit' ? 'fas fa-user-edit' : 'fas fa-user-plus'"
    width="800px"
  >
    <div class="grid grid-cols-12 gap-x-5 gap-y-6 py-6 px-6 overflow-y-auto max-h-[75vh] no-scrollbar">
    
      <div class="col-span-12 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
        <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
          <i class="fas fa-id-card"></i>
        </div>
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Asosiy Ma'lumotlar</h3>
      </div>
    <div class="col-span-12 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
        <Upload 
          v-model="model.image"
          type="image"
          :multiple="false"
          label="Profil uchun rasm"
          accept="image/*"
          rounded="rounded-[2rem]"
          class="w-full h-[180px] shadow-sm" 
        />
      </div>
      <div class="col-span-12 md:col-span-6">
        <Input 
          :ref="el => formRefs.fullname = el"
          required
          v-model="model.fullname"
          :rules="[v => !!v || 'F.I.SH kiritilishi shart']"
          label="To'liq ismi (F.I.SH)"
          placeholder="Masalan: Shomurodov Umid" 
          icon-pre="fas fa-user"
          clearable
        />
      </div>

      <div class="col-span-12 md:col-span-6">
        <Input 
          :ref="el => formRefs.phoneNumber = el"
          required
          v-model="model.phoneNumber"
          :rules="[v => !!v || 'Telefon raqami shart', v => /^\+998[0-9]{9}$/.test(v) || 'Format: +998901234567']"
          label="Telefon raqami"
          placeholder="+998901234567"
          icon-pre="fas fa-phone"
          clearable
        />
      </div>

      <div class="col-span-12 md:col-span-4">
        <Input 
          :ref="el => formRefs.username = el"
          required
          v-model="model.username"
          :rules="[v => !!v || 'Username shart']"
          label="Tizim uchun Username"
          placeholder="umid_dev"
          icon-pre="fas fa-at"
          :disabled="modalAction.action === 'edit'"
          clearable
        />
      </div>

      <div class="col-span-12 md:col-span-4">
        <Input 
          v-model="model.position"
          label="Lavozimi"
          placeholder="Masalan: Master, Haydovchi..."
          icon-pre="fas fa-briefcase"
          clearable
        />
      </div>

      <div class="col-span-12 md:col-span-4">
        <Input 
          v-if="modalAction.action === 'create'"
          :ref="el => formRefs.password = el"
          required
          v-model="model.password"
          type="password"
          :rules="[v => !!v || 'Parol shart', v => v.length >= 6 || 'Kamida 6 ta belgi']"
          label="Parol"
          placeholder="********"
          icon-pre="fas fa-lock"
          clearable
        />
        <div v-else class="h-full flex items-end pb-2">
           <span class="text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-100 dark:border-orange-500/20 w-full text-center">
             Parolni faqat Reset orqali o'zgartirish mumkin
           </span>
        </div>
      </div>

      <div class="col-span-12 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3 mt-4">
        <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
          <i class="fas fa-map-location-dot"></i>
        </div>
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Yashash Manzili</h3>
      </div>

      <div class="col-span-6 md:col-span-4">
        <Input v-model="model.address.district" label="Tuman / Shahar" placeholder="Gijduvon" icon-pre="fas fa-city" clearable />
      </div>
      <div class="col-span-6 md:col-span-4">
        <Input v-model="model.address.street" label="Mahalla / Ko'cha" placeholder="Degrezon" icon-pre="fas fa-road" clearable />
      </div>
      <div class="col-span-12 md:col-span-4">
        <Input v-model="model.address.house" label="Uy raqami" placeholder="12-uy" icon-pre="fas fa-house" clearable />
      </div>

      <div class="col-span-12 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3 mt-4">
        <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
          <i class="fas fa-user-shield"></i>
        </div>
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Tizim Huquqlari</h3>
      </div>

      <div class="col-span-12 md:col-span-8">
        <Select 
          :ref="el => formRefs.roles = el"
          v-model="model.roles"
          :options="roleOptions"
          label="Biriktirilgan Rollar"
          labelKey="name"
          valueKey="value"
          multiple
          chips
          searchable
          icon-pre="fas fa-tags"
          :rules="[v => v?.length > 0 || 'Kamida bitta rol tanlang']"
          clearable
        />
      </div>

      <div class="col-span-12 md:col-span-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] font-black text-slate-400 uppercase">Aktivlik</span>
          <Toggle v-model="model.isActive" color="success" />
        </div>
        <div class="w-px h-10 bg-slate-200 dark:bg-white/10"></div>
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] font-black text-slate-400 uppercase">Kirish</span>
          <Toggle v-model="model.isActivated" color="primary" />
        </div>
      </div>

      <div v-if="model.department === 'Logistika' || model.position?.toLowerCase().includes('haydovchi')" class="col-span-12 grid grid-cols-12 gap-5 contents">
          <div class="col-span-12 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3 mt-4">
            <div class="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
              <i class="fas fa-truck"></i>
            </div>
            <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Transport Ma'lumotlari</h3>
          </div>
          <div class="col-span-4">
            <Input v-model="model.carNumber" label="Mashina Raqami" placeholder="80 A 123 AA" icon-pre="fas fa-barcode" />
          </div>
          <div class="col-span-4">
            <Input v-model="model.carType" label="Modeli" placeholder="Damas" icon-pre="fas fa-truck-pickup" />
          </div>
          <div class="col-span-4">
            <Input v-model="model.vehicleCapacity" type="number" label="Sig'imi (Litr/Kg)" placeholder="800" icon-pre="fas fa-weight-hanging" />
          </div>
      </div>
<div class="col-span-12 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
        <TextArea 
          :ref="el => formRefs[6] = el"
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
      <div class="flex justify-end gap-3 px-6 w-full pb-4 pt-2">
        <Button variant="secondary" @click="isModal = false" :disabled="loading" class="!px-6">
          Bekor qilish
        </Button>
        <Button 
          variant="primary" 
          @click="onSave" 
          :loading="loading" 
          left-icon="fas fa-check-circle"
          class="shadow-lg shadow-indigo-500/25 !px-8"
        >
          {{ modalAction.action === 'edit' ? 'Yangilash' : 'Saqlash' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
/* Scrolni yashirish */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

:deep(.ui-input-label) {
  @apply !font-black !text-[10px] !text-slate-400 !uppercase !tracking-wider !mb-1.5;
}

:deep(.ui-modal-container) {
  @apply !rounded-[40px] !overflow-hidden;
}
</style>