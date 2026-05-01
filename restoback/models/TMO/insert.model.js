const mongoose = require("mongoose");
const { Schema } = mongoose;

const InsertSchema = new Schema({
  // --- Hujjat Ma'lumotlari ---
  docNumber: { 
    type: String, 
    unique: true, 
    index: true 
  }, // Hujjat raqami (masalan: IN-1001)
  
  // --- Mahsulotlar Ro'yxati ---
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    name: { type: String },
    
    // Kirim parametrlari
    quantity: { type: Number, required: true, min: 0 }, // Qancha keldi
    costPrice: { type: Number, required: true }, // Tannarx (Dona uchun)
    markup: { type: Number, default: 0 }, // Natsenka %
    sellPrice: { type: Number, required: true }, // Yangi sotuv narxi
    
    totalCost: { type: Number }, // quantity * costPrice
    totalSell: { type: Number }, // quantity * sellPrice
    unit: { type: String, default: "dona" }
  }],

  // --- Moliya ---
  totalCostAmount: { type: Number, default: 0 }, // Jami tannarx summa
  totalSellAmount: { type: Number, default: 0 }, // Jami sotuv qiymati (analitika uchun)
  
  // To'lov turi (Kirimda odatda naqd, qarz yoki o'tkazma bo'ladi)
  paymentType: {
    type: String,
    enum: ['cash', 'card', 'debt', 'mixed', 'unpaid'],
    default: 'unpaid',
    index: true
  },

  payments: [{
    type: { 
      type: String, 
      enum: ['cash', 'card', 'debt'], 
      required: true 
    },
    amount: { type: Number, required: true, default: 0 },
    paidAt: { type: Date, default: Date.now }
  }],

  // --- Bog'liqliklar ---
  // Customer o'rniga Counterparty (Yetkazib beruvchi)
  counterpartyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Counterparty', // Siz boya ochgan model
    required: [true, "Yetkazib beruvchini tanlash shart"],
    index: true
  },

  warehouseId: { 
    // type: Schema.Types.ObjectId, 
    // ref: 'Warehouse', 
    // required: [true, "Omborni tanlash shart"],
    // index: true
    type: String,
  },

//   staffId: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'Employee', 
//     required: true 
//   }, // Kirimni amalga oshirgan xodim

  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed', // Kirim odatda darrov yakunlanadi
    index: true
  },

  comment: { type: String, trim: true, default: "" },
  
}, { 
  timestamps: true,
  versionKey: false 
});

// Middleware: Hujjat saqlanishidan oldin hisob-kitoblarni tekshirish
InsertSchema.pre('save', function(next) {
  // Jami summani qayta hisoblash (xavfsizlik uchun)
  this.totalCostAmount = this.items.reduce((sum, item) => sum + item.totalCost, 0);
  this.totalSellAmount = this.items.reduce((sum, item) => sum + item.totalSell, 0);
  const hasDebt = this.payments.some(p => p.type === 'debt');
  
  if (hasDebt && !this.counterpartyId) {
    return next(new Error("Qarzga kirim qilish uchun yetkazib beruvchini tanlash majburiy!"));
  }
  next();
});

module.exports = InsertSchema;