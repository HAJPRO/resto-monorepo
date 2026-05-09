<template>
  <div class="space-y-6 animate__animated animate__fadeIn">
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
          Mening Shablonlarim
        </h3>
        <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
          Jami: {{ templates.length }} ta shablon
        </p>
      </div>
      <button @click="$emit('add-new')" 
        class="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
        <ion-icon :icon="addOutline" class="text-xl" />
      </button>
    </div>

    <div v-if="templates.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="item in templates" :key="item._id" 
        :class="[
          'relative p-5 rounded-[2rem] border-2 transition-all duration-300 group',
          item.isActive 
            ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10' 
            : 'bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
        ]">
        
        <div v-if="item.isActive" 
          class="absolute -top-3 left-6 px-4 py-1 bg-indigo-500 text-[9px] font-black text-white rounded-full uppercase tracking-tighter">
          Faol ishlatilmoqda
        </div>

        <div class="flex flex-col h-full justify-between gap-4">
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-sm font-black text-slate-700 dark:text-slate-200 uppercase truncate max-w-[150px]">
                {{ item.companyName }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono italic">
                {{ item.paperWidth }}mm • {{ item.lineStyle }}
              </span>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="editTemplate(item)" class="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-100">
                <ion-icon :icon="createOutline" />
              </button>
              <button @click="confirmDelete(item._id)" class="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-100">
                <ion-icon :icon="trashOutline" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center gap-2 text-[9px] text-slate-500 uppercase font-bold">
              <ion-icon :icon="checkmarkCircleOutline" :class="item.showLogo ? 'text-emerald-500' : 'text-slate-300'" /> Logo
            </div>
            <div class="flex items-center gap-2 text-[9px] text-slate-500 uppercase font-bold">
              <ion-icon :icon="checkmarkCircleOutline" :class="item.showQR ? 'text-emerald-500' : 'text-slate-300'" /> QR Kod
            </div>
            <div class="flex items-center gap-2 text-[9px] text-slate-500 uppercase font-bold">
              <ion-icon :icon="checkmarkCircleOutline" :class="item.showFiscal ? 'text-emerald-500' : 'text-slate-300'" /> Fiskal
            </div>
            <div class="flex items-center gap-2 text-[9px] text-slate-500 uppercase font-bold">
              <ion-icon :icon="checkmarkCircleOutline" :class="item.showService ? 'text-emerald-500' : 'text-slate-300'" /> Servis {{item.servicePercent}}%
            </div>
          </div>

          <button 
            v-if="!item.isActive"
            @click="activateTemplate(item._id)"
            class="w-full py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all">
            Tanlash va ishlatish
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
      <div class="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
        <ion-icon :icon="copyOutline" class="text-3xl text-slate-300" />
      </div>
      <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Hozircha shablonlar yo'q</p>
      <button @click="$emit('add-new')" class="mt-4 text-indigo-500 font-black text-xs uppercase underline decoration-2 underline-offset-4">Yangi yaratish</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { 
  addOutline, createOutline, trashOutline, 
  checkmarkCircleOutline, copyOutline 
} from 'ionicons/icons';
import { IonIcon } from "@ionic/vue";
import { CheckTemplateStore } from "../../stores/index.store";

const emit = defineEmits(['edit', 'add-new']);
const store = CheckTemplateStore();
const { templates, loading } = storeToRefs(store);

onMounted(() => {
  store.GetAllTemplates();
});

const activateTemplate = async (id) => {
  // Bu yerda backendda aktivlashtirish logikasi bo'lishi kerak
  // Hozircha oddiygina tanlanganini config-ga yuklaymiz
  const template = templates.value.find(t => t._id === id);
  if (template) {
    store.config = { ...template };
    // Agar backendda buni default qilish kerak bo'lsa:
    // await store.SetDefaultTemplate(id);
  }
};

const editTemplate = (item) => {
  store.config = { ...item };
  emit('edit');
};

const confirmDelete = (id) => {
  if (confirm("Ushbu shablonni o'chirmoqchimisiz?")) {
    // store.DeleteTemplate(id); // Store-da o'chirish metodini ochishingiz kerak
  }
};
</script>