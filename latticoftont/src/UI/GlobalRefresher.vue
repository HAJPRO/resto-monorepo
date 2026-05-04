<template>
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
    <ion-refresher-content
      pulling-text="Yangilash uchun torting..."
      refreshing-spinner="circles"
      refreshing-text="Yuklanmoqda..."
    ></ion-refresher-content>
  </ion-refresher>
</template>

<script setup>
import { IonRefresher, IonRefresherContent } from '@ionic/vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const handleRefresh = async (event) => {
  await Haptics.impact({ style: ImpactStyle.Medium });
  
  // Sahifani to'liq yangilash
  setTimeout(() => {
    window.location.reload();
    event.target.complete();
  }, 500);
};
</script>