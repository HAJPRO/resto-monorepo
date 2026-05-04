<template>
  <ion-app>
    <ion-router-outlet />
    <ToastContainer/>
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import ToastContainer from "./UI/Toast.vue";
</script>

<style>
/* Global Tailwind yoki maxsus stillar */
:root {
  --ion-font-family: 'Inter', sans-serif;
}
</style>