<template>
  <ion-footer class="ion-no-border">
    <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 pb-safe">
      
      <div class="flex items-center justify-around h-16 relative px-2">
        
        <div 
          v-for="nav in navLinks" 
          :key="nav.tab" 
          @click="navigate(nav.url)"
          class="relative flex flex-col items-center justify-center flex-1 h-full cursor-pointer group"
        >
          <div 
            class="relative z-10 flex flex-col items-center transition-all duration-300 ease-out"
            :class="currentRoute === nav.url ? '-translate-y-1' : 'translate-y-0'"
          >
            <ion-icon 
              :icon="currentRoute === nav.url ? nav.activeIcon : nav.icon" 
              class="text-xl transition-all duration-300"
              :class="currentRoute === nav.url 
                ? 'text-indigo-600 dark:text-indigo-400 scale-110' 
                : 'text-slate-400 dark:text-slate-500 opacity-60'"
            />
            
            <span 
              v-if="nav.hasUpdate" 
              class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 border border-white dark:border-slate-900 rounded-full"
            ></span>

            <span 
              class="text-[10px] mt-1 font-bold tracking-tight transition-all duration-300"
              :class="currentRoute === nav.url 
                ? 'text-indigo-600 dark:text-indigo-400 opacity-100' 
                : 'text-slate-400 dark:text-slate-500 opacity-60'"
            >
              {{ nav.label }}
            </span>
          </div>

          <div 
            class="absolute bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500 ease-in-out"
            :class="currentRoute === nav.url ? 'opacity-100 scale-100' : 'opacity-0 scale-0 translate-y-2'"
          ></div>
          
        </div>

      </div>
    </div>
  </ion-footer>
</template>

<script setup>
import { IonFooter, IonIcon } from '@ionic/vue';
import { 
  home, homeOutline, 
  restaurant, restaurantOutline, 
  receipt, receiptOutline,
  grid, gridOutline, 
  barChartSharp,
  barChartOutline,
  cashOutline,
  walletOutline
} from 'ionicons/icons';

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const route = useRoute();
const router = useRouter();

const currentRoute = computed(() => route.path);

const navLinks = [
  { tab: 'home', label: 'Asosiy', url: '/explore/home', icon: homeOutline, activeIcon: home },
  { tab: 'menu', label: 'Menyu', url: '/explore/menu', icon: restaurantOutline, activeIcon: restaurant },
  { tab: 'tables', label: 'Stollar', url: '/explore/tables', icon: gridOutline, activeIcon: grid },
  { tab: 'cash', label: 'Kassa', url: '/explore/cash', icon: walletOutline, activeIcon: walletOutline },
  { tab: 'order', label: 'Buyurtmalar', url: '/explore/order', icon: receiptOutline, activeIcon: receipt },
  { 
  tab: 'statistic', 
  label: 'Statistika', 
  url: '/explore/statistic', 
  icon: barChartOutline,      // Oddiy holatda chiziqli grafik
  activeIcon: barChartSharp   // Aktiv holatda to'qroq grafik
},
];

const navigate = async (url) => {
  if (route.path === url) return;
  
  try {
    // Mobil qurilmada yengil "tarsillash" effekti
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {}
  
  router.push(url);
};
</script>

<style scoped>
/* iPhone va zamonaviy Androidlardagi pastki "Home bar" uchun xavfsiz masofa */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Tugmani bosganda butun element biroz kichrayishi (Feedback) */
.group:active {
  transform: scale(0.92);
}

/* Webkit tap-blue effektini o'chirish */
div {
  -webkit-tap-highlight-color: transparent;
}

/* Silliq animatsiyalar uchun */
ion-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>