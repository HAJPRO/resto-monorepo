const { Schema } = require("mongoose");

const CashSchema = new Schema({
  cashierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  
  // Kassa ochilganda ichida bo'lgan naqd pul
  startingBalance: { type: Number, required: true, default: 0, min: 0 },

  // --- MOLIYAVIY HARAKATLAR ---
  transactions: {
  type: [{
    type: { type: String, enum: ['in', 'out'], required: true },
    method: { type: String, enum: ['cash', 'card'], default: 'cash' },
    amount: { type: Number, required: true },
    reason: { type: String }, 
    createdAt: { type: Date, default: Date.now }
  }],
  default: [] // <--- Mana bu qatnashishi kerak
},

  // Ushbu smenada yopilgan buyurtmalar
  closedOrderIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  }],

  // --- JORIY HOLAT (Real-time update bo'lib boradi) ---
  summary: {
    totalSales: { type: Number, default: 0 },   // Jami savdo (naqd + karta)
    totalCash: { type: Number, default: 0 },    // Faqat naqd tushum
    totalCard: { type: Number, default: 0 },    // Faqat karta/terminal tushum
    totalDebt: { type: Number, default: 0 },    // Smenadagi jami nasiya
    totalBalance: { type: Number, default: 0 }, // Mijoz depozitidan ishlatilgani
    totalIn: { type: Number, default: 0 },      // Qo'shimcha kirimlar (Inkassatsiyadan tashqari)
    totalOut: { type: Number, default: 0 }      // Chiqimlar (Xarajatlar)
  },

  // --- YOPILISH VAQTIDAGI TAHLIL ---
  closingData: {
    // expectedCash = startingBalance + totalCash + totalIn - totalOut
    expectedCash: { type: Number, default: 0 }, 
    actualCash: { type: Number, default: 0 },   // Kassir sanab topshirgan naqd pul
    difference: { type: Number, default: 0 },   // expectedCash va actualCash o'rtasidagi farq
    notes: { type: String, trim: true }         // Farq bo'lsa, sababi haqida izoh
  },

  deviceId: { type: String },
  tenantId: { type: String, required: true } // Agar tizimingiz multi-tenant bo'lsa
}, { 
  timestamps: true 
});
CashSchema.pre('save', function(next) {
  if (this.status === 'closed' && this.isModified('status')) {
    // Formula: Boshlang'ich + Naqd Savdo + Kirim - Chiqim
    this.closingData.expectedCash = 
      this.startingBalance + 
      (this.summary.totalCash || 0) + 
      (this.summary.totalIn || 0) - 
      (this.summary.totalOut || 0);
      
    this.closingData.difference = 
      this.closingData.actualCash - this.closingData.expectedCash;
  }
  next();
});
// Indekslar
CashSchema.index({ cashierId: 1, status: 1 });
CashSchema.index({ status: 1, openedAt: -1 }); // Oxirgi ochiq kassani tez topish uchun

module.exports = CashSchema;