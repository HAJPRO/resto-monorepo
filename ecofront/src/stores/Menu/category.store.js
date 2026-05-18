import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { CategoryService } from "../../ApiService/index.service";

export const CategoryStore = defineStore("CategoryStore", {
  state: () => ({
    // --- CATEGORY STATE ---
    model: {
      name: "",
      image: null,
      type: "food",
      order: 1,
      isAvailable: true
    },
    isModal: false,
    modalAction: {
      action: 'create',
      id: null
    },
    categories: [],
    loading: false,
  }),

  getters: {
    // Faqat sotuvda mavjud kategoriyalarni olish uchun (ixtiyoriy)
    activeCategories: (state) => state.categories.filter(c => c.isAvailable)
  },

  actions: {
    // Modal oynasini boshqarish
    async ModalAction(payload) {
      this.modalAction = payload;
      this.isModal = true;
      // Agar yangi yaratilayotgan bo'lsa, modelni tozalash
      if (payload.action === 'create') {
        this.model = { name: "", image: null, type: "food", order: 1, isAvailable: true };
      }
    },

    // Kategoriya yaratish yoki tahrirlash
    async Create(payload) {
      const { toast } = useToast();
      this.loading = true;
      try {
        await CategoryService.Create(payload);
        toast.success(this.modalAction.action === 'edit' ? "Yangilandi!" : "Muvaffaqiyatli yaratildi!");
        this.isModal = false;
        await this.GetAll(); // Ro'yxatni yangilash
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Barcha kategoriyalarni yuklash
    async GetAll(payload) {
      this.loading = true;
      try {
        const response = await CategoryService.GetAll(payload);
        this.categories = response.data.data;
      } catch (error) {
        const { toast } = useToast();
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },

    // Kategoriyani o'chirish (ixtiyoriy)
    async Delete(id) {
      const { toast } = useToast();
      try {
        await CategoryService.Delete(id);
        toast.success("O'chirildi");
        await this.GetAll();
      } catch (error) {
        toast.error("O'chirishda xatolik");
      }
    }
  },
});