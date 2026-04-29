import { PermissionService } from "../../../ApiService/index.service";
import { defineStore } from "pinia";
import { useToast } from "../../../UI/utils/useToast";
;

export const PermissionStore = defineStore("PermissionStore", {
  state: () => ({
    isModal: false,
    modalAction: { action: 'create' }, // Default qiymat
    model: {
      name: '',
      value: '',
      description: ''
    },
    permissions: [],
    loading: false,
  }),

  actions: {
    // --- MODALNI BOSHQARISH ---
    async ModalAction(payload) {
      this.modalAction = payload;
      
      if (payload.action === 'edit' && payload.data) {
        // Tahrirlash bo'lsa, mavjud ma'lumotni modelga nusxalash
        this.model = { ...payload.data };
      } else {
        // Yangi yaratish bo'lsa, modelni tozalash
        this.model = { name: '', value: '', description: '' };
      }
      
      this.isModal = true;
    },

    // --- SAQLASH (HAM CREATE, HAM UPDATE) ---
    async Save() {
     const { toast } = useToast();
      this.loading = true;
      
      const isEdit = this.modalAction.action === 'edit';
      const payload = { ...this.model };

      try {
        // Backend'da bitta API yoki ikkita alohida API bo'lishidan qat'i nazar:
        const res = isEdit 
          // ? await PermissionService.Update(payload._id, payload) 
            const respons = await PermissionService.Create(payload);
        if (respons.data.status === 200 || respons.data.status === 201) {
          toast.success(respons.data.msg);
          this.isModal = false;
          await this.GetAll(); // Ro'yxatni yangilash
          return true;
        }
      } catch (error) {
       toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        return false;
      } finally {
        this.loading = false;
        this.isModal = false; // Modalni har doim yopish
      }
    },

    // --- HAMMA PERMISSIONLARNI OLISH ---
    async GetAll() {
      this.loading = true;
      try {
        const res = await PermissionService.GetAll();
        if (res.status === 200) {
          // Backend'dan kelayotgan strukturaga qarab to'g'rilang
          this.permissions = res.data.permissions || res.data;
          return true;
        }
      } catch (err) {
        this.handleError(err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- PERMISSIONNI O'CHIRISH ---
    async Delete(id) {
        const { toast } = useToast();
      this.loading = true;
      try {
        const res = await PermissionService.Delete(id);
        if (res.data.status === 200 || res.data.status === 204) {
          this.permissions = this.permissions.filter(item => item._id !== id);
          toast.success(res.data.msg || "Ruxsatnoma o'chirildi");
          return true;
        }
      } catch (err) {
        this.handleError(err);
        return false;
      } finally {
        this.loading = false;
        this.GetAll()
      }
    },

    // --- XATOLIKLARNI MARKAZLASHGAN BOSHQARISH ---
    handleError(err) {
      console.error("[PermissionStore Error]:", err);
      const message = err.response?.data?.message || "Server bilan bog'lanishda xatolik";
      toast.error(message);
    }
  },
});