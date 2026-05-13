<template>
  <div class="max-w-[1400px] mx-auto space-y-6 md:space-y-10 p-2 md:p-6 animate__animated animate__fadeIn pb-32">
    
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-4">
      <div class="space-y-1">
        <h2 class="text-2xl md:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">
          Printerlar Markazi
        </h2>
        <div class="flex items-center gap-3">
          <div class="flex -space-x-2">
            <div v-for="p in printers" :key="p.id" 
              :class="[
                'w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] shadow-sm transition-all',
                p.status === 'online' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'
              ]">
              <ion-icon :icon="p.type === 'wifi' ? wifiOutline : (p.type === 'usb' ? printOutline : bluetoothOutline)" />
            </div>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {{ printers.length }} ta qurilma saqlangan
          </p>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <div class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        <span class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Tizim barqaror</span>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <transition-group name="list">
        <div v-for="printer in printers" :key="printer.id" 
          :class="[
            'relative group p-6 rounded-[2.5rem] transition-all duration-700 border-2 overflow-hidden',
            printer.status === 'online' 
              ? 'bg-white dark:bg-slate-900 border-emerald-500/20 shadow-xl shadow-emerald-500/5' 
              : 'bg-slate-50 dark:bg-white/[0.02] border-transparent grayscale opacity-80'
          ]">
          
          <div :class="`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${printer.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`"></div>

          <div class="relative z-10 flex flex-col gap-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div :class="[
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 shadow-lg',
                  printer.status === 'online' ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-200 text-slate-400'
                ]">
                  <ion-icon :icon="getPrinterIcon(printer.role)" />
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <div :class="`w-2 h-2 rounded-full ${printer.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`"></div>
                    <span class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{{ printer.type }} connection</span>
                  </div>
                  <h3 class="text-lg font-black text-slate-800 dark:text-white">{{ printer.name }}</h3>
                  <p class="text-[9px] font-bold text-indigo-500/60 uppercase tracking-tighter">{{ printer.id }}</p>
                </div>
              </div>

              <Button @click="printerStore.removeDevice(printer.id)" variant="danger" size="sm" class="!rounded-xl !w-10 !h-10 !p-0">
                <ion-icon :icon="trashOutline" />
              </Button>
            </div>

            <div class="space-y-3">
              <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2">Printer Vazifasi</label>
              <div class="flex flex-wrap gap-1.5 p-1.5 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                <button v-for="role in roles" :key="role.key"
                  @click="printerStore.updateRole(printer.id, role.key)"
                  :class="[
                    'flex-1 py-2.5 px-3 rounded-xl text-[8px] font-[900] uppercase tracking-widest transition-all duration-300',
                    printer.role === role.key 
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm border border-slate-200 dark:border-white/10 scale-105' 
                      : 'text-slate-400 hover:text-slate-600'
                  ]">
                  {{ role.label }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
              <span class="text-[9px] font-black uppercase text-slate-400">Holat: 
                <span :class="printer.status === 'online' ? 'text-emerald-500' : 'text-rose-500'">{{ printer.status }}</span>
              </span>
              <Button @click="testPrint(printer)" variant="secondary" size="sm" class="!rounded-xl !text-[8px] !font-black uppercase tracking-widest">
                Test Print
              </Button>
            </div>
          </div>
        </div>
      </transition-group>

      <div v-if="printers.length === 0" class="lg:col-span-2 xl:col-span-3 py-24 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[4rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
        <div class="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-4xl text-slate-300 mb-6">
          <ion-icon :icon="printOutline" />
        </div>
        <h4 class="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Hech qanday printer ulanmagan</h4>
        <p class="text-xs text-slate-400 font-bold uppercase mt-2">Quyidagi usullardan biri orqali yangi qurilma qo'shing</p>
      </div>
    </div>

    <div class="space-y-6 pt-10 border-t border-slate-100 dark:border-white/5">
      <div class="flex items-center gap-4 px-4">
        <h4 class="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Yangi qurilma qo'shish</h4>
        <div class="h-[1px] flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="method in connectionMethods" :key="method.id"
          @click="handleScan(method)"
          class="group relative p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-indigo-500 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer overflow-hidden">
          
          <div :class="`w-16 h-16 rounded-[1.8rem] ${method.bg} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-3xl shadow-lg shadow-black/5` ">
            <ion-icon :icon="method.icon" :class="method.color" />
          </div>

          <h4 class="text-md font-[900] text-slate-800 dark:text-slate-100 uppercase mb-3 tracking-tight">{{ method.title }}</h4>
          <p class="text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed pr-6">
            {{ method.desc }}
          </p>

          <div class="absolute bottom-8 right-8 w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all">
            <ion-icon :icon="arrowForwardOutline" />
          </div>
        </div>
      </div>
    </div>

    <transition enter-active-class="animate__animated animate__zoomIn" leave-active-class="animate__animated animate__fadeOut">
      <div v-if="showIPModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
        <div class="w-full max-w-lg p-10 rounded-[3.5rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden">
          <div class="relative z-10 space-y-8">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-black uppercase tracking-widest">Network Setup</h3>
                <p class="text-[10px] font-bold text-white/60 uppercase mt-1">LAN / WIFI Printerni ulash</p>
              </div>
              <button @click="showIPModal = false" class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors">
                <ion-icon :icon="closeOutline" class="text-2xl" />
              </button>
            </div>

            <div class="space-y-6">
              <Input 
                v-model="manualIP" 
                placeholder="192.168.1.100" 
                label="Printer IP manzili" 
                class="!bg-white/10 !border-white/10 !text-white placeholder:text-white/40"
              />
              <Button @click="connectViaIP" variant="secondary" class="w-full !h-16 !rounded-[1.5rem] !text-indigo-600 !font-black uppercase tracking-widest shadow-xl">
                Qurilmani Ulash
              </Button>
            </div>
          </div>
          <div class="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { 
  printOutline, bluetoothOutline, wifiOutline, trashOutline, 
  arrowForwardOutline, closeOutline, cartOutline, fastFoodOutline,
  beerOutline
} from 'ionicons/icons';
import { IonIcon } from "@ionic/vue";
import { PrinterStore } from "../../stores/index.store";
import { Button, Input } from "../../UI/UI";

