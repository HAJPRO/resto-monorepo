<template>
  <ion-page>
    <Tabels />
    <PaymentModal />
  </ion-page>
</template>

<script setup>
import { IonPage } from "@ionic/vue";
import Tabels from "./Tabels.vue";
import PaymentModal from "./PaymentModal.vue";
</script>