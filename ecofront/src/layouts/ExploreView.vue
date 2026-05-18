<template>
  <Sidebar />

  <ion-page id="main-content">
    <!-- <Header /> -->

    <ion-content class="bg-white dark:bg-slate-900" :scroll-y="true">
     <GlobalRefresher @refresh="handleGlobalRefresh" />

      <ion-router-outlet />
    </ion-content>

    <!-- <Footer /> -->
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonRouterOutlet, IonRefresher, IonRefresherContent } from '@ionic/vue';
// import Header from '../partials/Header.vue';
// import Footer from '../partials/Footer.vue';
import Sidebar from '../partials/Sidebare.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import GlobalRefresher from '../UI/GlobalRefresher.vue';

const handleGlobalRefresh = async (event) => {
  try {
    // 1. Mobil tebranish
    await Haptics.impact({ style: ImpactStyle.Light });

    // 2. Global event yuborish (Sizning aktiv sahifangiz buni eshitadi)
    window.dispatchEvent(new CustomEvent('app-refresh-data'));

    // 3. Spinnerni to'xtatish (masalan 1.5 soniyadan keyin)
    setTimeout(() => {
      event.target.complete();
    }, 1500);
  } catch (e) {
    event.target.complete();
  }
};
</script>
<style >
/* 1. Chrome, Safari va Capacitor WebView uchun */
ion-content::part(scroll)::-webkit-scrollbar {
  width: 1px !important;    /* Vertikal chiziq qalinligi */
  height: 1px !important;   /* Gorizontal chiziq balandligi */
}

ion-content::part(scroll)::-webkit-scrollbar-track {
  background: transparent !important;
}

ion-content::part(scroll)::-webkit-scrollbar-thumb {
  background: #e5e4eb !important; /* Light mode */
}

/* Dark mode uchun */
.dark ion-content::part(scroll)::-webkit-scrollbar-thumb {
  background: #0a61da !important; /* Dark mode */
}

/* 2. Firefox uchun */
ion-content::part(scroll) {
  scrollbar-width: thin !important;
  scrollbar-color: #4d69d8 transparent !important;
}
</style>