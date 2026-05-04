import api from "../../helpers/api";

const ZoneService = {
    /**
     * Yangi hudud yaratish yoki tahrirlash
     * payload: { name, code, status, manager, order, action, _id? }
     */
    Create(payload) {
        const url = "zone/create"; 
        return api.post(url, payload);
    },

    /**
     * Barcha hududlar ro'yxatini olish
     * payload: { search, status, etc... }
     */
    GetAll(payload) {
        const url = "zone/all";
        return api.post(url, payload);
    },

    /**
     * Hududni ID bo'yicha olish
     */
    GetById(id) {
        const url = `zone/get/${id}`;
        return api.get(url);
    },

    /**
     * Hududni o'chirish (Agar kerak bo'lsa)
     */
    Delete(id) {
        const url = `zone/delete/${id}`;
        return api.delete(url);
    }
};

export default ZoneService;