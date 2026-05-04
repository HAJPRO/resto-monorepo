<template>
  <ion-page class="bg-[#F8FAFC] dark:bg-[#020617] select-none">
    <!-- 1. HEADER -->
    <Header 
      title="Sut qabul qilish" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="Hududni qidirish..."
    >
      <template #actions>
        <Button @click="resetForm" icon="fas fa-plus-circle" size="sm" />
      </template>
    </Header>

    <!-- 2. NAVIGATION -->
    <SegmentTabs 
      v-model="currentStepId" 
      :tabs="steps" 
      @change="handleStepChange"
    />

    <ion-content :fullscreen="true" class="ion-padding">
      <GlobalRefresher @refresh="refreshData" />

      <div class="max-w-6xl mx-auto mt-4 p-3 mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT SIDE: DINAMIK BOSQICHLAR -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- STEP 1: BRUTTO -->
            <div v-if="currentStepId === 'brutto'" class="animate-content space-y-6">
              <div class="p-1 mb-6 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl inline-flex items-center gap-2 px-4 py-2">
                <i class="fas fa-weight-hanging text-indigo-500 text-xs"></i>
                <span class="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Tarozi nazorati (Kirish)</span>
              </div>
              
              <Select label="Yetkazib beruvchi" v-model="form.providerId" :options="providers" labelKey="name" valueKey="id" />
              <Input label="Transport raqami" v-model="form.carNumber" placeholder="80 A 345 AD" icon="fas fa-truck" />
              
              <div class="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 relative overflow-hidden group shadow-sm">
                <div class="absolute top-0 right-0 p-4 opacity-10">
                  <i class="fas fa-scale-balanced text-7xl text-indigo-600"></i>
                </div>
                <Input 
                  label="Brutto Vazni" 
                  type="number" 
                  v-model="form.brutto" 
                  suffix="KG" 
                />
              </div>
              <Button variant="primary" class="w-full h-14" rightIcon="fas fa-arrow-right" @click="goToStep('lab')" :disabled="!form.brutto || !form.providerId"> Laboratoriyaga yuborish</Button>
            </div>

            <!-- STEP 2: LABORATORY (Tugirlangan qism) -->
            <div v-if="currentStepId === 'lab'" class="animate-content space-y-6">
              <div class="p-1 mb-6 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl inline-flex items-center gap-2 px-4 py-2">
                <i class="fas fa-flask text-amber-500 text-xs"></i>
                <span class="text-[10px] font-black uppercase text-amber-600 tracking-wider">Laboratoriya tahlili</span>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <Input label="Yog'lilik (%)" type="number" v-model="form.fat" placeholder="3.5" />
                <Input label="Zichlik" type="number" v-model="form.density" placeholder="1028" />
                <Input label="Kislotalik (°T)" type="number" v-model="form.acidity" placeholder="17" />
                <Input label="Harorat (°C)" type="number" v-model="form.temp" placeholder="4" />
              </div>

              <div class="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Antibiotik testi</p>
                <div class="flex gap-4">
                  <button 
                    @click="form.antibiotic = false"
                    :class="form.antibiotic === false ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-slate-100 text-slate-500'"
                    class="flex-1 py-4 rounded-2xl font-black transition-all"
                  > TOZA </button>
                  <button 
                    @click="form.antibiotic = true"
                    :class="form.antibiotic === true ? 'bg-rose-500 text-white ring-4 ring-rose-100' : 'bg-slate-100 text-slate-500'"
                    class="flex-1 py-4 rounded-2xl font-black transition-all"
                  > ANIQLANDI </button>
                </div>
              </div>

              <Button variant="primary" class="w-full h-14" rightIcon="fas fa-check-shield" @click="handleLabComplete" :disabled="form.antibiotic === null"> Tahlilni yakunlash</Button>
            </div>

            <!-- STEP 3: RUXSAT -->
            <div v-if="currentStepId === 'ruxsat'" class="animate-content py-10 text-center">
              <div class="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 animate-pulse">
                <i class="fas fa-check text-4xl text-emerald-500"></i>
              </div>
              <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-2">Qabulga Ruxsat</h2>
              <p class="text-slate-500 max-w-sm mx-auto mb-10 text-sm">Sut tahlillari me'yorda. To'kish jarayonini boshlashga ruxsat berasizmi?</p>
              
              <div class="flex gap-4 max-w-md mx-auto">
                <Button variant="primary" class="flex-1" leftIcon="fas fa-check" @click="goToStep('tokish')">Ruxsat berish</Button>
                <Button variant="danger" class="flex-1" leftIcon="fas fa-xmark" @click="goToStep('lab')">Qayta tekshirish</Button>
              </div>
            </div>

            <!-- STEP 4: TO'KISH -->
            <div v-if="currentStepId === 'tokish'" class="animate-content space-y-6">
              <div class="flex items-center mb-4">
                 <i class="fas fa-faucet text-indigo-500 text-xs mr-2"></i>
                 <span class="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Rezervuarni tanlang</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="silus in siluses" :key="silus.id" 
                  @click="form.silusId = silus.id"
                  :class="form.silusId === silus.id ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200' : 'border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800'"
                  class="p-6 rounded-[32px] border-2 cursor-pointer transition-all relative overflow-hidden"
                >
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-lg font-black text-slate-800 dark:text-white">{{ silus.name }}</span>
                    <i class="fas fa-database text-slate-200 text-2xl"></i>
                  </div>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hajm: {{ silus.capacity }}L</p>
                  <div class="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500" :style="{ width: silus.fill + '%' }"></div>
                  </div>
                </div>
              </div>
              <Button class="w-full h-16 rounded-[32px]" variant="primary" @click="goToStep('tara')" :disabled="!form.silusId">To'kishni yakunlash</Button>
            </div>

            <!-- STEP 5: TARA -->
            <div v-if="currentStepId === 'tara'" class="animate-content space-y-6">
              <div class="p-1 mb-6 bg-rose-50/50 dark:bg-rose-500/5 rounded-2xl inline-flex items-center gap-2 px-4 py-2">
                <i class="fas fa-scale-unbalanced text-rose-500 text-xs"></i>
                <span class="text-[10px] font-black uppercase text-rose-600 tracking-wider">Tarozi nazorati (Chiqish)</span>
              </div>
              
              <Input 
                label="Tara (Bo'sh vazn)" 
                type="number" 
                v-model="form.tara" 
                suffix="KG" 
              />

              <div class="bg-indigo-600 p-8 rounded-[40px] text-white flex justify-between items-center shadow-xl shadow-indigo-100 dark:shadow-none">
                <div>
                  <p class="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Sof sut vazni (Netto)</p>
                  <p class="text-4xl font-black">{{ (form.brutto || 0) - (form.tara || 0) }} KG</p>
                </div>
                <i class="fas fa-calculator text-5xl opacity-20"></i>
              </div>

              <Button leftIcon="fas fa-file-invoice" class="w-full h-16" variant="primary" @click="goToStep('yakun')" :disabled="!form.tara">Hujjatni shakllantirish</Button>
            </div>

            <!-- STEP 6: YAKUN -->
            <div v-if="currentStepId === 'yakun'" class="animate-content text-center py-10">
              <div class="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
                <i class="fas fa-check-double text-4xl text-white"></i>
              </div>
              <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-2">Qabul Muvaffaqiyatli!</h2>
              <p class="text-slate-500 mb-10 text-sm">Barcha ma'lumotlar bazaga saqlandi.</p>
              
              <div class="flex flex-col  gap-4 max-w-md mx-auto">
                <Button  leftIcon="fas fa-print" variant="warning" @click="printReceipt">Kvitansiya</Button>
                <Button  leftIcon="fas fa-redo" variant="primary" @click="resetForm">Yangi qabul</Button>
              </div>
            </div>

          </div>

          <!-- ANALYTICS TRIGGER (Qushilgan qism) -->
          <div class="fixed bottom-8 right-8 z-[10001]">
            <button 
              @click="isModalOpen = !isModalOpen"
              class="w-16 h-16 bg-indigo-600 text-white rounded-[24px] shadow-2xl flex items-center justify-center transition-transform active:scale-90"
            >
              <i :class="isModalOpen ? 'fa-xmark' : 'fa-chart-pie'" class="fas text-xl"></i>
            </button>
          </div>

        <Modal 
        v-model="isModalOpen"
        title="SUT QABUL QILISH"
        subtitle="Laboratoriya tahlili #45"
        icon="fa-solid fa-flask-vial"
        width="600px"
      >
        <!-- ASOSIY KONTENT (Default Slot) -->
        <!-- 1. SELECTION & SUPPLIER SECTION -->
