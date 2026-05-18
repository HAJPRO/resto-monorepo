const { RoleService } = require("../../../services/index.service");

class RoleController {
  /**
   * Rol yaratish yoki tahrirlash (Upsert)
   */
  async CreateRole(req, res, next) {
    try {
      
      // req.body ichida _id bo'lsa Update, bo'lmasa Create mantiqi Service'da bajariladi
      const data = await RoleService.CreateRole(req, req.body);
      
      // Service'dan qaytgan status kodiga qarab javob qaytaramiz
      res.status(data.status || 200).json(data);
    } catch (error) {
      console.error("Controller CreateRole Error:", error);
      next(error);
    }
  }

  /**
   * Barcha rollarni olish (Permission'lar bilan birga)
   */
  async GetAll(req, res, next) {
    try {
      // req.query orqali qidiruv yoki filtr parametrlarini uzatish mumkin
      const data = await RoleService.GetAll(req, req.query);
      res.status(200).json(data);
    } catch (error) {
      console.error("Controller GetAllRoles Error:", error);
      next(error);
    }
  }

  /**
   * Rolni o'chirish
   */
  async DeleteRole(req, res, next) {
    try {
      const data = await RoleService.DeleteRole(req);
      
      // Service status 404 yoki 200 qaytaradi
      res.status(data.status || 200).json(data);
    } catch (error) {
      console.error("Controller DeleteRole Error:", error);
      next(error);
    }
  }
}

module.exports = new RoleController();