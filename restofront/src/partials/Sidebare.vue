<template>
  <ion-menu 
    menu-id="main-menu"
    content-id="main-content" 
    type="overlay" 
    class="custom-sidebar" 
    :persistent="true"
    @ionDidOpen="saveMenuState(true)"
    @ionDidClose="saveMenuState(false)"
  >
    <ion-content class="ion-no-padding" :scroll-y="false">
      <div class="flex flex-col h-full bg-white dark:bg-[#020617] transition-colors duration-500">
        
        <header class="p-6 pb-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ion-icon :icon="restaurant" class="text-white text-xl" />
              </div>
              <h1 class="text-xl font-black tracking-tighter dark:text-white">
                Resto<span class="text-indigo-600 italic">.uz</span>
              </h1>
            </div>
            <ion-menu-toggle>
              <button class="text-slate-400 hover:text-indigo-600 transition-colors">
                <ion-icon :icon="chevronBackOutline" class="text-xl" />
              </button>
            </ion-menu-toggle>
          </div>
        </header>

        <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
          
          <div class="space-y-1">
            <p class="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Statistika</p>
            <router-link
              v-for="item in menuItems"
              :key="'main-' + item.routeName"
              :to="{ name: item.routeName }"
              custom
              v-slot="{ navigate, isActive }"
            >
              <button @click="navigate"
                :class="[
                  'w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group',
                  isActive 
                    ? 'bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                ]">
                <div v-if="isActive" class="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full"></div>
                <ion-icon :icon="isActive ? item.activeIcon : item.icon" class="text-xl" :class="isActive ? 'opacity-100' : 'opacity-70'" />
                <span class="flex-1 text-left text-[13px] font-bold tracking-tight">{{ item.label }}</span>
                <div v-if="item.badge" class="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
              </button>
            </router-link>
          </div>

          <div class="space-y-1">
            <p class="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Boshqaruv</p>
            
            <div v-for="(section, key) in sidebarSections" :key="'sec-' + key" class="space-y-1">
              <button @click="toggleSection(key)" 
                :class="[
                  'w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group',
                  openSections[key] ? 'bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                ]">
                <div v-if="openSections[key]" class="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full"></div>
                
                <ion-icon :icon="section.icon" class="text-xl opacity-70" />
                <span class="flex-1 text-left text-[13px] font-bold tracking-tight">{{ section.label }}</span>
                <ion-icon :icon="chevronDownOutline" :class="{ 'rotate-180': openSections[key] }" class="text-[10px] transition-transform duration-300" />
              </button>

              <transition name="expand">
                <div v-show="openSections[key]" class="ml-4 pl-8 border-l-2 border-slate-100 dark:border-slate-800 space-y-1">
                  <router-link 
                    v-for="sub in section.subs" 
                    :key="'sub-' + sub.routeName" 
                    :to="{ name: sub.routeName }" 
                    v-slot="{ isActive, navigate }"
                  >
                    <div @click="navigate" :class="[
                      'flex items-center gap-3 py-2.5 text-[12px] font-bold transition-all duration-200 cursor-pointer',
                      isActive ? 'text-indigo-600 translate-x-1' : 'text-slate-500 hover:text-indigo-600'
                    ]">
                      <ion-icon :icon="sub.icon" class="text-[14px]" /> {{ sub.label }}
                    </div>
                  </router-link>
                </div>
              </transition>
            </div>
          </div>

          <div class="space-y-1">
            <Guard :roles="['1000']">
              <p class="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Sozlamalar</p>
              
             
                 <button @click="toggleSection('settings')" 
                :class="[
                  'w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group',
                  openSections.settings ? 'bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                ]">
                <div v-if="openSections.settings" class="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full"></div>
                <ion-icon :icon="settingsOutline" class="text-xl" :class="openSections.settings ? 'opacity-100' : 'opacity-70'" />
                <span class="flex-1 text-left text-[13px] font-bold tracking-tight">Tizim sozlamalari</span>
                <ion-icon :icon="chevronDownOutline" :class="{ 'rotate-180': openSections.settings }" class="text-[10px] transition-transform duration-300" />
              </button>
               <button @click="toggleSection('subscriptions')" 
                :class="[
                  'w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group',
                  openSections.subscriptions ? 'bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                ]">
                <div v-if="openSections.subscriptions" class="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full"></div>
                <ion-icon :icon="cardOutline" class="text-xl" :class="openSections.subscriptions ? 'opacity-100' : 'opacity-70'" />
                <span class="flex-1 text-left text-[13px] font-bold tracking-tight">Obunalar</span>
                <ion-icon :icon="chevronDownOutline" :class="{ 'rotate-180': openSections.subscriptions }" class="text-[10px] transition-transform duration-300" />
              </button>

              <transition name="expand">
                <div v-show="openSections.settings" class="ml-4 pl-8 border-l-2 border-slate-100 dark:border-slate-800 space-y-1">
                  <template v-for="sub in staffSubs" :key="'settings-' + sub.routeName">
                    <Guard :roles="sub.roles" :permissions="sub.permissions">
                      <router-link :to="{ name: sub.routeName }" v-slot="{ isActive, navigate }">
                        <div @click="navigate" 
                          class="flex items-center gap-3 py-2.5 text-[12px] font-bold transition-all cursor-pointer"
                          :class="isActive ? 'text-indigo-600 translate-x-1' : 'text-slate-500 hover:text-indigo-600'">
                          <ion-icon :icon="sub.icon" class="text-[14px]" /> 
                          {{ sub.label }}
                        </div>
                      </router-link>
                    </Guard>
                  </template>
                </div>
              </transition>
               <transition name="expand">
                <div v-show="openSections.subscriptions" class="ml-4 pl-8 border-l-2 border-slate-100 dark:border-slate-800 space-y-1">
                  <template v-for="sub in subscriptionsSubs" :key="'subscriptions-' + sub.routeName">
                    <Guard :roles="sub.roles" :permissions="sub.permissions">
                      <router-link :to="{ name: sub.routeName }" v-slot="{ isActive, navigate }">
                        <div @click="navigate" 
                          class="flex items-center gap-3 py-2.5 text-[12px] font-bold transition-all cursor-pointer"
                          :class="isActive ? 'text-indigo-600 translate-x-1' : 'text-slate-500 hover:text-indigo-600'">
                          <ion-icon :icon="sub.icon" class="text-[14px]" /> 
                          {{ sub.label }}
                        </div>
                      </router-link>
                    </Guard>
                  </template>
                </div>
              </transition>
            </Guard>
          </div>
        </nav>

       <footer class="p-4 border-t border-slate-50 dark:border-white/5 bg-white dark:bg-transparent">
   <div class="flex items-center justify-between gap-2 opacity-40 hover:opacity-80 transition-opacity duration-300 mb-1">
 
