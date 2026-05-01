import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast";
import { MenuService } from "../../ApiService/index.service";
import { TabelStore, FeeStore } from "../../stores/index.store";

export const MenuStore = defineStore('MenuStore', {
  state: () => ({
    model: { _id: null }, 
    cartItems: [], // Savatdagi mahsulotlar
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
    // Savatdagi jami elementlar soni
    totalItemsCount: (state) => state.cartItems.reduce((sum, item) => sum + item.cartQuantity, 0),
    
    // Asosiy summa (chegirma va xizmat haqsiz)
    currentSubtotal: (state) => state.cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0),
    
    // Xizmat haqini hisoblash
    calculateServiceFee: (state) => {
      const feeStore = FeeStore();
      const percentage = feeStore.model?.status === 'active' ? feeStore.model?.percentage : 0; 
      if (state.isServiceActive) {
        return (state.currentSubtotal * percentage) / 100;
      }
      return 0;
    },
    
    // Chegirma summasini hisoblash
    calculateDiscountAmount: (state) => {
      const subtotal = state.currentSubtotal || 0;
      const percent = Number(state.discountPercent) || 0;
      return (subtotal * percent) / 100;
    },
    
    // Yakuniy jami summa
    finalTotal: (state) => {
      return (state.currentSubtotal + state.calculateServiceFee) - state.calculateDiscountAmount;
    },
    
    // Buyurtma berishga tayyorligini tekshirish
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
        const foundItem = this.menus.find(item => item._id === payload.id);
        if (foundItem) {
          this.model = JSON.parse(JSON.stringify(foundItem));
        }
      } else {
        this.model = { _id: null };
      }
      this.isModal = !this.isModal;
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


    CardModalAction() {
      this.isCartOpen = !this.isCartOpen;
    },

    // --- CART ACTIONS (OMBOR NAZORATI BILAN) ---
    addToCart(product) {
      const { toast } = useToast();
      const productId = product.id || product._id;
      const existingItem = this.cartItems.find(item => item.id === productId);
      
      // Ombordagi mavjud miqdor (quantity kaliti orqali)
      const stockLimit = product.quantity || 0;

      if (existingItem) {
        if (product.is_stock && existingItem.cartQuantity >= stockLimit) {
          toast.warning("Omborda boshqa qoldiq yo'q");
          return;
        }
        existingItem.cartQuantity += 1;
      } else {
        if (product.is_stock && stockLimit <= 0) {
          toast.error("Mahsulot tugagan");
          return;
        }
        this.cartItems.push({ 
          id: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          is_stock: product.is_stock || false,
          quantity: stockLimit, // Ombordagi jami qoldiq (chegara uchun)
          cartQuantity: 1 // Savatdagi joriy miqdor
        });
        toast.success(`${product.name} qo'shildi`);
      }
    },

    updateCartQty({ id, change }) {
      const item = this.cartItems.find(i => i.id === id);
      if (!item) return;

      const newQty = item.cartQuantity + change;

      // Kamayish: 0 bo'lsa o'chirish
      if (newQty <= 0) {
        this.removeFromCart(id);
        return;
      }

      // Oshish: Ombor qoldig'idan (item.quantity) oshmasligi kerak
      if (change > 0 && item.is_stock && newQty > item.quantity) {
        const { toast } = useToast();
        toast.warning(`Maksimal miqdor: ${item.quantity}`);
        return;
      }

      item.cartQuantity = newQty;
    },

    // Input orqali manual kiritilganda
    setManualQty(id, value) {
      const item = this.cartItems.find(i => i.id === id);
      if (!item) return;

      let val = parseInt(value) || 1;
      
      if (item.is_stock && val > item.quantity) {
        val = item.quantity;
      }

      if (val <= 0) {
        this.removeFromCart(id);
      } else {
        item.cartQuantity = val;
      }
    },

    removeFromCart(id) {
      this.cartItems = this.cartItems.filter(i => i.id !== id);
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
        toast.error("Ma'lumotlarni yuklashda xatolik");
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
        const actualPercentage = feeStore.model?.status === 'active' ? feeStore.model?.percentage : 0;

        const orderData = {
          orderType: this.orderType,
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
        name: item.name,
        price: item.price,
        cartQuantity: item.quantity,
        quantity: item.foodId?.quantity || item.quantity, // Ombor qoldig'i
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