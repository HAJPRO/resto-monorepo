import api from "../../helpers/api";

/**
 * CashService - Kassa operatsiyalari uchun API servis.
 * Barcha so'rovlar backenddagi 'cash/' prefiksiga yo'naltirilgan.
 */
const CashService = {
    
    /**
     * 1. Smenani ochish
     * @param {Object} payload - { cashierId, startingBalance, registerId, deviceId }
     * @returns {Promise} - Yangi ochilgan smena ob'ekti
     */
    OpenShift(payload) {
        const url = "cash/open-shift";
        return api.post(url, payload);
    },

    /**
     * 2. Smenani yopish (Z-Report)
     * @param {String} id - Smena (Shift) ID si
     * @param {Object} payload - { actualCash, notes }
     */
    CloseShift(id, payload) {
        const url = `cash/close-shift/${id}`;
        return api.post(url, payload);
    },

    /**
     * 3. Kassa harakati (Kirim yoki Chiqim qo'shish)
     * @param {String} id - Smena (Shift) ID si
     * @param {Object} payload - { type: 'in'|'out', amount, reason }
     */
    AddTransaction(id, payload) {
        const url = `cash/transaction/${id}`;
        return api.post(url, payload);
    },

    /**
     * 4. Aktiv smenani tekshirish
     * Sahifa yangilanganda backend-dan joriy kassirga tegishli 'open' 
     * holatidagi smenani qidiradi. Backend foydalanuvchini Token orqali aniqlaydi.
     */
    GetActiveShift() {
        const url = "cash/active-shift"; 
        return api.get(url);
    },

    /**
     * 5. Ma'lum bir smena ma'lumotlarini ID orqali olish
     */
    GetCurrentShift(shiftId) {
        const url = `cash/shift/${shiftId}`;
        return api.get(url);
    },

    /**
     * 6. Smenalar tarixini olish (Filtrlar bilan)
     * @param {Object} payload - { startDate, endDate, cashierId, registerId }
     */
    GetHistory(payload) {
        const url = "cash/history";
        return api.post(url, payload);
    },

    /**
     * 7. X-Hisobot (Smenani yopmasdan joriy holatni ko'rish)
     */
    GetXReport(id) {
        const url = `cash/x-report/${id}`;
        return api.get(url);
    }
};

export default CashService;