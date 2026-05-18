const bcrypt = require('bcryptjs');

class UserService {
  async CreateUser(req, data) {
    const { User } = req.tenantModels;
    const { _id, ...model } = data;

    try {
      if (_id) {
        // --- UPDATE MANTIQI ---

        // Username yoki Telefon raqami boshqa foydalanuvchida band emasligini tekshirish
        const isExists = await User.findOne({
          _id: { $ne: _id },
          $or: [
            { username: model.username },
            { phoneNumber: model.phoneNumber }
          ]
        });

        if (isExists) {
          return { 
            status: 400, 
            msg: "Username yoki telefon raqami allaqachon boshqa xodimga biriktirilgan." 
          };
        }

        // Agar yangi parol kelgan bo'lsa, uni hash qilamiz
        if (model.password) {
          const salt = await bcrypt.genSalt(10);
          model.password = await bcrypt.hash(model.password, salt);
        } else {
          delete model.password; // Update paytida parolni o'zgartirmaslik uchun
        }

        const updatedUser = await User.findByIdAndUpdate(
          _id,
          { $set: model },
          { new: true, runValidators: true }
        ).populate("roles");

        if (!updatedUser) {
          return { status: 404, msg: "Foydalanuvchi topilmadi." };
        }

        return { 
          status: 200, 
          msg: "Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi!", 
          user: updatedUser 
        };

      } else {
        // --- CREATE MANTIQI ---

        // Unikallikni tekshirish
        const isExists = await User.findOne({
          $or: [
            { username: model.username },
            { phoneNumber: model.phoneNumber }
          ]
        });

        if (isExists) {
          return { 
            status: 400, 
            msg: "Bu username yoki telefon raqami bilan foydalanuvchi allaqachon ro'yxatdan o'tgan." 
          };
        }

        // Parolni hash qilish
        if (model.password) {
          const salt = await bcrypt.genSalt(10);
          model.password = await bcrypt.hash(model.password, salt);
        }

        const user = await User.create(model);
        
        return { 
          status: 201, 
          msg: "Yangi xodim muvaffaqiyatli qo‘shildi!", 
          user 
        };
      }

    } catch (err) {
      console.error("User Upsert Error:", err.message);
      return { 
        status: 500, 
        msg: "Serverda xatolik yuz berdi", 
        error: err.message 
      };
    }
  }

  async GetAll(req) {
    const { User } = req.tenantModels;

    try {
      // Foydalanuvchilarni olish (parolni chiqarib tashlagan holda)
     const users = await User.find()
    .select("-password") 
    .populate({
        path: "roles",
        populate: {
            path: "permissions", // Role modeli ichidagi permissions maydoni nomi
            model: "Permission"  // Permission modeli nomi
        }
    })
    .sort({ createdAt: -1 })
    .lean();
      return { 
        status: 200,
        msg: "Barcha foydalanuvchilar ro'yxati", 
        users 
      };
    } catch (err) {
      console.error("User GetAll Error:", err.message);
      return { status: 500, msg: "Xatolik yuz berdi", error: err.message };
    }
  }

  async DeleteUser(req) {
    const { User } = req.tenantModels;
    const id = req.params.id;

    try {
      // O'chirishdan oldin xodimni topamiz
      const deletedUser = await User.findByIdAndDelete(id);
      
      if (!deletedUser) {
        return { status: 404, msg: "Foydalanuvchi topilmadi." };
      }
      
      return { status: 200, msg: "Foydalanuvchi tizimdan o'chirildi!" };
    } catch (err) {
      console.error("User Delete Error:", err.message);
      return { 
        status: 500, 
        msg: "Serverda xatolik yuz berdi", 
        error: err.message 
      };
    }
  }
}

module.exports = new UserService();