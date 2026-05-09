<template>
  <ion-page>
    <div class="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col">
      <Header title="Chek sozlamalari" v-model="searchQuery" class="no-print" />

      <div class="sticky top-0 z-30 bg-slate-50/80 dark:bg-[#020617]/80 backdrop-blur-md pb-2 pt-1 no-print">
        <SegmentTabs :tabs="Tabs" v-model="activeTab" />
      </div>

      <ion-content :fullscreen="true">
        <div class="p-4 pb-44 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div v-if="activeTab === 'templates'" class="lg:col-span-8">
  <TemplateList @edit="activeTab = 'sozlamalar'" @add-new="clearAndNew" />
</div>
          <div v-if="activeTab === 'sozlamalar'" class="lg:col-span-8 space-y-6 animate__animated animate__fadeIn">
            
            <section class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-white/5 shadow-sm">
              <h3 class="text-xs font-black uppercase text-blue-500 mb-6 flex items-center gap-2">
                <ion-icon :icon="printOutline" class="text-lg" /> Printer Parametrlari
              </h3>
              <div class="space-y-4">
                <div class="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex flex-col text-left">
                      <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Qog'oz kengligi (mm)</span>
                      <span class="text-[9px] text-slate-400">Standart o'lchamlar yoki qo'lda kiriting</span>
                    </div>
                    <div class="w-full sm:w-32">
                      <Input size="sm" v-model.number="config.paperWidth" type="number" placeholder="58" suffix="mm" />
                    </div>
                  </div>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <Select v-model="config.lineStyle" :options="lineStyleOptions" label="Ajratuvchi chiziq turi" labelKey="name" valueKey="value" />
                </div>
              </div>
            </section>

            <section class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-white/5 shadow-sm">
              <h3 class="text-xs font-black uppercase text-indigo-500 mb-4 flex items-center gap-2">
                <ion-icon :icon="businessOutline" /> Brending va Aloqa
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center justify-between p-4 col-span-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all">
                  <div class="flex flex-col">
                    <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Logo ko'rsatish</span>
                    <span class="text-[9px] text-slate-400">Chekning yuqori qismida logotip</span>
                  </div>
                  <ion-toggle v-model="config.showLogo" color="success" mode="ios"></ion-toggle>
                </div>
                <Upload v-if="config.showLogo" v-model="config.logoImage" class="col-span-2 h-[180px]" />
                <Input v-model="config.companyName" label="Restoran nomi" class="col-span-2" />
                <Input v-model="config.address" label="Manzil" class="col-span-2" />
                <Input v-model="config.phone" label="Telefon" class="col-span-2" />
                <Input v-model="config.socials" label="Ijtimoiy tarmoqlar" class="col-span-2" />
              </div>
            </section>

            <section class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-white/5 shadow-sm">
              <h3 class="text-xs font-black uppercase text-emerald-500 mb-4 flex items-center gap-2">
                <ion-icon :icon="calculatorOutline" /> Moliya va Hisob-kitob
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all">
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Xizmat haqi (%)</span>
                    <span class="text-[9px] text-slate-400">Ko'rsatish holati</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <input type="number" v-model.number="config.servicePercent" class="w-10 bg-transparent text-right border-b border-black/10 focus:outline-none text-[10px]" />
                    <ion-toggle v-model="config.showService" color="success" mode="ios"></ion-toggle>
                  </div>
                </div>
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all">
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Chegirma (Summa)</span>
                    <span class="text-[9px] text-slate-400">Ko'rsatish holati</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <input type="number" v-model.number="config.discountValue" class="w-16 bg-transparent text-right border-b border-black/10 focus:outline-none text-[10px]" />
                    <ion-toggle v-model="config.showDiscount" color="success" mode="ios"></ion-toggle>
                  </div>
                </div>
              </div>
            </section>

            <section class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-white/5 shadow-sm">
              <h3 class="text-xs font-black uppercase text-orange-500 mb-6 flex items-center gap-2">
                <ion-icon :icon="peopleOutline" class="text-lg" /> Shaxslar va Mas'ullar
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="p in persons" :key="p.key" class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-orange-500/20 transition-all">
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{{ p.label }}</span>
                    <span class="text-[9px] text-slate-400">{{ p.sub }}</span>
                  </div>
                  <ion-toggle v-model="config[p.key]" color="success" mode="ios"></ion-toggle>
                </div>
              </div>
            </section>

            <section class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-white/5 shadow-sm">
              <h3 class="text-xs font-black uppercase text-rose-500 mb-6 flex items-center gap-2">
                <ion-icon :icon="qrCodeOutline" class="text-lg" /> Fiskal va Yakuniy qism
              </h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-rose-500/20 transition-all">
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Fiskal ma'lumotlar</span>
                  </div>
                  <ion-toggle v-model="config.showFiscal" color="success" mode="ios"></ion-toggle>
                </div>
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-rose-500/20 transition-all">
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">QR Kod</span>
                  </div>
                  <ion-toggle v-model="config.showQR" color="success" mode="ios"></ion-toggle>
                </div>
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-rose-500/20 transition-all">
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Rahmatnoma matni</span>
                  </div>
                  <ion-toggle v-model="config.showFooterText" color="success" mode="ios"></ion-toggle>
                </div>
                <Input v-if="config.showFooterText" v-model="config.footerText" placeholder="Xaridingiz uchun rahmat!" class="animate__animated animate__fadeIn" />
              </div>
            </section>
