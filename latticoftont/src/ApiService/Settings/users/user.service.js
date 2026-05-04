import api from "../../../helpers/api";

const UserService = {
    
    GetAll(data = {}) {
        const url = "settings/user/all";
        return api.post(url, data);
    },

  
    Create(payload) {
        const url = "settings/user/create";
        return api.post(url, payload);
    },

   
    Delete(id) {
        const url = `settings/user/delete/${id}`;
        return api.delete(url);
    },

   
    GetById(id) {
        const url = `settings/user/get/${id}`;
        return api.get(url);
    },

   
    ResetPassword(payload) {
        const url = "settings/user/reset-password";
        return api.post(url, payload);
    },

    
    UpdateStatus(id, status) {
        const url = `settings/user/status/${id}`;
        return api.patch(url, { isActive: status });
    }
};

export default UserService;