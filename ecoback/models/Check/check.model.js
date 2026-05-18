const {Schema} = require('mongoose');

const CheckTemplateSchema = new Schema({
  // Shablonning nomi (masalan: "Asosiy chek" yoki "Oshxona uchun")
  templateName: {
    type: String,
    required: false,
    trim: true,
    default: 'Asosiy shablon'
  },
  
  // Printer va Texnik sozlamalar
  paperWidth: {
    type: Number,
    default: 58
  },
  lineStyle: {
    type: String,
    enum: ['dashed', 'solid', 'star', 'dotted'],
    default: 'dashed'
  },
  currency: {
    type: String,
    default: 'UZS'
  },

  // Brending va Aloqa
  companyName: {
    type: String,
    default: 'SHAHAR RESTORANI'
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  socials: {
    type: String,
    default: ''
  },
  showLogo: {
    type: Boolean,
    default: true
  },
  logoImage: {
    type: String, // Base64 formatida yoki URL sifatida saqlash uchun
    default: null
  },

  // Shaxslar (Visible/Hidden)
  showWaiter: {
    type: Boolean,
    default: true
  },
  showCashier: {
    type: Boolean,
    default: true
  },
  showCustomer: {
    type: Boolean,
    default: true
  },
  showBalance: {
    type: Boolean,
    default: false
  },

  // Moliya (Siz aytgandek, bu yerda faqat ko'rinish holati saqlanadi)
  showService: {
    type: Boolean,
    default: true
  },
  servicePercent: {
    type: Number, // Siz configda true deb bergansiz, ya'ni ko'rinsin/ko'rinmasin mantiqida
    default: 10
  },
  showDiscount: {
    type: Boolean,
    default: false
  },
  discountValue: {
    type: Number, // Chegirma summasi ko'rinishi
    default: 0
  },

  // Fiskal va Footer
  showFiscal: {
    type: Boolean,
    default: true
  },
  showQR: {
    type: Boolean,
    default: true
  },
  showFooterText: {
    type: Boolean,
    default: true
  },
  footerText: {
    type: String,
    default: 'Xaridingiz uchun rahmat!'
  },

  // Tizim uchun qo'shimcha (qaysi restoran ekanligini bilish uchun)
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: false // Agar tizimingiz ko'p restoranli bo'lsa kerak bo'ladi
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // created_at va updated_at avtomatik qo'shiladi
});
module.exports = CheckTemplateSchema;
