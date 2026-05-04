<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617]">
    <Header title="Xizmat sozlamalari" />

    <ion-content :fullscreen="true">
      <GlobalRefresher @refresh="handleRefresh" />

      <div v-if="storeLoading && !isSaving" class="flex flex-col items-center justify-center h-full">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">Yuklanmoqda...</p>
      </div>

      <div v-else class="p-6 max-w-lg mx-auto space-y-6">
        
        <div class="bg-white dark:bg-slate-900 rounded-[35px] p-6 border border-slate-100 dark:border-white/5 shadow-xl shadow-indigo-500/5 animate-slide-up">
          
          <div class="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-white/5">
            <div class="flex items-center gap-4">
              <div :class="model.status === 'active' ? 'bg-indigo-600 shadow-indigo-500/40' : 'bg-slate-200 dark:bg-slate-800'" 
                   class="w-14 h-14 rounded-[22px] flex items-center justify-center text-white transition-all duration-500">
                <ion-icon :icon="model.status === 'active' ? powerOutline : alertCircleOutline" class="text-3xl" />
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white leading-tight">Xizmat foizi</h2>
                <p class="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-0.5">
                  Holati: <span :class="model.status === 'active' ? 'text-indigo-500' : 'text-slate-500'">{{ model.status === 'active' ? 'Aktiv' : 'O\'chirilgan' }}</span>
                </p>
              </div>
            </div>
            
            <button 
              @click="toggleService"
              :class="model.status === 'active' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'"
              class="w-16 h-9 rounded-full relative transition-all duration-300 active:scale-90"
            >
              <div :class="model.status === 'active' ? 'translate-x-8' : 'translate-x-1'" 
                   class="absolute top-1 left-0 w-7 h-7 bg-white rounded-full shadow-lg transition-transform duration-300 flex items-center justify-center">
                 <div v-if="model.status === 'active'" class="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
              </div>
            </button>
          </div>

          <div v-if="model.status === 'active'" class="pt-8 space-y-6 animate-slide-up">
            <div class="text-center">
              <label class="text-[12px] text-slate-400 font-black uppercase tracking-[0.2em]">Belgilangan foiz miqdori</label>
              
              <div class="mt-4 relative inline-block w-full">
                <input 
                  v-model="model.percentage" 
                  type="number" 
                  class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] py-8 px-6 text-5xl font-black text-indigo-600 text-center transition-all outline-none"
                  placeholder="0"
                />
                <span class="absolute right-8 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">%</span>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3">
              <button 
                v-for="val in [5, 10, 15, 20]" 
                :key="val"
                @click="setRate(val)"
                :class="model.percentage == val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'"
                class="py-4 rounded-[20px] font-black text-sm transition-all border border-transparent"
              >
                {{ val }}%
              </button>
            </div>

            <div class="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl flex gap-3">
              <ion-icon :icon="informationCircleOutline" class="text-amber-500 text-xl flex-shrink-0" />
              <p class="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed font-medium">
                Diqqat: Ushbu foiz stavkasi yangi buyurtmalarga avtomatik qo'llaniladi.
              </p>
            </div>
          </div>

          <div v-else class="py-12 text-center animate-slide-up">
            <div class="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ion-icon :icon="cloudOfflineOutline" class="text-3xl text-slate-300" />
            </div>
            <h3 class="text-slate-900 dark:text-white font-bold">Xizmat haqi o'chirilgan</h3>
            <p class="text-sm text-slate-400 mt-2 px-6">Tizim bo'yicha xizmat haqi hisoblanmaydi.</p>
          </div>
        </div>

        <div class="pt-4">
          <Button 
            @click="saveChanges"
            :disabled="isSaving"
            class="w-full"
          >
            <ion-spinner v-if="isSaving" name="crescent" class="w-5 h-5" />
            <div v-else class="flex items-center gap-2">
              <ion-icon :icon="checkmarkCircleOutline" class="text-xl" />
              <span>SOZLAMALARNI SAQLASH</span>
            </div>
          </Button>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { IonPage, IonContent, IonIcon, IonSpinner } from "@ionic/vue";
import { 
  powerOutline, alertCircleOutline, checkmarkCircleOutline,
  informationCircleOutline, cloudOfflineOutline
} from "ionicons/icons";
import { Header, GlobalRefresher, Button } from "../../../UI/UI";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { FeeStore } from "../../../stores/index.store";
import { storeToRefs } from "pinia";

const store = FeeStore();
// Store'dan model va loadingni olamiz
const { loading: storeLoading, model } = storeToRefs(store);

const isSaving = ref(false);

const loadInitialData = async () => {
  // GetFee allaqachon store.model ni to'ldiradi
  await store.GetFee();
};

onMounted(() => {
  loadInitialData();
});

const toggleService = async () => {
  // Store modelidagi statusni o'zgartiramiz
  model.value.status = model.value.status === 'active' ? 'inactive' : 'active';
  await Haptics.impact({ style: ImpactStyle.Medium });
};

const setRate = async (val) => {
  // Store modelidagi foizni o'zgartiramiz
  model.value.percentage = val;
  await Haptics.impact({ style: ImpactStyle.Light });
};

const handleRefresh = async (event) => {
  await Haptics.impact({ style: ImpactStyle.Light });
  await loadInitialData();
  event.target.complete();
};

const saveChanges = async () => {
  await Haptics.impact({ style: ImpactStyle.Heavy });
  isSaving.value = true;

  try {
    // Store.model dagi barcha ma'lumotlarni yuboramiz
    await store.Create({
      action: "create",
      ...model.value
    });
  } catch (err) {
    console.error("Saqlashda xatolik:", err);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
ion-content {
  --background: transparent;
}
</style>