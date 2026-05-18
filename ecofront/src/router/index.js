import { createRouter, createWebHistory,createWebHashHistory } from '@ionic/vue-router';
import ExploreView from '../layouts/ExploreView.vue';
import LandingView from '../layouts/LandingView.vue';

const routes = [
  {
    path: '/landing',
    component: LandingView,
    children: [
      { 
        path: '', 
        redirect: '/landing/login' 
      },
      { 
        path: 'login', 
        name: 'login', 
        component: () => import('../pages/landing/login.vue') 
      },
    ],
    meta: { guestOnly: true }
  },
  {
    path: '/explore',
    component: ExploreView,
    children: [
      { 
        path: '', 
        redirect: '/explore/home' 
      },
      { path: 'home', name: 'home', component: () => import('../pages/explore/Home/index.vue') },
      { path: 'statistic', name: 'statistic', component: () => import('../pages/explore/Dashboard/sale/index.vue') },
      { path: 'menu', name: 'menu', component: () => import('../pages/explore/Menu/index.vue') },
      { path: 'order', name: 'order', component: () => import('../pages/explore/Order/index.vue') },
      { path: 'tables', name: 'tables', component: () => import('../pages/explore/Tabels/index.vue') },
      { path: 'profile', name: 'profile', component: () => import('../pages/explore/Profile/index.vue') },
      { path: 'check', name: 'check', component: () => import('../pages/explore/Check/index.vue') },
      { path: 'employee', name: 'employee', component: () => import('../pages/explore/HR/Employee/index.vue') },
      { path: 'settings/users', name: 'settingsusers', component: () => import('../pages/explore/Settings/users/index.vue') },
      { path: 'settings/roles', name: 'settingsroles', component: () => import('../pages/explore/Settings/role/index.vue') },
      { path: 'settings/permissions', name: 'settingspermissions', component: () => import('../pages/explore/Settings/permission/index.vue') },
      { path: 'settings/service/fee', name: 'fee', component: () => import('../pages/explore/Settings/service/index.vue') },
      { path: 'customer', name: 'customer', component: () => import('../pages/explore/Customer/index.vue') },
      { path: 'department', name: 'department', component: () => import('../pages/explore/HR/Department/index.vue') },
      { path: 'category', name: 'category', component: () => import('../pages/explore/Menu/Category/index.vue') },
      { path: 'zone', name: 'zone', component: () => import('../pages/explore/Zone/index.vue') },
      { path: 'transaction', name: 'transaction', component: () => import('../pages/explore/Transaction/index.vue') },
      { path: 'insert', name: 'insert', component: () => import('../pages/explore/TMO/Insert/index.vue') },
      { path: 'insert/history', name: 'inserthistory', component: () => import('../pages/explore/TMO/InsertHistory/index.vue') },
      { path: 'counterparty', name: 'counterparty', component: () => import('../pages/explore/Counterparty/index.vue') },
      { path: 'cash', name: 'cash', component: () => import('../pages/explore/Cash/index.vue') },
      { path: 'subscriptions', name: 'server', component: () => import('../pages/explore/Subscriptions/index.vue') },


    ],
    meta: { requiresAuth: true }
  },
  { 
    path: '/', 
    redirect: '/explore/home' 
  },
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/landing/login' 
  }
];

const router = createRouter({
  // MUHIM: Mobile APK uchun createWebHashHistory ishlatish shart!
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// --- NAVIGATION GUARD ---
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Faqat tokenni haqiqiy mavjudligini tekshiramiz
  const isAuthenticated = !!(token && token !== 'undefined' && token !== 'null');

  // 1. Kirgan bo'lsa, login/landing sahifalariga yo'latma
  if (to.matched.some(record => record.meta.guestOnly) && isAuthenticated) {
    return next({ name: 'home' });
  }

  // 2. Kirmagan bo'lsa, ichki sahifalarga yo'latma
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    return next({ name: 'login' });
  }

  // 3. Qolgan holatlarda ruxsat
  next();
});

export default router;