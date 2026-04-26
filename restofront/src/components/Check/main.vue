<template>
  <ion-page>
    <ion-header class="ion-no-border no-print">
      <div class="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/5 pt-safe">
        <div class="px-6 h-20 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button @click="$router.back()" class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-600 flex items-center justify-center active:scale-90 transition-all">
              <ion-icon :icon="arrowBackOutline" class="text-2xl" />
            </button>
            <div>
              <h1 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">Safy <span class="text-indigo-600">ERP</span></h1>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kassa Moduli v9.0</p>
            </div>
          </div>
          <button @click="resetToDefaults" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest active:bg-rose-500 active:text-white transition-all">Reset</button>
        </div>

        <div class="px-6 pb-4">
          <div class="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 backdrop-blur-xl">
            <button v-for="tab in ['Sozlamalar', 'Savatcha', 'Preview']" :key="tab" @click="activeTab = tab"
              :class="activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'"
              class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {{ tab }}
            </button>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="bg-[#F8FAFC] dark:bg-slate-950">
      <div class="p-6 pb-44 space-y-6 max-w-3xl mx-auto">
        
        <div v-if="activeTab === 'Sozlamalar'" class="space-y-6 animate__animated animate__fadeInUp">
          <div class="rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-[10px] font-black uppercase tracking-widest text-indigo-500">Vizual Brending</h3>
              <ion-toggle v-model="config.showLogo" mode="ios" color="success"></ion-toggle>
            </div>
            <Upload v-if="config.showLogo" v-model="config.logoImage" type="image" label="Logo yuklash" class="w-full h-[200px] rounded-[2.5rem]" />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input v-model="config.companyName" label="Korxona nomi" />
              <Input v-model="config.stir" label="STIR (TIN)" placeholder="301234567" />
              <Input v-model="config.socials" label="Ijtimoiy tarmoqlar" />
              <Input v-model="config.footerText" label="Chek osti matni" />
            </div>
          </div>

          <div class="rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6">Printer va Dizayn</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select v-model="config.lineStyle" label="Ajratuvchi chiziq">
                <option value="dashed">Dashed (-----)</option>
                <option value="solid">Solid (_____)</option>
                <option value="double">Double (=====)</option>
                <option value="star">Star (* * * *)</option>
              </Select>
              <div class="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl h-[56px] items-center px-2">
                <button v-for="w in [58, 80]" :key="w" @click="config.paperWidth = w"
                  :class="config.paperWidth === w ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'"
                  class="flex-1 h-10 rounded-xl font-black text-xs transition-all">
                  {{ w }}mm
                </button>
              </div>
            </div>
          </div>
          
          <div class="rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="t in displayToggles" :key="t.key" class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <span class="text-[9px] font-black uppercase text-slate-500">{{ t.label }}</span>
              <ion-toggle v-model="config[t.key]" mode="ios" color="success"></ion-toggle>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Savatcha'" class="space-y-4 animate__animated animate__fadeIn">
          <div v-for="(item, index) in cartItems" :key="item.id" class="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex items-center gap-4 shadow-sm">
             <div class="flex-1 grid grid-cols-12 gap-3">
                <input v-model="item.name" class="col-span-12 font-black text-base outline-none bg-transparent border-b border-slate-100 dark:border-white/10 pb-2" placeholder="Mahsulot nomi" />
                <div class="col-span-6">
                  <p class="text-[8px] font-black text-slate-400 uppercase mb-1 ml-1">Soni</p>
                  <input v-model.number="item.quantity" type="number" class="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold text-sm outline-none" />
                </div>
                <div class="col-span-6">
                  <p class="text-[8px] font-black text-slate-400 uppercase mb-1 ml-1">Narxi</p>
                  <input v-model.number="item.price" type="number" class="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold text-sm outline-none text-right" />
                </div>
             </div>
             <button @click="removeItem(index)" class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center active:scale-75 transition-all shadow-inner">
                <ion-icon :icon="trashOutline" class="text-xl" />
             </button>
          </div>
          <button @click="addItem" class="w-full py-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white dark:hover:bg-slate-900 transition-all">
            + Mahsulot qo'shish
          </button>
        </div>

        <div v-if="activeTab === 'Preview'" class="flex flex-col items-center animate__animated animate__zoomIn">
          <div id="printable-receipt" :style="{ width: config.paperWidth + 'mm' }" 
               class="bg-white p-6 text-black font-mono text-[11px] leading-tight text-center shadow-2xl receipt-box border border-slate-200">
            
            <div class="mb-4">
               <img v-if="config.showLogo && config.logoImage" :src="config.logoImage" class="w-16 h-16 mx-auto mb-3 object-contain grayscale" />
               <h2 class="font-black text-[18px] uppercase tracking-tighter leading-none">{{ config.companyName }}</h2>
               <p v-if="config.stir" class="text-[9px] mt-1 font-bold">STIR: {{ config.stir }}</p>
               <p v-if="config.socials" class="text-[8px] mt-1 font-bold opacity-60 italic">{{ config.socials }}</p>
            </div>

            <div :class="getLineClass" class="my-3 border-black overflow-hidden whitespace-nowrap">
              <span v-if="config.lineStyle === 'star'">* * * * * * * * * * * * * * * * * * * * *</span>
            </div>

            <div class="text-[10px] text-left space-y-1 mb-4 font-bold uppercase">
               <div class="flex justify-between"><span>CHECK ID:</span> <span>#{{ orderData.receiptId }}</span></div>
               <div class="flex justify-between"><span>SANA:</span> <span>{{ orderData.date }}</span></div>
               <div class="flex justify-between"><span>KASSIR:</span> <span>{{ orderData.waiterName }}</span></div>
               <div class="flex justify-between"><span>TO'LOV:</span> <span>{{ orderData.paymentType }}</span></div>
            </div>

            <div v-if="config.showCustomer" class="border-[1.5px] border-black p-2 my-3 text-left bg-slate-50">
               <div class="flex justify-between items-center font-black uppercase text-[9px]">
                  <span class="truncate max-w-[130px]">{{ orderData.customerName }}</span>
                  <span v-if="config.showBalance">{{ formatPrice(orderData.customerBalance) }}</span>
               </div>
            </div>

            <table class="w-full text-[10px] border-collapse mb-4">
               <thead><tr class="border-b-[1.5px] border-black font-black"><th class="text-left pb-1">NOM</th><th class="text-center pb-1">SONI</th><th class="text-right pb-1">SUM</th></tr></thead>
               <tbody class="divide-y divide-black/10">
                  <tr v-for="item in cartItems" :key="item.id">
                    <td class="py-2 text-left align-top uppercase font-black">{{ item.name }}</td>
                    <td class="py-2 text-center align-top">{{ item.quantity }}</td>
                    <td class="py-2 text-right align-top font-black">{{ formatPrice(item.price * item.quantity) }}</td>
                  </tr>
               </tbody>
            </table>

            <div :class="getLineClass" class="my-2 border-black overflow-hidden">
               <span v-if="config.lineStyle === 'star'">* * * * * * * * * * * * * * * * * * * * *</span>
            </div>

            <div class="space-y-1 text-right text-[10px] font-bold uppercase">
              <div v-if="config.showTaomSumma" class="flex justify-between"><span>SUMMA:</span> <span>{{ formatPrice(subTotal) }}</span></div>
              <div v-if="config.showServiceSum && orderData.servicePercent > 0" class="flex justify-between text-indigo-700">
                <span>XIZMAT ({{ orderData.servicePercent }}%):</span> <span>+{{ formatPrice(serviceValue) }}</span>
              </div>
              <div v-if="config.showDiscountSum && orderData.discountPercent > 0" class="flex justify-between text-rose-600 italic">
                <span>CHEGIRMA ({{ orderData.discountPercent }}%):</span> <span>-{{ formatPrice(discountValue) }}</span>
              </div>
              <div class="border-t-[3px] border-black mt-2 pt-2 flex justify-between font-black text-[18px] leading-none">
                <span>JAMI:</span>
                <span>{{ formatPrice(totalAmount) }}</span>
              </div>
            </div>

            <div v-if="config.showQR" class="mt-8 flex flex-col items-center">
               <div class="w-24 h-24 border-[2px] border-black p-1.5 bg-white">
                  <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SAFY-ERP-${orderData.receiptId}`" class="w-full grayscale" />
               </div>
               <p class="text-[7px] mt-2 font-black opacity-50 uppercase">Fiskal chek: {{ new Date().getTime() }}</p>
            </div>

            <div class="mt-8 border-t border-dashed border-black pt-4 text-center">
               <p class="text-[11px] font-black uppercase italic leading-none">{{ config.footerText }}</p>
               <p class="text-[8px] mt-3 font-bold opacity-30 tracking-widest">*** {{ orderData.timestamp }} ***</p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <footer class="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-[1000] no-print">
      <div class="max-w-3xl mx-auto">
        <button @click="handlePrint" class="w-full h-16 bg-indigo-600 text-white rounded-[2.5rem] font-black tracking-[0.3em] text-[12px] uppercase shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
            <ion-icon :icon="printOutline" class="text-2xl" />
            CHOP ETISH ({{ config.paperWidth }}mm)
        </button>
      </div>
    </footer>
  </ion-page>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { arrowBackOutline, printOutline, trashOutline } from 'ionicons/icons';
import { Input, Select, Upload } from "../../UI/UI"; // UI komponentlar yo'li

const activeTab = ref('Savatcha');

// 1. BACKENDDAN KELGAN DINAMIK DATA
const orderData = ref({
  receiptId: '885-2026',
  servicePercent: 12,    // Zavod/Restoran xizmat haqi
  discountPercent: 5,     // Mijoz chegirmasi
  customerName: 'Umid Shomurodov',
  customerBalance: 1200000,
  waiterName: 'Abdulaziz T.',
  paymentType: 'Humo (Plastik)',
  date: new Date().toLocaleDateString('uz-UZ'),
  timestamp: new Date().toLocaleTimeString('uz-UZ')
});

// 2. KONFIGURATSIYA (Reactive)
const config = ref({
  paperWidth: 58,
  lineStyle: 'dashed',
  showLogo: true,
  logoImage: null,
  companyName: 'SAFY MILK FACTORY',
  stir: '302456789',
  socials: '@safymilk_uz',
  footerText: 'Xaridingiz uchun rahmat!',
  showTaomSumma: true,
  showServiceSum: true,
  showDiscountSum: true,
  showCustomer: true,
  showBalance: true,
  showQR: true
});

const displayToggles = computed(() => [
  { key: 'showTaomSumma', label: 'Sof summa' },
  { key: 'showServiceSum', label: 'Xizmat haqi' },
  { key: 'showDiscountSum', label: 'Chegirma' },
  { key: 'showCustomer', label: 'Mijoz nomi' },
  { key: 'showBalance', label: 'Mijoz balansi' },
  { key: 'showQR', label: 'QR kod' }
]);

// 3. SAVATCHA LOGIKASI
const cartItems = ref([
  { id: 1, name: 'Sut (Safy 1.5L)', quantity: 4, price: 12000 },
  { id: 2, name: 'Smetana (Lacto)', quantity: 2, price: 24000 }
]);

// --- MATEMATIK LOGIKA ---
const subTotal = computed(() => cartItems.value.reduce((acc, item) => acc + (item.price * item.quantity), 0));
const serviceValue = computed(() => (subTotal.value * orderData.value.servicePercent) / 100);
const discountValue = computed(() => (subTotal.value * orderData.value.discountPercent) / 100);
const totalAmount = computed(() => subTotal.value + serviceValue.value - discountValue.value);

const addItem = () => cartItems.value.push({ id: Date.now(), name: '', quantity: 1, price: 0 });
const removeItem = (i) => cartItems.value.splice(i, 1);
const resetToDefaults = () => { if(confirm('Barcha sozlamalar tiklansinmi?')) location.reload(); };

const getLineClass = computed(() => {
  const s = { 
    dashed: 'border-b border-dashed', 
    solid: 'border-b border-solid', 
    double: 'border-b-4 border-double', 
    star: 'border-none h-4' 
  };
  return s[config.value.lineStyle] || s.dashed;
});

const formatPrice = (v) => new Intl.NumberFormat('uz-UZ').format(Math.floor(v)) + ' UZS';

// --- CHOP ETISH LOGIKASI (FINAL) ---
const handlePrint = async () => {
  // 1. Preview tabiga o'tish (Chunki printer faqat render bo'lgan DOMni ko'radi)
  activeTab.value = 'Preview';
  
  // 2. DOM yangilanishini kutish
  await nextTick();
  
  // 3. Rasmlar va QR yuklanishi uchun ozgina kechikish bilan pechatga berish
  setTimeout(() => {
    window.print();
  }, 500);
};
</script>

<style scoped>
.receipt-box { border-radius: 4px; }

/* PRINTER UCHUN MAXSUS FORMATLASH */
@media print {
  /* Ionic va interfeys elementlarini o'chirish */
  ion-header, footer, .no-print, ion-content::part(background), ion-content::part(scroll) {
    display: none !important;
    visibility: hidden !important;
  }

  /* Chekni chop etish oynasiga moslash */
  #printable-receipt {
    visibility: visible !important;
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 2mm !important;
    border: none !important;
    box-shadow: none !important;
    background: white !important;
    color: black !important;
  }

  /* Brauzerning o'z fonlarini tozalash */
  body {
    background: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>