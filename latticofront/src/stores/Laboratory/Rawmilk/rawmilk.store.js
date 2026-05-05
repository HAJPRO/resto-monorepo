import { defineStore } from "pinia";
import { useToast } from "../../../UI/utils/useToast";
import { CustomerService } from "../../../ApiService/index.service";

export const RawmilkStore = defineStore("RawmilkStore", {
  state: () => ({
    model: {},
    isModal: false,
    modalAction: "",
    customers: [],
    loading: false,
  }),

  getters: {},

  actions: {
    async ModalAction(payload) {
    if(payload.action ==="edit"){
        this.model= payload.data
    }
      this.modalAction = payload;
      this.isModal = true;
    },
    async Create(payload, action) {
      const { toast } = useToast();
      this.loading = true;
      try {
        await CustomerService.Create(payload, action);
        toast.success("Muvaffaqiyatli!");
        this.isModal = false;
        this.GetAll();
      } catch (error) {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        this.loading = false;
      }
    },

    async GetAll(payload) {
      this.loading = true;
      try {
        const response = await CustomerService.GetAll(payload);
        this.customers = response.data.data;
      } catch (error) {
        const { toast } = useToast();
        toast.error("Yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },
  },
});
