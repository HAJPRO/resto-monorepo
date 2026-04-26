import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { TransactionService } from "../../ApiService/index.service";

export const  TransactionStore = defineStore("TransactionStore", {
  state: () => ({
    model: {},
    isModal: false,
    modalAction: {},
    transactions: [],
    loading: false,
  }),

  getters: {},

  actions: {
    // --- API ACTIONS (Employee) ---
    async ModalAction(payload) {
      this.modalAction = payload;
      this.isModal = true;
    },
    async Create(payload, action) {
      const { toast } = useToast();
      this.loading = true;
      try {
        await TransactionService.Create(payload, action);
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
        const response = await TransactionService.GetAll(payload);
        this.transactions = response.data.data;
      } catch (error) {
        const { toast } = useToast();
        toast.error("Yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },
  },
});