<!-- SELECTION RESULTS (Minimalist Read-only) -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
  
  <!-- Yetkazib beruvchi Natijasi -->
  <div class="relative group p-4 rounded-[24px] bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-indigo-500">
        <i class="fa-solid fa-user-tie text-lg"></i>
      </div>
      <div class="flex flex-col min-w-0">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Yetkazib beruvchi</span>
        <h4 class="text-sm font-black text-slate-800 dark:text-white truncate">
          {{ providers.find(p => p.id === form.providerId)?.name || 'Tanlanmagan' }}
        </h4>
      </div>
    </div>
  </div>

  <!-- Rezervuar Natijasi -->
  <div class="relative group p-4 rounded-[24px] bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-blue-500">
        <i class="fa-solid fa-database text-lg"></i>
      </div>
      <div class="flex flex-col min-w-0">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rezervuar (Silus)</span>
        <h4 class="text-sm font-black text-slate-800 dark:text-white truncate">
          {{ siluses.find(s => s.id === form.silusId)?.name || 'Tanlanmagan' }}
        </h4>
      </div>
    </div>
  </div>

</div>

<!-- 2. WEIGHT & LOGISTICS (Card Style) -->
<div class="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-[32px] p-5 mb-6 border border-indigo-100/50 dark:border-indigo-500/10">
  <div class="flex items-center gap-3 mb-4 ml-2">
    <i class="fa-solid fa-weight-hanging text-indigo-500"></i>
    <span class="text-xs font-black text-indigo-600 uppercase tracking-tighter">Vazn va Transport</span>
  </div>
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="relative">
      <input v-model.number="form.brutto" type="number" placeholder="0.0" class="peer w-full h-14 pt-4 px-4 rounded-2xl bg-white dark:bg-slate-900 border-0 shadow-sm font-black text-lg text-slate-800 dark:text-white" />
      <span class="absolute top-2 left-4 text-[9px] font-bold text-slate-400 uppercase">Brutto (kg)</span>
    </div>
    <div class="relative">
      <input v-model.number="form.tara" type="number" placeholder="0.0" class="peer w-full h-14 pt-4 px-4 rounded-2xl bg-white dark:bg-slate-900 border-0 shadow-sm font-black text-lg text-slate-800 dark:text-white" />
      <span class="absolute top-2 left-4 text-[9px] font-bold text-slate-400 uppercase">Tara (kg)</span>
    </div>
    <div class="relative col-span-2 lg:col-span-1">
      <input v-model="form.carNumber" type="text" placeholder="00 A 000 AA" class="w-full h-14 pt-4 px-4 rounded-2xl bg-white dark:bg-slate-900 border-0 shadow-sm font-black text-md text-slate-800 dark:text-white" />
      <span class="absolute top-2 left-4 text-[9px] font-bold text-slate-400 uppercase">Moshina Raqami</span>
    </div>
  </div>
