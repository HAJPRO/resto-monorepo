const BaseError = require("../../errors/base.error");

class OrderService {
  async Create(req) {
    const { Menu } = req.tenantModels;
    
    // Agar body bo'sh bo'lsa, demak JSON limit yoki Header muammosi bor
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new BaseError("Ma'lumotlar qabul qilinmadi (JSON body bo'sh)", 400);
    }

    const { action, _id, image } = req.body;
    console.log("Kelingan Action:", action); 

    if (action === 'create') {
        if (!image) throw new BaseError("Rasm majburiy", 400);
        const data = await Menu.create(req.body);   
        return { msg: "Muvaffaqiyatli yaratildi", data };

    } else if (action === 'edit') {
        if (!_id) throw new BaseError("ID topilmadi", 400);
        const updated = await Menu.findByIdAndUpdate(_id, req.body, { new: true });
        return { msg: "Muvaffaqiyatli yangilandi", data: updated };
    }

    throw new BaseError("Noto'g'ri action: " + action, 400);
}
 async GetAll(req) {
    const { Cart } = req.tenantModels;
    const { page = 1, limit = 10, filterType, startDate, endDate } = req.body;

    // 1. Filtr mantiqini qurish
    let query = {};

    // Agar frontenddan startDate va endDate kelsa (Custom range)
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    } 
    // Agar tayyor filterType kelsa (Kun, Hafta, Oy...)
    else if (filterType) {
      const now = new Date();
      if (filterType === 'Kun') {
        query.createdAt = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999))
        };
      } else if (filterType === 'Hafta') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        query.createdAt = { $gte: new Date(startOfWeek.setHours(0,0,0,0)) };
      } else if (filterType === 'Oy') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        query.createdAt = { $gte: startOfMonth };
      } else if (filterType === 'Yil') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        query.createdAt = { $gte: startOfYear };
      }
    }

    // 2. Pagination va Data yuklash
    const skip = (page - 1) * limit;
    
    const data = await Cart.find(query)
      .populate('customerId')
      .populate('staffId')
      .populate({
        path: 'tableId',
        populate: { path: 'cartId', model: 'Cart' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Jami elementlar soni (Frontendda 'hasMore' uchun kerak)
    const total = await Cart.countDocuments(query);

    return {
      success: true,
      msg: "Buyurtmalar ro'yxati",
      data: {
        data,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  async GetById(req) {
    const { Menu } = req.tenantModels;
    const data = await Menu.findById(req.params.id)
        .populate('bookings') // 'bookings' maydonini populate qilamiz
        .lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun
    return { 
        success: true,
        msg: "MENU TOPILDI", 
        data 
    };
}

/**
 * To'lovni yakunlash va orderni yopish
 * @param {Object} req - Request object
 */
async SubmitPayment(req) {
  const { Cart, Customer, Tabel, Transaction } = req.tenantModels;
  const { 
    orderId, 
    customerId, 
    payments, 
    surplusAmount, 
    tableId 
  } = req.body;

  // 1. MongoDB sessiyasini boshlash (Tranzaksiyalar uchun)
  const session = await Cart.startSession();
  session.startTransaction();

  try {
    // To'lov turlarini hisob-kitob qilish
    const debtAmount = payments.find(p => p.type === 'debt')?.amount || 0;
    const usedBalanceAmount = payments.find(p => p.type === 'balance')?.amount || 0;
    const surplus = surplusAmount || 0;

    // 2. Buyurtmani (Cart) muvaffaqiyatli deb yopish
    await Cart.findByIdAndUpdate(orderId, {
      $set: {
        status: 'completed',
        payments: payments,
        surplusAmount: surplus,
        isDebtClosed: debtAmount <= 0
      }
    }, { session });

    // 3. Agar mijoz biriktirilgan bo'lsa, mantiqiy amallarni bajarish
    if (customerId) {
      const transactionRecords = [];

      // A. Nasiya (Debt) shakllangan bo'lsa log yozish
      if (debtAmount > 0) {
        transactionRecords.push({
          customerId,
          orderId,
          type: 'debt',
          amount: debtAmount,
          method: 'balance',
          // staffId: req.user._id,
          description: `Buyurtma #${orderId} uchun nasiya shakllandi`
        });
      }

      // B. Qaytim (Surplus) balansga o'tkazilgan bo'lsa log yozish
      if (surplus > 0) {
        transactionRecords.push({
          customerId,
          orderId,
          type: 'surplus',
          amount: surplus,
          method: 'cash',
          // staffId: req.user._id,
          description: `Buyurtma #${orderId} dan qaytim balansga qo'shildi`
        });
      }

      // C. Eski balansdan (Used Balance) foydalanilgan bo'lsa log yozish
      if (usedBalanceAmount > 0) {
        transactionRecords.push({
          customerId,
          orderId,
          type: 'refund', // Balansdan yechish mantiqi
          amount: usedBalanceAmount,
          method: 'balance',
          // staffId: req.user._id,
          description: `Buyurtma #${orderId} uchun eski balansdan to'lov qilindi`
        });
      }

      // Tranzaksiya yozuvlarini bazaga saqlash
      if (transactionRecords.length > 0) {
        await Transaction.insertMany(transactionRecords, { session });
      }

      // Mijoz balansini va buyurtmalar sonini yangilash
      const balanceChange = surplus - debtAmount - usedBalanceAmount;
      const customerUpdate = {
        $inc: { orderCount: 1 } // Har doim 1 taga oshadi
      };

      if (balanceChange !== 0) {
        customerUpdate.$inc.balance = balanceChange;
      }

      await Customer.findByIdAndUpdate(
        customerId, 
        customerUpdate, 
        { session }
      );
    }
    
    // 4. Stolni bo'shatish va buyurtmani undan ajratish
    await Tabel.findByIdAndUpdate(tableId, { 
      $set: { status: '0', cartId: null } 
    }, { session });

    // Barcha amallarni tasdiqlash
    await session.commitTransaction();
    return { success: true, message: "To'lov muvaffaqiyatli yakunlandi" };

  } catch (e) {
    // Xatolik bo'lsa, barcha amallarni bekor qilish (Rollback)
    await session.abortTransaction();
    console.error("SubmitPayment Error:", e);
    throw e; // Global xato ushlagichga yuborish
  } finally {
    // Sessiyani har doim yopish
    session.endSession();
  }
}



}
module.exports = new OrderService();    