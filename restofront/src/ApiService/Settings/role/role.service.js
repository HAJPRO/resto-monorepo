import api from "../../../helpers/api";

const RoleService = {

    GetAll(data) {
        const url = "settings/role/all";
        return api.post(url, data);
    },

};

export default RoleService;