import { PermissionService } from "../../../ApiService/index.service";
import { defineStore } from "pinia";
import { useToast } from "../../../UI/utils/useToast"; // To'g'ri yo'l ekanligini tekshiring
import { Loading } from "../../../utils/Loading.js";
import { jwtDecode } from "jwt-decode"; // O'rnatish shart: npm install jwt-decode
const loading = Loading();
const { toast } = useToast();
export const PermissionStore = defineStore("PermissionStore", {
  state: () => {

    return {
      permissions: "",
    };
  },
  actions: {
    async GetAll(payload) {
      try {
        const res = await PermissionService.GetAll();
        console.log("GetAll Response:", res);
        if (res.status === 200) {
          this.permissions = res.data.permissions;
          console.log("Permissions State Updated:", this.permissions);
          return true; 
        } else {
          toast.error("Permissions ni olishda xatolik yuz berdi");
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
