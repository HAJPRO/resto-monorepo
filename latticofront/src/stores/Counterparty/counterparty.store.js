import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { CounterpartyService } from "../../ApiService/index.service";

export const CounterpartyStore = defineStore("CounterpartyStore", {
  state: () => ({
    model: {},
    isModal: false,
    modalAction: "", // "add" yoki "edit"
    counterparties: [],
    loading: false,
  }),

  getters: {
    // Zarur bo'lsa, filtrlangan kontragentlar uchun getter qo'shish mumkin
  },

  actions: {
    async openModal(payload) {
      if (payload.action === "edit") {
        this.model = { ...payload.data }; // Reference'ni uzish uchun clone qilingani ma'qul
      } else {
        this.model = {}; // Yangi qo'shish bo'lsa modelni tozalaymiz
      }
      this.modalAction = payload.action;
      this.isModal = true;
    },

    async createOrUpdate(payload) {
      const { toast } = useToast();
      this.loading = true;
      try {
        // modalAction'ga qarab API chaqiriladi
        await CounterpartyService.Create(payload, this.modalAction); 
        
        toast.success("Muvaffaqiyatli saqlandi!");
        this.isModal = false;
        this.getAll();
      } catch (error) {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        this.loading = false;
      }
    },

    async getAll(params) {
      this.loading = true;
      try {
        const response = await CounterpartyService.GetAll(params);
        this.counterparties = response.data.data;
      } catch (error) {
        const { toast } = useToast();
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },
    
    closeModal() {
      this.isModal = false;
      this.model = {};
      this.modalAction = "";
    }
  },
});