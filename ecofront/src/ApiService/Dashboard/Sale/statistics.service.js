import api from "../../../helpers/api";

const StatisticsService = {
    
    /**
     * Dashboard uchun umumiy statistika, grafiklar va to'lov turlarini olish
     * @param {Object} payload - { period?: string, startDate?: Date, endDate?: Date }
     */
    GetDashboardStats(payload) {
        const url = "/dashboard/sale/statistics/dashboard";
        return api.get(url, { 
            params: payload
        });
    },

    /**
     * Eng ko'p sotilgan mahsulotlar ro'yxatini olish
     * @param {Object} payload - { limit: number, period?: string, startDate?: Date, endDate?: Date }
     */
    GetTopSales(payload) {
        const url = "/dashboard/sale/statistics/top-sales";
        return api.get(url, { 
            params: payload
        });
    },

    /**
     * Eng ko'p xarid qilgan top mijozlar ro'yxatini olish
     * @param {Object} payload - { limit: number, period?: string, startDate?: Date, endDate?: Date }
     */
    GetTopCustomers(payload) {
        const url = "/dashboard/sale/statistics/top-customers";
        return api.get(url, { 
            params: payload
        });
    },
       GetHomeStats(payload) {
        const url = "/dashboard/sale/statistics/home";
        return api.get(url, { 
            params: payload
        });
    }
};

export default StatisticsService;