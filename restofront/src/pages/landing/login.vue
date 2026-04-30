<template>
  <ion-page>
    <ion-content :force-overscroll="false" class="ion-padding" style="--background: #020617;">
      
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content refreshing-spinner="crescent"></ion-refresher-content>
      </ion-refresher>

      <form @submit.prevent="handleManualLogin" class="flex flex-col items-center justify-center min-h-full py-8 px-6">
        
       

        <ion-popover trigger="lang-trigger" trigger-action="click" dismiss-on-select="true" mode="ios" class="language-popover">
           <div class="p-2 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[22px] shadow-3xl space-y-1">
            <button v-for="lang in languages" :key="lang.code" @click="setLanguage(lang.code)"
              :class="currentLang === lang.code ? 'bg-indigo-600/10 border-indigo-500/30' : 'border-transparent'"
              class="w-full flex items-center space-x-3 px-3 py-2 rounded-xl border transition-all"
            >
              <img :src="lang.flag" class="w-5 h-5 rounded-full object-cover" />
              <span class="text-xs font-bold dark:text-white">{{ lang.label }}</span>
            </button>
          </div>
        </ion-popover>

        <div class="w-full max-w-sm space-y-4 animate-slide-up border border-slate-200 dark:border-white/10 rounded-[28px] p-7 bg-white/10 dark:bg-white/5 backdrop-blur-2xl shadow-2xl">
         <div class="absolute top-0 left-0 right-0 px-6 z-[100] flex justify-between items-center pt-safe h-20 bg-transparent">
  
  <div class="flex items-center">
    <button 
      id="lang-trigger"
      class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl 
             bg-white/10 dark:bg-white/5 
             backdrop-blur-md border border-white/20 dark:border-white/10 
             shadow-lg shadow-black/5
             active:scale-95 transition-all duration-300 group"
    >
      <div class="w-5 h-5 rounded-full overflow-hidden border border-white/30 shadow-sm flex-shrink-0">
        <img :src="getSelectedFlag(currentLang)" class="w-full h-full object-cover scale-110" />
      </div>
      
      <ion-icon 
        :icon="chevronDownOutline" 
        class="text-[12px] text-slate-500 dark:text-slate-400 group-hover:translate-y-0.5 transition-transform duration-300"
      ></ion-icon>
    </button>

    <ion-popover trigger="lang-trigger" trigger-action="click" dismiss-on-select="true" mode="ios" class="language-popover">
      <div class="p-2 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border border-white/20 rounded-[24px] shadow-2xl space-y-1">
        <button 
          v-for="lang in languages" 
          :key="lang.code"
          @click="setLanguage(lang.code)"
          :class="currentLang === lang.code 
            ? 'bg-blue-600 dark:bg-blue-600 shadow-md shadow-blue-500/20' 
            : 'hover:bg-slate-100 dark:hover:bg-white/5'"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
        >
          <img :src="lang.flag" class="w-5 h-5 rounded-full object-cover border border-white/20" />
          <div class="flex flex-col text-left">
            <span :class="currentLang === lang.code ? 'text-white' : 'text-slate-700 dark:text-slate-200'" class="text-[11px] font-bold leading-tight">
              {{ lang.label }}
            </span>
            <span :class="currentLang === lang.code ? 'text-blue-100' : 'text-slate-400'" class="text-[9px] uppercase tracking-wider font-medium">
              {{ lang.native }}
            </span>
          </div>
        </button>
      </div>
    </ion-popover>
  </div>

  <button 
    @click="toggleTheme" 
    class="w-10 h-10 flex items-center justify-center rounded-2xl 
           bg-white/10 dark:bg-white/5 
           backdrop-blur-md border border-white/20 dark:border-white/10 
           shadow-lg shadow-black/5
           active:scale-90 transition-all duration-500 
           hover:bg-white/20 dark:hover:bg-white/10"
  >
    <div class="relative w-6 h-6 flex items-center justify-center">
      <transition name="icon-rotate" mode="out-in">
        <ion-icon 
          v-if="isDarkMode" 
          :key="'sun'"
          :icon="sunny" 
          class="text-xl text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
        ></ion-icon>
        <ion-icon 
          v-else 
          :key="'moon'"
          :icon="moon" 
          class="text-xl text-blue-600 drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]"
        ></ion-icon>
      </transition>
    </div>
  </button>
