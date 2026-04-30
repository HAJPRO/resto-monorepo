const { UserService } = require("../../../services/index.service");

class UserController {
  /**
   * Foydalanuvchi yaratish yoki tahrirlash (Upsert)
   * Create & Update mantiqi UserService.CreateUser ichida
   */
  async CreateUser(req, res, next) {
    try {
      // req.body ichida _id bo'lsa Update, bo'lmasa Create
      const data = await UserService.CreateUser(req, req.body);
      
      // Service qaytargan status kodiga qarab javob berish (200 yoki 201)
      res.status(data.status || 200).json(data);
    } catch (error) {
      console.error("Controller CreateUser Error:", error);
      next(error);
    }
  }

  /**
   * Barcha foydalanuvchilarni olish
   */
  async GetAll(req, res, next) {
    try {
      // Filtratsiya yoki qidiruv parametrlarini req.body orqali yuborish mumkin
      const data = await UserService.GetAll(req, req.body);
      res.status(200).json(data);
    } catch (error) {
      console.error("Controller GetAllUsers Error:", error);
      next(error);
    }
  }

  /**
   * Foydalanuvchini tizimdan o'chirish
   */
  async DeleteUser(req, res, next) {
    try {
      const data = await UserService.DeleteUser(req);
      res.status(data.status || 200).json(data);
    } catch (error) {
      console.error("Controller DeleteUser Error:", error);
      next(error);
    }
  }

  /**
   * Parolni yangilash (Reset Password)
   */
  async ResetPassword(req, res, next) {
    try {
      const data = await UserService.ResetPassword(req, req.body);
      res.status(data.status || 200).json(data);
    } catch (error) {
      console.error("Controller ResetPassword Error:", error);
      next(error);
    }
  }

  /**
   * Foydalanuvchi statusini o'zgartirish (Active/Inactive)
   */
  async UpdateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const data = await UserService.UpdateStatus(id, isActive);
      res.status(data.status || 200).json(data);
    } catch (error) {
      console.error("Controller UpdateStatus Error:", error);
      next(error);
    }
  }
}

module.exports = new UserController();