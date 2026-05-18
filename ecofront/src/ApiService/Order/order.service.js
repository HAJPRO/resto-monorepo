import api from "../../helpers/api";

const OrderService = {
    Create(payload) {
        const url = "order/create";
        return api.post(url, payload);
    },
     GetAll(payload) {
        const url = "order/all";
        return api.post(url, payload);
    },
        GetById(id) {
        const url = `order/get/${id}`;
        return api.get(url);
        },
        SubmitPayment(payload) {
        const url = "order/payment";
        return api.post(url, payload)
        },

     
    

};

// MANA SHU QATORNI QO'SHING
export default OrderService;