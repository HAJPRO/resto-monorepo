const { Schema } = require("mongoose");

const MenuSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Ombor logikasi uchun eng muhim maydonlar:
    is_stock: { 
      type: Boolean, 
      default: false // true bo'lsa - soni hisoblanadigan (ichimliklar), false - oshxona taomi
    },
    quantity: {
      type: Number,
      default: 0, // Agar is_stock true bo'lsa, bu yerda qoldiq soni saqlanadi
    },
    min_threshold: {
      type: Number,
      default: 5, // Mahsulot shu sondan kam qolsa, tizim ogohlantirish berishi uchun
    },
    // Kirim jarayoni uchun muhim:
    costPrice: { 
      type: Number, 
      default: 0 // Oxirgi kirim qilingan tannarx
    },
    // Asosiy ma'lumotlar
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discount_price: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: "1 porsiya", // Masalan: "1 dona", "0.5 L", "1 kg"
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "out_of_stock", "hidden"],
      default: "active",
    },
    image: {
      type: String,
      default: "default.jpg",
    },
    description: {
      type: String,
      required: true,
    },
    is_popular: {
      type: Boolean,
      default: false,
    },
    cooking_time: {
      type: String,
      default: "15",
    },
    ingredients: [{
      type: String
    }],
  }, 
  {
    timestamps: true,
  }
);

// Middleware: Soni o'zgarganda statusni avtomatik yangilash
MenuSchema.pre('save', function(next) {
  if (this.is_stock) {
    if (this.quantity <= 0) {
      this.status = "out_of_stock";
      this.quantity = 0; // Minusga tushib ketmasligi uchun
    } else {
      this.status = "active";
    }
  }
  next();
});

module.exports = MenuSchema;