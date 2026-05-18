<template>
  <div class="max-w-[1400px] mx-auto space-y-6 md:space-y-10 p-2 md:p-6 animate__animated animate__fadeIn pb-32">
    
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
      <div class="space-y-1">
        <h3 class="text-xl md:text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none">
          Shablonlar ro'yxati
        </h3>
        
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Mavjud shablonlar: {{ templates.length }} ta
        </p>
      </div>
      
      <Button 
        @click="$emit('add-new')" 
        leftIcon="fas fa-plus" 
        variant="primary" 
        size="sm" 
      >
        <span>Shablon</span>
      </Button>
    </header>

    <div v-if="templates.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
      <div 
        v-for="item in templates" 
        :key="item._id" 
        :class="[
          'relative flex flex-col group rounded-[2.5rem] border-2 transition-all duration-700 overflow-hidden',
          item.isActive 
            ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-[0_30px_60px_-15px_rgba(99,102,241,0.15)] ring-4 ring-indigo-500/5' 
            : 'bg-white/40 dark:bg-slate-900/40 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-xl'
        ]"
      >
        <!-- <div v-if="item.isActive" 
          class="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-indigo-500 text-[8px] font-black text-white rounded-full uppercase tracking-widest z-10 animate__animated animate__pulse animate__infinite">
          <i class="fas fa-check-circle"></i> Asosiy
        </div> -->

        <div class="p-6 md:p-8 space-y-6 flex-1">
          <div class="flex items-start justify-between">
            <div class="space-y-3">
              <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-colors duration-500', 
                item.isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400']">
                <ion-icon :icon="documentTextOutline" />
              </div>
              <div>
                <h4 class="text-lg font-[900] text-slate-800 dark:text-slate-100 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                  {{ item.companyName }}
                </h4>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {{ item.paperWidth }}mm
                  </span>
                  <span class="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {{ item.lineStyle }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col gap-2">
              <Button @click="editTemplate(item)" icon="fas fa-pen" variant="secondary" size="sm" class="!rounded-xl !w-10 !h-10 !p-0" />
              <Button @click="confirmDelete(item._id)" icon="fas fa-trash-alt" variant="danger" size="sm" class="!rounded-xl !w-10 !h-10 !p-0" />
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between px-1">
              <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Biriktirilgan Printerlar</label>
              <span class="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                {{ getLinkedPrinters(item._id).length }} ta
              </span>
            </div>
            
            <div class="flex flex-wrap gap-2 p-4 bg-slate-50/50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 min-h-[80px] content-start">
              <transition-group name="list">
                <div v-for="p in getLinkedPrinters(item._id)" :key="p.id" 
                  class="flex items-center gap-2.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:border-indigo-300 transition-all group/chip">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div class="flex flex-col">
                    <span class="text-[9px] font-[900] uppercase text-slate-700 dark:text-slate-200 leading-none mb-0.5">{{ p.name }}</span>
                    <span class="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">{{ p.role }}</span>
                  </div>
                  <button @click="unlinkPrinter(p.id)" class="text-slate-300 hover:text-rose-500 transition-colors ml-1">
                    <ion-icon :icon="closeCircleOutline" class="text-base" />
                  </button>
                </div>
              </transition-group>
              
              <div v-if="getLinkedPrinters(item._id).length === 0" class="w-full h-full flex flex-col items-center justify-center opacity-40 py-2">
                <ion-icon :icon="printOutline" class="text-xl mb-1" />
                <p class="text-[8px] font-black uppercase tracking-widest text-center">Bo'sh</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5">
          <div class="flex flex-col sm:flex-row items-center gap-3">
            <div class="w-full flex-1">
              <Select
                :options="printerOptions"
                placeholder="Printer qo'shish"
                @update:modelValue="(val) => linkPrinter(val, item._id)"
                class="!h-12 !rounded-2xl shadow-inner"
                label="Printerlarni tanlang"
              />
            </div>

            <Button 
              v-if="!item.isActive"
              @click="activateTemplate(item)"
              variant="secondary"
              class="mt-[-25px]"
              size="sm"
            >
              Default qilish
            </Button>
            <!-- <div v-else class="h-9 px-6 w-full sm:w-auto bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              <i class="fas fa-check-double"></i> Asosiy Tanlangan
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-32 px-6 bg-white/50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 backdrop-blur-xl">
      <div class="relative mb-8">
        <div class="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full"></div>
        <div class="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl flex items-center justify-center text-6xl text-indigo-500">
          <ion-icon :icon="copyOutline" />
        </div>
      </div>
      <h4 class="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-3 text-center">Dizayn kutubxonasi bo'sh</h4>
      <p class="max-w-xs text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose mb-10">
        Chek shablonlarini yarating va ularni kassa yoki oshxona printerlariga biriktiring
      </p>
      <Button @click="$emit('add-new')" variant="primary" size="sm">
        Shablon yaratish
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
       <div v-for="n in 3" :key="n" class="h-[450px] bg-white/50 dark:bg-white/5 rounded-[3rem] animate-pulse"></div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { 
  documentTextOutline, checkmarkCircleOutline, 
  copyOutline, closeCircleOutline, printOutline 
} from 'ionicons/icons';
import { IonIcon } from "@ionic/vue";
import { CheckTemplateStore, PrinterStore } from "../../stores/index.store";
import { Button, Select } from "../../UI/UI";

const emit = defineEmits(['edit', 'add-new']);

// Stores
const templateStore = CheckTemplateStore();
const printerStore = PrinterStore();
const { templates, loading } = storeToRefs(templateStore);
const { printers } = storeToRefs(printerStore);

const MAPPING_KEY = 'printer_template_mapping';
const printerMapping = ref({});

// Select Options with better formatting
const printerOptions = computed(() => {
  return printers.value.map(p => ({
    label: `${p.name} • ${p.role.toUpperCase()}`,
    value: p.id
  }));
});

onMounted(async () => {
  await templateStore.GetAllTemplates();
  loadMapping();
});

const loadMapping = () => {
  const saved = localStorage.getItem(MAPPING_KEY);
  printerMapping.value = saved ? JSON.parse(saved) : {};
};

const getLinkedPrinters = (templateId) => {
  return printers.value.filter(p => printerMapping.value[p.id] === templateId);
};

const linkPrinter = (printerId, templateId) => {
  if (!printerId) return;
  printerMapping.value[printerId] = templateId;
  localStorage.setItem(MAPPING_KEY, JSON.stringify(printerMapping.value));
};

const unlinkPrinter = (printerId) => {
  delete printerMapping.value[printerId];
  localStorage.setItem(MAPPING_KEY, JSON.stringify(printerMapping.value));
};

const activateTemplate = async (template) => {
  // Store action to set active template
  await templateStore.SetActive(template._id);
};

const editTemplate = (item) => {
  templateStore.config = { ...item };
  emit('edit');
};

const confirmDelete = (id) => {
  // Custom dialog or native confirm
  if (window.confirm("Ushbu shablon o'chirilsa, unga bog'langan printerlar standart shablonga qaytadi. O'chirilsinmi?")) {
    Object.keys(printerMapping.value).forEach(key => {
      if (printerMapping.value[key] === id) delete printerMapping.value[key];
    });
    localStorage.setItem(MAPPING_KEY, JSON.stringify(printerMapping.value));
    templateStore.DeleteTemplate(id);
  }
};
</script>

<style scoped>
/* List animation for printer chips */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Glassmorphism for light/dark */
.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

.dark .shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.4);
}
</style>