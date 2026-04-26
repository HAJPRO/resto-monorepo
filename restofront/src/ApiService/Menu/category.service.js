import api from "../../helpers/api";

const CategoryService = {
   
    Create(payload) {
        const url = "menu/category/create";
        return api.post(url, payload);
    },


    GetAll(payload) {
        const url = "menu/category/all";
        return api.post(url, payload);
    },

    
    GetById(id) {
        const url = `menu/category/get/${id}`;
        return api.get(url);
    },

    
    Delete(id) {
        const url = `menu/category/delete/${id}`;
        return api.delete(url);
    }
};

export default CategoryService;