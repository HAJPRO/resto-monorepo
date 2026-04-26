import api from "../../../helpers/api";

const UserService = {

    GetAll(data) {
        const url = "settings/user/all";
        return api.post(url, data);
    },

};

export default UserService;