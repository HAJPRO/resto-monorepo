import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { EmployeeService } from "../../ApiService/index.service";

export const EmployeeStore = defineStore("EmployeeStore", {
  state: () => ({
    // --- FOOD (TAOM) STATE ---
    model: {},
    isModal: false,
    modalAction: {},
    employees: [],
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
        await EmployeeService.Create(payload, action);
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
        const response = await EmployeeService.GetAll(payload);
        this.employees = response.data.data.data;
        console.log(this.employees)
      } catch (error) {
        const { toast } = useToast();
        toast.error("Yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },
  },
});
