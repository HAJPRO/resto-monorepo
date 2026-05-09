const BaseError = require("../../errors/base.error");

class CheckTemplateService {
    async Create(req) {
        const { CheckTemplate } = req.tenantModels;
        
        // 1. Body mavjudligini tekshirish
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new BaseError("Shablon ma'lumotlari qabul qilinmadi", 400);
        }

        // 2. Ma'lumotlarni destruktizatsiya qilish
        const { _id, action, ...modelData } = req.body;

        // 3. Yaratish (Create) mantiqi
        if (action === 'create') {
            // Agar yangi shablon faol (isActive: true) bo'lib kelsa, 
            // boshqa eski faol shablonlarni o'chirib qo'yishimiz mumkin
            if (modelData.isActive) {
                await CheckTemplate.updateMany({}, { isActive: false });
            }

            const data = await CheckTemplate.create(modelData);
            return {
                success: true,
                msg: "Chek shabloni muvaffaqiyatli yaratildi",
                data
            };
        } 

        // 4. Tahrirlash (Edit) mantiqi
        if (action === 'edit') {
            if (!_id) {
                throw new BaseError("Tahrirlash uchun shablon ID si topilmadi", 400);
            }

            // Agar ushbu shablon asosiy (isActive) qilib belgilansa, qolganlarini false qilamiz
            if (modelData.isActive) {
                await CheckTemplate.updateMany({ _id: { $ne: _id } }, { isActive: false });
            }

            const updated = await CheckTemplate.findByIdAndUpdate(
                _id, 
                { $set: modelData }, 
                { new: true, runValidators: true }
            );

            if (!updated) {
                throw new BaseError("Bunday ID li shablon topilmadi", 404);
            }

            return { 
                success: true,
                msg: "Shablon muvaffaqiyatli yangilandi", 
                data: updated 
            };
        }

        throw new BaseError(`Noto'g'ri operatsiya: ${action}`, 400);
    }

    async GetAll(req) {
        const { CheckTemplate } = req.tenantModels;

        // Barcha shablonlarni olish (oxirgi yangilangani birinchi chiqadi)
        const data = await CheckTemplate.find().sort({ updatedAt: -1 }).lean();

        return { 
            success: true,
            msg: "Barcha chek shablonlari", 
            data 
        };
    }

    async GetById(req) {
        const { CheckTemplate } = req.tenantModels;
        
        const data = await CheckTemplate.findById(req.params.id).lean();
        
        if (!data) {
            throw new BaseError("Shablon topilmadi", 404);
        }

        return { 
            success: true,
            msg: "Shablon topildi", 
            data 
        };
    }

    // Qo'shimcha: Hozirda faol bo'lgan shablonni olish (Printer uchun kerak bo'ladi)
    async GetActiveTemplate(req) {
        const { CheckTemplate } = req.tenantModels;
        
        const data = await CheckTemplate.findOne({ isActive: true }).lean();
        
        if (!data) {
            // Agar faol shablon bo'lmasa, eng birinchisini qaytaramiz
            const fallback = await CheckTemplate.findOne().lean();
            return { success: true, data: fallback };
        }

        return { 
            success: true,
            data 
        };
    }

    // Shablonni o'chirish
    async Delete(req) {
        const { CheckTemplate } = req.tenantModels;
        const { id } = req.params;

        const deleted = await CheckTemplate.findByIdAndDelete(id);
        
        if (!deleted) {
            throw new BaseError("O'chirish uchun shablon topilmadi", 404);
        }

        return {
            success: true,
            msg: "Shablon o'chirib tashlandi"
        };
    }
}

module.exports = new CheckTemplateService();