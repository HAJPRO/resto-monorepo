import api from "../../helpers/api";

const DepartmentService = {
    Create(payload) {
        const url = "hr/department/create";
        return api.post(url, payload,{
    });
    },
     GetAll(payload) {
        const url = "hr/department/all";
        return api.post(url, payload);
    },
        GetById(id) {
        const url = `hr/department/get/${id}`;
        return api.get(url);
        },

     
    

};

export default DepartmentService;