<template>
  <transition 
    enter-active-class="animate__animated animate__fadeIn" 
    leave-active-class="animate__animated animate__fadeOut"
  >
    <div 
      v-if="lockStore.isLocked" 
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl transition-colors duration-500"
    >
      <div class="w-full max-w-md p-8 text-center space-y-8">
        
        <div class="space-y-4">
          <div class="w-24 h-24 mx-auto rounded-[2.5rem] bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-2xl">
            <div class="w-full h-full rounded-[2.3rem] bg-white dark:bg-slate-900 flex items-center justify-center text-3xl">
                <ion-icon :icon="lockClosedOutline" class="text-indigo-600 dark:text-indigo-500" />
            </div>
          </div>
          <div class="space-y-1">
            <h2 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Tizim Bloklangan</h2>
            <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Davom etish uchun PIN-kodni kiring</p>
          </div>
        </div>

        <div class="flex justify-center gap-3">
          <div v-for="(n, i) in 4" :key="i" 
            :class="[
              'w-4 h-4 rounded-full border-2 transition-all duration-300',
              pin.length > i 
                ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 scale-125 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                : 'border-slate-300 dark:border-slate-600'
            ]">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
          <button v-for="num in [1,2,3,4,5,6,7,8,9]" :key="num" @click="addDigit(num)"
            class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xl font-black transition-all active:scale-90 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
            {{ num }}
          </button>

          <button @click="clear" 
            class="w-16 h-16 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-500 text-sm font-black uppercase transition-all active:scale-90">
            C
          </button>

          <button @click="addDigit(0)" 
            class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xl font-black transition-all active:scale-90 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
            0
          </button>

          <button @click="backspace" 
            class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center transition-all active:scale-90 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <ion-icon :icon="backspaceOutline" class="text-2xl" />
          </button>
        </div>

        <p v-if="error" class="text-rose-600 dark:text-rose-500 text-[10px] font-black uppercase animate__animated animate__headShake">
          Xato PIN-kod kiritildi!
        </p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { LockStore } from '../../stores/index.store';
import { backspaceOutline, lockClosedOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/vue';

const lockStore = LockStore();
const pin = ref('');
const error = ref(false);

const addDigit = (n) => {
  if (pin.value.length < 4) {
    pin.value += n;
    error.value = false;
  }
};

const clear = () => pin.value = '';
const backspace = () => pin.value = pin.value.slice(0, -1);

watch(pin, (newPin) => {
  if (newPin.length === 4) {
    setTimeout(() => {
      const success = lockStore.unlock(newPin);
      if (!success) {
        error.value = true;
        pin.value = '';
      }
    }, 300);
  }
});
</script>