import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { DepartmentService } from "../../ApiService/index.service";

export const DepartmentStore = defineStore("DepartmentStore", {
  state: () => ({
    // --- FOOD (TAOM) STATE ---
    model: {},
    isModal: false,
    modalAction: {},
    departments: [],
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
        await DepartmentService.Create(payload, action);
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
        const response = await DepartmentService.GetAll(payload);
        this.departments = response.data.data;
      } catch (error) {
        const { toast } = useToast();
        toast.error("Yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },
  },
});
