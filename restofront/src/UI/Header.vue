<template>
  <ion-header class="ion-no-border">
    <div class="relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 pt-safe overflow-hidden transition-all duration-300">
      
      <transition name="slide-fade">
        <div v-if="!isSearchActive" class="px-4 h-14 mt-10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Button v-if="showBack" @click="handleBack" icon="fas fa-arrow-left" size="sm" />
            
            <h1 class="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-3">
              {{ title }}
            </h1>
          </div>

          <div class="flex items-center gap-2">
            <Button v-if="searchable" @click="toggleSearch" icon="fas fa-search" size="sm" />
            
            <slot name="actions"></slot>
          </div>
        </div>
      </transition>

      <transition name="search-slide">
        <div v-if="isSearchActive" class="mt-10 px-4 h-14 flex items-center gap-2 bg-white dark:bg-slate-950 shadow-sm">
          <div class="flex-1">
            <Input 
              v-model="internalSearchQuery"
              size="small" 
              clearable 
              iconPre="fas fa-search" 
              :placeholder="searchPlaceholder" 
              autofocus
            />
          </div>

          <Button 
            @click="toggleSearch" 
            size="sm"
            icon="fas fa-xmark"
            class="mt-[-20px]"
          />
        </div>
      </transition>

    </div>
  </ion-header>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { IonHeader } from '@ionic/vue';
import { Button, Input } from '../UI/UI'; // O'zingizning UI yo'lingizni yozing

const props = defineProps({
  title: { type: String, default: 'Sarlavha' },
  showBack: { type: Boolean, default: true },
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: 'Izlash...' },
  modelValue: { type: String, default: '' } // Qidiruv matni uchun v-model
});

const emit = defineEmits(['update:modelValue', 'onSearchToggle']);
const router = useRouter();

const isSearchActive = ref(false);
const internalSearchQuery = ref(props.modelValue);

// Qidiruv matni o'zgarganda emit qilish
watch(internalSearchQuery, (newVal) => {
  emit('update:modelValue', newVal);
});

const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value;
  if (!isSearchActive.value) internalSearchQuery.value = '';
  emit('onSearchToggle', isSearchActive.value);
};

const handleBack = () => {
  router.back();
};
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active,
.search-slide-enter-active, .search-slide-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.search-slide-enter-from, .search-slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>