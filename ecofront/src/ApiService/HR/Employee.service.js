import api from "../../helpers/api";

const EmployeeService = {
    Create(payload) {
        const url = "hr/employee/create";
        return api.post(url, payload,{
    });
    },
     GetAll(payload) {
        const url = "hr/employee/all";
        return api.post(url, payload);
    },
        GetById(id) {
        const url = `hr/employee/get/${id}`;
        return api.get(url);
        },

     
    

};

// MANA SHU QATORNI QO'SHING
export default EmployeeService;