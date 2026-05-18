const BaseError = require("../../errors/base.error");
const redisClient = require('../../redis/index.redis'); // Dinamik redis drayverimiz
const crypto = require('crypto'); // Node.js ichki moduli

class OrderService {

    // --- MANEJU KESH KALITLARI ---
    getMenuKeys(tenantId, id = null) {
        return {
            all: `pos:${tenantId}:menu:all`,
            single: id ? `pos:${tenantId}:menu:single:${id}` : null
        };
    }

    async Create(req) {
        const { Menu, Cash } = req.tenantModels;
        const { action, _id } = req.body;

        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const menuKeys = this.getMenuKeys(tenantId, _id);

        // 3. CREATE LOGIKASI
        if (action === 'create') {
            if (!req.body.image) throw new BaseError("Rasm majburiy", 400);

            const orderData = {
                ...req.body,
                createdBy: userId, 
                shiftId: activeShift._id 
            };

            const data = await Menu.create(orderData);

            // 🔥 KESH TOZALASH: Yangi taom qo'shildi, umumiy ro'yxat keshini o'chiramiz
            if (redisClient && redisClient.isOpen) {
                await redisClient.del(menuKeys.all).catch(err => console.error("Redis Error:", err));
            }

            return { msg: "Muvaffaqiyatli yaratildi", data };
        } 
        
        // 4. EDIT LOGIKASI
        else if (action === 'edit') {
            if (!_id) throw new BaseError("ID topilmadi", 400);
            
            const updated = await Menu.findByIdAndUpdate(_id, req.body, { new: true });

            // 🔥 KESH TOZALASH: Taom o'zgardi, ham umumiy ro'yxatni, ham shu ID keshini o'chiramiz
            if (redisClient && redisClient.isOpen) {
                await redisClient.del([menuKeys.all, menuKeys.single]).catch(err => console.error("Redis Error:", err));
            }

            return { msg: "Muvaffaqiyatli yangilandi", data: updated };
        }

        throw new BaseError("Noto'g'ri action: " + action, 400);
    }

