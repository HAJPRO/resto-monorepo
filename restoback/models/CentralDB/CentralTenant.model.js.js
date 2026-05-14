const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  // --- ASOSIY MA'LUMOTLAR ---
  name: { 
    type: String, 
    required: [true, 'Kompaniya nomi kiritilishi shart'], 
    trim: true 
  },
  companyCode: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    index: true // Qidiruvni tezlashtirish uchun
  },
  dbName: { 
    type: String, 
    required: true,
    unique: true 
  },

  // --- STATUS VA HOLAT ---
  status: {
    type: String,
    enum: ['active', 'suspended', 'trial', 'expired', 'deleted'],
    default: 'trial'
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },

  // --- ALOQA ---
  adminContact: {
    email: { type: String, lowercase: true },
    phone: { type: String,  }, // Masalan: +998901234567
    ownerName: { type: String }
  },

  // --- MOLIYA VA BALANS ---
  billing: {
    balance: { 
      type: Number, 
      default: 0,
      min: [0, 'Balans manfiy bo\'lishi mumkin emas']
    },
    currency: { 
      type: String, 
      default: 'UZS',
      enum: ['UZS', 'USD']
    },
    monthlyFee: { 
      type: Number, 
      default: 0 
    },
    lastPaymentDate: { type: Date },
    nextBillingDate: { type: Date }
  },

  // --- OBUNA VA TARIF REJASI ---
  subscription: {
    plan: { 
      type: String, 
      enum: ['basic', 'standard', 'premium', 'enterprise'], 
      default: 'basic' 
    },
    features: [String], // Masalan: ['inventory', 'hr', 'accounting']
    expiresAt: { type: Date }
  },

  // --- TEXNIK CHEKLOVLAR (Limits) ---
  limits: {
    maxUsers: { type: Number, default: 5 },
    maxStorageGB: { type: Number, default: 2 },
    maxOrdersPerMonth: { type: Number, default: 1000 } // RestoApp uchun kerak bo'ladi
  },

  // --- LOGO VA BRANDING ---
  branding: {
    logoUrl: { type: String },
    primaryColor: { type: String, default: '#4f46e5' }, // Kompaniya brend rangi
    customDomain: { type: String } // Mijozning shaxsiy domeni bo'lsa
  }

}, { 
  timestamps: true, // createdAt va updatedAt ni avtomatik qo'shadi
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

// --- VIRTUALS (Hisoblanadigan maydonlar) ---

// Mijozning necha kunlik to'lovi qolganini hisoblash
TenantSchema.virtual('daysRemaining').get(function() {
  if (this.billing.monthlyFee <= 0) return 365; // Tekin bo'lsa
  const dailyRate = this.billing.monthlyFee / 30;
  return Math.floor(this.billing.balance / dailyRate);
});

// Balans holatiga qarab xavf darajasini aniqlash
TenantSchema.virtual('isLowBalance').get(function() {
  return this.daysRemaining <= 5; // 5 kundan kam qolsa true qaytaradi
});

// --- MIDDLEWARES (Saqlashdan oldingi mantiq) ---

// Kompaniya kodini o'zgartirishni taqiqlash (Xavfsizlik)
TenantSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified('companyCode')) {
    return next(new Error('Kompaniya identifikatorini (companyCode) o\'zgartirish mumkin emas!'));
  }
  next();
});


module.exports = TenantSchema;