<template>
  <ion-header class="ion-no-border">
    <ion-toolbar 
      class="pt-safe transition-all duration-500 bg-indigo-600 dark:bg-slate-900 border-b border-white/10 shadow-lg"
    >
      <div class="flex items-center justify-between w-full h-20 px-4 py-0">
        
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md active:scale-90 transition-transform cursor-pointer">
            <ion-menu-button class="text-white custom-menu-button text-lg"></ion-menu-button>
          </div>

          <div class="flex flex-col">
            <h1 class="flex items-center text-2xl font-black tracking-tighter text-white group cursor-default mt-3">
  <span class="relative">
    Lattico
    <span class="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
  </span>

  <!-- <span class="text-white dark:text-indigo-600 italic">.uz</span> -->
</h1>
            <!-- <p class="text-[8px] font-medium text-indigo-200/60 uppercase tracking-widest mt-1">Premium System</p> -->
          </div>
        </div>

        <div class="flex items-center space-x-2.5">
          
          <button 
            @click="toggleTheme" 
            class="flex items-center justify-center w-10 h-10 border border-white/10 rounded-xl bg-white/5 text-white active:scale-90 transition-all"
          >
            <ion-icon 
              :icon="isDark ? sunnyOutline : moonOutline" 
              class="text-lg" 
            />
          </button>

          <button class="relative flex items-center justify-center w-10 h-10 border border-white/10 rounded-xl bg-white/5 text-white active:scale-90 transition-all">
            <ion-icon :icon="notificationsOutline" class="text-lg" />
            <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-400 rounded-full border-2 border-indigo-600 dark:border-slate-900"></span>
          </button>
          
          <router-link to="/explore/profile" class="no-underline">
  <div class="p-[1.5px] rounded-xl bg-gradient-to-tr from-indigo-400 to-white/20 active:scale-95 transition-transform shadow-md">
    <div class="bg-indigo-700 dark:bg-slate-800 rounded-[11px] overflow-hidden">
      <img 
        src="https://ui-avatars.com/api/?name=Umid+Shomurodov&background=4f46e5&color=fff&font-size=0.33&bold=true" 
        class="w-8 h-8 object-cover" 
      />
    </div>
  </div>
</router-link>
          
        </div>

      </div>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { IonHeader, IonToolbar, IonIcon, IonMenuButton } from '@ionic/vue';
import { book, notificationsOutline, moonOutline, sunnyOutline } from 'ionicons/icons';

const isDark = ref(false);

// Tizim va LocalStorage tekshiruvi
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true;
    updateDOM(true);
  } else {
    isDark.value = false;
    updateDOM(false);
  }
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
};

// Rejim o'zgarganda ishlaydi
watch(isDark, (newVal) => {
  updateDOM(newVal);
});

function updateDOM(dark) {
  if (dark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}
</script>

<style scoped>
ion-toolbar {
  --background: transparent;
  --border-width: 0;
}

.scale-fade-enter-active, .scale-fade-leave-active {
  transition: all 0.3s ease;
}
.scale-fade-enter-from { transform: scale(0) rotate(-90deg); opacity: 0; }
.scale-fade-leave-to { transform: scale(0) rotate(90deg); opacity: 0; }
</style>