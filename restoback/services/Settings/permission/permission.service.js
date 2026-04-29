

class PermissionService {
 async CreatePermission(req, data) {
  const { Permission } = req.tenantModels;
  const { _id, ...model } = data; // Ma'lumotlarni data'dan olamiz

  try {
    if (_id) {
      // --- UPDATE MANTIQI ---
      
      // O'zidan boshqa permissionlarda nomi yoki qiymati bandligini tekshirish
      const isExists = await Permission.findOne({
        _id: { $ne: _id }, // O'zini hisobga olmaslik
        $or: [
          { name: model.name },
          { value: model.value }
        ]
      });

      if (isExists) {
        return { 
          status: 400, 
          msg: "Bunday nomdagi yoki qiymatdagi ruxsat boshqa ruxsatnomada band." 
        };
      }

      const updatedPermission = await Permission.findByIdAndUpdate(
        _id,
        { $set: model },
        { new: true, runValidators: true }
      );

      if (!updatedPermission) {
        return { status: 404, msg: "Ruxsatnoma topilmadi." };
      }

      return { 
        status: 200, 
        msg: "Ruxsatnoma muvaffaqiyatli yangilandi!", 
      };

    } else {
      // --- CREATE MANTIQI ---

      const isExists = await Permission.findOne({
        $or: [
          { name: model.name },
          { value: model.value }
        ]
      });

      if (isExists) {
        return { 
          status: 400, 
          msg: "Bunday nomdagi yoki qiymatdagi ruxsat allaqachon mavjud." 
        };
      }

      const permission = await Permission.create(model);
      return { 
        status: 201, 
        msg: "Ruxsat muvaffaqiyatli qo‘shildi!", 
      };
    }

  } catch (err) {
    console.error("Permission Upsert Error:", err.message);
    return { 
      status: 500, 
      msg: "Serverda xatolik yuz berdi", 
      error: err.message 
    };
  }
}
  async GetAll(req) {
    const { Permission } = req.tenantModels;

    try {
      const permissions = await Permission.find().lean();
      return { msg: "Barcha ruxsatnomalar", permissions };
    } catch (err) {
      console.error("Permission GetAll Error:", err.message);
      return { msg: "Xatolik yuz berdi", error: err.message };
    }
  }
  async DeletePermission(req) {
    const { Permission } = req.tenantModels;
const id = req.params.id; // URL'dan ID'ni olish
    try {
      const deletedPermission = await Permission.findByIdAndDelete(id);
      if (!deletedPermission) {
        return { status: 404, msg: "Ruxsatnoma topilmadi." };
      }
      return { status: 200, msg: "Ruxsatnoma muvaffaqiyatli o'chirildi!" };
    } catch (err) {
      console.error("Permission Delete Error:", err.message);
      return { status: 500, msg: "Serverda xatolik yuz berdi", error: err.message };
    }
  }
}

module.exports = new PermissionService();