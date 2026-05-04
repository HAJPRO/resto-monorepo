const express = require("express");
const { CounterpartyController } = require("../../controllers/index.controller.js");

const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js");

const router = express.Router();

/**
 * @route   POST /api/counterparty/create
 * @desc    Kontragent yaratish yoki tahrirlash (action-ga qarab)
 * @access  Private
 */
router.post(
  "/create", 
  authMiddleware, // Odatda auth har doim kerak bo'ladi
  tenantMiddleware, 
  CounterpartyController.Create
);

/**
 * @route   POST /api/counterparty/all
 * @desc    Barcha kontragentlarni olish (Filtrlar bilan)
 * @access  Private
 */
router.post(
  "/all", 
  authMiddleware, 
  tenantMiddleware, 
  CounterpartyController.GetAll
);

/**
 * @route   GET /api/counterparty/get/:id
 * @desc    Bitta kontragent ma'lumotini ID bo'yicha olish
 * @access  Private
 */
router.get(
  "/get/:id", 
  authMiddleware, 
  tenantMiddleware, 
  CounterpartyController.GetById
);

module.exports = router;