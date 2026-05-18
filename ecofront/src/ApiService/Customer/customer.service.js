import api from "../../helpers/api";
const CustomerService = {
    Create(payload) {
        const url = "customer/create";
        return api.post(url, payload,{
    });
    },
     GetAll(payload) {
        const url = "customer/all";
        return api.post(url, payload);
    },
        GetById(id) {
        const url = `customer/get/${id}`;
        return api.get(url);
        },
};
export default CustomerService;