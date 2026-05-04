<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617] select-none">
    <!-- 1. HEADER (Har doim tepada) -->
    <Header 
      title="Sut qabul qilish" 
      :searchable="isShiftOpen" 
      v-model="searchQuery" 
    >
      <template #actions>
        <div class="flex items-center gap-1">
          <Button 
            v-if="isShiftOpen"
            @click="showCloseModal = true" 
            icon="fas fa-power-off" 
            color="danger" 
            size="sm" 
          />
        </div>
      </template>
    </Header>

    <!-- 2. STICKY SEGMENT TABS (Faqat smena ochiq bo'lsa) -->
    <div 
      v-if="isShiftOpen" 
      class="sticky-tabs-container"
    >
      <SegmentTabs 
        :tabs="Tabs" 
        v-model="activeTab" 
        @reorder="handleReorder"
      />
    </div>

    <!-- 3. MAIN CONTENT -->
    <ion-content :fullscreen="true" class="ion-padding">
      <GlobalRefresher @refresh="refreshData" />

   
    </ion-content>

   
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { IonPage, IonContent, IonModal } from '@ionic/vue';
import { Button,Input, Header, GlobalRefresher, SegmentTabs,Select } from '../../UI/UI'; // UI yo'lingizni tekshiring
import { vibrate, notify } from '../../utils/index.util';
const Tabs = [
  { id: 'cash', label: 'Asosiy', routeName: 'cash', icon: 'fas fa-home' },
  { id: 'order', label: 'Buyurtmalar', routeName: 'order', icon: 'fas fa-list' },
    { id: 'tables', label: 'Stollar', routeName: 'tables', icon: 'fas fa-table' },
    { id: 'statistic', label: 'Statistika', routeName: 'statistic', icon: 'fas fa-chart-bar' },
   

];






const filteredTransactions = computed(() => {
  if (!searchQuery.value) return transactions.value;
  return transactions.value.filter(tx => tx.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
});




</script>

<style scoped>

/* Animatsiyalar */
.animate-tab {
  animation: tabSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes tabSlide {
  from { opacity: 0; transform: scale(0.98) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.quick-action-btn {
  @apply flex flex-col items-center gap-2 transition-all active:scale-90 outline-none;
}
.quick-action-btn span {
  @apply text-[10px] font-black uppercase text-slate-400 tracking-tighter;
}

.pos-modal {
  --height: 480px;
  --border-radius: 40px;
}
</style>