</div>

<!-- 3. LABORATORY ANALYSIS SECTION -->
<div class="mb-2 ml-2 flex justify-between items-center">
  <div class="flex items-center gap-3">
    <i class="fa-solid fa-microscope text-rose-500"></i>
    <span class="text-xs font-black text-rose-600 uppercase tracking-tighter">Laboratoriya tahlillari</span>
  </div>
  <!-- Sidebar Toggle -->
  <button @click="isSidebarOpen = !isSidebarOpen" class="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full hover:bg-indigo-100 transition-all">
    {{ isSidebarOpen ? 'Xulosani yopish' : 'Xulosani ko‘rish' }}
  </button>
</div>

<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
  <div v-for="field in [
    {id: 'fat', label: 'Yog\'lilik %', color: 'text-amber-500'},
    {id: 'density', label: 'Zichlik', color: 'text-blue-500'},
    {id: 'acidity', label: 'Kislota °T', color: 'text-emerald-500'},
    {id: 'temp', label: 'Harorat °C', color: 'text-orange-500'}
  ]" :key="field.id" class="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
    <p class="text-[10px] font-bold text-slate-500 mb-1 uppercase">{{ field.label }}</p>
    <input v-model.number="form[field.id]" type="number" step="0.1" class="w-full bg-transparent border-0 p-0 font-black text-lg focus:ring-0" :class="field.color" />
  </div>
</div>