</div>
          <div class="w-full max-w-sm mb-2 mt-8 mx-auto">
  <div class="flex flex-col items-center justify-center mt-16">
    
    <div class="flex items-center gap-4 group">
      <div class="relative flex items-center justify-center w-12 h-12 rounded-2xl 
                  bg-gradient-to-br from-blue-700 to-indigo-800 
                  shadow-[0_12px_24px_-5px_rgba(37,99,235,0.4)] 
                  transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3">
        <ion-icon :icon="restaurant" class="text-2xl text-white"></ion-icon>
        
        <div class="absolute inset-0 rounded-2xl border border-white/20"></div>
      </div>

      <h1 class="flex items-center gap-1 text-4xl font-black tracking-tighter select-none mt-3">
  <span class="text-slate-900 dark:text-white transition-colors duration-300">
    Resto
  </span>
  <span class="relative">
    <span class="text-indigo-600 dark:text-indigo-400 italic">.uz</span>
    <span class="absolute -bottom-1 left-0 w-full h-1 bg-indigo-500/20 blur-sm rounded-full"></span>
  </span>
</h1>
    </div>

  </div>
</div>
          <div class="space-y-1">
            <label class="text-[9px] font-bold text-indigo-600 uppercase ml-2 tracking-widest opacity-80">Server</label>
            <Input 
              iconPre="fas fa-server"
              clearable
              v-model="loginForm.companyCode"
              placeholder="Zavod serveri"
              class="custom-input"
            />
          </div>

          <div class="space-y-1">
            <label class="text-[9px] font-bold text-indigo-600 uppercase ml-2 tracking-widest opacity-80">Foydalanuvchi</label>
            <Input 
              iconPre="fas fa-user-shield"
              clearable
              v-model="loginForm.username"
              placeholder="Login"
            />
          </div>

          <div class="space-y-1">
            <label class="text-[9px] font-bold text-indigo-600 uppercase ml-2 tracking-widest opacity-80">Parol</label>
            <Input
              iconPre="fas fa-lock"
              clearable
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••"
            />
          </div>

          <div class="pt-4">
            <Button
              rightIcon="fas fa-arrow-right"
              variant="primary"
              @click="handleManualLogin"
              :disabled="isProcessing"
              class="w-full h-14 !rounded-2xl shadow-lg shadow-blue-500/20 font-bold"
            >
              Tizimga kirish
            </Button>
          </div>
          
          <p class="text-[10px] text-center text-slate-500 uppercase tracking-widest pt-2">
            Restaran boshqaruv tizimi v{{ version }}
          </p>
        </div>

      </form>
    </ion-content>
  </ion-page>
</template>



<script setup>
import { ref, reactive } from 'vue';
import {AuthStore} from "../../stores/index.store"
import { storeToRefs } from 'pinia';
const store_auth = AuthStore();
const {} = storeToRefs(store_auth)
import { useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonIcon, IonPopover,
  IonRefresher, IonRefresherContent, alertController 
} from '@ionic/vue';
import { 
  restaurant, 
   
 sunny, moon, chevronDownOutline, checkmarkOutline,
 water, 
  
} from 'ionicons/icons';
import pkg from '../../../package.json';
const version = pkg.version;
// Native Plugins
// import { NativeBiometric } from 'capacitor-native-biometric';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {Input,Button} from "../../UI/UI"
const router = useRouter();
const isProcessing = ref(false);
// const isLoadingBiometric = ref(false);
const showPassword = ref(false);
const isDarkMode = ref(true);
const currentLang = ref('UZ');

// --- Tillar va Bayroqlar logikasi ---
const getFlagPath = (code) => {
  // Vite uchun local assets yo'lini to'g'ri generatsiya qilish
  return new URL(`../../../assets/${code.toLowerCase()}.png`, import.meta.url).href;
};

const languages = [
  { code: 'UZ', label: "O'zbekcha", native: 'Uzbekistan', flag: getFlagPath('uz') },
  { code: 'RU', label: 'Русский', native: 'Russia', flag: getFlagPath('ru') },
  { code: 'EN', label: 'English', native: 'United States', flag: getFlagPath('us') }
];

// Tanlangan tilning bayrog'ini olish uchun yordamchi funksiya
const getSelectedFlag = (code) => {
  return languages.find(l => l.code === code)?.flag || '';
};



// --- Helpers ---
const triggerHaptic = async (style = ImpactStyle.Light) => {
  try { await Haptics.impact({ style }); } catch (e) {
    console.log('Haptics not available');
  }
};