<div class="flex justify-end gap-2">
            <Button @click="checkTemplateStore.SaveTemplate()" :disabled="loading" >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <ion-icon v-else :icon="cloudUploadOutline" />
              {{ loading ? 'Saqlanmoqda...' : 'Shablonni saqlash' }}
            </Button>
             <Button @click="checkTemplateStore.ClearTemplate()"  variant="danger" leftIcon="fas fa-xmark" >
Tozalash
            </Button>
            </div>
          </div>

          <div :class="['lg:col-span-4 flex justify-center items-start sticky top-24', activeTab === 'preview' ? 'flex animate__animated animate__zoomIn' : 'hidden lg:flex']">
            <div id="printable-receipt" :style="{ width: config.paperWidth + 'mm' }" 
                 class="bg-white p-5 text-black font-mono text-[10px] shadow-2xl receipt-print min-h-[500px] border-t-8 border-indigo-500">
              
              <div class="text-center space-y-1 mb-4">
                <img v-if="config.showLogo && config.logoImage" :src="config.logoImage" class="w-14 h-14 mx-auto mb-2 object-contain grayscale" />
                <h2 class="font-black text-[12px] uppercase leading-none mb-1">{{ config.companyName }}</h2>
                <p class="text-[7px] leading-tight">{{ config.address }}</p>
                <p class="text-[7px]">{{ config.phone }}</p>
                <p class="text-[7px] italic">{{ config.socials }}</p>
              </div>

              <div :class="lineClass" class="my-2 border-black"></div>

              <div class="space-y-0.5 text-[8px] uppercase mb-2">
                <div v-if="config.showWaiter" class="flex justify-between"><span>Ofitsiant:</span> <span class="font-bold">Bekzod M.</span></div>
                <div v-if="config.showCashier" class="flex justify-between"><span>Kassir:</span> <span class="font-bold">Admin</span></div>
                <div v-if="config.showCustomer" class="flex justify-between border-t border-black/10 mt-1 pt-1"><span>Mijoz:</span> <span class="font-bold">Aziz Rahimov</span></div>
                <div v-if="config.showBalance" class="flex justify-between"><span>Mijoz Balansi:</span> <span class="font-bold">{{ formatPrice(450000) }}</span></div>
              </div>

              <div :class="lineClass" class="my-2 border-black"></div>

              <table class="w-full text-[8px] mb-2">
                <thead><tr class="border-b border-black text-left"><th class="pb-1">NOM</th><th class="text-center">SON</th><th class="text-right">SUMMA</th></tr></thead>
                <tbody>
                  <tr v-for="i in [1,2]" :key="i">
                    <td class="py-1 leading-tight">Palov (Choyxona) <br><span class="text-[6px] opacity-50">1 x 45,000</span></td>
                    <td class="text-center">1</td>
                    <td class="text-right font-bold">45,000</td>
                  </tr>
                </tbody>
              </table>

              <div :class="lineClass" class="my-2 border-black"></div>

              <div class="space-y-1 text-right font-bold text-[9px]">
                <div class="flex justify-between font-normal"><span>SUBTOTAL:</span> <span>90,000</span></div>
                <div v-if="config.showService" class="flex justify-between font-normal">
                  <span>SERVICE ({{config.servicePercent}}%):</span> <span>{{formatPrice((90000 * config.servicePercent) / 100)}}</span>
                </div>
                <div v-if="config.showDiscount" class="flex justify-between text-black/60 italic font-normal">
                  <span>DISCOUNT:</span> <span>-{{formatPrice(config.discountValue)}}</span>
                </div>
                <div class="flex justify-between text-[13px] font-black border-t-2 border-black pt-1 mt-1">
                  <span>JAMI:</span> <span>{{ formatPrice(90000 + ((90000 * config.servicePercent) / 100) - config.discountValue) }}</span>
                </div>
              </div>

              <div v-if="config.showFiscal" class="mt-5 text-[7px] space-y-0.5 opacity-80 uppercase border-t border-black/10 pt-2">
                <div class="flex justify-between"><span>Fiskal ID:</span> <span>88723423</span></div>
                <div class="flex justify-between"><span>Sana:</span> <span>09.05.2026 23:22</span></div>
              </div>

              <div class="mt-6 text-center">
                <img v-if="config.showQR" :src="`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=PREVIEW_ONLY`" class="w-16 h-16 mx-auto grayscale mb-3" />
                <p v-if="config.showFooterText" class="text-[9px] font-black uppercase tracking-widest">{{ config.footerText }}</p>
              </div>
            </div>
          </div>

        </div>
      </ion-content>

      <footer v-if="activeTab === 'preview' || isLargeScreen" class="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-50 dark:from-[#020617] no-print">
        <div class="max-w-6xl mx-auto flex gap-4">
           <Button @click="activeTab = 'sozlamalar'" leftIcon="fas fa-edit" class="lg:hidden flex-1 h-14 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black uppercase">
            Tahrirlash
          </Button>
          <Button @click="handlePrint" leftIcon="fas fa-print" class="flex-[2] h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all">
            Printerga yuborish
          </Button>
        </div>
      </footer>
    </div>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { 
  printOutline, businessOutline, calculatorOutline, 
  peopleOutline, qrCodeOutline, cloudUploadOutline 
} from 'ionicons/icons';
import { 
  IonPage, IonContent, IonToggle, IonSpinner, IonIcon 
} from "@ionic/vue";
import { Input, Select, Upload, Header, SegmentTabs,Button } from "../../UI/UI";
import TemplateList from "./TemplateList.vue";
import { CheckTemplateStore } from "../../stores/index.store"; // To'g'ri pathni kiriting

