const { Schema } = require("mongoose");

const userSchema = new Schema(
  {
    companyCode: { type: String, index: true }, // Tezkor qidiruv uchun index
    department: { type: String },
    isActivated: { type: Boolean, default: false },
    chatId: { type: String, unique: true, sparse: true }, // Telegram bot uchun bo'lsa unique bo'lishi kerak
image : { type: String, default: "" },
    fullname: {
      type: String,
      required: [true, "To'liq ism kiritilishi shart"],
      trim: true,
    },
    
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true // Bo'sh bo'lsa unique xatosi bermasligi uchun
    },

    password: {
      type: String,
      select: false, // Default holatda querylarda chiqmaydi (xavfsizlik)
    },

    phoneNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      // O'zbekiston raqam formati uchun validator
      validate: {
        validator: function(v) {
          return /^\+998[0-9]{9}$/.test(v);
        },
        message: props => `${props.value} noto'g'ri telefon raqami!`
      }
    },

    age: { type: Number, min: 16 }, // Yosh Number bo'lgani ma'qul

    address: {
      region: { type: String, default: "" },
      district: { type: String, default: "" },
      neighborhood: { type: String, default: "" },
      street: { type: String, default: "" },
      house: { type: String, default: "" },
    },

    roles: [{
      type: Schema.Types.ObjectId, 
      ref: "Role",
      index: true
    }],
    position: { type: String, default: "" },  
description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["online", "offline", "band", "kutmoqda"],
      default: "offline",
      index: true
    },

    // Haydovchilar uchun maxsus blok (Alohida obyektga yig'ish tavsiya etiladi)
    driverDetails: {
      carNumber: { type: String, uppercase: true },
      carType: { type: String },
      carColor: { type: String },
      vehicleCapacity: { type: Number, min: 1 },
      totalOrders: { type: Number, default: 0 },
      completedOrders: { type: Number, default: 0 },
    },

    lastLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [long, lat]
        default: [0, 0]
      }
    },

    ratings: {
      type: [Number],
      default: [],
    },
    
    blockedUntil: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },

  { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
  }
);

// Reyting o'rtachasini hisoblash uchun Virtual field
userSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((a, b) => a + b, 0);
  return (sum / this.ratings.length).toFixed(1);
});

module.exports = userSchema;