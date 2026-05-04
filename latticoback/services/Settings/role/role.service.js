class RoleService {
  async CreateRole(req, data) {
    const { Role } = req.tenantModels;
    const { _id, ...model } = data;
console.log("RoleService CreateRole Data:", data);
    try {
      if (_id) {
        // --- UPDATE MANTIQI ---
        
        // O'zidan boshqa rollarda nomi yoki qiymati bandligini tekshirish
        const isExists = await Role.findOne({
          _id: { $ne: _id },
          $or: [
            { name: model.name },
            { value: model.value }
          ]
        });

        if (isExists) {
          return { 
            status: 400, 
            msg: "Bunday nomdagi yoki qiymatdagi rol allaqachon boshqa joyda band." 
          };
        }

        const updatedRole = await Role.findByIdAndUpdate(
          _id,
          { $set: model },
          { new: true, runValidators: true }
        ).populate("permissions");

        if (!updatedRole) {
          return { status: 404, msg: "Rol topilmadi." };
        }

        return { 
          status: 200, 
          msg: "Rol muvaffaqiyatli yangilandi!", 
          role: updatedRole 
        };

      } else {
        // --- CREATE MANTIQI ---

        const isExists = await Role.findOne({
          $or: [
            { name: model.name },
            { value: model.value }
          ]
        });

        if (isExists) {
          return { 
            status: 400, 
            msg: "Bunday nomdagi yoki qiymatdagi rol allaqachon mavjud." 
          };
        }

        const role = await Role.create(model);
        return { 
          status: 201, 
          msg: "Rol muvaffaqiyatli qo‘shildi!", 
          role 
        };
      }

    } catch (err) {
      console.error("Role Upsert Error:", err.message);
      return { 
        status: 500, 
        msg: "Serverda xatolik yuz berdi", 
        error: err.message 
      };
    }
  }

  async GetAll(req) {
    const { Role } = req.tenantModels;

    try {
      // populate("permissions") orqali ruxsatnomalarning to'liq ma'lumotini olamiz
      const roles = await Role.find()
        .populate("permissions")
        .sort({ createdAt: -1 })
        .lean();
        
      return { 
        status: 200,
        msg: "Barcha rollar", 
        roles 
      };
    } catch (err) {
      console.error("Role GetAll Error:", err.message);
      return { status: 500, msg: "Xatolik yuz berdi", error: err.message };
    }
  }

  async DeleteRole(req) {
    const { Role } = req.tenantModels;
    const id = req.params.id;

    try {
      const deletedRole = await Role.findByIdAndDelete(id);
      if (!deletedRole) {
        return { status: 404, msg: "Rol topilmadi." };
      }
      return { status: 200, msg: "Rol muvaffaqiyatli o'chirildi!" };
    } catch (err) {
      console.error("Role Delete Error:", err.message);
      return { 
        status: 500, 
        msg: "Serverda xatolik yuz berdi", 
        error: err.message 
      };
    }
  }
}

module.exports = new RoleService();