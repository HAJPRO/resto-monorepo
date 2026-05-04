import api from "../../helpers/api";

const TabelService = {
    Create(payload,action) {
        const url = "tabel/create";
        return api.post(url, {...payload,action});
    },
     GetAll(payload) {
        const url = "tabel/all";
        return api.post(url, payload);
    },
        GetById(id) {
        const url = `tabel/get/${id}`;
        return api.get(url);
        },
    ///Booking Modal uchun service
        CreateBooking(payload) {
        const url = `tabel/booking/create/${payload._id}`;
        return api.post(url, payload);
    },
        GetTableBookings(id) {
        const url = `tabel/booking/get/${id}`;
        return api.get(url);
        },

        //cart service
        

};

// MANA SHU QATORNI QO'SHING
export default TabelService;