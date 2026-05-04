const BaseError = require("../../errors/base.error");

class InsertService {
  /**
   * Yangi kirim yaratish
   */
  async Create(req) {
    const { Insert, Menu, Counterparty } = req.tenantModels;
    const { items, counterpartyId, warehouseId, paymentType, paidAmount, mixedPayments, comment } = req.body;

    // 1. Ma'lumotlarni tekshirish
    if (!items || items.length === 0) throw new BaseError("Mahsulotlar ro'yxati bo'sh", 400);

    const session = await Insert.startSession();
    session.startTransaction();

    try {
      // 2. Items massivini boyitish (totalCost ni backendda hisoblaymiz)
      const processedItems = items.map(item => ({
        ...item,
        totalCost: (item.quantity || 0) * (item.costPrice || 0)
      }));

      // 3. Payments massivini shakllantirish
      let payments = [];
      if (paymentType === 'mixed') {
        Object.keys(mixedPayments).forEach(key => {
          if (mixedPayments[key] > 0) {
            payments.push({ type: key, amount: mixedPayments[key] });
          }
        });
      } else {
        payments.push({ type: paymentType, amount: paidAmount || 0 });
      }

      // 4. Jami tannarxni hisoblash
      const totalCostSum = processedItems.reduce((sum, i) => sum + i.totalCost, 0);

      // 5. Kirim hujjatini yaratish
      const newInsert = await Insert.create([{
        docNumber: `IN-${Date.now()}`, // Avtomatik raqam
        items: processedItems,
        counterpartyId,
        warehouseId,
        paymentType,
        paidAmount: totalCostSum, // Jami summa
        payments,
        comment
      }], { session });

     //  6-qadam (Yangilangan)
for (const item of processedItems) {
  await Menu.findByIdAndUpdate(item.productId, {
    // 1. Ombor qoldig'ini oshirish ($inc)
    $inc: { quantity: item.quantity }, 
    
    // 2. Narxlarni yangilash ($set)
    $set: { 
      price: item.sellPrice,    // Yangi sotuv narxi
      costPrice: item.costPrice // Yangi tannarx
    }
  }, { session });
}

      // 7. Kontragent balansi (Nasiya bo'lsa)
      const debtPayment = payments.find(p => p.type === 'debt');
      if (debtPayment && debtPayment.amount > 0) {
        await Counterparty.findByIdAndUpdate(counterpartyId, {
          $inc: { balance: -debtPayment.amount } // Bizning qarzimiz ko'payadi (balans minusga kiradi)
        }, { session });
      }

      await session.commitTransaction();
      return { msg: "Kirim muvaffaqiyatli saqlandi", data: newInsert[0] };

    } catch (e) {
      await session.abortTransaction();
      console.error("Insert Create Error:", e);
      throw new BaseError(e.message, 500);
    } finally {
      session.endSession();
    }
  }

  /**
   * Kirimlar ro'yxatini olish (Filtrlar bilan)
   */
  async GetAll(req) {
    const { Insert } = req.tenantModels;
    const { page = 1, limit = 10, startDate, endDate, counterpartyId } = req.body;

    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    if (counterpartyId) {
      query.counterpartyId = counterpartyId;
    }

    const skip = (page - 1) * limit;

    const data = await Insert.find(query)
      .populate('counterpartyId', 'name phone balance')
    //   .populate('warehouseId', 'name')
    //   .populate('staffId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Insert.countDocuments(query);

    return {
      success: true,
      data: {
        data,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Bitta kirim tafsilotlarini olish
   */
  async GetById(req) {
    const { Insert } = req.tenantModels;
    const data = await Insert.findById(req.params.id)
      .populate('counterpartyId')
    //   .populate('warehouseId')
      .populate('items.productId') // Mahsulot tafsilotlari uchun
      .lean();

    if (!data) throw new BaseError("Kirim topilmadi", 404);

    return { success: true, data };
  }
}

module.exports = new InsertService();