import api from "../../../helpers/api";

const InsertService = {
    /**
     * Yangi kirim yaratish
     * @param {Object} payload - { items, counterpartyId, warehouseId, totalAmount, ... }
     */
    Create(payload) {
        const url = "insert/create";
        return api.post(url, payload);
    },

    /**
     * Kirimlar ro'yxatini olish (Filtrlar va pagination bilan)
     * Store'dan page, limit, startDate kabi ma'lumotlar keladi
     */
    GetAll(payload) {
        const url = "insert/all";
        // Backend odatda POST orqali filtr parametrlarini qabul qiladi
        return api.post(url, payload);
    },

    /**
     * Bitta kirimning to'liq tafsilotlarini olish
     */
    GetById(id) {
        const url = `insert/${id}`;
        return api.get(url);
    },

    /**
     * Kirim hujjatini bekor qilish yoki o'chirish
     */
    Delete(id) {
        const url = `insert/${id}`;
        return api.delete(url);
    },

    /**
     * Kirim hujjatini tahrirlash (kerak bo'lsa)
     */
    Update(id, payload) {
        const url = `insert/${id}`;
        return api.put(url, payload);
    }
};

export default InsertService;