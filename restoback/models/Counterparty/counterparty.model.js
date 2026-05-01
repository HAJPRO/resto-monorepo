const { Schema } = require("mongoose");

const CounterpartySchema = new Schema({
  // Asosiy ma'lumotlar
  name: {
    type: String,
    required: [true, "Kontragent nomi yoki F.I.SH kiritilishi shart"],
    trim: true,
    index: true // Ism bo'yicha qidiruvni tezlashtiradi
  },
  image: {
    type: String, // Base64 yoki Cloudinary/S3 URL
    default: "" 
  },
  phone: {
    type: String,
    required: [true, "Telefon raqami shart"],
    unique: true, // Bir xil raqamli kontragentlar takrorlanmasligi uchun
    trim: true,
    index: true
  },

  // Kontragent turi va toifasi
  type: {
    type: String,
    enum: ['individual', 'legal_entity'], // Jismoniy yoki Yuridik shaxs
    default: 'individual'
  },
  
  // Moliya va balans
  balance: {
    type: Number,
    default: 0 // Manfiy bo'lsa - bizning qarzimiz (Debitor), Musbat bo'lsa - uning haqqi (Kreditor)
  },
  
  // Manzil va aloqa
  address: {
    type: String,
    default: "",
    trim: true
  },
  
  // Biznes ko'rsatkichlari
  transactionCount: {
    type: Number,
    default: 0 // Umumiy operatsiyalar soni (savdo, to'lov va h.k.)
  },

  // Qo'shimcha ma'lumotlar
  comment: {
    type: String, 
    default: ""
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true, // Yaratilgan va tahrirlangan vaqtni saqlash (createdAt, updatedAt)
  versionKey: false // __v maydonini olib tashlash uchun
});

// Qidiruvni optimallashtirish uchun indexlar
CounterpartySchema.index({ name: 'text', phone: 'text' });

module.exports = CounterpartySchema;