const showAlert = async (header, message, status = 'success') => {
  const alert = await alertController.create({
    header,
    message,
    mode: 'ios',
    buttons: [{
      text: 'OK',
      cssClass: status === 'error' ? 'text-red-500' : 'text-indigo-500'
    }],
  });
  await alert.present();
};

const handleRefresh = (event) => {
  setTimeout(() => { event.target.complete(); }, 1500);
};

// --- Actions ---
const setLanguage = async (lang) => {
  await triggerHaptic();
  currentLang.value = lang;
};

const toggleTheme = async () => {
  await triggerHaptic();
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// loginForm'ni to'g'irlangan holati
const loginForm = reactive({
  companyCode: '',
  username: '',
  password: ''
});

// handleManualLogin funksiyasini biroz kengaytiramiz
const handleManualLogin = async () => {
  // 1. Validatsiya
  if (!loginForm.companyCode || !loginForm.username || !loginForm.password) {
    await triggerHaptic(ImpactStyle.Medium);
    return showAlert("Xatolik", "Barcha maydonlarni to'ldiring", 'error');
  }
  
  isProcessing.value = true;
  await triggerHaptic(ImpactStyle.Medium);
  
  try {
    // 2. Delay simulyatsiyasi (ixtiyoriy, agar kerak bo'lsa)
    // await new Promise(resolve => setTimeout(resolve, 1500)); 

    // 3. API ulanishi (Store orqali)
    console.log("Yuborilayotgan ma'lumot:", loginForm);
    
    // Muhim: await aynan shu yerda bo'lishi kerak
    const response = await store_auth.login(loginForm);

    if (response) {
      await triggerHaptic(ImpactStyle.Heavy);
      router.push('/explore/home');
    }
  } catch (err) {
    // 4. Xatolikni ushlash
    console.error("Login Error:", err);
    showAlert("Xato", err.response?.data?.message || "Server bilan ulanishda xatolik", "error");
  } finally {
    // 5. Har qanday holatda ham loadingni o'chirish
    isProcessing.value = false;
  }
};

// const handleBiometricLogin = async () => {
//   isLoadingBiometric.value = true;
//   await triggerHaptic(ImpactStyle.Light);
  
//   try {
//     const result = await NativeBiometric.isAvailable();
//     if (!result.isAvailable) throw new Error("Biometrika mavjud emas");

//     const verified = await NativeBiometric.verify({
//       reason: "Xavfsiz kirish uchun shaxsingizni tasdiqlang",
//       title: "Resto.uz Xavfsizlik",
//       subtitle: "Biometrik kirish",
//       description: "Barmog'ingizni datchikka qo'ying"
//     });

//     if (verified) {
//       await triggerHaptic(ImpactStyle.Heavy);
//       router.push('/explore/home');
//     }
//   } catch (error) {
//     // Web muhitda test qilish uchun fallback
//     if (error.message?.includes("not implemented") || error.message?.includes("web")) {
//       console.warn("Biometrika faqat real qurilmada ishlaydi");
//       setTimeout(() => { router.push('/explore/home'); }, 1000);
//     } else {
//       await showAlert("Xato", "Biometrik identifikatsiya amalga oshmadi.", 'error');
//     }
//   } finally {
//     setTimeout(() => { isLoadingBiometric.value = false; }, 500);
//   }
// };
</script>

<style scoped>
/* 🎨 UI Animations */
.animate-slide-up {
  animation: slideUp 0.8s cubic-bezier(0.2, 1, 0.2, 1) forwards;
}

.animate-fade-in-down {
  animation: fadeInDown 0.7s ease-out forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-25px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 🌓 Icon Rotate Animation */
.icon-rotate-enter-active,
.icon-rotate-leave-active {
  transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-rotate-enter-from { opacity: 0; transform: rotate(-120deg) scale(0.4); }
.icon-rotate-leave-to { opacity: 0; transform: rotate(120deg) scale(0.4); }

/* 📱 Popover (Dropdown) Customizing */
.language-popover {
  --background: transparent;
  --box-shadow: none;
  --width: 190px;
}

.language-popover::part(content) {
  border-radius: 28px;
  background: rgba(2, 6, 23, 0.88);
  backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8);
  overflow: hidden;
}

/* 🛠 Utility */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}

input:-webkit-autofill {
  -webkit-text-fill-color: white !important;
  -webkit-box-shadow: 0 0 0px 1000px #0f172a inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

button:active {
  transform: scale(0.96);
}
/* Minimalistik ko'rinish uchun qo'shimcha stil */
.custom-input {
  --background: transparent;
  --border-radius: 16px;
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>