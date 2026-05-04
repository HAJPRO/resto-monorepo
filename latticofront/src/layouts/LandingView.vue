<template>
  <ion-page id="main-content">
    <!-- <Header /> -->

    <ion-content class="bg-white dark:bg-slate-900">
      <ion-refresher slot="fixed" @ionRefresh="handleGlobalRefresh($event)">
        <ion-refresher-content
          pulling-text="Yangilash uchun pastga torting"
          refreshing-spinner="circles"
        ></ion-refresher-content>
      </ion-refresher>

      <ion-router-outlet />
    </ion-content>

  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonRouterOutlet, IonRefresher, IonRefresherContent } from '@ionic/vue';
// import Header from '../partials/Header.vue';
// import Footer from '../partials/Footer.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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