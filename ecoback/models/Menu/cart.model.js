const mongoose = require("mongoose");
const { Schema } = mongoose;

const CartSchema = new Schema({
  // ... (items, subtotal va boshqa maydonlar o'zgarishsiz qoladi)
  orderNumber: { type: String, unique: true, index: true },
  orderType: { type: String, enum: ['table', 'takeaway'], required: true, default: 'table' },
  items: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true }
  }],

  subtotal: { type: Number, required: true, default: 0 },
  isServiceActive: { type: Boolean, default: true },
  serviceFeePercent: { type: Number, default: 10 },
  serviceFeeAmount: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  discountAmount: { type: Number, default: 0 },
  
  finalTotal: { type: Number, required: true, index: true },

  // --- To'lov Qismi ---
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'debt', 'balance', 'mixed', 'unpaid'], 
    default: 'unpaid',
    index: true
  },

  payments: [{
    type: { type: String, enum: ['cash', 'card', 'debt', 'balance'], required: true },
    amount: { type: Number, required: true, default: 0 },
    paidAt: { type: Date, default: Date.now }
  }],

  surplusAmount: { type: Number, default : 0 },
  isDebtClosed: { type: Boolean, default: false },

  // --- Bog'liqliklar (Xodimlar va Mijoz) ---
  tableId: { type: Schema.Types.ObjectId, ref: 'Tabel', default: null },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },

  // 1. Buyurtmani kim yaratdi (Ofitsiant yoki Admin)
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true // Har doim kimdir yaratgan bo'lishi shart
  },

  // 2. To'lovni kim qabul qildi (Kassir)
  cashierId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Employee', 
    default: null // To'lov qilinmaguncha bo'sh bo'ladi
  },

  // Eski staffId ni o'rniga createdBy ishlatish tavsiya etiladi, 
  // lekin hozircha saqlab qolishingiz ham mumkin.
  staffId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },

  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },

  comment: { type: String, trim: true, default: "" },
  edit: { type: Boolean, default: false }
}, { 
  timestamps: true,
  versionKey: false 
});

// Middleware: Tekshiruvlar
CartSchema.pre('save', function(next) {
  const hasDebt = this.payments.some(p => p.type === 'debt');
  const hasBalance = this.payments.some(p => p.type === 'balance');
  
  if ((hasDebt || hasBalance) && !this.customerId) {
    return next(new Error("Qarz yoki Balans orqali to'lov uchun mijozni tanlash majburiy!"));
  }

  // To'lov amalga oshirilganda (completed bo'lganda) cashierId borligini tekshirish (ixtiyoriy)
  if (this.status === 'completed' && !this.cashierId) {
    // Agar dasturda avtomatik yopilsa, bu xatolik berishi mumkin, 
    // shuning uchun buni controller darajasida tekshirgan ma'qul.
  }

  next();
});

module.exports = CartSchema;