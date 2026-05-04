import api from "../../helpers/api";

const MenuService = {
    Create(payload) {
        const url = "menu/create";
        return api.post(url, payload,{
      headers: {
        'Content-Type': 'application/json', // FormData emas, JSON yuboramiz
        'x-tenant-id': localStorage.getItem('companyCode') || 'lattico'
      }
    });
    },
     GetAll(payload) {
        const url = "menu/all";
        return api.post(url, payload);
    },
        GetById(id) {
        const url = `menu/get/${id}`;
        return api.get(url);
        },
    Delete(id) {
        const url = `menu/delete/${id}`;
        return api.delete(url);},

        // --- CATEGORY API ---
    CreateCategory(payload) {
        const url = "menu/category/create";
        return api.post(url, payload,{
      headers: {
        'Content-Type': 'application/json', // FormData emas, JSON yuboramiz
        'x-tenant-id': localStorage.getItem('companyCode') || 'lattico'
      }
    });
  },
    GetAllCategories() {
        const url = "menu/category/all";
        return api.post(url);
    },
    GetCategoryById(id) {
        const url = `menu/category/get/${id}`;
        return api.get(url);
    },
    DeleteCategory(id) {
        const url = `menu/category/delete/${id}`;
        return api.delete(url);
    },


    ///Cart uchun API
    CreateOrder(payload) {
        const url = "menu/order/create";
        return api.post(url, payload,{
      headers: {
        'Content-Type': 'application/json', // FormData emas, JSON yuboramiz
        'x-tenant-id': localStorage.getItem('companyCode') || 'lattico'
      }
    });
    },
    UpdateOrder(payload){
      console.log(payload)
        const url = "menu/order/update";
        return api.post(url, payload)
    }
  
    

};

// MANA SHU QATORNI QO'SHING
export default MenuService;