const printerStore = PrinterStore();
const { printers } = storeToRefs(printerStore);

const showIPModal = ref(false);
const manualIP = ref('');

const roles = [
  { key: 'cashier', label: 'Kassa' },
  { key: 'kitchen', label: 'Oshxona' },
  { key: 'bar', label: 'Bar' },
];

const connectionMethods = [
  { id: 'bt', title: 'Bluetooth', desc: 'Simsiz portativ va stol printerlari', icon: bluetoothOutline, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'usb', title: 'USB Cable', desc: 'OTG orqali to\'g\'ridan-to\'g\'ri ulanish', icon: printOutline, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'ip', title: 'Network IP', desc: 'Tarmoqdagi barqaror LAN printerlar', icon: wifiOutline, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const getPrinterIcon = (role) => {
  switch (role) {
    case 'cashier': return cartOutline;
    case 'kitchen': return fastFoodOutline;
    case 'bar': return beerOutline;
    default: return printOutline;
  }
};

const handleScan = (method) => {
  if (method.id === 'bt') printerStore.scanBluetooth();
  if (method.id === 'usb') printerStore.scanUSB();
  if (method.id === 'ip') showIPModal.value = true;
};

const connectViaIP = async () => {
  if (manualIP.value) {
    await printerStore.connectToDevice({ 
      name: 'Network Printer', 
      id: manualIP.value,
      role: 'kitchen' 
    }, 'wifi');
    showIPModal.value = false;
    manualIP.value = '';
  }
};

const testPrint = (printer) => {
  // Sinov cheki chiqarish mantiqi
  console.log(`Testing printer: ${printer.name}`);
};
</script>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(30px); }
</style>