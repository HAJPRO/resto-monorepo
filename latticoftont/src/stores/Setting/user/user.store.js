import { UserService } from "../../../ApiService/index.service";
import { defineStore } from "pinia";
import { useToast } from "../../../UI/utils/useToast";
import { vibrate,getBase64 } from "../../../utils/index.util";

export const UserStore = defineStore("UserStore", {
  state: () => ({
    isModal: false,
    modalAction: { action: 'create' }, 
    model: {
      image: null, // Foydalanuvchi rasmi (yangi yaratishda)
      fullname: '',
      username: '',
      phoneNumber: '',
      password: '', // Faqat yangi yaratishda kerak
      roles: [], // Rollar ID massivi
      address: {
        region: 'Buxoro',
        district: '',
        street: '',
        house: ''
      },
      position: '',
      department: '',
      carNumber: '',
      carType: '',
      vehicleCapacity: 0,
      isActive: true,
      isActivated: true,
      description: ''
    },
    users: [],
    loading: false,
  }),

  actions: {
    // --- MODALNI BOSHQARISH ---
    async ModalAction(payload) {
      this.modalAction = payload;
      
      if (payload.action === 'edit' && payload.data) {
        // 1. Chuqur nusxa olish (Deep Copy)
        let rawData = JSON.parse(JSON.stringify(payload.data));

        // 2. Formatlash: Roles massivi ichidagi obyektlarni faqat IDga aylantiramiz
        if (rawData.roles && Array.isArray(rawData.roles)) {
          rawData.roles = rawData.roles.map(role => 
            typeof role === 'object' && role !== null ? role._id : role
          );
        }

        // 3. Manzil (address) bo'sh bo'lsa, default strukturani saqlab qolish
        if (!rawData.address) {
          rawData.address = { region: 'Buxoro', district: '', street: '', house: '' };
        }

        this.model = rawData;
      } else {
        // Yangi yaratishda modelni tozalash
        this.ResetModel();
      }
      
      this.isModal = true;
    },

   // --- SAQLASH (CREATE / UPDATE) ---
async Save(payload) {
  const { toast } = useToast();
  this.loading = true;

  try {
    // Payload'dan nusxa olamiz (Original ma'lumotni buzmaslik uchun)
    const requestData = { ...payload };

    // Rasmni Base64 ga o'girish
    if (requestData.image instanceof File) {
      requestData.image = await getBase64(requestData.image);
    } else if (!requestData.image) {
      requestData.image = null;
    }

    // API so'rovi
    const res = await UserService.Create(requestData);

    // Muvaffaqiyatli holatni tekshirish
    if ([200, 201].includes(res.status) || [200, 201].includes(res.data?.status)) {
      toast.success(res.data.msg || "Ma'lumotlar muvaffaqiyatli saqlandi!");
      
      this.isModal = false;
      await this.GetAll(); // Ro'yxatni yangilash
      return true;
    } 
    
    // Serverdan xato xabari kelsa
    toast.error(res.data?.msg || "Xatolik yuz berdi");
    return false;

  } catch (error) {
    // Markazlashgan xatolar boshqaruvi
    this.handleError(error); 
    return false;
  } finally {
    this.loading = false;
  }
},

    // --- BARCHA FOYDALANUVCHILARNI OLISH ---
    async GetAll() {
      this.loading = true;
      try {
        const res = await UserService.GetAll();
        // Backend'dan kelgan ma'lumotni users massiviga yuklash
        this.users = res.data.users || res.data.data || [];
        console.log("User GetAll Response:", res.data);
        return true;
      } catch (err) {
        console.error("User GetAll Error:", err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- O'CHIRISH ---
    async Delete(id) {
      const { toast } = useToast();
      try {
        const res = await UserService.Delete(id);
        if (res.data.status === 200 || res.data.status === 204) {
          toast.success(res.data.msg || "Foydalanuvchi tizimdan o'chirildi");
          await this.GetAll();
          return true;
        }
      } catch (err) {
        this.handleError(err);
        return false;
      }
    },

    // --- MODELNI TOZALASH ---
    ResetModel() {
      this.model = {
        fullname: '',
        username: '',
        phoneNumber: '',
        password: '',
        roles: [],
        address: { region: 'Buxoro', district: '', street: '', house: '' },
        position: '',
        department: '',
        carNumber: '',
        carType: '',
        vehicleCapacity: 0,
        isActive: true,
        isActivated: true
      };
    },

    // --- XATOLIKLARNI BOSHQARISH ---
    handleError(err) {
      const { toast } = useToast();
      console.error("[UserStore Error]:", err);
      const message = err.response?.data?.msg || err.response?.data?.message || "Serverda xatolik yuz berdi";
      toast.error(message);
    }
  },
});