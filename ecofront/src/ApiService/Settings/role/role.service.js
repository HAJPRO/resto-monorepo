import api from "../../../helpers/api";

const RoleService = {
    /**
     * Barcha rollarni olish
     * @param {Object} data - Filtrlash uchun ma'lumotlar (ixtiyoriy)
     */
    GetAll(data = {}) {
        const url = "settings/role/all";
        return api.post(url, data);
    },

    /**
     * Rol yaratish yoki tahrirlash (Upsert)
     * Agar data ichida _id bo'lsa - Update, bo'lmasa - Create
     * @param {Object} data - Rol ma'lumotlari (name, value, description, permissions)
     */
    Create(payload) {
        const url = "settings/role/create";
        return api.post(url, payload);
    },

    /**
     * Rolni o'chirish
     * @param {String} id - Rolning unikall ID raqami
     */
    Delete(id) {
        const url = `settings/role/delete/${id}`;
        return api.delete(url);
    },

    /**
     * Bitta rolni ID bo'yicha olish (Agar kerak bo'lsa)
     * @param {String} id 
     */
    GetById(id) {
        const url = `settings/role/get/${id}`;
        return api.get(url);
    }
};

export default RoleService;