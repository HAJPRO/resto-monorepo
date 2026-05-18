import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { CheckTemplateService } from "../../ApiService/index.service";

export const CheckTemplateStore = defineStore("CheckTemplateStore", {
  state: () => ({
    config: {
      paperWidth: 58,
      companyName: 'SHAHAR RESTORANI',
      address: '',
      phone: '',
      socials: '',
      showLogo: true,
      logoImage: null,
      showWaiter: true,
      showCashier: true,
      showCustomer: true,
      showBalance: false,
      showService: true,
      servicePercent: 10,
      showDiscount: false,
      discountValue: 0,
      showFiscal: true,
      showQR: true,
      showFooterText: true,
      footerText: 'Xaridingiz uchun rahmat!',
      currency: 'UZS',
      lineStyle: 'dashed'
    },
    templates: [],
    loading: false,
  }),

  actions: {
    async SaveTemplate() {
      const { toast } = useToast();
      this.loading = true;
      
      const payload = {
        ...this.config,
        action: this.config._id ? "edit" : "create",
        _id: this.config._id || null
      };

      try {
        const response = await CheckTemplateService.Save(payload);
        if (response.data.success) {
          toast.success("Shablon muvaffaqiyatli saqlandi!");
          
          if (response.data.data?._id) {
            this.config._id = response.data.data._id;
          }
          
          await this.GetAllTemplates();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Saqlashda xatolik yuz berdi");
      } finally {
        this.loading = false;
      }
    },
 async ClearTemplate() {
      this.config = {
        
      };
    },
    async GetAllTemplates(payload = {}) {
      this.loading = true;
      try {
        const response = await CheckTemplateService.GetAll(payload);
        this.templates = response.data.data;
        
        if (this.templates.length > 0 && !this.config._id) {
           const active = this.templates.find(t => t.isActive);
           if (active) this.config = { ...active };
        }
      } catch (error) {
        const { toast } = useToast();
        toast.error("Shablonlarni yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },

    async GetActiveTemplate() {
      this.loading = true;
      try {
        const response = await CheckTemplateService.GetActive();
        if (response.data.data) {
          this.config = response.data.data;
        }
      } catch (error) {
        console.error("Active template error:", error);
      } finally {
        this.loading = false;
      }
    }
  },
});