import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Capacitor } from "@capacitor/core";

// 1. Muhitni aniqlash (Universal Helper)
const getBaseURL = () => {
    const platform = Capacitor.getPlatform(); // 'ios', 'android' yoki 'web'
    
    // Agar biz Web brauzerda bo'lsak
    if (platform === 'web') {
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        return isLocal 
            ? "http://localhost:5000/api/v1" 
            : "https://lacto-core.company-erp.uz/api/v1";
    } 

    // Agar Mobile (Native) bo'lsa, har doim Production serverga ulanish ma'qul
    // (Lokalda test qilish uchun kompyuter IP-sini yozish kerak, masalan: http://192.168.1.5:5000)
    return "https://lacto-core.company-erp.uz/api/v1";
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000, // 15 soniya kutish (Mobile tarmoqlari uchun muhim)
});

// 2. Request Interceptor
api.interceptors.request.use(
    async (config) => {
        // Universal token olish (Capacitor/Web uchun localStorage ishlayveradi, 
        // lekin kelajakda Preferences pluginiga o'tish oson bo'ladi)
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;

            try {
                const decoded = jwtDecode(token);
                
                // ✅ Tenant ID ni headerga qo'shish (Xavfsizroq tekshirish)
                const companyCode = decoded?.companyCode || decoded?.tenantId;
                
                if (companyCode) {
                    // Header nomini kichik harf bilan yozish (Best practice)
                    config.headers["x-tenant-id"] = companyCode;
                }
            } catch (error) {
                console.error("JWT Decode Error:", error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor (Xatoliklarni universal ushlash uchun)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Avtorizatsiya muddati tugagan!");
            // localStorage.clear();
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;