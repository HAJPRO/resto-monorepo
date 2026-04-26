import { useI18n } from 'vue-i18n'

export function useLanguage() {
  const { locale, t } = useI18n()

  const changeLanguage = (lang) => {
    locale.value = lang
    localStorage.setItem('lang', lang)
    // Sahifani yangilash shart emas, Vue o'zi hamma matnni o'zgartiradi
  }

  return { 
    locale, 
    changeLanguage,
    t // matnlarni tarjima qilish funksiyasi
  }
}