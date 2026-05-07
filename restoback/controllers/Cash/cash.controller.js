const { CashService } = require("../../services/index.service");

class CashController {
  // 1. Yangi smena ochish
  async OpenShift(req, res, next) {
    try {
      const data = await CashService.OpenShift(req);
      return res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 2. MUHIM: Aktiv smenani topish (Sakrashga qarshi asosiy metod)
   * Bu metod sahifa refresh bo'lganda ID-siz chaqiriladi va bazadan 
   * joriy 'open' holatdagi smenani qidiradi.
   */
  async GetActiveShift(req, res, next) {
    try {
      // Service ichida Cash.findOne({ status: 'open' }) logikasi bo'lishi kerak
      const data = await CashService.GetActiveShift(req); 
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // 3. Kassa harakati: Kirim yoki Chiqim qo'shish
  async AddTransaction(req, res, next) {
    try {
      const data = await CashService.AddTransaction(req);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // 4. Smenani yopish (Z-Report)
  async CloseShift(req, res, next) {
    try {
      const data = await CashService.CloseShift(req);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // 5. Ma'lum bir smenani ID orqali olish
  async GetCurrentShift(req, res, next) {
    try {
      const data = await CashService.GetCurrentShift(req);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // 6. Kassa tarixi
  async GetHistory(req, res, next) {
    try {
      const data = await CashService.GetHistory(req);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CashController();