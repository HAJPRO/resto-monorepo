<template>
  <div class="max-w-4xl mx-auto space-y-6 p-1 animate__animated animate__fadeIn">
    
    <div v-if="connectedPrinter" 
      class="relative overflow-hidden p-8 rounded-[3rem] bg-slate-900 dark:bg-indigo-950 text-white shadow-2xl transition-all duration-500">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="w-16 h-16 rounded-3xl bg-indigo-500/20 backdrop-blur-xl border border-indigo-400/30 flex items-center justify-center animate-pulse">
            <ion-icon :icon="printOutline" class="text-3xl text-indigo-300" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Connected Device</span>
            </div>
            <h3 class="text-2xl font-black tracking-tight">{{ connectedPrinter.name }}</h3>
            <p class="text-[10px] font-medium text-indigo-300/60 uppercase mt-1">ID: {{ connectedPrinter.id }} • {{ connectedPrinter.date }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
            {{ connectedPrinter.type }}
          </span>
          <button @click="printerStore.disconnect()" 
            class="p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all duration-300 group">
            <ion-icon :icon="trashOutline" class="text-xl" />
          </button>
        </div>
      </div>
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="method in connectionMethods" :key="method.id"
        @click="handleScan(method)"
        class="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden">
        
       <div :class="`w-14 h-14 rounded-2xl ${method.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 text-2xl` ">
          <ion-icon :icon="method.icon" :class="method.color" />
        </div>

        <h4 class="text-sm font-black text-slate-800 dark:text-slate-100 uppercase mb-2">{{ method.title }}</h4>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
          {{ method.desc }}
        </p>

        <div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all">
          <ion-icon :icon="arrowForwardOutline" class="text-indigo-500 text-xl" />
        </div>
      </div>
    </div>

    <transition enter-active-class="animate__animated animate__fadeInUp" leave-active-class="animate__animated animate__fadeOutDown">
      <div v-if="showIPModal" class="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
        <div class="flex flex-col md:flex-row items-end gap-5">
          <div class="flex-1 w-full">
            <div class="flex items-center justify-between mb-3 px-2">
              <label class="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Printer Network Address</label>
              <button @click="showIPModal = false" class="text-slate-400 hover:text-rose-500">
                <ion-icon :icon="closeOutline" />
              </button>
            </div>
            <input v-model="manualIP" placeholder="Masalan: 192.168.1.100" 
              class="w-full h-16 px-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-sm font-bold shadow-inner transition-all" />
          </div>
          <button @click="connectViaIP" 
            class="w-full md:w-auto h-16 px-10 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all">
            Ulash
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { 
  printOutline, bluetoothOutline, wifiOutline, 
  trashOutline, arrowForwardOutline, closeOutline,
} from 'ionicons/icons';
import { IonIcon } from "@ionic/vue";
import { PrinterStore } from "../../stores/index.store";

const printerStore = PrinterStore();
const { connectedPrinter } = storeToRefs(printerStore);

const showIPModal = ref(false);
const manualIP = ref('');

const connectionMethods = [
  { id: 'bt', title: 'Bluetooth', desc: 'Atrofdagi simsiz printerlar', icon: bluetoothOutline, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'usb', title: 'USB Connection', desc: 'OTG yoki Kabel orqali', icon: printOutline, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'ip', title: 'Network IP', desc: 'Lokal tarmoqdagi printerlar', icon: wifiOutline, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const handleScan = (method) => {
  if (method.id === 'bt') printerStore.scanBluetooth();
  if (method.id === 'usb') printerStore.scanUSB();
  if (method.id === 'ip') showIPModal.value = true;
};

const connectViaIP = () => {
  if (manualIP.value) {
    printerStore.connectToDevice({ name: 'Ethernet Printer', id: manualIP.value }, 'wifi');
    showIPModal.value = false;
    manualIP.value = '';
  }
};
</script>