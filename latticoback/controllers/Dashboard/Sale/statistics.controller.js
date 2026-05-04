const { StatisticsService } = require("../../../services/index.service");

class StatisticsController {
  /**
   * Dashboard uchun asosiy statistika
   * (Grafik, jami tushum, o'rtacha chek va to'lov turlari tahlili)
   * Query params: period, startDate, endDate
   */
  async GetDashboardStats(req, res, next) {
    try {
      // Service-dan barcha dashboard metrikalarini olamiz
      // req.query orqali period yoki startDate/endDate avtomatik servisga o'tadi
      const data = await StatisticsService.GetDashboardStats(req);

      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Top sotilayotgan mahsulotlar ro'yxati
   * Query params: limit, period, startDate, endDate
   */
  async GetTopSales(req, res, next) {
    try {
      const data = await StatisticsService.GetTopSales(req);

      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eng ko'p xarid qilgan top mijozlar ro'yxati
   * Query params: limit, period, startDate, endDate
   */
  async GetTopCustomers(req, res, next) {
    try {
      const data = await StatisticsService.GetTopCustomers(req);

      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async GetHomeStats(req, res, next) {
    try {
      const data = await StatisticsService.GetHomeStats(req);

      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }


}

module.exports = new StatisticsController();