import { UserService } from "../../../ApiService/index.service";
import { defineStore } from "pinia";
import { useToast } from "../../../UI/utils/useToast"; // To'g'ri yo'l ekanligini tekshiring
import { Loading } from "../../../utils/Loading.js";
import { jwtDecode } from "jwt-decode"; // O'rnatish shart: npm install jwt-decode
const loading = Loading();
const { toast } = useToast();
export const UserStore = defineStore("UserStore", {
  state: () => {

    return {
      users: "",
    };
  },
  actions: {
    async GetAll(payload) {
      try {
        const res = await UserService.GetAll();
        if (res.status === 200) {
          this.users = res.data.data;
          
          return true; 
        } else {
          toast.error("Foydalanuvchilarni olishda xatolik yuz berdi");
          return false; 
        }
      } catch (err) {
        console.error("[Login Action Error]:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Server bilan bog'lanishda xatolik yuz berdi";

        toast.error(errorMessage);

        return false; 
      }
    },
  },
});
