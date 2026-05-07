import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { CashService } from "../../ApiService/index.service";

export const CashStore = defineStore("CashStore", {
  state: () => ({
    currentShift: null, // Aktiv smena ma'lumotlari
    loading: false,     // API so'rovlari yuklanayotgan holati
    initialized: false, // Sahifa birinchi marta yuklanishini nazorat qilish
    registers: [],      // Mavjud kassa apparatlari ro'yxati
    shiftHistory: [],   // O'tgan smenalar tarixi
  }),

  getters: {
    // Smena ochiqligini tekshirish (Computed)
    isShiftOpen: (state) => {
      return !!state.currentShift && state.currentShift.status === 'open';
    },

financialSummary: (state) => {
  const summary = {
    cash: 0,
    card: 0,
    debt: 0,
    in: 0,
    out: 0,
    starting: state.currentShift?.startingBalance || 0,
    totalSales: 0 // Tekshiruv uchun umumiy savdo
  };

  if (!state.currentShift) return summary;

  // Tranzaksiyalar
  state.currentShift.transactions?.forEach(tx => {
    if (tx.type === 'in') summary.in += tx.amount;
    else summary.out += tx.amount;
  });

  // Sotuvlar tahlili
  state.currentShift.closedOrderIds?.forEach(order => {
    summary.totalSales += (order.finalTotal || 0);

    let orderPaid = 0;
    order.payments?.forEach(p => {
      if (p.type === 'cash') {
        summary.cash += p.amount;
        orderPaid += p.amount;
      }
      if (p.type === 'card') {
        summary.card += p.amount;
        orderPaid += p.amount;
      }
    });

    // Qarzni hisoblash: Agar buyurtma summasi to'langanidan ko'p bo'lsa
    const orderDebt = (order.finalTotal || 0) - orderPaid;
    if (orderDebt > 0) {
      summary.debt += orderDebt;
    }
  });

  summary.totalInVault = summary.starting + (summary.in - summary.out) + summary.cash;

  return summary;
},

  // 2. Jami Terminal (Karta) tushumlari
  totalCardPayments: (state) => {
    if (!state.currentShift?.closedOrderIds) return 0;
    return state.currentShift.closedOrderIds.reduce((acc, order) => {
      const cardTotal = order.payments?.filter(p => p.type === 'card')
        .reduce((sum, p) => sum + p.amount, 0) || 0;
      return acc + cardTotal;
    }, 0);
  },

  // 3. Jami Nasiya (Qarz) miqdori
 totalDebtOrders: (state) => {
  if (!state.currentShift?.closedOrderIds) return 0;
  
  return state.currentShift.closedOrderIds.reduce((acc, order) => {
    // 1. Buyurtmaning umumiy summasi
    const total = order.finalTotal || 0;
    
    // 2. Shu buyurtma uchun amalga oshirilgan jami to'lovlar (naqd + karta)
    const paidSum = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    
    // 3. Haqiqiy qarz = Jami summa - To'langan summa
    // Faqat qarzga yopilgan (unpaid) yoki to'lovi chala buyurtmalar uchun
    const actualDebt = (order.paymentMethod === 'unpaid' || total > paidSum) 
                       ? (total - paidSum) 
                       : 0;
    
    return acc + actualDebt;
  }, 0);
},

  // 4. Kassa operatsiyalari (Kirim va Chiqim alohida)
  kassaOperations: (state) => {
    const txs = state.currentShift?.transactions || [];
    return {
      in: txs.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0),
      out: txs.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0)
    };
  },

    // Faqat tranzaksiyalar ro'yxatini olish
    getTransactions: (state) => {
      return state.currentShift?.transactions || [];
    }
  },

  actions: {
    /**
     * 1. AKTIV SMENANI TEKSHIRISH
     * Sahifa onMounted bo'lganda birinchi bo'lib chaqiriladi.
     * @param {boolean} force - Majburiy yangilash (refresh uchun)
     */
    async checkActiveShift(force = false) {
      if (this.initialized && !force) return;
      
      this.loading = true;
      try {
        const response = await CashService.GetActiveShift();
        
        if (response.data.success && response.data.data) {
          this.currentShift = response.data.data;
          console.log();
          
          // ID ni saqlab qo'yish (zarurat bo'lsa)
          localStorage.setItem('active_shift_id', this.currentShift._id);
        } else {
          this.currentShift = null;
          localStorage.removeItem('active_shift_id');
        }
      } catch (error) {
        console.error("Shift check error:", error);
        this.currentShift = null;
      } finally {
        this.loading = false;
        this.initialized = true; // Yuklash tugaganini bildiradi
      }
    },

    /**
     * 2. SMENANI OCHISH
     */
    async openShift(payload) {
      const { toast } = useToast();
      this.loading = true;
      try {
        const response = await CashService.OpenShift(payload);
        if (response.data.success) {
          this.currentShift = response.data.data;
          localStorage.setItem('active_shift_id', this.currentShift._id);
          toast.success("Smena muvaffaqiyatli ochildi!");
          return response.data.data;
        }
      } catch (error) {
        const msg = error.response?.data?.message || "Smenani ochishda xatolik";
        toast.error(msg);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 3. SMENANI YOPISH (Z-Report)
     */
    async closeShift(payload) {
      const { toast } = useToast();
      if (!this.currentShift?._id) return;
      
      this.loading = true;
      try {
        const response = await CashService.CloseShift(this.currentShift._id, payload);
        if (response.data.success) {
          this.currentShift = null;
          localStorage.removeItem('active_shift_id');
          toast.warning("Smena yopildi, hisobot tayyor.");
          return response.data;
        }
      } catch (error) {
        toast.error("Smenani yopishda xatolik yuz berdi");
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 4. KASSA HARAKATI QO'SHISH (Kirim/Chiqim)
     */
    async addTransaction(payload) {
      const { toast } = useToast();
      if (!this.currentShift?._id) return;

      try {
        const response = await CashService.AddTransaction(this.currentShift._id, payload);
        
        if (response.data.success && this.currentShift) {
          // Reaktivlikni ta'minlash uchun massivni yangilaymiz
          this.currentShift.transactions = [
            ...(this.currentShift.transactions || []),
            response.data.data
          ];
          toast.success("Kassa harakati qayd etildi");
        }
      } catch (error) {
        toast.error("Tranzaksiyani saqlashda xatolik");
        throw error;
      }
    },

    /**
     * 5. SMENALAR TARIXINI OLISH
     */
    async getShiftHistory(filters = {}) {
      this.loading = true;
      try {
        const response = await CashService.GetHistory(filters);
        if (response.data.success) {
          this.shiftHistory = response.data.data;
        }
      } catch (error) {
        console.error("History fetch error:", error);
      } finally {
        this.loading = false;
      }
    }
  }
});