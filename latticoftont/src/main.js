import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { IonicVue } from '@ionic/vue';
import i18n from "./Language/i18n.js";
import Guard from './Guard/AppGuard.vue'
import { createPinia } from 'pinia';

// Tailwind va Global CSS
import './main.css';

/* Ionic CSS qoidalari */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

const pinia = createPinia();
const app = createApp(App);

// Pluginlarni ulash
app.use(pinia); 
app.use(IonicVue);
app.use(router);
app.use(i18n); // ✅ Faqat bir marta bo'lishi kerak

app.component('Guard', Guard); // Global ro'yxatdan o'tkazish

router.isReady().then(() => {
  app.mount('#app');
});