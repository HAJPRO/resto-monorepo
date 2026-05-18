const express = require("express");
const { CashController } = require("../../controllers/index.controller.js");

const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js");

const router = express.Router();

// 1. Smenani ochish
router.post(
  "/open-shift", 
  authMiddleware,
  tenantMiddleware, 
  CashController.OpenShift
);

/**
 * 2. MUHIM: Aktiv smenani tekshirish (Sakrashga qarshi asosiy endpoint)
 * Bu endpoint ID talab qilmaydi. U bazadan statusi 'open' bo'lgan smenani qidiradi.
 * Frontend'da onMounted ichida birinchi bo'lib SHU endpoint chaqiriladi.
 */
router.get(
  "/active-shift", 
  authMiddleware,
  tenantMiddleware, 
  CashController.GetActiveShift
);

// 3. Kassa harakati (Kirim/Chiqim qo'shish)
router.post(
  "/transaction/:id", 
  authMiddleware,
  tenantMiddleware, 
  CashController.AddTransaction
);

// 4. Smenani yopish (Z-Report)
router.post(
  "/close-shift/:id", 
  authMiddleware,
  tenantMiddleware, 
  CashController.CloseShift
);

// 5. Ma'lum bir smena holatini ID orqali olish
router.get(
  "/shift/:id", 
  authMiddleware,
  tenantMiddleware, 
  CashController.GetCurrentShift
);

// 6. Kassa tarixi (Smenalar hisoboti)
router.get(
  "/history", 
  authMiddleware,
  tenantMiddleware, 
  CashController.GetHistory
);

module.exports = router;