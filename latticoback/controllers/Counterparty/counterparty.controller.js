const { CounterpartyService } = require("../../services/index.service");

class CounterpartyController {
  // Kontragent yaratish yoki tahrirlash
  async Create(req, res, next) {
    try {
      // Service-dan qaytgan ma'lumotni olamiz
      const data = await CounterpartyService.Create(req);

      // Muvaffaqiyatli javob qaytarish (201 - Created yoki 200 - OK)
      return res.status(data.action === 'edit' ? 200 : 201).json(data);
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }

  // Barcha kontragentlarni olish
  async GetAll(req, res, next) {
    try {
      const data = await CounterpartyService.GetAll(req);

      // Ma'lumotlarni olishda odatda 200 status ishlatiladi
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // ID bo'yicha bitta kontragentni olish
  async GetById(req, res, next) {
    try {
      const data = await CounterpartyService.GetById(req);

      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CounterpartyController();