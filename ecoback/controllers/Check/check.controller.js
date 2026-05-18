const { CheckTemplateService } = require("../../services/index.service");

class CheckTemplateController {
  // Yangi shablon yaratish yoki tahrirlash
  async Create(req, res, next) {
    try {
      // Service-dan qaytgan ma'lumotni olamiz (action: 'create' yoki 'edit' mantiqi servisda)
      const data = await CheckTemplateService.Create(req);

      // Muvaffaqiyatli yaratilganda 201, tahrirlanganda 200 qaytishi mumkin. 
      // Servisdan qaytgan javobga qarab statusni moslaymiz.
      return res.status(req.body.action === 'edit' ? 200 : 201).json(data);
    } catch (error) {
      next(error);
    }
  }

  // Barcha shablonlarni olish
  async GetAll(req, res, next) {
    try {
      const data = await CheckTemplateService.GetAll(req);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // ID bo'yicha bitta shablonni olish
  async GetById(req, res, next) {
    try {
      const data = await CheckTemplateService.GetById(req);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // Hozirda faol (kassada ishlayotgan) shablonni olish
  async GetActiveTemplate(req, res, next) {
    try {
      const data = await CheckTemplateService.GetActiveTemplate(req);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // Shablonni o'chirish
  async Delete(req, res, next) {
    try {
      const data = await CheckTemplateService.Delete(req);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckTemplateController();