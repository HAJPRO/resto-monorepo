import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export const ToastifyService = {
    ToastInfo(item) {
        return toast.info("Toast Info !", { autoClose: 1500 });
    },
    ToastSuccess(data) {
        return toast.success(data.msg, { autoClose: 1500 });
    },
    ToastWarning(item) {
        return toast.warning("Toast warning !", { autoClose: 1500 });
    },
    ToastError(error) {
        return toast.error(error.msg, { autoClose: 1500 });
    },
};