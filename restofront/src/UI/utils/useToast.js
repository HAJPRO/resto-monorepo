// src/components/UI/utils/useToast.js
import { reactive } from 'vue';

const state = reactive({
  toasts: []
});

const remove = (id) => {
  const index = state.toasts.findIndex((t) => t.id === id);
  if (index !== -1) state.toasts.splice(index, 1);
};

const add = (options) => {
  const { message, title, type = 'info', duration = 4000 } = options;
  const id = Date.now() + Math.random();
  state.toasts.push({ id, message, title, type, duration });
  if (duration > 0) {
    setTimeout(() => { remove(id); }, duration);
  }
};

// Bu ob'ektni tashqariga chiqaramiz
export const toast = {
  success: (message, title = 'Muvaffaqiyatli') => add({ message, title, type: 'success' }),
  error: (message, title = 'Xatolik') => add({ message, title, type: 'danger' }),
  info: (message, title = 'Ma\'lumot') => add({ message, title, type: 'info' }),
  warning: (message, title = 'Diqqat') => add({ message, title, type: 'warning' }),
};

export function useToast() {
  return { toasts: state.toasts, remove, toast };
}