<span class="text-[9px] font-bold tracking-[0.3em]  text-slate-600 dark:text-slate-300">
    version:
  </span>
  <span class="text-[9px] font-bold tracking-[0.3em]  text-slate-600 dark:text-slate-300">
    {{ version }}
  </span>
</div>
  <button @click="handleLogout" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-500 bg-rose-50 dark:bg-rose-500/5 transition-all active:scale-95 group mb-3">
    <ion-icon :icon="logOutOutline" class="text-xl group-hover:rotate-180 transition-transform duration-500" />
    <span class="text-sm font-bold uppercase tracking-wider">Chiqish</span>
  </button>

  
</footer>
      </div>
    </ion-content>
  </ion-menu>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import pkg from '../../package.json';
const version = pkg.version;
import { IonMenu, IonContent, IonIcon, menuController, IonMenuToggle } from "@ionic/vue";
import {
  restaurant, flame, trophy, trophyOutline, time, timeOutline, logOutOutline,
  chevronBackOutline, archiveOutline, chevronDownOutline, peopleOutline,
  cartOutline, settingsOutline, ribbonOutline, shieldCheckmarkOutline, receiptOutline,
  cubeOutline, personOutline, swapVerticalOutline, printOutline,
  cashOutline, layersOutline, briefcaseOutline, walletOutline, idCardOutline,
  businessOutline, gridOutline,
  locationOutline,
  fileTray,
  fileTrayOutline,
  filterOutline,
  calculatorOutline,
  cardOutline,
  serverOutline
} from "ionicons/icons";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const route = useRoute();

// --- STATE ---
const openSections = ref({
  staff: false, supply: false, inventory: false, tmo: false, settings: false, custom: false, product: false,zone:false, counterparty: false, cash: false,subscriptions:false
});

// --- CONFIGS ---
const menuItems = [
  { label: "Dashboard", routeName: "home", icon: flame, activeIcon: flame, badge: true },
  { label: "Reyting", routeName: "tables", icon: trophyOutline, activeIcon: trophy },
  { label: "Tranzaksiyalar", routeName: "transaction", icon: timeOutline, activeIcon: time },
];

