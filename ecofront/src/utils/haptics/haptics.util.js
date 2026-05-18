import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Oddiy zarba tebranishlari (Tugmalar va qisqa amallar uchun)
 * @param {('light'|'medium'|'heavy'|'soft'|'rigid')} style 
 */
export const vibrate = async (style = 'light') => {
  const styles = {
    light: ImpactStyle.Light,    // Yengil (standart tugmalar)
    medium: ImpactStyle.Medium,  // O'rtacha
    heavy: ImpactStyle.Heavy,    // Kuchli (muhim amallar)
    soft: ImpactStyle.Soft,      // Yumshoq
    rigid: ImpactStyle.Rigid     // Qattiq
  };
  await Haptics.impact({ style: styles[style] || ImpactStyle.Light });
};

/**
 * Tizim bildirishnomalari uchun tebranishlar
 * @param {('SUCCESS'|'WARNING'|'ERROR')} type 
 */
export const notify = async (type = 'SUCCESS') => {
  const types = {
    SUCCESS: NotificationType.Success, // Muvaffaqiyat (qisqa ikki marta)
    WARNING: NotificationType.Warning, // Ogohlantirish
    ERROR: NotificationType.Error      // Xatolik (uch marta qisqa)
  };
  await Haptics.notification({ type: types[type] || NotificationType.Success });
};

/**
 * Tanlov o'zgarganda (Wheel picker yoki scroll bo'lganda)
 * Juda mayin va deyarli sezilmas tebranish
 */
export const selectionClick = async () => {
  await Haptics.selectionStart(); // Tanlash boshlanganda (ixtiyoriy)
  await Haptics.selectionChanged();
};

/**
 * Maxsus ketma-ketlikdagi tebranish (Double Click effekti)
 */
export const doubleVibrate = async () => {
  await vibrate('light');
  setTimeout(async () => {
    await vibrate('medium');
  }, 100);
};

/**
 * Uzoq muddatli tebranish (Masalan, qidiruv natijasi chiqmaganda yoki diqqatni tortishda)
 */
export const longVibrate = async (duration = 200) => {
  // Capacitor Haptics'da bevosita duration yo'q, 
  // shuning uchun ketma-ketlik bilan simulyatsiya qilinadi
  for (let i = 0; i < 3; i++) {
    await vibrate('heavy');
    await new Promise(r => setTimeout(r, 50));
  }
};

/**
 * O'chirish amali uchun maxsus "Xavfli" tebranish
 */
export const dangerVibrate = async () => {
  await notify('ERROR');
  await vibrate('heavy');
};