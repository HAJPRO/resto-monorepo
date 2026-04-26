import { AuthService } from "../../ApiService/index.service";
import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast"; // To'g'ri yo'l ekanligini tekshiring
import { Loading } from "../../utils/Loading.js";
import { jwtDecode } from "jwt-decode"; // O'rnatish shart: npm install jwt-decode
import router from "../../router/index"; // Routeringiz qayerda joylashgan bo'lsa o'sha yo'lni yozing
const loading = Loading();
const { toast } = useToast();
export const AuthStore = defineStore("AuthStore", {
  state: () => {
    // Sahifa yangilanganda ham foydalanuvchi ma'lumotlarini saqlab qolamiz
    const token = localStorage.getItem("token");

    return {
      user: token ? jwtDecode(token) : null, // Guard aynan shu 'user'ni qidiradi
      items: "",
      is_alert: false,
    };
  },
  actions: {
    // async register(payload) {
    //     try {
    //         const loader = loading.show();
    //         const res = await RegisterService.Register(payload);
    //         loader.hide();
    //         ToastifyService.ToastSuccess({ msg: res.data.msg });
    //     } catch (err) {
    //         console.error("Register xatosi:", err);
    //     }
    // },

    // AuthStore.js actions qismi
    /**
     * Tizimga kirish action-i
     * @param {Object} payload - {username, password, server}
     */
   async login(payload) {
      try {
        const res = await AuthService.Login(payload);

        if (res.data?.success && res.data?.data?.accessToken) {
          const token = res.data.data.accessToken;
          const userData = res.data.data.user;

          // 1. Ma'lumotlarni saqlash (await shart emas, lekin tartib muhim)
          localStorage.setItem("token", token);
          this.user = userData || jwtDecode(token);
          this.isAuthenticated = true;

          // 2. Muvaffaqiyatli xabar
          toast.success(res.data.message || "Tizimga muvaffaqiyatli kirdingiz!");

          // 3. Sahifani almashtirish
          // setTimeout ishlatish shart bo'lsa, quyidagicha yozing:
          setTimeout(async () => {
             await router.replace("/explore/home"); // push o'rniga replace yaxshiroq (orqaga qaytmaslik uchun)
          }, 200);

          return true;
        }
        return false;
      } catch (err) {
         console.error("[Login Action Error]:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Server bilan bog'lanishda xatolik yuz berdi";

        toast.error(errorMessage);

        // Login muvaffaqiyatsiz bo'lsa state'larni tozalash
        this.user = null;
        this.isAuthenticated = false;

        return false;
      }
    },
    // async update(payload) {
    //     try {
    //         const loader = loading.show();
    //         const res = await RegisterService.Update(payload);
    //         loader.hide();
    //         ToastifyService.ToastSuccess({ msg: res.data.msg });
    //     } catch (err) {
    //         console.error("Update xatosi:", err);
    //     }
    // },

    logout() {
      console.log("Logout boshlandi...");

      // Avval o'chirishni bajaramiz
      localStorage.removeItem("token");

      console.log(
        "LocalStorage tozalandi. Token hozir:",
        localStorage.getItem("token"),
      );

      this.user = null;
      window.location.href = "/login";
    },
  },
});
