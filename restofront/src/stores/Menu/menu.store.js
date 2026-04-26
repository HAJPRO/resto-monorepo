import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { MenuService } from "../../ApiService/index.service";
import { TabelStore, FeeStore } from "../../stores/index.store";

export const MenuStore = defineStore('MenuStore', {
  state: () => ({
    model: { _id: null }, 
    cartItems: [],
    isCartOpen: false,
    loading: false,
    
    // Taomlar va Kategoriyalar
    menus: [],
    categories: [],
    isModal: false,
    modalAction: '',
    
    // Kategoriya Modal State
    isCategoryOpen: false,
    isCategoryEditModal: false,
    categoryModalAction: 'create',
    categoryModel: { name: '', image: null, icon: 'fa-solid fa-utensils' },

    // Hisob-kitob sozlamalari
    isServiceActive: true,
    serviceFeePercent: 0, 
    discountPercent: 0, 
    
    // Tanlovlar
    selectedTable: null,
    selectedStaff: null,
    selectedCustomer: null,
    orderType: 'table',
    orderComment: '',
  }),

  getters: {
    totalItemsCount: (state) => state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
    currentSubtotal: (state) => state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    
    // Xizmat haqini hisoblash (Dinamik ravishda FeeStore'dan oladi)
    calculateServiceFee: (state) => {
      const feeStore = FeeStore();
      const percentage = feeStore.model?.status === 'active' ? feeStore.model?.percentage : 0; 

      if (state.isServiceActive) {
        return (state.currentSubtotal * percentage) / 100;
      }
      return 0;
    },
    
    calculateDiscountAmount: (state) => {
      const subtotal = state.currentSubtotal || 0;
      const percent = Number(state.discountPercent) || 0;
      return (subtotal * percent) / 100;
    },
    
    finalTotal: (state) => {
      return (state.currentSubtotal + state.calculateServiceFee) - state.calculateDiscountAmount;
    },
    
    isReadyToOrder: (state) => {
      const hasItems = state.cartItems.length > 0;
      const hasStaff = !!state.selectedStaff;
      const hasTable = state.orderType === 'table' ? !!state.selectedTable : true;
      return hasItems && hasStaff && hasTable;
    }
  },

  actions: {
    // --- UI ACTIONS ---
    async ModalAction(payload) {
      this.modalAction = payload?.action;
      if (payload?.action === 'edit' && payload.id) {
        const response = await MenuService.GetById(payload.id);
        this.model = response.data.data.data;
      } else {
        this.model = { _id: null };
      }
      this.isModal = !this.isModal;
    },

    CardModalAction() {
      this.isCartOpen = !this.isCartOpen;
    },

    async Create(payload) {
      const { toast } = useToast();
      try {
        if(payload.action === 'create'){
          const data = await MenuService.Create(payload);
          toast.success(data.msg);
        }
      } catch (error) {
        toast.error("Xatolik yuz berdi");
      } finally {
        this.GetAll();
      }
    },

    // --- CATEGORY ACTIONS ---
    async openCategoryForm(payload = null) {
      if (payload && (payload.id || payload._id)) {
        this.categoryModalAction = 'edit';
        this.categoryModel = { ...payload };
      } else {
        this.categoryModalAction = 'create';
        this.categoryModel = { name: '', image: null, icon: 'fa-solid fa-utensils' };
      }
      this.isCategoryEditModal = true;
    },

    async CreateCategory(payload) {
      const { toast } = useToast();
      this.loading = true;
      try {
        await MenuService.CreateCategory(payload);
        toast.success(this.categoryModalAction === 'edit' ? "Kategoriya yangilandi" : "Kategoriya qo'shildi");
        this.isCategoryEditModal = false;
        await this.GetAllCategories(); 
      } catch (error) {
        toast.error("Kategoriyani saqlashda xatolik");
      } finally {
        this.loading = false;
      }
    },

    async GetAllCategories() {
      try {
        const response = await MenuService.GetAllCategories();
        this.categories = response.data.data;
      } catch (error) {
        console.error("Kategoriyalarni yuklashda xatolik", error);
      }
    },

    async DeleteCategory(id) {
      const { toast } = useToast();
      try {
        await MenuService.DeleteCategory(id);
        toast.success("Kategoriya o'chirildi");
        await this.GetAllCategories();
      } catch (error) {
        toast.error("O'chirishda xatolik yuz berdi");
      }
    },

    // --- CART ACTIONS ---
    addToCart(product) {
      const { toast } = useToast();
      const productId = product.id || product._id;
      const existingItem = this.cartItems.find(item => item.id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.cartItems.push({ 
          id: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1 
        });
        toast.success(`${product.name} savatga qo'shildi`);
      }
    },

    updateCartQty({ id, change }) {
      const item = this.cartItems.find(i => i.id === id);
      if (item) {
        item.quantity += change;
        if (item.quantity <= 0) this.removeFromCart(id);
      }
    },

    removeFromCart(id) {
      this.cartItems = this.cartItems.filter(i => i.id !== id);
    },

    toggleService() {
      this.isServiceActive = !this.isServiceActive;
    },

    clearCart() {
      this.model = { _id: null };
      this.cartItems = [];
      this.discountPercent = 0;
      this.orderComment = '';
      this.selectedTable = null;
      this.selectedStaff = null;
      this.selectedCustomer = null;
      this.isServiceActive = true;
    },

    // --- API ACTIONS ---
    async GetAll(payload) {
      this.loading = true;
      try {
        const response = await MenuService.GetAll(payload);
        this.menus = response.data.data.data;
      } catch (error) {
        const { toast } = useToast();
        toast.error("Yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },

    async CreateOrder() {
      const storeTabel = TabelStore();
      const feeStore = FeeStore();
      const { toast } = useToast();
      this.loading = true;

      try {
        // FeeStore'dan real foizni olish (Backend 10% muammosi yechimi)
        const actualPercentage = feeStore.model?.status === 'active' ? feeStore.model?.percentage : 0;

        const orderData = {
          orderType: this.orderType,
          items: this.cartItems.map(item => ({
            foodId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity
          })),
          subtotal: this.currentSubtotal,
          
          isServiceActive: this.isServiceActive,
          serviceFeePercent: this.isServiceActive ? actualPercentage : 0,
          serviceFeeAmount: this.calculateServiceFee,
          
          discountPercent: Number(this.discountPercent),
          discountAmount: this.calculateDiscountAmount,
          finalTotal: this.finalTotal,

          comment: this.orderComment,
          staffId: this.selectedStaff?._id || this.selectedStaff,
          customerId: this.selectedCustomer?._id || this.selectedCustomer,
          status: 'pending'
        };

        if (this.orderType === 'table') {
          orderData.tableId = this.selectedTable?._id || this.selectedTable;
        }

        if (this.model._id) {
          await MenuService.UpdateOrder({ id: this.model._id, orderData });
          toast.success("Buyurtma yangilandi");
        } else {
          await MenuService.CreateOrder(orderData);
          toast.success("Buyurtma muvaffaqiyatli saqlandi");
        }

        this.clearCart();
        this.isCartOpen = false;
        await this.GetAll(); 
      } catch (error) {
        toast.error(error.response?.data?.message || "Saqlashda xatolik yuz berdi");
      } finally {
        this.loading = false;
        await storeTabel.GetAll();
      }
    },

    async setEditOrder(orderData) {
      this.clearCart(); 
      
      this.model._id = orderData._id;
      this.orderType = orderData.orderType;
      this.orderComment = orderData.comment || '';
      this.discountPercent = orderData.discountPercent || 0;
      this.isServiceActive = orderData.isServiceActive;
      
      // Savatchani to'ldirish
      this.cartItems = orderData.items.map(item => ({
        id: item.foodId?._id || item.foodId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.foodId?.image || null
      }));

      // SELECT larda ko'rinishi uchun faqat ID'larni saqlaymiz
      this.selectedTable = orderData.tableId?._id || orderData.tableId;
      this.selectedStaff = orderData.staffId?._id || orderData.staffId;
      this.selectedCustomer = orderData.customerId?._id || orderData.customerId;
      
      this.isCartOpen = true;
    }
  }
});