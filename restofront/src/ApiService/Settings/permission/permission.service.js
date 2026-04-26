import api from "../../../helpers/api";

const PermissionService = {

    GetAll(data) {
        const url = "settings/permission/all";
        return api.post(url, data);
    },

};

export default PermissionService;