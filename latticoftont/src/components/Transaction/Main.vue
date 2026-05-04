<template>
  <ion-page class="flex flex-col bg-slate-50 dark:bg-slate-950">
    <List class="flex-1" />
  </ion-page>
</template>

<script setup>
import { IonPage } from "@ionic/vue";
import List from "./List.vue";
</script>

<style scoped>
/* Ba'zida ion-page ning ichki shadow-dom'i flexni cheklashi mumkin, 
shuning uchun quyidagilarni qo'shish xatolikni aniq tuzatadi */
ion-page {
  display: flex !important;
  flex-direction: column !important;
}

/* List komponenti butun bo'sh joyni egallashi uchun */
:deep(List) {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>