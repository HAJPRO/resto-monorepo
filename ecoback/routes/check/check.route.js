const express = require("express");
const { CheckTemplateController } = require("../../controllers/index.controller.js");

const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js");

const router = express.Router();

/**
 * @route   POST /api/check-templates/save
 * @desc    Yangi shablon yaratish yoki mavjudini tahrirlash (action: 'create'|'edit')
 */
router.post(
  "/save", 
  tenantMiddleware, 
  // authMiddleware, // Agar faqat adminlar o'zgartira olsa, buni yoqing
  CheckTemplateController.Create
);

/**
 * @route   POST /api/check-templates/all
 * @desc    Barcha yaratilgan shablonlar ro'yxatini olish
 */
router.post(
  "/all", 
  tenantMiddleware, 
  CheckTemplateController.GetAll
);

/**
 * @route   POST /api/check-templates/active
 * @desc    Hozirda faol (default) bo'lgan bitta shablonni olish
 */
router.post(
  "/active", 
  tenantMiddleware, 
  CheckTemplateController.GetActiveTemplate
);

/**
 * @route   POST /api/check-templates/get/:id
 * @desc    ID bo'yicha aniq bir shablonni ko'rish
 */
router.post(
  "/get/:id", 
  tenantMiddleware, 
  CheckTemplateController.GetById
);

/**
 * @route   POST /api/check-templates/delete/:id
 * @desc    Shablonni o'chirish
 */
router.post(
  "/delete/:id", 
  tenantMiddleware, 
  CheckTemplateController.Delete
);

module.exports = router;