<template>
  <ion-page class="bg-slate-50 dark:bg-[#020617]">
    <Header 
      title="Kontragentlar" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="Nomi yoki telefon..."
    >
      <template #actions>
        <div class="flex gap-2">
          <Button @click="openAddModal" icon="fas fa-plus" color="primary" size="sm" />
          <Button @click="toggleStats = !toggleStats" :icon="toggleStats ? 'fas fa-chart-line' : 'fas fa-eye-slash'" variant="soft" size="sm" />
        </div>
      </template>
    </Header>

    <ion-content :fullscreen="true" class="ion-padding">
      <GlobalRefresher @refresh="refreshCounterparties" />
      
      <LoadingState v-if="loading"/>
      
      <div v-else class="max-w-full mx-auto pb-10 p-4">
        
        <transition name="slide-fade">
          <div v-if="toggleStats" class="grid grid-cols-2 gap-3 mb-6">
            
            <div class="col-span-2 bg-gradient-to-r from-indigo-600 to-violet-600 p-5 rounded-[32px] text-white shadow-lg shadow-indigo-500/20">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest opacity-80">Umumiy kontragentlar</p>
                  <h3 class="text-3xl font-black mt-1">
                    {{ counterparties.length }} 
                    <span class="text-sm font-medium opacity-70 ml-1">ta</span>
                  </h3>
                </div>
                <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <i class="fas fa-address-book text-xl"></i>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Debitorlik (Qarzimiz)</p>
              </div>
              <h3 class="text-xl font-black text-rose-500">
                {{ totalDebt }}
              </h3>
            </div>

            <div class="bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Kreditorlik (Haqqimiz)</p>
              </div>
              <h3 class="text-xl font-black text-emerald-500">
                {{ totalCredit }}
              </h3>
            </div>
          </div>
        </transition>

        <div v-if="filteredCounterparties.length > 0" class="space-y-2 mt-2">
          <div 
            v-for="item in filteredCounterparties" 
            :key="item._id"
            class="bg-white dark:bg-slate-900 rounded-[35px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm transition-all active:scale-[0.98]"
          >
            <div class="p-5">
              <div class="flex items-start gap-4">
                <div class="relative">
                  <img 
                    v-if="item.image" 
                    :src="item.image" 
                    class="w-16 h-16 rounded-[24px] object-cover shadow-md"
                  />
                  <div v-else class="w-16 h-16 rounded-[24px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500 text-2xl font-black">
                    {{ item.name?.charAt(0) }}
                  </div>
                  <div 
                    v-if="item.status === 'active'" 
                    class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full"
                  ></div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-black text-slate-900 dark:text-white text-lg truncate leading-tight">
                        {{ item.name }}
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <span 
                          class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider"
                          :class="getTypeClass(item.type)"
                        >
                          {{ item.type === 'legal_entity' ? 'Yuridik' : 'Jismoniy' }}
                        </span>
                        <span class="text-[11px] font-bold text-slate-400">ID: {{ item._id?.slice(-5) }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <p 
                        class="text-sm font-black" 
                        :class="item.balance < 0 ? 'text-rose-500' : item.balance > 0 ? 'text-emerald-500' : 'text-slate-400'"
                      >
                        {{ item.balance?.toLocaleString() }} <span class="text-[10px]">so'm</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4 py-3 border-y border-slate-50 dark:border-white/5">
                <div class="flex items-start gap-2">
                  <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                    <i class="fas fa-location-dot text-[10px]"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="text-[9px] text-slate-400 font-bold uppercase leading-none">Manzil</p>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-1">{{ item.address || 'Kiritilmagan' }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-2">
                  <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                    <i class="fas fa-handshake text-[10px]"></i>
                  </div>
                  <div>
                    <p class="text-[9px] text-slate-400 font-bold uppercase leading-none">Amallar</p>
                    <p class="text-[11px] text-indigo-600 font-black mt-1">{{ item.transactionCount || 0 }} ta</p>
                  </div>
                </div>
              </div>

              <div class="flex gap-2 mt-4">
                <button 
                  @click.stop="callCounterparty(item.phone)"
                  class="flex-1 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center gap-2 text-xs font-black transition-transform active:scale-95"
                >
                  <i class="fas fa-phone-alt"></i> QO'NG'IROQ
                </button>
                <button 
                  @click.stop="openTelegram(item.phone)"
                  class="flex-1 h-11 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 flex items-center justify-center gap-2 text-xs font-black transition-transform active:scale-95"
                >
                  <i class="fab fa-telegram-plane text-base"></i> TELEGRAM
                </button>
                <ActionMenu 
                  :items="getTableActions(item)" 
                  @click.stop 
                  class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center active:rotate-12 transition-all"
                >
                  <i class="fas fa-ellipsis-h"></i>
                </ActionMenu>
              </div>
            </div>
          </div>
        </div>

        <EmptyState v-else title="Kontragent topilmadi" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { IonPage, IonContent } from "@ionic/vue";
import { CounterpartyStore } from "../../stores/index.store";
import { storeToRefs } from "pinia";
import { Button, Header, GlobalRefresher, EmptyState, LoadingState, ActionMenu } from "../../UI/UI";
import { vibrate, notify } from "../../utils/index.util";

const store_counterparty = CounterpartyStore();
const { counterparties, loading } = storeToRefs(store_counterparty);

const searchQuery = ref("");
const toggleStats = ref(true);

const getTableActions = (item) => [
  { label: 'Tahrirlash', icon: 'fa-solid fa-pen-to-square', onClick: () => editCounterparty(item) },
  { label: 'Akt sveryka', icon: 'fa-solid fa-file-invoice', onClick: () => console.log('Report', item._id) },
  { label: 'O\'chirish', icon: 'fa-solid fa-trash', variant: 'danger', onClick: () => {} }
];

onMounted(() => store_counterparty.getAll());

const filteredCounterparties = computed(() => {
  if (!searchQuery.value) return counterparties.value;
  const q = searchQuery.value.toLowerCase();
  return counterparties.value.filter(c => 
    c.name?.toLowerCase().includes(q) || c.phone?.includes(q)
  );
});

const totalDebt = computed(() => {
  const sum = counterparties.value.reduce((acc, c) => acc + (c.balance < 0 ? c.balance : 0), 0);
  return Math.abs(sum).toLocaleString() + " so'm";
});

const totalCredit = computed(() => {
  const sum = counterparties.value.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);
  return sum.toLocaleString() + " so'm";
});

const getTypeClass = (type) => {
  switch(type) {
    case 'legal_entity': return 'bg-amber-100 text-amber-600 dark:bg-amber-500/20';
    case 'individual': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20';
    default: return 'bg-slate-100 text-slate-500 dark:bg-white/10';
  }
};

const callCounterparty = (p) => {
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

const editCounterparty = (item) => {
  vibrate('light');
  store_counterparty.openModal({ action: 'edit', data: item });
};

const openAddModal = () => {
  vibrate('heavy');
  store_counterparty.openModal({ action: 'create' });
};

const refreshCounterparties = async (e) => {
  await store_counterparty.getAll();
  e.target.complete();
};
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}
</style>