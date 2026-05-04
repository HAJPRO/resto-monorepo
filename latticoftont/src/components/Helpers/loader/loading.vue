<template>
  <div class="loader-overlay" :class="themeClass">
    <div class="loader-content">
      <div class="logo-wrapper">
        <div class="liquid-ring"></div>
        <div class="logo-container">
          <img
            src="../../../../assets/icon.png" 
            alt="Safy Logo"
            class="main-logo"
          />
        </div>
      </div>

      <div class="text-container">
        <div class="loading-bar-container">
          <div class="loading-bar-fill"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Standart holatda dark rejim
const theme = ref('dark');

onMounted(() => {
  // LocalStorage dan 'theme' kalitini tekshiramiz
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.value = savedTheme;
  }
});

// Classni aniqlash uchun computed property
const themeClass = computed(() => {
  return theme.value === 'light' ? 'light-mode' : 'dark-mode';
});
</script>

<style scoped>
/* Asosiy qatlam (Overlay) */
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.4s ease;
}

/* DARK MODE: slate-900/90 */
.dark-mode {
  background-color: rgba(15, 23, 42, 0.9); /* #0f172a 90% opacity */
}

/* LIGHT MODE: white/90 */
.light-mode {
  background-color: rgba(255, 255, 255, 0.9); /* #ffffff 90% opacity */
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* Animatsiyali halqa */
.logo-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.liquid-ring {
  position: absolute;
  inset: 0;
  border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
  background: linear-gradient(45deg, #4f46e5, #10b981, #6366f1);
  filter: blur(1px);
  animation: liquid-morph 6s linear infinite alternate;
  opacity: 0.8;
  box-shadow: 0 0 30px rgba(79, 70, 229, 0.2);
}

.logo-container {
  position: relative;
  z-index: 2;
  width: 130px;
  height: 130px;
  background: white;
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: logo-breathe 3s ease-in-out infinite;
}

/* Matn stillari */
.brand-name {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.dark-mode .brand-name {
  color: white;
  background: linear-gradient(to right, #fff, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.light-mode .brand-name {
  color: #1e293b; /* slate-800 */
}

.loading-bar-container {
  width: 100px;
  height: 3px;
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}

.loading-bar-fill {
  width: 40%;
  height: 100%;
  background: #4f46e5;
  animation: loading-move 1.5s ease-in-out infinite;
}

/* Animatsiyalar (Keyframes) */
@keyframes liquid-morph {
  0% { border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%; transform: rotate(0deg); }
  100% { border-radius: 62% 38% 37% 63% / 59% 56% 44% 41%; transform: rotate(180deg); }
}

@keyframes logo-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@keyframes loading-move {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(250%); }
}
</style>