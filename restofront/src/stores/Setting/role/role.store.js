import { RoleService } from "../../../ApiService/index.service";
import { defineStore } from "pinia";
import { useToast } from "../../../UI/utils/useToast"; // To'g'ri yo'l ekanligini tekshiring
import { Loading } from "../../../utils/Loading.js";
import { jwtDecode } from "jwt-decode"; // O'rnatish shart: npm install jwt-decode
const loading = Loading();
const { toast } = useToast();
export const RoleStore = defineStore("RoleStore", {
  state: () => {

    return {
      roles: "",
    };
  },
  actions: {
    async GetAll(payload) {
      try {
        const res = await RoleService.GetAll();
        console.log("GetAll Response:", res);
        if (res.status === 200) {
          this.roles = res.data.roles;
          console.log("Roles State Updated:", this.roles);
          return true; 
        } else {
          toast.error("Rollar ni olishda xatolik yuz berdi");
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
