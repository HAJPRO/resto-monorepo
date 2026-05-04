import { RoleService } from "../../../ApiService/index.service";
import { defineStore } from "pinia";
import { useToast } from "../../../UI/utils/useToast";

export const RoleStore = defineStore("RoleStore", {
  state: () => ({
    isModal: false,
    modalAction: { action: 'create' }, 
    model: {
      name: '',
      value: '',
      description: '',
      permissions: [] // Rolga biriktirilgan huquqlar IDlari
    },
    roles: [],
    loading: false,
  }),

  actions: {
    // --- MODALNI BOSHQARISH ---
    // role.store.js ichida
async ModalAction(payload) {
  this.modalAction = payload;
  
  if (payload.action === 'edit' && payload.data) {
    // 1. Obyektni nusxalaymiz
    let rawData = JSON.parse(JSON.stringify(payload.data));

    // 2. Formatlash: permissions massivi ichidagi obyektlarni faqat IDga aylantiramiz
    if (rawData.permissions && Array.isArray(rawData.permissions)) {
      rawData.permissions = rawData.permissions.map(item => {
        // Agar item obyekt bo'lsa (populate bo'lgan), uning _id sini olamiz
        // Agar item allaqachon string bo'lsa, o'zini qoldiramiz
        return typeof item === 'object' && item !== null ? item._id : item;
      });
    }

    this.model = rawData;
  } else {
    // Yangi yaratishda modelni tozalash
    this.model = { 
      name: '', 
      value: '', 
      description: '', 
      permissions: [] 
    };
  }
  
  this.isModal = true;
},

    // --- SAQLASH (UPSERT LOGIC) ---
    async Save() {
      const { toast } = useToast();
      this.loading = true;
      
      try {
        // Backend'da CreateRole (Upsert) API ishlatiladi
        const res = await RoleService.Create(this.model);
console.log(res);

        if (res.data.status === 200 || res.data.status === 201) {
          toast.success(res.data.msg || "Rol muvaffaqiyatli saqlandi!");
          this.isModal = false;
          await this.GetAll(); 
          return true;
        } else {
          toast.error(res.data.msg || "Xatolik yuz berdi");
          return false;
        }
      } catch (error) {
        this.handleError(error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- MA'LUMOTLARNI YUKLASH ---
    async GetAll() {
      this.loading = true;
      try {
        const res = await RoleService.GetAll();
        // Backend populate ishlatgan bo'lsa, permissions massivi to'liq keladi
        this.roles = res.data?.roles || res.data || [];
        return true;
      } catch (err) {
        console.error("Role GetAll Error:", err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- O'CHIRISH ---
    async Delete(id) {
      const { toast } = useToast();
      try {
        const res = await RoleService.Delete(id);
        if (res.data.status === 200 || res.data.status === 204) {
          toast.success(res.data.msg || "Rol o'chirildi");
          await this.GetAll();
          return true;
        }
      } catch (err) {
        this.handleError(err);
        return false;
      }
    },

    // --- XATOLIKLARNI BOSHQARISH ---
    handleError(err) {
      const { toast } = useToast();
      console.error("[RoleStore Error]:", err);
      const message = err.response?.data?.msg || err.response?.data?.message || "Serverda xatolik yuz berdi";
      toast.error(message);
    }
  },
});