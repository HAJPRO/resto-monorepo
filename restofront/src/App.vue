<template>
  <ion-app>
    <ion-router-outlet />
    
    <!-- <ToastContainer /> -->

    <LockScreen />
  </ion-app>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import LockScreen from "./components/Lock/LockScreen.vue";
import { LockStore } from "./stores/index.store";

const lockStore = LockStore();
let timeout = null;

const resetTimer = () => {
  if (lockStore.isLocked) {
    if (timeout) clearTimeout(timeout);
    return;
  }

  if (timeout) clearTimeout(timeout);
  
  // 10 daqiqa (600,000 ms)
  timeout = setTimeout(() => {
    lockStore.lock();
  }, 300000); 
};

// Blokdan chiqishni kuzatish
watch(() => lockStore.isLocked, (locked) => {
  if (!locked) resetTimer();
});

onMounted(() => {
  const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click'];
  
  events.forEach(event => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();
});

onUnmounted(() => {
  const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click'];
  events.forEach(event => {
    window.removeEventListener(event, resetTimer);
  });
  if (timeout) clearTimeout(timeout);
});
</script>

<style>
:root {
  --ion-font-family: 'Inter', sans-serif;
}

/* Blokirovka oynasi silliq chiqishi uchun animatsiya */
.animate__animated {
  animation-duration: 0.4s;
}
</style>