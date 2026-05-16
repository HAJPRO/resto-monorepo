const BaseError = require("../../errors/base.error");
const redisClient = require('../../redis/index.redis'); // Dinamik redis drayverimiz

class CashService {

    // --- KESH KALITLARINI BOSHQARISH ---
    _getCacheKey(tenantId, cashierId) {
        return `pos:${tenantId}:cash:active:shift:${cashierId}`;
    }

    // 1. Smenani ochish
    async OpenShift(req) {
        const { Cash } = req.tenantModels;
        const { cashierId, startingBalance, deviceId } = req.body;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";

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
            tenantId, 
            cashierId,
            startingBalance,
            deviceId,
            status: 'open',
            openedAt: new Date(),
            summary: { totalCash: 0, totalCard: 0, totalSales: 0, totalIn: 0, totalOut: 0 }
        });

        // 🔥 KESH TOZALASH: Yangi smena ochilganda ushbu kassirning keshini tozalaymiz
        if (redisClient && redisClient.isOpen) {
            const cacheKey = this._getCacheKey(tenantId, cashierId);
            await redisClient.del(cacheKey).catch(err => console.error(err));
        }

        return { success: true, data: newShift };
    }

    // 2. Kassa harakati (Kirim/Chiqim)
    async AddTransaction(req) {
        const { Cash } = req.tenantModels;
        const { id } = req.params; 
        const { type, amount, reason, method = 'cash' } = req.body;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";

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

        // 🔥 KESH TOZALASH: Smenadagi pul balansi o'zgardi, faol smena keshini o'chiramiz
        if (redisClient && redisClient.isOpen) {
            const cacheKey = this._getCacheKey(tenantId, shift.cashierId);
            await redisClient.del(cacheKey).catch(err => console.error(err));
        }

        return { success: true, data: shift.transactions[shift.transactions.length - 1] };
    }

    // 3. Smenani yopish (Z-Report)
    async CloseShift(req) {
        const { Cash, Cart } = req.tenantModels;
        const { id } = req.params;
        const { actualCash, notes } = req.body;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";

        const shift = await Cash.findById(id);
        if (!shift || shift.status === 'closed') {
            throw BaseError.NotFound("Yopish uchun aktiv smena topilmadi");
        }

        // 🌟 Izohdan chiqarildi va faollashtirildi: Smenaga tegishli yakunlangan buyurtmalarni topish
        const orders = await Cart.find({ shiftId: shift._id, status: 'completed' }).select('_id');

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
        shift.closedOrderIds = orders.map(o => o._id); // Buyurtmalar bog'landi

        await shift.save();

        // 🔥 KESH TOZALASH: Smena yopildi, keshni portlatamizki qayta GetActiveShift qilganda open chiqmasin
        if (redisClient && redisClient.isOpen) {
            const cacheKey = this._getCacheKey(tenantId, shift.cashierId);
            await redisClient.del(cacheKey).catch(err => console.error(err));
        }

        // Front-end uchun Z-Report ma'lumotlarini to'liq populate qilib qaytaramiz
        const finalReport = await Cash.findById(shift._id)
            .populate('cashierId', 'fullname username')
            .populate({
                path: 'closedOrderIds',
                populate: { path: 'items.foodId', select: 'name price' } // Odatda oziq-ovqat loyihalarida foodId yoki food ishlatiladi
            });

        return { 
            success: true, 
            message: "Smena muvaffaqiyatli yopildi", 
            data: finalReport 
        };
    }

    // 4. Aktiv smenani tekshirish (Keshlashtirildi)
    async GetActiveShift(req) {
        const { Cash } = req.tenantModels;
        
        if (!req.user || !req.user.id) {
            throw BaseError.UnauthorizedError("Foydalanuvchi aniqlanmadi");
        }

        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const cashierId = req.user.id;
        const cacheKey = this._getCacheKey(tenantId, cashierId);

        // 1. Redis Keshni Tekshirish
        try {
            if (redisClient && redisClient.isOpen) {
                const cachedShift = await redisClient.get(cacheKey);
                if (cachedShift) {
                    console.log(`[CACHE HIT] Aktiv smena keshdan yuklandi. Kassir: ${cashierId}`);
                    return JSON.parse(cachedShift);
                }
            }
        } catch (redisError) {
            console.error(`[REDIS READ ERROR] Active shift:`, redisError.message);
        }

        try {
            console.log(`[CACHE MISS] Aktiv smena MongoDB'dan qidirilmoqda... Kassir: ${cashierId}`);
            const activeShift = await Cash.findOne({ 
                status: 'open', 
                cashierId: cashierId
            }).populate({
                path: 'closedOrderIds',
                populate: {
                    path: 'tableId',
                    select: 'number' 
                }
            });

            const result = { 
                success: true, 
                isShiftOpen: !!activeShift, 
                data: activeShift || null 
            };

            // 2. Keshga yozish (Aktiv smena tez-tez tekshirilgani uchun 5 daqiqa ya'ni 300 soniya keshda saqlaymiz)
            try {
                if (redisClient && redisClient.isOpen) {
                    await redisClient.setEx(cacheKey, 300, JSON.stringify(result));
                    console.log(`[CACHE SET] Aktiv smena keshga saqlandi.`);
                }
            } catch (redisWriteError) {
                console.error(`[REDIS WRITE ERROR] Active shift:`, redisWriteError.message);
            }

            return result;
        } catch (error) {
            console.error("GET_ACTIVE_SHIFT_ERROR:", error);
            throw BaseError.BadRequest("Smenani tekshirishda xatolik");
        }
    }
}

// Klass helper funksiyalardan to'g'ri foydalanishi uchun eksport qilinadi
module.exports = new CashService();