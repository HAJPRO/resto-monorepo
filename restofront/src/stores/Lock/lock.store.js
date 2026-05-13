import { defineStore } from 'pinia';

export const LockStore = defineStore('LockStore', {
  state: () => ({
    // Sahifa yangilanganda ham localStorage'dan holatni tekshiramiz
    isLocked: localStorage.getItem('is_system_locked') === 'true',
    lockPin: '1234', 
  }),
  actions: {
    lock() {
      this.isLocked = true;
      // localStorage'ga yozish
      localStorage.setItem('is_system_locked', 'true');
    },
    unlock(pin) {
      if (pin === this.lockPin) {
        this.isLocked = false;
        // localStorage'dan o'chirish (yoki false qilish)
        localStorage.setItem('is_system_locked', 'false');
        return true;
      }
      return false;
    }
  }
});