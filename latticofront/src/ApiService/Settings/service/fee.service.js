import api from "../../../helpers/api";

const FeeService = {
 Create(data) {
        const url = "settings/service/fee/create";
        return api.post(url, data);
    },
    GetFee(data) {
        const url = "settings/service/fee/all";
        return api.post(url, data);
    },

};

export default FeeService;