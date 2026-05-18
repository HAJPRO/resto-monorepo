import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { OrderService } from "../../ApiService/index.service";

export const OrderStore = defineStore('OrderStore', {
  state: () => ({
    orders: [],
    loading: false,
    isModal: false,
    modalAction: '',
    
    // Pagination va Filtr holati
    page: 1,
    limit: 10,
    hasMore: true,
    
  }),

  actions: {
    // --- BUYURTMA YARATISH ---
    async Create(payload, action) {
      const { toast } = useToast();
      this.loading = true;
      try {
        await OrderService.Create(payload, action);
        toast.success("Muvaffaqiyatli saqlandi!");
        this.isModal = false;
        // Yangi buyurtmadan keyin ro'yxatni yangilaymiz
        this.GetAll(true); 
      } catch (error) {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        this.loading = false;
      }
    },

   
async GetAll(isRefresh = true, filter = null) {
      if (this.loading) return;
      this.loading = true;
      
      if (isRefresh) {
        this.page = 1;
        this.hasMore = true;
      }

      const apiPayload = {
        page: this.page,
        limit: this.limit
      };

      if (filter) {
        if (typeof filter === 'string') {
          apiPayload.filterType = filter;
        } else if (filter.start && filter.end) {
          apiPayload.startDate = filter.start;
          apiPayload.endDate = filter.end;
        }
      }

      try {
        const response = await OrderService.GetAll(apiPayload);
        
        // DIQQAT: Backend strukturangizga qarab tekshiramiz
        // response.data -> Axios javobi
        // response.data.data -> Backenddagi { data: [...], total: 10 } obyekti
        // Shuning uchun massivni olish uchun:
        const fetchedOrders = response.data?.data.data.data || [];
        
        // AGAR yuqoridagi ishlamasa, buni ko'ring:
        // const fetchedOrders = response.data?.data || []; 

        if (isRefresh) {
          this.orders = Array.isArray(fetchedOrders) ? fetchedOrders : [];
        } else {
          if (Array.isArray(fetchedOrders)) {
            this.orders = [...this.orders, ...fetchedOrders];
          }
        }

        this.hasMore = fetchedOrders.length === this.limit;
        if (this.hasMore) this.page++;

      } catch (error) {
        const { toast } = useToast();
        toast.error("Ma'lumotlarni yuklashda xatolik");
        console.error("Order Load Error:", error);
        this.orders = []; // Xatolik bo'lsa massivni bo'shatamiz
      } finally {
        this.loading = false;
      }
    },

    
  }
});