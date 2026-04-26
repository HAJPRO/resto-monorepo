import { defineStore } from "pinia";
import { StatisticsService } from "../../../ApiService/index.service";

export const StatisticsStore = defineStore('StatisticsStore', {
  state: () => ({
    loading: false,
    activeFilter: 'Hafta',
    
    // Dashboard asosiy ma'lumotlari
    totalRevenue: 0,
    totalOrders: 0,
    averageCheck: 0,
    
    // To'lov turlari ulushi
    payments: [],
    
    // Grafik ma'lumotlari
    chartData: [],
    
    // Top ro'yxatlar
    topProducts: [],
    topCustomers: [],
    
    //Home
    stats: { closedCount: 0, activeCount: 0 },
    topStaff: [],
    topDishes: [],
    lastUpdated: null
  }),

  getters: {
    hasData: (state) => state.chartData.length > 0,
    
    maxChartValue: (state) => {
      return state.chartData.length ? Math.max(...state.chartData.map(d => d.value)) : 0;
    }
  },

  actions: {
    /**
     * @param {Object} range - { startDate: Date, endDate: Date } 
     */
    async fetchAllStats(range = null) {
      this.loading = true;
      try {
        // API uchun parametrlarni tayyorlaymiz
        // Agar range bo'lsa, shuni yuboramiz, aks holda activeFilter (Kun, Hafta...)
        const params = range 
          ? { startDate: range.startDate, endDate: range.endDate }
          : { period: this.activeFilter };

        // Bir vaqtning o'zida barcha so'rovlarni yuboramiz
        const [dashRes, topSalesRes, topCustRes] = await Promise.all([
          StatisticsService.GetDashboardStats(params),
          StatisticsService.GetTopSales({ ...params, limit: 5 }),
          StatisticsService.GetTopCustomers({ ...params, limit: 10 })
        ]);

        // 1. Dashboard va to'lov turlari
        if (dashRes.data.success) {
          const d = dashRes.data.data;
          this.totalRevenue = d.totalRevenue || 0;
          this.totalOrders = d.totalOrders || 0;
          this.averageCheck = d.averageCheck || 0;
          this.payments = d.payments || [];
          this.chartData = d.chartData || [];
        }

        // 2. Top taomlar
        if (topSalesRes.data.success) {
          this.topProducts = topSalesRes.data.data;
        }

        // 3. Top mijozlar
        if (topCustRes.data.success) {
          this.topCustomers = topCustRes.data.data;
        }

        this.lastUpdated = new Date();
      } catch (error) {
        console.error("Statistikalarni yuklashda xatolik:", error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Filterni o'zgartirish (Range ishlatilmaganda)
     */
    async setFilter(newFilter) {
      this.activeFilter = newFilter;
      // Filter o'zgarganda range'siz so'rov yuboramiz
      
      await this.fetchAllStats(); 
    },

    clearStats() {
      this.$reset();
    },

    //home stat
    async GetHomeStats() {
      this.loading = true;
      try {
        const res = await StatisticsService.GetHomeStats(); // API orqali chaqirish
        console.log(res.data.data);
        
        this.stats = res.data.data.stats;
        this.topStaff = res.data.data.topStaff;
        this.topDishes = res.data.data.topDishes;
      } finally {
        this.loading = false;
      }
    }
  }
});