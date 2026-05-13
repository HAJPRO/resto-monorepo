const BaseError = require("../../errors/base.error");

class CashService {
    // 1. Smenani ochish
    async OpenShift(req) {
        const { Cash } = req.tenantModels;
        const { cashierId, startingBalance, deviceId } = req.body;
        const tenantId = req.tenantId; // Middleware dan kelayotgan tenantId

        if (startingBalance === undefined) {
            throw BaseError.BadRequest("Boshlang'ich qoldiq ko'rsatilmadi");
        }

        // Tekshirish: Ochiq smena bormi?
        const activeShift = await Cash.findOne({ 
            status: 'open', 
            $or: [{ cashierId }, { deviceId }] 
        });

        if (activeShift) {
            throw BaseError.BadRequest("Sizda allaqachon ochiq smena mavjud.");
        }

        const newShift = await Cash.create({
            tenantId, // required: true bo'lgani uchun qo'shildi
            cashierId,
            startingBalance,
            deviceId,
            status: 'open',
            openedAt: new Date(),
            summary: { totalCash: 0, totalCard: 0, totalSales: 0, totalIn: 0, totalOut: 0 }
        });

        return { success: true, data: newShift };
    }

    // 2. Kassa harakati (Kirim/Chiqim)
    async AddTransaction(req) {
        const { Cash } = req.tenantModels;
        const { id } = req.params; 
        const { type, amount, reason, method = 'cash' } = req.body;

        if (!['in', 'out'].includes(type) || !amount) {
            throw BaseError.BadRequest("Ma'lumotlar yetarli emas");
        }

        const updateField = type === 'in' ? 'summary.totalIn' : 'summary.totalOut';
        
        const shift = await Cash.findOneAndUpdate(
            { _id: id, status: 'open' },
            { 
                $push: { transactions: { type, amount, reason, method } },
                $inc: { [updateField]: Number(amount) }
            },
            { new: true }
        );

        if (!shift) {
            throw BaseError.NotFound("Aktiv smena topilmadi");
        }

        return { success: true, data: shift.transactions[shift.transactions.length - 1] };
    }

    // 3. Smenani yopish (Z-Report) + Buyurtmalarni Populate qilish
    async CloseShift(req) {
        const { Cash, Cart } = req.tenantModels;
        const { id } = req.params;
        const { actualCash, notes } = req.body;

        const shift = await Cash.findById(id);
        if (!shift || shift.status === 'closed') {
            throw BaseError.NotFound("Yopish uchun aktiv smena topilmadi");
        }

        // Smenaga tegishli barcha yakunlangan buyurtmalar
        // const orders = await Cart.find({ shiftId: shift._id, status: 'completed' });

        const expectedCash = 
            shift.startingBalance + 
            shift.summary.totalCash + 
            shift.summary.totalIn - 
            shift.summary.totalOut;

        shift.status = 'closed';
        shift.closedAt = new Date();
        shift.closingData = {
            expectedCash,
            actualCash: Number(actualCash || 0),
            difference: Number(actualCash || 0) - expectedCash,
            totalSales: shift.summary.totalSales,
            totalWithdrawals: shift.summary.totalOut
        };
        shift.notes = notes;
        // shift.closedOrderIds = orders.map(o => o._id);

        await shift.save();

        // Front-end uchun barcha ma'lumotlarni yig'ib (populate) qaytaramiz
        const finalReport = await Cash.findById(shift._id)
            .populate('cashierId', 'fullname username')
            .populate({
                path: 'closedOrderIds',
                populate: { path: 'items.productId', select: 'name price' }
            });

        return { 
            success: true, 
            message: "Smena muvaffaqiyatli yopildi", 
            data: finalReport 
        };
    }

    // 4. Aktiv smenani tekshirish
    async GetActiveShift(req) {
        const { Cash } = req.tenantModels;
        
        if (!req.user || !req.user.id) {
            throw BaseError.UnauthorizedError("Foydalanuvchi aniqlanmadi");
        }

        try {
        const activeShift = await Cash.findOne({ 
    status: 'open', 
    cashierId: req.user.id
}).populate({
    path: 'closedOrderIds',
    populate: {
        path: 'tableId',
        // Faqat 'number' maydonini oladi, '_id' har doim default keladi
        select: 'number' 
    }
});

            return { 
                success: true, 
                isShiftOpen: !!activeShift, 
                data: activeShift || null 
            };
        } catch (error) {
            console.error("GET_ACTIVE_SHIFT_ERROR:", error);
            throw BaseError.BadRequest("Smenani tekshirishda xatolik");
        }
    }
}

module.exports = new CashService();