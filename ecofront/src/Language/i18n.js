import { createI18n } from 'vue-i18n'
import uz from './locales/uz.json'
import en from './locales/en.json'
import ru from './locales/ru.json' // Import qilingan

const i18n = createI18n({
  legacy: false, 
  locale: localStorage.getItem('lang') || 'uz', 
  fallbackLocale: 'en',
  // Barcha tillarni shu yerda ro'yxatdan o'tkazish shart:
  messages: { 
    uz, 
    en, 
    ru 
  }
})

export default i18n