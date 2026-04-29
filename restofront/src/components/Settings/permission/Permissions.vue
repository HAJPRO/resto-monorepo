<script setup>
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { chevronForwardOutline } from 'ionicons/icons';
import { EmptyState, Button, Header, GlobalRefresher } from '../../../UI/UI';
import { PermissionStore } from "../../../stores/index.store";
import { storeToRefs } from 'pinia';
import { vibrate } from '../../../utils/index.util';

// Store bilan bog'lanish
const store = PermissionStore();
const { permissions, loading } = storeToRefs(store);

const searchQuery = ref('');

// --- QIDIRUV MANTIQI ---
const filteredPermissions = computed(() => {
  if (!permissions.value || !Array.isArray(permissions.value)) return [];
  
  const q = searchQuery.value.toLowerCase().trim();
  
  return permissions.value.filter(p => {
    return (
      p.name?.toLowerCase().includes(q) || 
      p.value?.toLowerCase().includes(q) ||
      p._id?.includes(q)
    );
  });
});

// --- MODAL BILAN ISHLASH ---
const openModal = (action, data = null) => {
  vibrate("light");
  
  // Store'dagi ModalAction funksiyasini chaqiramiz
  // Bu funksiya isModal=true qiladi va model'ni to'ldiradi
  store.ModalAction({ 
    action: action, 
    data: data ? { ...data } : { name: '', value: '', description: '' } 
  });
};

// --- ICONLARNI DINAMIK TANLASH ---
const getPermissionIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('create') || n.includes('qo\'shish')) return 'fas fa-plus-circle';
  if (n.includes('delete') || n.includes('o\'chirish')) return 'fas fa-trash-alt';
  if (n.includes('edit') || n.includes('tahrir')) return 'fas fa-edit';
  if (n.includes('view') || n.includes('ko\'rish')) return 'fas fa-eye';
  if (n.includes('admin') || n.includes('root')) return 'fas fa-user-shield';
  return 'fas fa-shield-alt'; // Default icon
};

// --- MALUMOTLARNI YUKLASH ---
onMounted(async () => {
  await store.GetAll();
});
</script>

<template>
  <ion-page class="bg-[#F8FAFC] dark:bg-[#020617]">
     <Header 
      title="Ruxsatlar" 
      searchable 
      v-model="searchQuery" 
      searchPlaceholder="Ruxsatlarni qidirish..."
    >
      <template #actions>
        <Button @click="openModal('create')" icon="fas fa-plus-circle" size="sm" />
      </template>
    </Header>

    <ion-content :fullscreen="true">
      <GlobalRefresher @refresh="store.GetAll()"/>

      <div class="max-w-full mx-auto px-5 py-6 pb-28">
        
        <div v-if="loading" class="space-y-5">
          <div v-for="i in 5" :key="i" class="h-36 w-full bg-white dark:bg-slate-900/40 rounded-[32px] border border-slate-100 dark:border-white/5 animate-pulse"></div>
        </div>

        <div v-else-if="filteredPermissions.length > 0" class="space-y-5">
          <div 
            v-for="permission in filteredPermissions" :key="permission._id" 
            class="relative overflow-hidden group bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 rounded-[35px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none active:scale-[0.97] transition-all duration-300"
          >
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>

            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-5">
                <div class="w-16 h-16 rounded-[22px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                  <i :class="getPermissionIcon(permission.name)" class="text-2xl"></i>
                </div>

                <div class="flex flex-col">
                  <h3 class="font-bold text-[18px] text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                    {{ permission.name }}
                  </h3>
                  <div class="flex">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-indigo-500/10 text-[11px] font-mono font-bold text-slate-500 dark:text-indigo-400 border border-slate-200 dark:border-indigo-500/20">
                      {{ permission.value }}
                    </span>
                  </div>
                </div>
              </div>

              <button @click="openModal('edit', permission)" class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors">
                <ion-icon :icon="chevronForwardOutline" class="text-xl" />
              </button>
            </div>

            <div class="mt-5 pt-5 border-t border-slate-100 dark:border-white/5 flex items-end justify-between">
              <div class="flex flex-col gap-1 max-w-[70%]">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Tavsif</span>
                <p class="text-[13px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                  {{ permission.description || 'Ushbu ruxsatnoma tizim funksionalligini cheklash uchun ishlatiladi.' }}
                </p>
              </div>

              <div class="flex gap-2">
                <Button
                size="sm" 
                  @click="openModal('edit', permission)"
                  variant="secondarys"
                  icon="fas fa-edit"
                />
                <Button
                size="sm" 
                  @click="store.Delete(permission._id)"
                  variant="danger"
                  icon="fas fa-trash"
                />
              </div>
            </div>
          </div>
        </div>

        <EmptyState 
          v-else
          title="Ruxsatnomalar mavjud emas"
          description="Qidiruv natijasida hech narsa topilmadi"
          :searchTerm="searchQuery"
          @action="searchQuery = ''"
        />
        
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.shrink-0 { flex-shrink: 0; }

ion-content::part(scroll) {
  scrollbar-width: none;
}
ion-content::part(scroll)::-webkit-scrollbar {
  display: none;
}
.pt-safe { padding-top: env(safe-area-inset-top); }
</style>