<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617]">
    <Setting :key="$route.fullPath"/>
    
  </ion-page>
</template>

<script setup>
import { IonPage } from "@ionic/vue";
import Setting from "./Setting.vue";


</script>
