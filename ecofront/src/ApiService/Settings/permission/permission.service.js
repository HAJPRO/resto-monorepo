import api from "../../../helpers/api";

const PermissionService = {

    GetAll(data) {
        const url = "settings/permission/all";
        return api.post(url, data);
    },
    Create(payload) {
        const url = "settings/permission/create";
        return api.post(url, payload);
    },
    Delete(id) {
        const url = `settings/permission/delete/${id}`;
        return api.delete(url);
    },

};

export default PermissionService;