import { defineStore } from "pinia";
import { useToast } from "../../../UI/utils/useToast";
const { toast } = useToast();
import { FeeService } from "../../../ApiService/index.service";

export const FeeStore = defineStore("FeeStore", {
  state: () => ({
    // Boshlang'ich model strukturasi
    model: { 
      _id: null,
      percentage: 0,
      status: 'inactive',
      title: ''
    },
    loading: false,
  }),

  actions: {
    async Create(payload) {
      this.loading = true; // Saqlash jarayonida ham loading bo'lishi yaxshi
      try {
        // payload.action === "create" sharti saqlanib qoldi
        if (payload.action === "create") {
          const response = await FeeService.Create(payload);
          toast.success(response.data.msg || "Muvaffaqiyatli saqlandi");
        }
      } catch (error) {
        console.error("Saqlashda xatolik:", error);
        toast.error("Saqlashda xatolik yuz berdi");
      } finally {
        this.loading = false;
        // Ma'lumot saqlangandan keyin modelni yangilash uchun qayta chaqiramiz
        await this.GetFee(); 
      }
    },

    async GetFee(payload) {
      this.loading = true;
      try {
        const response = await FeeService.GetFee(payload);
        const result = response.data.data;
        if (result) {
          this.model = { ...result }; 
        }
      } catch (error) {
        console.error("Yuklashda xatolik:", error);
        toast.error("Ma'lumotni yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },
  },
});