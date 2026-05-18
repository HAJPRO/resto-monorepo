const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
// Faqat adminlar rollarni boshqarishi uchun admin middleware'ini qo'shishingizni tavsiya qilaman
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");

const { RoleController } = require("../../../controllers/index.controller.js");

// Role yaratish yoki tahrirlash (Upsert)
router.post(
    "/create",
    authMiddleware,
    // onlyAdminAccess, // Rollarni faqat Admin yaratishi va tahrirlashi mumkin
    RoleController.CreateRole
);

// Barcha rollarni olish
router.post(
    "/all",
    authMiddleware,
    // Role ro'yxatini ko'rish uchun admin bo'lishi shart emas bo'lishi mumkin (masalan, Select uchun)
    // lekin xavfsizlik uchun faqat ichki xodimlar (auth) ko'rishi kerak
    RoleController.GetAll
);

// Rolni o'chirish
router.delete(
    "/delete/:id",
    authMiddleware,
    // onlyAdminAccess,
    RoleController.DeleteRole
);

module.exports = router;