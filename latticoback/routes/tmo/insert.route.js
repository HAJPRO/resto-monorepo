const express = require("express");
const { InsertController } = require("../../controllers/index.controller.js");

const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js");
// Agar kirim hujjatlari (faktura) rasmini saqlash kerak bo'lsa:
const upload = require("../../middlewares/multer.middleware.js"); 

const router = express.Router();

/**
 * @route   POST /api/insert/create
 * @desc    Yangi kirim yaratish (Ombor qoldig'ini oshiradi va narxlarni yangilaydi)
 * @access  Private
 */
router.post(
  "/create", 
  tenantMiddleware, 
  // upload.single('image'), // Agar faktura rasmi kerak bo'lsa yoqing
  InsertController.Create
);

/**
 * @route   POST /api/insert/all
 * @desc    Barcha kirimlar ro'yxatini olish (Filtrlar bilan)
 * @access  Private
 */
router.post(
  "/all", 
  tenantMiddleware, 
  InsertController.GetAll
);

/**
 * @route   GET /api/insert/:id
 * @desc    Bitta kirim hujjatining to'liq tafsilotlarini olish
 * @access  Private
 */
router.get(
  "/:id", 
  tenantMiddleware, 
  InsertController.GetById
);

module.exports = router;