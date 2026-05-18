const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
// Xodimlarni faqat adminlar yoki kadrlar bo'limi boshqarishi uchun:
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");

const { UserController } = require("../../../controllers/index.controller.js");


router.post(
    "/all",
    authMiddleware,
    UserController.GetAll
);


router.post(
    "/create",
    authMiddleware,
    // onlyAdminAccess, 
    UserController.CreateUser
);


router.delete(
    "/delete/:id",
    authMiddleware,
    // onlyAdminAccess,
    UserController.DeleteUser
);


router.patch(
    "/status/:id",
    authMiddleware,
    // onlyAdminAccess,
    UserController.UpdateStatus
);


router.post(
    "/reset-password",
    authMiddleware,
    // onlyAdminAccess,
    UserController.ResetPassword
);

module.exports = router;