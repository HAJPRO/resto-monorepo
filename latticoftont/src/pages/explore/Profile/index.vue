<template>
  <ion-page class="bg-slate-50 dark:bg-slate-950">
     <ion-header class="ion-no-border">
  <div class="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl pt-safe border-b border-slate-100 dark:border-white/5">
    
    <div class="max-w-full mx-auto px-3 h-12 flex items-center justify-between pt-14 mb-6">
      <div class="flex items-center gap-2"> <button 
          @click="$router.back()" 
          class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center justify-center active:scale-95 transition-all"
        >
          <ion-icon :icon="arrowBackOutline" class="text-lg" />
        </button>

        <h1 class="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-3">
          Profile
        </h1>
      </div>
<div class="flex gap-2">
      <button class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center justify-center active:scale-95 transition-all">
        <ion-icon :icon="searchOutline" class="text-base" />
      </button>
       <button class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center justify-center active:scale-95 transition-all">
        <ion-icon :icon="addCircleOutline" class="text-base" />
      </button>
      </div>
    </div>

    <div class="max-w-md mx-auto px-3 pb-3 mt-1 overflow-x-auto no-scrollbar flex gap-2">
      <button 
        v-for="cat in categories" :key="cat.id"
        @click="activeCategory = cat.id"
        :class="[
          'px-4 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all duration-300',
          activeCategory === cat.id 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-white/5'
        ]"
      >
        {{ cat.name }}
      </button>
    </div>
  </div>
</ion-header>

    <ion-content :fullscreen="true">
      <div class="max-w-full mx-auto px-5 pb-10 space-y-8">
        
       <div class="relative group mt-2">
  <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
  
  <div class="relative bg-white dark:bg-slate-900 rounded-[30px] p-5 flex items-center gap-4 border border-slate-100 dark:border-white/5">
    <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center overflow-hidden text-white text-2xl font-black shadow-lg shadow-indigo-500/30">
      <img :src="user?.image" alt="Profile" class="w-full h-full object-cover">
    </div>

    <div class="flex-1">
      <h2 class="text-lg font-black text-slate-900 dark:text-white leading-none">{{ user?.fullname }}</h2>
      <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Full-stack Developer</p>
    </div>

    <button 
      aria-label="View Profile"
      class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-500 active:scale-90 transition-all">
      <ion-icon :icon="chevronForwardOutline" class="text-lg" />
    </button>
  </div>
</div>

        <div v-for="(section, sIdx) in menuSections" :key="sIdx" class="space-y-3">
          <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ section.title }}</p>
          
          <div class="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
            <div 
              v-for="(item, iIdx) in section.items" 
              :key="iIdx"
              @click="handleAction(item.action)"
              class="group flex items-center gap-4 px-5 py-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all border-b border-slate-50 last:border-0 dark:border-white/5 cursor-pointer"
            >
              <div :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-active:scale-90', item.colorClass]">
                <ion-icon :icon="item.icon" class="text-lg" />
              </div>
              
              <span class="flex-1 text-[15px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                {{ item.label }}
              </span>

              <div class="flex items-center gap-2">
                <span v-if="item.value" class="text-[12px] font-bold text-slate-400">{{ item.value }}</span>
                <ion-icon :icon="chevronForwardOutline" class="text-slate-300 dark:text-slate-700 text-sm" />
              </div>
            </div>
          </div>
        </div>

        <button class="w-full py-5 rounded-[28px] bg-rose-50 dark:bg-rose-500/5 text-rose-500 font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all border border-rose-100 dark:border-rose-500/10">
          Hisobdan chiqish
        </button>

        <p class="text-center text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">
          Version 2.0.4 • Resto Engine
        </p>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, IonHeader, IonContent, IonIcon 
} from '@ionic/vue';
import { 
  chevronForwardOutline, personOutline, shieldCheckmarkOutline, 
  notificationsOutline, colorPaletteOutline, languageOutline, 
  helpCircleOutline, documentTextOutline,searchOutline,arrowBackOutline,
  
  
  addCircleOutline
  
} from 'ionicons/icons';
import { AuthStore } from "../../../stores/index.store";
import { storeToRefs } from "pinia";
const store_auth = AuthStore();
const { user } = storeToRefs(store_auth);
const menuSections = [
  {
    title: 'Profil va Xavfsizlik',
    items: [
      { label: 'Shaxsiy ma\'lumotlar', icon: personOutline, colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400', action: 'profile' },
      { label: 'Parol va Xavfsizlik', icon: shieldCheckmarkOutline, colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', action: 'security' },
    ]
  },
  {
    title: 'Ilova sozlamalari',
    items: [
      { label: 'Bildirishnomalar', icon: notificationsOutline, colorClass: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400', action: 'notif', value: 'Yoqilgan' },
      { label: 'Mavzu (Dark Mode)', icon: colorPaletteOutline, colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400', action: 'theme', value: 'Tizim' },
      { label: 'Til', icon: languageOutline, colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400', action: 'lang', value: 'O\'zbekcha' },
    ]
  },
  {
    title: 'Yordam',
    items: [
      { label: 'Qo\'llab-quvvatlash', icon: helpCircleOutline, colorClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', action: 'support' },
      { label: 'Foydalanish shartlari', icon: documentTextOutline, colorClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', action: 'terms' },
    ]
  }
];

const handleAction = (action) => {
  console.log('Action triggered:', action);
  // Navigatsiya mantiqi shu yerda bo'ladi
};
</script>

<style scoped>
header {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
* { -webkit-tap-highlight-color: transparent; }
</style>