const sidebarSections = {
  staff: { label: "Xodimlar", icon: peopleOutline, subs: [
    { label: "Xodimlar", routeName: "employee", icon: personOutline },
    { label: "Bo'limlar", routeName: "department", icon: businessOutline }
  ]},
  custom: { label: "Mijozlar", icon: idCardOutline, subs: [
    { label: "Mijozlar ro'yxati", routeName: "customer", icon: peopleOutline },
    { label: "Mijozlar qarzdorligi", routeName: "customer", icon: walletOutline }
  ]},
   counterparty: { label: "Kontragentlar", icon: briefcaseOutline, subs: [
    { label: "Kontragentlar ro'yxati", routeName: "counterparty", icon: peopleOutline },
    { label: "Kontragentlar qarzdorligi", routeName: "customer", icon: walletOutline }
  ]},
  product: { label: "Mahsulotlar", icon: cubeOutline, subs: [
    { label: "Mahsulotlar", routeName: "menu", icon: cubeOutline },
    { label: "Kategoriyalar", routeName: "category", icon: gridOutline }
  ]},
 zone: { 
  label: "Restaran tuzilmasi", 
  icon: businessOutline, // Bino yoki struktura ramzi
  subs: [
    { label: "Hududlar", routeName: "zone", icon: locationOutline }, // Qatlamlar (1-etaj, 2-etaj)
    { label: "Stollar", routeName: "tables", icon: gridOutline }    // Kataklar (Stollar joylashuvi)
  ]
},
  supply: { label: "Ta'minot", icon: briefcaseOutline, subs: [
    { label: "Xaridlar", routeName: "home", icon: cartOutline },
    { label: "Yetkazib beruvchilar", routeName: "home", icon: peopleOutline }
  ]},
  cash: { label: "Buxgalterya", icon: calculatorOutline, subs: [
    { label: "Kassa", routeName: "cash", icon: walletOutline },
    { label: "Hisobotlar", routeName: "home", icon: fileTrayOutline }
  ]},
  tmo: { label: "TMO", icon: layersOutline, subs: [
    { label: "Mahsulotlar", routeName: "menu", icon: cubeOutline },
    { label: "Kirim qilish", routeName: "insert", icon: swapVerticalOutline },
    { label: "Kirim hujjatlari", routeName: "inserthistory", icon: filterOutline },

    { label: "Kategoriyalar", routeName: "category", icon: personOutline },
{ label: "Kontragentlar", routeName: "counterparty", icon: businessOutline }
  ]},
  inventory: { label: "Omborxona", icon: archiveOutline, subs: [
    { label: "Mahsulotlar", routeName: "menu", icon: cubeOutline },
    { label: "Kirim-chiqim", routeName: "statistic", icon: swapVerticalOutline },
  ]}
};

const staffSubs = [
  { label: "Foydalanuvchilar", routeName: "settingsusers", icon: personOutline, roles: ['1000'] },
  { label: "Huquqlar", routeName: "settingsroles", icon: ribbonOutline, roles: ['1000'] },
  { label: "Ruxsatlar", routeName: "settingspermissions", icon: shieldCheckmarkOutline, roles: ['1000'] },
  { label: "Chek sozlamalari", routeName: "check", icon: printOutline },
  { label: "Xizmat foizi (%)", routeName: "fee", icon: receiptOutline },
];

const subscriptionsSubs = [
  { label: "Server balansi", routeName: "server", icon: serverOutline, roles: ['1000'] },
 
];




// --- LOGIC ---

const toggleSection = async (section) => {
  openSections.value[section] = !openSections.value[section];
  localStorage.setItem("sidebar_open_sections", JSON.stringify(openSections.value));
  await hapticImpact(ImpactStyle.Light);
};

const saveMenuState = (isOpen) => {
  localStorage.setItem("sidebar_menu_is_open", isOpen);
};

onMounted(async () => {
  // 1. Accordionlarni tiklash
  const savedSections = localStorage.getItem("sidebar_open_sections");
  if (savedSections) {
    try { openSections.value = JSON.parse(savedSections); } catch (e) {}
  }

  // 2. Sidebar holatini tiklash (YAXSHILANGAN QISM)
  const menuWasOpen = localStorage.getItem("sidebar_menu_is_open") === "true";
  if (menuWasOpen) {
    // Kechikishni biroz oshiramiz va kontrollerni aniq chaqiramiz
    setTimeout(async () => {
      try {
        await menuController.enable(true, 'main-menu');
        await menuController.open('main-menu');
      } catch (err) {
        console.error("Menu ochishda xato:", err);
      }
    }, 500);
  }
});

const handleLogout = async () => {
  await hapticImpact(ImpactStyle.Medium);
  localStorage.clear();
  window.location.href = "/landing/login";
};

const hapticImpact = async (style) => {
  try { await Haptics.impact({ style }); } catch (e) {}
};
</script>

<style scoped>
.custom-sidebar { --width: 310px; }
.custom-scrollbar::-webkit-scrollbar { display: none; }
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 600px;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}
header { padding-top: calc(env(safe-area-inset-top) + 1rem); }
footer { padding-bottom: calc(env(safe-area-inset-bottom) + 1rem); }
</style>