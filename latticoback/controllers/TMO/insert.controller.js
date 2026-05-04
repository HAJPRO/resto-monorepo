const { InsertService } = require("../../services/index.service");

class InsertController {
  /**
   * Yangi kirim (faktura) yaratish
   * POST /api/insert/create
   */
  async Create(req, res, next) {
    try {
      // InsertService orqali barcha mantiqiy amallarni (ombor, narx, balans) bajaramiz
      const result = await InsertService.Create(req);

      return res.status(201).json({
        success: true,
        message: result.msg || "Kirim muvaffaqiyatli amalga oshirildi",
        data: result.data,
      });
    } catch (error) {
      // Xatolik bo'lsa BaseError yoki Global Error Middleware tutib oladi
      next(error);
    }
  }

  /**
   * Kirimlar ro'yxatini olish (Filtr va Pagination bilan)
   * POST /api/insert/all
   */
  async GetAll(req, res, next) {
    try {
      const result = await InsertService.GetAll(req);

      return res.status(200).json({
        success: true,
        message: "Kirimlar ro'yxati olindi",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bitta kirim hujjati haqida to'liq ma'lumot
   * GET /api/insert/:id
   */
  async GetById(req, res, next) {
    try {
      const result = await InsertService.GetById(req);

      return res.status(200).json({
        success: true,
        message: "Kirim tafsilotlari",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InsertController();