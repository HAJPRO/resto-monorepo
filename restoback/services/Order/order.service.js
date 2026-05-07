const BaseError = require("../../errors/base.error");

class OrderService {
  async Create(req) {
    const { Menu, Cash } = req.tenantModels;
    

    // 3. CREATE LOGIKASI
    if (action === 'create') {
        if (!req.body.image) throw new BaseError("Rasm majburiy", 400);

        // Buyurtmaga avtomatik ravishda userId va smena ID sini biriktiramiz
        const orderData = {
            ...req.body,
            createdBy: userId,
            shiftId: activeShift._id
        };

        const data = await Menu.create(orderData);

        

        return { msg: "Muvaffaqiyatli yaratildi", data };

    } 
    
    // 4. EDIT LOGIKASI
    else if (action === 'edit') {
        if (!_id) throw new BaseError("ID topilmadi", 400);
        
        // Tahrirlashda ham req.body ichidagi ma'lumotlarni yangilaymiz
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
  const { Cart, Customer, Tabel, Transaction, Cash } = req.tenantModels; // Cash qo'shildi
  const { 
    orderId, 
    customerId, 
    payments, 
    surplusAmount, 
    tableId 
  } = req.body;
  const userId = req.user.id; // Tokendan olingan foydalanuvchi ID
console.log(userId, "USER ID");

  // 1. Kassa ochiqligini tekshirish (Tranzaksiyadan oldin tekshirgan ma'qul)
  const activeShift = await Cash.findOne({
    cashierId: userId,
    status: 'open'
  });

  if (!activeShift) {
   throw BaseError.Forbidden("To'lov uchun avval kassa smenasini oching!");
  }

  // 2. MongoDB sessiyasini boshlash
  const session = await Cart.startSession();
  session.startTransaction();

  try {
    const debtAmount = payments.find(p => p.type === 'debt')?.amount || 0;
    const usedBalanceAmount = payments.find(p => p.type === 'balance')?.amount || 0;
    const surplus = surplusAmount || 0;

    // Naqd pul va karta orqali kelgan real pullarni hisoblash (Kassa balansi uchun)
    const cashReceived = payments.find(p => p.type === 'cash')?.amount || 0;
    const cardReceived = payments.find(p => p.type === 'card')?.amount || 0;
    
    // Kassaga kirishi kerak bo'lgan jami real pul (Qaytim ayirilgan holda)
    const netCashAmount = cashReceived - surplus; 

    // 3. Buyurtmani (Cart) muvaffaqiyatli deb yopish
    await Cart.findByIdAndUpdate(orderId, {
      $set: {
        status: 'completed',
        payments: payments,
        surplusAmount: surplus,
        isDebtClosed: debtAmount <= 0,
        shiftId: activeShift._id // Buyurtmani yopilganda ham smenaga biriktiramiz
      }
    }, { session });

    // 4. Kassa smenasi balansini yangilash
    // Naqd pul, karta va jami tushumni ochiq smenada yangilaymiz
await Cash.findByIdAndUpdate(activeShift._id, {
  $inc: {
    "summary.totalCash": netCashAmount,
    "summary.totalCard": cardReceived,
    "summary.totalSales": netCashAmount + cardReceived,
    "summary.totalDebt": debtAmount
  },
  $addToSet: { closedOrderIds: orderId }
}, { session });

    // 5. Mijoz mantiqi
    if (customerId) {
      const transactionRecords = [];

      if (debtAmount > 0) {
        transactionRecords.push({
          customerId,
          orderId,
          shiftId: activeShift._id, // Tranzaksiyani ham smenaga bog'laymiz
          type: 'debt',
          amount: debtAmount,
          method: 'balance',
          description: `Buyurtma #${orderId} uchun nasiya shakllandi`
        });
      }

      if (surplus > 0) {
        transactionRecords.push({
          customerId,
          orderId,
          shiftId: activeShift._id,
          type: 'surplus',
          amount: surplus,
          method: 'cash',
          description: `Buyurtma #${orderId} dan qaytim balansga qo'shildi`
        });
      }

      if (usedBalanceAmount > 0) {
        transactionRecords.push({
          customerId,
          orderId,
          shiftId: activeShift._id,
          type: 'refund',
          amount: usedBalanceAmount,
          method: 'balance',
          description: `Buyurtma #${orderId} uchun eski balansdan to'lov qilindi`
        });
      }

      if (transactionRecords.length > 0) {
        await Transaction.insertMany(transactionRecords, { session });
      }

      const balanceChange = surplus - debtAmount - usedBalanceAmount;
      const customerUpdate = { $inc: { orderCount: 1 } };
      if (balanceChange !== 0) {
        customerUpdate.$inc.balance = balanceChange;
      }

      await Customer.findByIdAndUpdate(customerId, customerUpdate, { session });
    }
    
    // 6. Stolni bo'shatish
    await Tabel.findByIdAndUpdate(tableId, { 
      $set: { status: '0', cartId: null } 
    }, { session });

    // Tasdiqlash
    await session.commitTransaction();
    return { success: true, message: "To'lov muvaffaqiyatli yakunlandi" };

  } catch (e) {
    await session.abortTransaction();
    console.error("SubmitPayment Error:", e);
    throw e;
  } finally {
    session.endSession();
  }
}



}
module.exports = new OrderService();    