// STORE BOG'LASH
const checkTemplateStore = CheckTemplateStore();
const { config,loading } = storeToRefs(checkTemplateStore);

// LOCAL STATE
const activeTab = ref('sozlamalar');
const searchQuery = ref('');
const isLargeScreen = ref(window.innerWidth >= 1024);

const Tabs = [
  { id: 'sozlamalar', label: 'Konstruktor', icon: 'fas fa-tools' },
  { id: 'preview', label: 'Chekni ko\'rish', icon: 'fas fa-eye' },
  { id: 'templates', label: 'Shablonlar', icon: 'fas fa-folder' }
];

const persons = [
  { key: 'showWaiter', label: 'Ofitsiant', sub: 'Xodim ismi' },
  { key: 'showCashier', label: 'Kassir', sub: 'To\'lov mas\'uli' },
  { key: 'showCustomer', label: 'Mijoz', sub: 'Ism va ID' },
  { key: 'showBalance', label: 'Mijoz Balansi', sub: 'Qarz/Depozit' },
];

const lineStyleOptions = [
  { value: 'dashed', name: 'Uzun-uzun chiziq (---)' },
  { value: 'solid', name: 'To\'g\'ri chiziq (___)' },
  { value: 'star', name: 'Yulduzchalar (* * *)' },
  { value: 'dotted', name: 'Nuqtali (.....)' }
];

// DINAMIK LINE CLASS
const lineClass = computed(() => {
  const styles = {
    dashed: 'border-b border-dashed',
    solid: 'border-b border-solid',
    star: 'border-none after:content-["**************************"] after:block after:text-center after:tracking-[2px]',
    dotted: 'border-b border-dotted'
  };
  return styles[config.value.lineStyle] || styles.dashed;
});

// PRICE FORMATTER
const formatPrice = (v) => new Intl.NumberFormat('uz-UZ').format(v) + ' ' + config.value.currency;

const handlePrint = () => window.print();

const updateScreenSize = () => { isLargeScreen.value = window.innerWidth >= 1024; };

onMounted(async () => {
  window.addEventListener('resize', updateScreenSize);
  // Sahifa ochilganda faol shablonni serverdan olish
  await checkTemplateStore.GetActiveTemplate();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
});
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

@media print {
  body * { visibility: hidden; }
  #printable-receipt, #printable-receipt * { visibility: visible; }
  #printable-receipt { 
    position: absolute; left: 0; top: 0; width: 100% !important; 
    box-shadow: none !important; border: none !important;
  }
  .no-print { display: none !important; }
}

.receipt-print {
  font-family: 'Courier New', Courier, monospace;
}
</style>