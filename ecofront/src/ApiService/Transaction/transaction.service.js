import api from "../../helpers/api";

const TransactionService = {
    Create(payload,action) {
        const url = "transaction/create";
        return api.post(url, {...payload,action});
    },
     GetAll(payload) {
        const url = "transaction/all";
        return api.post(url, payload);
    },
        GetById(id) {
        const url = `transaction/get/${id}`;
        return api.get(url);
        },
   
        

};

export default TransactionService;