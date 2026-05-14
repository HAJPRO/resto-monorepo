<template>
  <ion-page class="bg-slate-50 dark:bg-slate-950">
   <Header 
      title="Hisobni to'ldirish" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="Hisob qidirish..."
    >
      <template #actions>
        <!-- <Button @click="handleCreate" icon="fas fa-plus-circle" size="sm" /> -->
      </template>
    </Header>

    <ion-content :force-overscroll="false" class="--background: transparent">
      <div class="max-w-4xl mx-auto p-5 space-y-8">
        
        <div class="relative overflow-hidden p-6 rounded-[32px] bg-indigo-600 dark:bg-indigo-500 shadow-2xl shadow-indigo-500/20 text-white">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Sizning balansigiz</p>
          <div class="flex items-baseline gap-2">
            <h2 class="text-3xl font-[1000] tracking-tighter">{{ savedBalance.balance }}</h2>
            <span class="text-xs font-bold opacity-80 uppercase">{{savedBalance.currency}}</span>
          </div>
        </div>

        <div class="space-y-3">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">To'lov summasi</label>
          <div class="relative group">
            <Input 
              type="number" 
              placeholder="0.00"
              v-model="amount"
              isFormatted="true"
              suffix="uzs"

            />
          </div>
        </div>

       <div class="space-y-4">
  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/80 ml-1">
    To'lov usulini tanlang
  </label>

  <div class="grid grid-cols-3 gap-3">
    
    <button 
      @click="paymentType = 'click'"
      class="group relative h-24 rounded-[2rem] border-2 transition-all duration-300 active:scale-95 overflow-hidden"
      :class="paymentType === 'click' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100 dark:border-white/5'"
    >
      <div class="absolute inset-0 w-full h-full bg-white">
        <img 
          src="https://avatars.mds.yandex.net/i?id=02fc8161b5dd2774c1568a21614fd0494a06a704-4395898-images-thumbs&n=13" 
          class="w-full h-full object-cover transition-all duration-500"
          :class="paymentType === 'click' ? 'grayscale-0 scale-105' : 'grayscale opacity-40 group-hover:opacity-100'"
        />
      </div>
      
      <div v-if="paymentType === 'click'" class="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
      
      <div v-if="paymentType === 'click'" class="absolute top-2 right-2 z-20">
        <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
           <ion-icon :icon="checkmark" class="text-xs text-white font-bold" />
        </div>
      </div>
    </button>

    <button 
      @click="paymentType = 'payme'"
      class="group relative h-24 rounded-[2rem] border-2 transition-all duration-300 active:scale-95 overflow-hidden"
      :class="paymentType === 'payme' ? 'border-cyan-500 ring-4 ring-cyan-500/10' : 'border-slate-100 dark:border-white/5'"
    >
      <div class="absolute inset-0 w-full h-full bg-white">
        <img 
          src="https://avatars.mds.yandex.net/i?id=40b15ed61cb0051c2650b2d83f8ff743a9441a7b-12569562-images-thumbs&n=13" 
          class="w-full h-full object-cover transition-all duration-500"
          :class="paymentType === 'payme' ? 'grayscale-0 scale-105' : 'grayscale opacity-40 group-hover:opacity-100'"
        />
      </div>
      
      <div v-if="paymentType === 'payme'" class="absolute inset-0 bg-cyan-500/5 pointer-events-none"></div>

      <div v-if="paymentType === 'payme'" class="absolute top-2 right-2 z-20">
        <div class="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
           <ion-icon :icon="checkmark" class="text-xs text-white font-bold" />
        </div>
      </div>
    </button>

    <button 
      @click="paymentType = 'uzum'"
      class="group relative h-24 rounded-[2rem] border-2 transition-all duration-300 active:scale-95 overflow-hidden"
      :class="paymentType === 'uzum' ? 'border-purple-600 ring-4 ring-purple-600/10' : 'border-slate-100 dark:border-white/5'"
    >
      <div class="absolute inset-0 w-full h-full bg-white">
        <img 
          src="https://avatars.mds.yandex.net/i?id=6046d7732b17eb57231a7a0dca175e5aa024d160-9181167-images-thumbs&n=13" 
          class="w-full h-full object-cover transition-all duration-500"
          :class="paymentType === 'uzum' ? 'grayscale-0 scale-105' : 'grayscale opacity-40 group-hover:opacity-100'"
        />
      </div>
      
      <div v-if="paymentType === 'uzum'" class="absolute inset-0 bg-purple-600/5 pointer-events-none"></div>

      <div v-if="paymentType === 'uzum'" class="absolute top-2 right-2 z-20">
        <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
           <ion-icon :icon="checkmark" class="text-xs text-white font-bold" />
        </div>
      </div>
    </button>

  </div>
</div>

        <div class="p-5 rounded-3xl bg-slate-100/50 dark:bg-white/5 space-y-3">
          <div class="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>To'lov turi</span>
            <span class="text-slate-800 dark:text-slate-200">{{ paymentType.toUpperCase() }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">To'lovga</span>
            <span class="text-lg font-black text-slate-800 dark:text-slate-100">{{ (amount || 0).toLocaleString() }} UZS</span>
          </div>
        </div>

        <Button 
        size="md"
        variant="primary"
        :disabled="!amount"
        class="w-full"
        leftIcon="fas fa-check"
        >
          To'lovni tasdiqlash
        </Button>

        <div class="pt-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Qo'llab-quvvatlash xizmati</p>
          <div class="flex gap-3">
            <Button @click.stop="openTelegram('+998930043936')"  class="w-full" leftIcon="fab fa-telegram-plane text-base" size="sm" variant="info">
              Telegram
            </Button>
            <Button @click.stop="openPhone('+998930043936')" class="w-full" leftIcon="fas fa-phone" size="sm" variant="success">
              Qo'ng'iroq
            </Button>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonContent, IonTitle, IonButtons, IonBackButton, IonIcon 
} from '@ionic/vue';
import { checkmark, chatboxEllipsesOutline, callOutline, paperPlaneOutline } from 'ionicons/icons';
import {Header,Button,Input} from "../../UI/UI"
import { vibrate } from '../../utils/index.util';
import { AuthStore } from '../../stores/index.store';
import { storeToRefs } from 'pinia';
const store_auth = AuthStore();
const {billing} = storeToRefs(store_auth)
// Noto'g'ri: "100" + 50 = "10050"
// To'g'ri:
const savedBalance = JSON.parse(localStorage.getItem("balance")) || {};
const openPhone = (p) => {
  if (p) {
    vibrate('medium');
    const cleanPhone = p.toString().replace(/[^\d+]/g, '');
    window.open(`tel:${cleanPhone}`, '_system');
  } else {
    notify('WARNING');
  }
};

const openTelegram = (p) => {
  if (p) {
    vibrate('light');
    const cleanPhone = p.toString().replace(/\D/g, '');
    window.open(`https://t.me/+${cleanPhone}`, '_system');
  } else {
    notify('WARNING');
  }
};
const amount = ref('');
const paymentType = ref('click');
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera uchun spinnerni olib tashlash */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>