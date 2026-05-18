import api from "../../helpers/api";

const CounterpartyService = {
  // Yangi kontragent yaratish
  Create(payload) {
    const url = "counterparty/create";
    return api.post(url, payload);
  },

  // Barcha kontragentlarni olish (Filter yoki Pagination bilan)
  GetAll(payload) {
    const url = "counterparty/all";
    return api.post(url, payload);
  },

  // ID bo'yicha bitta kontragent ma'lumotini olish
  GetById(id) {
    const url = `counterparty/get/${id}`;
    return api.get(url);
  },

  // Kontragent ma'lumotlarini tahrirlash (Update)
  Update(id, payload) {
    const url = `counterparty/update/${id}`;
    return api.put(url, payload);
  },

  // Kontragentni o'chirish
  Delete(id) {
    const url = `counterparty/delete/${id}`;
    return api.delete(url);
  }
};

export default CounterpartyService;