import api from "../../helpers/api";

const CheckTemplateService = {
  // Shablonni saqlash (Yaratish yoki Tahrirlash)
  // Payload ichida 'action' (create/edit) va '_id' (edit bo'lsa) bo'lishi kerak
  Save(payload) {
    const url = "check-template/save";
    return api.post(url, payload);
  },

  // Barcha shablonlarni olish
  GetAll(payload = {}) {
    const url = "check-template/all";
    return api.post(url, payload);
  },

  // Hozirda faol (kassada ishlatilayotgan) shablonni olish
  GetActive() {
    const url = "check-template/active";
    return api.post(url, {}); // TenantMiddleware body kutsa {} yuboramiz
  },

  // ID bo'yicha bitta shablonni olish
  GetById(id) {
    const url = `check-template/get/${id}`;
    return api.post(url, {});
  },

  // Shablonni o'chirish
  Delete(id) {
    const url = `check-template/delete/${id}`;
    return api.post(url, {});
  }
};

export default CheckTemplateService;