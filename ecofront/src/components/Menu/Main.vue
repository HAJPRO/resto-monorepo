<template>
  <ion-page>
    <List />
    <ActionModal />
    <AddCategoryModal />
  </ion-page>
</template>

<script setup>
import { IonPage } from "@ionic/vue";
import List from "./List.vue";
import ActionModal from "./ActionModal.vue";
import AddCategoryModal from "./AddCategoryModal.vue";
</script>