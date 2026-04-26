import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { ZoneService } from "../../ApiService/index.service"; // Service nomini o'zgartirdik

export const ZoneStore = defineStore("ZoneStore", {
  state: () => ({
    // --- ZONE (HUDUD) STATE ---
    model: {
      name: "",
      code: "",
      status: "active",
      manager: "",
      order: 1,
      description: ""
    },
    isModal: false,
    modalAction: {
      action: "create",
      id: null
    },
    zones: [], // departments -> zones
    loading: false,
  }),

  getters: {
    // Faol hududlarni filtrlab olish uchun (kerak bo'lsa)
    activeZones: (state) => state.zones.filter(z => z.status === 'active')
  },

  actions: {
    // --- MODAL ACTIONS ---
    async ModalAction(payload) {
      this.modalAction = payload;
      
      // Agar 'create' bo'lsa modelni tozalaymiz
      if (payload.action === 'create') {
        this.model = {
          name: "",
          code: "",
          status: "active",
          manager: "",
          order: this.zones.length + 1,
          description: ""
        };
      }
      this.isModal = true;
    },

    // --- API ACTIONS (Zone) ---
    async Create(payload) {
      const { toast } = useToast();
      this.loading = true;
      try {
        await ZoneService.Create(payload);
        toast.success(payload.action === 'edit' ? "Muvaffaqiyatli yangilandi!" : "Yangi hudud qo'shildi!");
        this.isModal = false;
        await this.GetAll(); // Ro'yxatni yangilash
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Saqlashda xatolik yuz berdi");
        return false;
      } finally {
        this.loading = false;
      }
    },

    async GetAll(silent = false) {
      if (!silent) this.loading = true;
      try {
        const response = await ZoneService.GetAll();
        // Backend'dan kelayotgan struktura bo'yicha: response.data yoki response.data.data
        this.zones = response.data?.data || response.data;
        
      } catch (error) {
        const { toast } = useToast();
        toast.error("Hududlarni yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },
  },
});