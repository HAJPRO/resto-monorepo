import { defineStore } from "pinia";
import { useToast } from "../../UI/utils/useToast"; // To'g'ri yo'l ekanligini tekshiring
import { TabelService,OrderService } from "../../ApiService/index.service";

export const TabelStore = defineStore('TabelStore', {
  state: () => ({
    model : {},
    isModal: false,
    modalAction:'',
    isBookingModal: false,
    bookingModel: {},
    tableBookings: [],
    tabels: [], // Ma'lumotlarni saqlash uchun
    loading: false,

    selectedTableNumber : "",
    model_payment:{},
    activeTable : {},
    isPaymentModal:false
  }),

  actions: {
    async ModalAction(payload) {
      console.log(payload);
      
      this.modalAction = payload?.action; 
      if(payload?.action === 'edit') {
        const response = await TabelService.GetById(payload.id);
        this.model = response.data.data.data;
        
      }else {
        this.model = {}
      }
      this.isModal = !this.isModal
    },
   

    async Create(payload,action) {
      const { toast } = useToast();
      this.loading = true;
      
      try {
        const response = await TabelService.Create(payload,action);
        const message = response?.data?.message || response?.data?.msg || "Muvaffaqiyatli!";
        // 3. Toast chiqarish
        toast.success(message);
        // Modalni yopish (ixtiyoriy)
        this.isModal = false;

      } catch (error) {
        console.error("Xatolik:", error);

        // Xato xabarini ham toast orqali ko'rsatish
        const errorMsg = error.response?.data?.message || "Xatolik yuz berdi";
        toast.error(errorMsg);
      } finally {
        this.loading = false;
        this.GetAll()

      }
    },
     async GetAll(payload) {
      const { toast } = useToast();
      this.loading = true;
      try {
        const response = await TabelService.GetAll(payload);
        this.tabels = response.data.data.data; // Olingan ma'lumotlarni state'ga saqlaymiz
        const message = response?.data?.message || response?.data?.msg || "Muvaffaqiyatli!";
        // toast.success(message);
        // Modalni yopish (ixtiyoriy)
        this.isModal = false;
      } catch (error) {
        console.error("Xatolik:", error);

        // Xato xabarini ham toast orqali ko'rsatish
        const errorMsg = error.response?.data?.message || "Xatolik yuz berdi";
        toast.error(errorMsg);
      } finally {
        this.loading = false;
      }
    },
//Payment Modal
  PaymentModalAction(table) {
    console.log(table);
    
    this.activeTable = table.tableId ? table.tableId : table ;
    const cart = table.cartId  ? table.cartId : table;

    // Modelni obyekt strukturasiga moslab tozalaymiz
    this.model_payment = {
      cash: 0,
      card: 0,
      terminal: 0,
      debt: 0,
      note: '',
      // Backend uchun qo'shimcha ma'lumotlar
      tableId: table._id,
      cartId: cart?._id,
      customerId: cart?.customerId?._id || null,
      totalAmount: cart?.finalTotal || 0
    };

    this.isPaymentModal = true;
  },

 async SubmitPayment() {
  const p = this.model_payment;
  const cart = this.activeTable?.cartId ? this.activeTable.cartId : this.activeTable; // activeTable'dan cartId ni olish yoki activeTable ni to'g'ridan-to'g'ri olish
  const { toast } = useToast();

  if (!cart) return;

  // 1. To'langan jami summani hisoblaymiz (Kassa + Balans)
  // Eslatma: debt (nasiya) bu kassaga kirim emas, shuning uchun totalPaid ga kirmaydi
  const totalPaid = 
    Number(p.cash || 0) + 
    Number(p.card || 0) + 
    Number(p.terminal || 0) + 
    Number(p.balance || 0);

  const orderTotal = cart.finalTotal || 0;
  
  // 2. Qaytim (Surplus) faqat naqd/karta jami summadan ortsa hisoblanadi
  const surplusAmount = Math.max(0, totalPaid - orderTotal);

  // 3. To'lov tafsilotlarini shakllantirish (Buxgalteriya uchun)
  const paymentDetails = [];
  if (p.cash > 0) paymentDetails.push({ type: 'cash', amount: Number(p.cash) });
  if (p.card > 0) paymentDetails.push({ type: 'card', amount: Number(p.card) });
  if (p.terminal > 0) paymentDetails.push({ type: 'card', amount: Number(p.terminal) }); // Terminalni 'card' deb ketish to'g'ri
  if (p.debt > 0) paymentDetails.push({ type: 'debt', amount: Number(p.debt) });
  if (p.balance > 0) paymentDetails.push({ type: 'balance', amount: Number(p.balance) });

  const payload = {
    orderId: cart._id,
    tableId: this.activeTable._id, // activeTable'dan olish xavfsizroq
    customerId: p.customerId || cart.customerId?._id || cart.customerId || null,
    paymentMethod: paymentDetails.length > 1 ? 'mixed' : (paymentDetails[0]?.type || 'cash'),
    payments: paymentDetails,
    isDebtClosed: !(Number(p.debt) > 0),
    totalPaid: totalPaid,
    surplusAmount: surplusAmount 
  };

  try {
    this.loading = true;
    const res = await OrderService.SubmitPayment(payload);
    console.log(res);
    
    if (res.data.success) {
     
      toast.success(res.data.message);
      
      this.isPaymentModal = false;
      // model_payment'ni tozalash (keyingi safar eski ma'lumotlar chiqmasligi uchun)
      this.model_payment = { cash: 0, card: 0, terminal: 0, debt: 0, balance: 0, customerId: null };
      
      await this.GetAll(); 
    }
  } catch (err) {
    console.error("Payment Error:", err);
    toast.error(err.response?.data?.message || "To'lovni yakunlashda xatolik");
  } finally {
    this.loading = false;
  }
},
    // / Booking Modal uchun action
     async BookingModalAction(tabel) {
      this.bookingModel = tabel
      this.isBookingModal = !this.isBookingModal
      console.log("booking modal",tabel)
    },
     async CreateBooking(payload) {
      const { toast } = useToast();
      this.loading = true;
      try {
const respons = await TabelService.CreateBooking(payload);  
        const message = respons?.data?.message || respons?.data?.msg || "Muvaffaqiyatli!";
        // 3. Toast chiqarish
        toast.success(message);
        // Modalni yopish (ixtiyoriy)
        this.isBookingModal = false;
      } catch (error) {
        console.error("Xatolik:", error);

        // Xato xabarini ham toast orqali ko'rsatish
        const errorMsg = error.response?.data?.message || "Xatolik yuz berdi";
        toast.error(errorMsg);
        
      } finally {
        this.loading = false;
        await this.GetAll()

      }
     
  },
  async GetTableBookings(id) {
    try {
      const response = await TabelService.GetTableBookings(id);
      this.tableBookings = response.data.data.data; // Olingan ma'lumotlarni state'ga saqlaymiz
    } catch (error) {
      console.error("Xatolik:", error);
    }
  }

  }
});