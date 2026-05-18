import { defineStore } from "pinia";
import { toast } from "../../UI/utils/useToast";
import { MenuService } from "../../ApiService/index.service";
import { TabelStore, FeeStore } from "../../stores/index.store";
import { jwtDecode } from 'jwt-decode';

export const MenuStore = defineStore('MenuStore', {
  state: () => ({
    model: { _id: null }, 
    cartItems: [], 
    isCartOpen: false,
    loading: false,
    
    // Taomlar va Kategoriyalar
    kirimItems : [],
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
    discountPercent: 0, 
    
    // Tanlovlar
    selectedTable: null,
    selectedStaff: null,
    selectedCustomer: null,
    orderType: 'table',
    orderComment: '',
  }),

  getters: {
    getUserId: () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      try {
        const decoded = jwtDecode(token);
        return decoded.id || decoded._id;
      } catch (e) { return null; }
    },

    // Savatdagi jami mahsulotlar soni (porsiyalar yig'indisi)
    totalItemsCount: (state) => state.cartItems.reduce((sum, item) => sum + item.cartQuantity, 0),
    
    // Asosiy summa (har bir itemning o'z narxi bo'yicha)
    currentSubtotal: (state) => state.cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0),
    
    calculateServiceFee: (state) => {
      const feeStore = FeeStore();
      const percentage = feeStore.model?.status === 'active' ? feeStore.model?.percentage : 0; 
      return state.isServiceActive ? (state.currentSubtotal * percentage) / 100 : 0;
    },
    
    calculateDiscountAmount: (state) => {
      const percent = Number(state.discountPercent) || 0;
      return (state.currentSubtotal * percent) / 100;
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
    async ModalAction(payload) {
      this.modalAction = payload?.action;
      if (payload?.action === 'edit' && payload.id) {
        const foundItem = this.menus.find(item => item._id === payload.id);
        if (foundItem) this.model = JSON.parse(JSON.stringify(foundItem));
      } else {
        this.model = { _id: null };
      }
      this.isModal = !this.isModal;
    },
 async Create(payload) {
   
      try {
          const data = await MenuService.Create(payload);
          toast.success("Yangilandi!");
      } catch (error) {
        toast.error("Xatolik yuz berdi");
      } finally {
        this.GetAll();
      }
    },


    CardModalAction() {
      this.isCartOpen = !this.isCartOpen;
    },
    // --- CART ACTIONS (UNIQUE ID LOGIKASI BILAN) ---
    addToCart(payload) {
   
      
      // payload ichida: id, uniqueId, name, price, cartQuantity, image, is_stock, quantity (stock) keladi
      const existingItem = this.cartItems.find(item => item.uniqueId === payload.uniqueId);
      
      if (existingItem) {
        // Ombor nazorati: bitta ID dagi barcha porsiyalar yig'indisi stockdan oshmasligi kerak
        const totalInCartOfThisFood = this.cartItems
          .filter(i => i.id === payload.id)
          .reduce((sum, i) => sum + i.cartQuantity, 0);

        if (payload.is_stock && totalInCartOfThisFood + payload.cartQuantity > payload.quantity) {
          toast.warning(`Omborda yetarli qoldiq yo'q. Maksimal: ${payload.quantity}`);
          return;
        }
        existingItem.cartQuantity += payload.cartQuantity;
      } else {
        // Yangi uniqueId (yangi narx) bo'lsa
        this.cartItems.push(payload);
        toast.success(`${payload.name} savatga qo'shildi`);
      }
    },

    updateCartQty({ uniqueId, change }) {
      const item = this.cartItems.find(i => i.uniqueId === uniqueId);
      if (!item) return;

      const newQty = item.cartQuantity + change;

      if (newQty <= 0) {
        this.removeFromCart(uniqueId);
        return;
      }

      // Ombor nazorati (ID bo'yicha umumiy tekshiruv)
      if (change > 0 && item.is_stock) {
        const totalInCart = this.cartItems
          .filter(i => i.id === item.id)
          .reduce((sum, i) => sum + i.cartQuantity, 0);

        if (totalInCart + change > item.quantity) {
       
          toast.warning(`Ombor chegarasi: ${item.quantity}`);
          return;
        }
      }

      item.cartQuantity = newQty;
    },

    setManualQty(uniqueId, value) {
      const item = this.cartItems.find(i => i.uniqueId === uniqueId);
      if (!item) return;

      let val = parseInt(value) || 1;
      
      if (item.is_stock) {
        const otherItemsQty = this.cartItems
          .filter(i => i.id === item.id && i.uniqueId !== uniqueId)
          .reduce((sum, i) => sum + i.cartQuantity, 0);
          
        if (val + otherItemsQty > item.quantity) {
          val = item.quantity - otherItemsQty;
        }
      }

      if (val <= 0) {
        this.removeFromCart(uniqueId);
      } else {
        item.cartQuantity = val;
      }
    },

    removeFromCart(uniqueId) {
      this.cartItems = this.cartItems.filter(i => i.uniqueId !== uniqueId);
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
     
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },

    async CreateOrder() {
      const storeTabel = TabelStore();
      const feeStore = FeeStore();
   
      this.loading = true;

      try {
        const actualPercentage = feeStore.model?.status === 'active' ? feeStore.model?.percentage : 0;

        const orderData = {
          orderType: this.orderType,
          createdBy: this.getUserId,
          items: this.cartItems.map(item => ({
            foodId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.cartQuantity,
            totalPrice: item.price * item.cartQuantity
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
          toast.success("Buyurtma saqlandi");
        }

        this.clearCart();
        this.isCartOpen = false;
        await this.GetAll(); 
      } catch (error) {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
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
      
      this.cartItems = orderData.items.map(item => ({
        id: item.foodId?._id || item.foodId,
        // EDIT REJIMIDA HAM UNIQUE ID YARATAMIZ
        uniqueId: `${(item.foodId?._id || item.foodId)}_${item.price}`,
        name: item.name,
        price: item.price,
        cartQuantity: item.quantity,
        quantity: item.foodId?.quantity || item.quantity, 
        is_stock: item.foodId?.is_stock || false,
        image: item.foodId?.image || null
      }));

      this.selectedTable = orderData.tableId?._id || orderData.tableId;
      this.selectedStaff = orderData.staffId?._id || orderData.staffId;
      this.selectedCustomer = orderData.customerId?._id || orderData.customerId;
      this.isCartOpen = true;
    }
  }
});