const UserDto = require("../../dtos/user.dto");
const bcrypt = require("bcryptjs");
const tokenService = require("./token.service");
const BaseError = require("../../errors/base.error");
const { CentralTenantModel } = require("../../models/CentralDB/config/db"); // Markaziy (Master) baza modeli
const initModels = require("../../models/initModels");
const { getTenantDB } = require("../../middlewares/db/dbManager.middleware");

class AuthService {
  /**
   * 📝 Yangi foydalanuvchini ro'yxatdan o'tkazish (Tenant doirasida)
   */
  async register(req, data) {
    const { User, Token } = req.tenantModels;
    const { username, password, companyCode } = data;
    console.log(data)
    // 1. Shu tenant ichida username band emasligini tekshirish
    const existUser = await User.findOne({ username });
    if (existUser) {

      throw BaseError.BadRequest(`Username ${username} allaqachon band!`);
    }

    // 2. Parolni xesh qilish va saqlash
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      ...data,
      password: hashPassword,
      action: "login_successfully",
      chatId: 1
    });

    const userDto = new UserDto(user);
    // Tokenga companyCode qo'shiladi, shunda keyingi so'rovlarda qaysi bazaga ulanishni bilamiz
    const tokens = tokenService.generateToken({ ...userDto, companyCode });

    await tokenService.saveToken(userDto.id, tokens.refreshToken, Token);

    return { msg: "Foydalanuvchi qo'shildi", user: userDto, ...tokens };
  }

 
async login(req, username, password) {
    const { companyCode } = req.body;

    // 1. Markaziy bazadan kompaniyani tekshirish
    const tenant = await CentralTenantModel.findOne({ companyCode });
    
    if (!tenant) {
      return { status: false, msg: "Bunday kompaniya tizimda mavjud emas!" };
    }

    // --- BALANS VA STATUS TEKSHIRUVI ---
    if (!tenant.isActive || tenant.status === 'suspended') {
      return { status: false, msg: "Sizning kompaniyangiz bloklangan. Iltimos, administratorga murojaat qiling!" };
    }

    const now = new Date();
    // Qarzni tekshirish mantiqi
    if (tenant.billing.balance <= 0 && tenant.status === 'expired') {
      return { status: false, msg: "Sizda qarzdorlik bor! Iltimos, administratorga murojaat qiling!" };
    }
    
    // Obuna muddati
    if (tenant.subscription.expiresAt && new Date(tenant.subscription.expiresAt) < now) {
      return { status: false, msg: "Sizning obuna muddatingiz yakunlangan! Iltimos, administratorga murojaat qiling!" };
    }

    // 2. Tenant bazasiga ulanish
    const db = await getTenantDB(tenant.dbName);
    const { User, Token } = initModels(db); 

    if (!User || !Token) {
      return { status: false, msg: "Kompaniya bazasiga ulanishda texnik xatolik!" };
    }

    // 3. Foydalanuvchini tekshirish
    const user = await User.findOne({ username })
      .populate({
        path: 'roles',
        populate: { path: 'permissions', model: 'Permission' }
      })
      .select('+password');

    if (!user) {
      return { status: false, msg: "Foydalanuvchi nomi yoki parol noto'g'ri" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { status: false, msg: "Foydalanuvchi nomi yoki parol noto'g'ri" };
    }

    // 4. Tokenlarni yaratish
    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({
      id: userDto.id,
      roles: userDto.roles,
      companyCode: tenant.companyCode,
      tenantId: tenant._id,
    });

    await tokenService.saveToken(userDto.id, tokens.refreshToken, Token);

    return {
      status: true,
      msg: "Tizimga muvaffaqiyatli kirdingiz!",
      user: userDto,
      ...tokens,
      companyCode: tenant.companyCode,
      billing: {
        balance: tenant.billing.balance,
        daysRemaining: tenant.daysRemaining, 
        isLow: tenant.isLowBalance,
        currency : tenant.billing.currency
      },
      loginAt: new Date()
    };
}

  /**
   * 🔄 Tokenni yangilash (Refresh)
   */
  async refresh(req, refreshToken) {
    const { User, Token } = req.tenantModels;
    const { companyCode } = req.body; // Yoki tokendan olinadi

    if (!refreshToken) throw BaseError.UnauthorizedError();

    const userPayload = tokenService.validateRefreshToken(refreshToken);
    const tokenDb = await tokenService.findToken(refreshToken, Token);

    if (!userPayload || !tokenDb) {
      throw BaseError.UnauthorizedError("Sessiya muddati tugagan");
    }

    const user = await User.findById(userPayload.id);
    const userDto = new UserDto(user);

    const tokens = tokenService.generateToken({ ...userDto, companyCode });
    await tokenService.saveToken(userDto.id, tokens.refreshToken, Token);

    return { user: userDto, ...tokens };
  }

  /**
   * 📝 Foydalanuvchi ma'lumotlarini tahrirlash
   */
  async update(req, data) {
    const { User } = req.tenantModels;
    await User.findByIdAndUpdate(data.id, data.model, { new: true });
    return { msg: "Muvaffaqiyatli o'zgartirildi" };
  }

  /**
   * 🚪 Tizimdan chiqish
   */
  async logout(req, refreshToken) {
    const { Token } = req.tenantModels;
    return await tokenService.removeToken(refreshToken, Token);
  }

  /**
   * 👥 Barcha foydalanuvchilarni olish
   */
  async getUsers(req) {
    const { User } = req.tenantModels;
    return await User.find().select("-password");
  }
}

module.exports = new AuthService();