<!-- 4. SAFETY TOGGLE (Antibiotic) -->
<div class="mt-6 flex items-center justify-between p-4 rounded-[24px] bg-slate-100/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700">
  <div class="flex items-center gap-4">
    <div :class="form.antibiotic ? 'bg-rose-500' : 'bg-slate-400'" class="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors">
      <i class="fa-solid fa-virus-slash"></i>
    </div>
    <div>
      <p class="text-xs font-black text-slate-700 dark:text-slate-200">Antibiotik Tekshiruvi</p>
      <p class="text-[10px] text-slate-500 font-medium">Sut tarkibida dori vositalari borligi</p>
    </div>
  </div>
  <div class="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm">
    <button 
      @click="form.antibiotic = false" 
      :class="form.antibiotic === false ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400'"
      class="px-4 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase"
    >Toza</button>
    <button 
      @click="form.antibiotic = true" 
      :class="form.antibiotic === true ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'"
      class="px-4 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase"
    >Bor</button>
  </div>
</div>


        <!-- FOOTER QISMI (Named Slot) -->
        <template #footer="{ close }">
          <Button  variant="danger" size="sm" leftIcon="fas fa-xmark" @click="close">Bekor qilish</Button>
          <Button  variant="primary" size="sm" leftIcon="fas fa-check" @click="saveData">Saqlash</Button>
        </template>
      </Modal>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { Header, Input, Button, Select, GlobalRefresher, SegmentTabs, Modal } from '../../../UI/UI';
import { vibrate, notify } from '../../../utils/index.util';

const searchQuery = ref('');
const currentStepId = ref('brutto');
const isSidebarOpen = ref(false);
const isModalOpen = ref(false);

const saveData = () => {
  // Saqlash logikasi
  console.log("Ma'lumotlar saqlandi");
  isModalOpen.value = false;
};
const steps = [
  { id: 'brutto', label: '1. BRUTTO', icon: 'fas fa-weight-hanging' },
  { id: 'lab', label: '2. TAHLIL', icon: 'fas fa-flask' },
  { id: 'ruxsat', label: '3. RUXSAT', icon: 'fas fa-shield-check' },
  { id: 'tokish', label: '4. TO\'KISH', icon: 'fas fa-faucet' },
  { id: 'tara', label: '5. TARA', icon: 'fas fa-scale-unbalanced' },
  { id: 'yakun', label: '6. YAKUN', icon: 'fas fa-check-double' }
];

const form = ref({
  providerId: null,
  carNumber: '',
  brutto: null,
  tara: null,
  fat: 3.5,
  density: 1028,
  acidity: 17,
  temp: 4,
  antibiotic: null,
  silusId: null
});

const providers = [
  { id: 1, name: 'Vobkent Sut Klasteri' },
  { id: 2, name: 'Buxoro Chorva' },
  { id: 3, name: 'Gʻijduvon Agro' }
];

const siluses = [
  { id: 1, name: 'Silus #1', capacity: 5000, fill: 45 },
  { id: 2, name: 'Silus #2', capacity: 5000, fill: 10 },
  { id: 3, name: 'Silus #3', capacity: 10000, fill: 80 }
];

const handleStepChange = (tab) => {
  vibrate('light');
};

const goToStep = (stepId) => {
  vibrate('medium');
  currentStepId.value = stepId;
};

const handleLabComplete = () => {
  if (form.value.antibiotic === true) {
    notify('Diqqat! Antibiotik aniqlangan sutni qabul qilib bo\'lmaydi', 'error');
    vibrate('heavy');
  } else {
    goToStep('ruxsat');
  }
};

const printReceipt = () => {
  notify('Kvitansiya chop etilmoqda...', 'success');
  vibrate('double');
};

const resetForm = () => {
  form.value = {
    providerId: null, carNumber: '', brutto: null, tara: null,
    fat: 3.5, density: 1028, acidity: 17, temp: 4, antibiotic: null, silusId: null
  };
  currentStepId.value = 'brutto';
  isSidebarOpen.value = false;
  notify('Yangi jarayon boshlandi');
};

const refreshData = (done) => {
  setTimeout(() => {
    done();
    notify('Ma\'lumotlar yangilandi');
  }, 1000);
};
</script>

<style scoped>
.animate-content {
  animation: slideUp 0.4s cubic-bezier(0.24, 0.4, 0.28, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

:deep(.ui-input-wrapper) {
  @apply rounded-[24px] border-slate-100;
}

.custom-scroll::-webkit-scrollbar {
  width: 5px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.2);
  border-radius: 100px;
}

.dark .custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>