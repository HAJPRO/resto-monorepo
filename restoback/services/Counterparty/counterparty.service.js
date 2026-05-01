const BaseError = require("../../errors/base.error");

class CounterpartyService {
  async Create(req) {
    const { Counterparty } = req.tenantModels;
    
    // 1. Body mavjudligini tekshirish
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new BaseError("Ma'lumotlar qabul qilinmadi (JSON body bo'sh)", 400);
    }

    // 2. Ma'lumotlarni destruktizatsiya qilish
    const { _id, action, ...modelData } = req.body;

    // 3. Yaratish (Create) mantiqi
    if (action === 'create') {
      // Kontragent uchun rasm ixtiyoriy bo'lishi mumkin, lekin tekshiruvni qoldirdik
      // if (!modelData.image) {
      //   throw new BaseError("Kontragent rasmi yuklanishi shart", 400);
      // }

      const data = await Counterparty.create(modelData);
      return {
        success: true,
        msg: "Kontragent muvaffaqiyatli yaratildi",
        data
      };
    } 

    // 4. Tahrirlash (Edit) mantiqi
    if (action === 'edit') {
      if (!_id) {
        throw new BaseError("Tahrirlash uchun kontragent ID si topilmadi", 400);
      }

      const updated = await Counterparty.findByIdAndUpdate(
        _id, 
        { $set: modelData }, 
        { new: true, runValidators: true } 
      );

      if (!updated) {
        throw new BaseError("Bunday ID li kontragent topilmadi", 404);
      }

      return { 
        success: true,
        msg: "Ma'lumotlar muvaffaqiyatli yangilandi", 
        data: updated 
      };
    }

    // 5. Noma'lum action bo'lsa
    throw new BaseError(`Noto'g'ri operatsiya: ${action}`, 400);
  }

  async GetAll(req) {
    const { Counterparty } = req.tenantModels;

    // .lean() - queryni tezlashtiradi (POJO qaytaradi)
    const data = await Counterparty.find().sort({ createdAt: -1 }).lean(); 

    return { 
      success: true,
      msg: "Barcha kontragentlar ro'yxati", 
      data 
    };
  }

  async GetById(req) {
    const { Counterparty } = req.tenantModels;
    
    // Agar boshqa modellarga bog'liqlik bo'lsa .populate() ishlatiladi
    const data = await Counterparty.findById(req.params.id).lean(); 

    if (!data) {
      throw new BaseError("Kontragent topilmadi", 404);
    }

    return { 
      success: true,
      msg: "Kontragent ma'lumotlari yuklandi", 
      data 
    };
  }
}

module.exports = new CounterpartyService();