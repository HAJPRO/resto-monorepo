import { AuthService } from "../../ApiService/index.service";
import { defineStore } from "pinia";
import { toast } from "../../UI/utils/useToast"; // To'g'ri yo'l ekanligini tekshiring
import { Loading } from "../../utils/Loading.js";
import { jwtDecode } from "jwt-decode"; // O'rnatish shart: npm install jwt-decode
import router from "../../router/index"; // Routeringiz qayerda joylashgan bo'lsa o'sha yo'lni yozing
const loading = Loading();
export const AuthStore = defineStore("AuthStore", {
  state: () => {
    // Sahifa yangilanganda ham foydalanuvchi ma'lumotlarini saqlab qolamiz
    const token = localStorage.getItem("token");

    return {
      user: token ? jwtDecode(token) : null, // Guard aynan shu 'user'ni qidiradi
      items: "",
      is_alert: false,
      billing : {}
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
    // 1. So'rov yuborishdan oldin yuborilayotgan ma'lumotni ko'ramiz
    console.log("Yuborilayotgan payload:", JSON.parse(JSON.stringify(payload)));

    const res = await AuthService.Login(payload);
    
    // Agar kod shu yerga kelsa, demak Status 2xx (Muvaffaqiyatli)
    console.log("Serverdan kelgan muvaffaqiyatli javob:", res.data);

    if (res.data?.success && res.data?.data?.accessToken) {
      const { accessToken, user, billing, companyCode } = res.data.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("companyCode", companyCode);
      
      this.user = user;
      this.isAuthenticated = true;

      if (billing) {
        this.billing = {
          balance: billing.balance,
          daysRemaining: billing.daysRemaining,
          isLow: billing.isLow,
          currency : billing.currency
        };
        // Ob'ektni matnga aylantirib saqlash
localStorage.setItem("balance", JSON.stringify(this.billing));
      }

      toast.success(res.message || "Tizimga muvaffaqiyatli kirdingiz!");

      setTimeout(async () => {
        await router.replace("/explore/home");
      }, 300);

      return true;
    } else{
      toast.error(res.message)
    }

    return false;
  } catch (err) {
    // --- MUHIM: Xatolik aynan shu yerda ushlanadi ---
    
    // 1. Agar serverdan javob kelgan bo'lsa (400, 401, 403, 500)
    if (err.response) {
      console.log("Xatolik holati (Status):", err.response.status);
      console.log("Serverdan kelgan xato xabari:", err.response.data); // SIZ QIDIRGAN LOG SHU YERDA!
      
      const errorMessage = err.response.data?.message || "Server xatosi";
      toast.error(errorMessage);
    } 
    // 2. Agar serverdan umuman javob kelmagan bo'lsa (Internet yoki Server o'chiq)
    else if (err.request) {
      console.log("Server bilan bog'lanish yo'q (Network Error)");
      toast.error("Server bilan bog'lanish imkoniyati yo'q");
    } 
    // 3. Boshqa kutilmagan xatolar
    else {
      console.log("Kutilmagan xato:", err.message);
    }

    // Xato bo'lganda state'larni tozalash
    this.user = null;
    this.isAuthenticated = false;
    this.billing = null;

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