    async GetAll(req) {
        const { Cart } = req.tenantModels;
        const { page = 1, limit = 10, filterType, startDate, endDate } = req.body;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";

        let query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        } else if (filterType) {
            const now = new Date();
            if (filterType === 'Kun') {
                query.createdAt = {
                    $gte: new Date(now.setHours(0, 0, 0, 0)),
                    $lte: new Date(now.setHours(23, 59, 59, 999))
                };
            } else if (filterType === 'Hafta') {
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                query.createdAt = { $gte: new Date(startOfWeek.setHours(0, 0, 0, 0)) };
            } else if (filterType === 'Oy') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                query.createdAt = { $gte: startOfMonth };
            } else if (filterType === 'Yil') {
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                query.createdAt = { $gte: startOfYear };
            }
        }

        const queryParams = { page, limit, filterType, startDate, endDate };
        const queryHash = crypto.createHash('md5').update(JSON.stringify(queryParams)).digest('hex');
        const cacheKey = `pos:${tenantId}:carts:${queryHash}`;

        try {
            if (redisClient && redisClient.isOpen) {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    console.log(`[CACHE HIT] Buyurtmalar tarixi keshdan olindi`);
                    return { success: true, msg: "Buyurtmalar ro'yxati (KESHDAN)", data: JSON.parse(cachedData) };
                }
            }
        } catch (redisError) {
            console.error(`[REDIS READ ERROR]`, redisError.message);
        }

        console.log(`[CACHE MISS] Buyurtmalar MongoDB'dan yuklanmoqda...`);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Cart.find(query)
                .populate('customerId')
                .populate('staffId')
                .populate({
                    path: 'tableId',
                    populate: { path: 'cartId', model: 'Cart' }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Cart.countDocuments(query)
        ]);

        const resultData = {
            data,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        };

        try {
            if (redisClient && redisClient.isOpen && data.length > 0) {
                await redisClient.setEx(cacheKey, 300, JSON.stringify(resultData)); // 5 daqiqa kesh
            }
        } catch (redisWriteError) {
            console.error(`[REDIS WRITE ERROR]`, redisWriteError.message);
        }

        return { success: true, msg: "Buyurtmalar ro'yxati", data: resultData };
    }

    async GetById(req) {
        const { Menu } = req.tenantModels;
        const { id } = req.params;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        
        // Unikal kalit: pos:tenant_id:menu:single:id
        const cacheKey = this.getMenuKeys(tenantId, id).single;

        // 1. Redisdan keshni tekshirish
        try {
            if (redisClient && redisClient.isOpen) {
                const cachedItem = await redisClient.get(cacheKey);
                if (cachedItem) {
                    console.log(`[CACHE HIT] Alohida taom keshdan olindi. ID: ${id}`);
                    return { success: true, msg: "MENU TOPILDI (KESHDAN)", data: JSON.parse(cachedItem) };
                }
            }
        } catch (redisError) {
            console.error(`[REDIS SINGLE READ ERROR]`, redisError.message);
        }

        // 2. Keshda yo'q bo'lsa MongoDB'dan qidirish
        console.log(`[CACHE MISS] Taom bazadan qidirilmoqda... ID: ${id}`);
        const data = await Menu.findById(id).populate('bookings').lean();

        if (!data) throw new BaseError("Menu topilmadi", 404);

        // 3. Kelajakda tez ochilishi uchun Redisga yozish (Masalan: 2 soatga = 7200 soniya)
        try {
            if (redisClient && redisClient.isOpen) {
                await redisClient.setEx(cacheKey, 7200, JSON.stringify(data));
            }
        } catch (redisWriteError) {
            console.error(`[REDIS SINGLE WRITE ERROR]`, redisWriteError.message);
        }

        return { success: true, msg: "MENU TOPILDI", data };
    }

    /**
     * To'lovni yakunlash va orderni yopish
     */
    async SubmitPayment(req) {
        const { Cart, Customer, Tabel, Transaction, Cash } = req.tenantModels;
        const { orderId, customerId, payments, surplusAmount, tableId } = req.body;
        const userId = req.user.id; 

        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";

        const activeShift = await Cash.findOne({ cashierId: userId, status: 'open' });
        if (!activeShift) {
            throw BaseError.Forbidden("To'lov uchun avval kassa smenasini oching!");
        }

        const session = await Cart.startSession();
        session.startTransaction();

        try {
            const debtAmount = payments.find(p => p.type === 'debt')?.amount || 0;
            const usedBalanceAmount = payments.find(p => p.type === 'balance')?.amount || 0;
            const surplus = surplusAmount || 0;
            const cashReceived = payments.find(p => p.type === 'cash')?.amount || 0;
            const cardReceived = payments.find(p => p.type === 'card')?.amount || 0;
            const netCashAmount = cashReceived - surplus; 

            // 3. Buyurtmani (Cart) completed deb yopish
            await Cart.findByIdAndUpdate(orderId, {
                $set: {
                    status: 'completed',
                    payments: payments,
                    surplusAmount: surplus,
                    isDebtClosed: debtAmount <= 0,
                    shiftId: activeShift._id 
                }
            }, { session });

            // 4. Kassa balansini yangilash
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
                        customerId, orderId, shiftId: activeShift._id, type: 'debt', amount: debtAmount, method: 'balance', description: `Buyurtma #${orderId} uchun nasiya shakllandi`
                    });
                }
                if (surplus > 0) {
                    transactionRecords.push({
                        customerId, orderId, shiftId: activeShift._id, type: 'surplus', amount: surplus, method: 'cash', description: `Buyurtma #${orderId} dan qaytim balansga qo'shildi`
                    });
                }
                if (usedBalanceAmount > 0) {
                    transactionRecords.push({
                        customerId, orderId, shiftId: activeShift._id, type: 'refund', amount: usedBalanceAmount, method: 'balance', description: `Buyurtma #${orderId} uchun eski balansdan to'lov qilindi`
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

            await session.commitTransaction();

            // 🔥 PROFESSIONAL BEST PRACTICE: KESH INVALIDATSIYASI (TOZALASH)
            // To'lov muvaffaqiyatli tugagach, fonda stollar holati o'zgardi va yangi buyurtma yopildi.
            // Shuning uchun stollar va buyurtmalar ro'yxatiga bog'liq barcha eski keshlar tozalanishi shart.
            if (redisClient && redisClient.isOpen) {
                // 1. Stollar keshini tozalaymiz
                await redisClient.del(`pos:${tenantId}:tables:all`).catch(e => console.error(e));
                
                // 2. Buyurtmalar ro'yxati keshlarini tozalash. 
                // Carts kalitlari dinamik (hashlangan) bo'lgani uchun ularni pattern (KEYS) orqali o'chiramiz.
                // Izoh: Katta bazalarda KEYS buyrug'i sekin ishlashi mumkin, lekin bitta tenant doirasida bu juda xavfsiz.
                const cartCacheKeys = await redisClient.keys(`pos:${tenantId}:carts:*`).catch(() => []);
                if (cartCacheKeys.length > 0) {
                    await redisClient.del(cartCacheKeys).catch(e => console.error(e));
                }
                console.log(`[CACHE INVALIDATED] To'lov tugagani sababli Stollar va Buyurtmalar keshlari tozalandi.`);
            }

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