import { defineStore } from "pinia";
import { useToast } from "../../../UI/utils/useToast";
import { InsertService } from "../../../ApiService/index.service";

export const InsertStore = defineStore('InsertStore', {
  state: () => ({
    // --- API LIST DATA ---
    inserts: [],         // Barcha kirimlar ro'yxati
    loading: false,
    page: 1,
    limit: 15,
    hasMore: true,       // Yana ma'lumot borligini tekshirish uchun (Infinite Scroll)
    
    // --- CART DATA ---
    kirimItems: [], 
    isCartOpen: false,
    
    // --- SETTINGS / REKVIZITLAR ---
    counterpartyId: null,
    warehouseId: null,
    responsibleId: null,
    comment: '',
    
    menus: [], 
  }),

  getters: {
    totalUniqueItems: (state) => state.kirimItems.length,

    totalKirimSumma: (state) => {
      return state.kirimItems.reduce((sum, item) => {
        return sum + (Number(item.costPrice || 0) * Number(item.kirimQty || 0));
      }, 0);
    },

    getItemInKirim: (state) => (id) => state.kirimItems.find(item => item._id === id)
  },

  actions: {
    // --- 1. KIRIMLAR RO'YXATINI OLISH (GET ALL) ---
    async GetAll(refresh = false, dateRange = null) {
      if (this.loading) return;
      
      try {
        this.loading = true;
        
        if (refresh) {
          this.page = 1;
          this.inserts = [];
          this.hasMore = true;
        }

        const params = {
          page: this.page,
          limit: this.limit,
          startDate: dateRange?.start,
          endDate: dateRange?.end
        };

        const response = await InsertService.GetAll(params);
        const newItems = response.data.data.data;

        if (newItems.length < this.limit) {
          this.hasMore = false;
        }

        this.inserts = refresh ? newItems : [...this.inserts, ...newItems];
        this.page++;
        console.log(this.inserts);
        
        
      } catch (error) {
        console.error("Kirimlar yuklashda xato:", error);
      } finally {
        this.loading = false;
      }
    },

    // --- 2. BITTASINI O'CHIRISH (DELETE) ---
    async DeleteInsert(id) {
      const { toast } = useToast();
      try {
        await InsertService.Delete(id);
        this.inserts = this.inserts.filter(i => i._id !== id);
        toast.success("Kirim hujjati o'chirildi");
      } catch (error) {
        toast.error("O'chirishda xatolik yuz berdi");
      }
    },

    // --- 3. SAVATCHA AMALLARI ---
addToKirim(product) {
  const existing = this.kirimItems.find(item => item._id === product._id);

  if (existing) {
    existing.kirimQty += 1;
  } else {
    this.kirimItems.push({
      _id: product._id,
      productId: product._id, // Backend Menu.findById uchun
      name: product.name,
      unit: product.unit || 'ta',
      kirimQty: 1,
      // Menu modelidagi nomlar bilan moslash:
      costPrice: product.costPrice || 0, 
      sellPrice: product.price || 0, // Amaldagi sotuv narxi
      markup: 0 
    });
  }
},

    updateKirimQty(id, change) {
      const item = this.kirimItems.find(i => i._id === id);
      if (item) {
        item.kirimQty = Math.max(0, item.kirimQty + change);
        if (item.kirimQty === 0) this.removeFromKirim(id);
      }
    },

    setManualKirimQty(id, value) {
      const item = this.kirimItems.find(i => i._id === id);
      if (item) {
        const val = parseFloat(value) || 0;
        item.kirimQty = val;
        if (val <= 0) this.removeFromKirim(id);
      }
    },

    removeFromKirim(id) {
      this.kirimItems = this.kirimItems.filter(i => i._id !== id);
    },

    // --- 4. NARX HISOB-KITOBI ---
    calculateSellPrice(item) {
      const cost = Number(item.costPrice) || 0;
      const markup = Number(item.markup) || 0;
      item.sellPrice = Math.round(cost * (1 + markup / 100));
    },

    calculateMarkup(item) {
      const cost = Number(item.costPrice) || 0;
      const sell = Number(item.sellPrice) || 0;
      if (cost > 0) {
        item.markup = parseFloat(((sell - cost) / cost * 100).toFixed(2));
      }
    },

    // --- 5. SAQLASH (SUBMIT) ---
    async submitKirim(payload) {
      const { toast } = useToast();
      this.loading = true;
      try {
        const res = await InsertService.Create(payload);
        toast.success("Kirim saqlandi");
        
        // Yangi kirimni ro'yxatning boshiga qo'shish
        if (res.data) this.inserts.unshift(res.data);
        
        this.clearStore();
        this.isCartOpen = false;
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Xatolik");
        return false;
      } finally {
        this.loading = false;
      }
    },

    clearStore() {
      this.kirimItems = [];
      this.counterpartyId = null;
      this.warehouseId = null;
      this.responsibleId = null;
      this.comment = '';
    }
  }
});