const BaseError = require("../../errors/base.error");
const redisClient = require('../../redis/index.redis'); // Dinamik redis drayverimiz

class MenuService {

    // --- KESH KALITLARINI BOSHQARISH ---
    getCacheKeys(tenantId, id = null) {
        return {
            menuAll: `pos:${tenantId}:menu:all`,
            menuSingle: id ? `pos:${tenantId}:menu:single:${id}` : null,
            categoryAll: `pos:${tenantId}:category:all`,
            tablesAll: `pos:${tenantId}:tables:all`
        };
    }

    async Create(req) {
        const { Menu } = req.tenantModels;
        
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new BaseError("Ma'lumotlar qabul qilinmadi (JSON body bo'sh)", 400);
        }

        const { action, _id } = req.body;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const keys = this.getCacheKeys(tenantId, _id);

        if (action === 'create') {
            const data = await Menu.create(req.body);   
            
            // 🔥 KESH TOZALASH: Yangi taom qo'shildi, menyu ro'yxati keshini o'chiramiz
            if (redisClient && redisClient.isOpen) {
                await redisClient.del(keys.menuAll).catch(err => console.error(err));
            }

            return { msg: "Muvaffaqiyatli yaratildi", data };

        } else if (action === 'edit') {
            if (!_id) throw new BaseError("ID topilmadi", 400);
            
            const updateData = { ...req.body };
            delete updateData.action;
            delete updateData._id;

            const updated = await Menu.findByIdAndUpdate(_id, updateData, { new: true });

            // 🔥 KESH TOZALASH: Taom tahrirlandi, umumiy ro'yxat va individual taom keshini tozalaymiz
            if (redisClient && redisClient.isOpen) {
                await redisClient.del([keys.menuAll, keys.menuSingle]).catch(err => console.error(err));
            }

            return { msg: "Muvaffaqiyatli yangilandi", data: updated };
        }

        throw new BaseError("Noto'g'ri action: " + action, 400);
    }

    async GetAll(req) {
        const { Menu } = req.tenantModels;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const keys = this.getCacheKeys(tenantId);

        try {
            if (redisClient && redisClient.isOpen) {
                const cachedData = await redisClient.get(keys.menuAll);
                if (cachedData) {
                    console.log(`[CACHE HIT] Menyu Redisdan yuklandi. Tenant: ${tenantId}`);
                    return { 
                        success: true,
                        msg: "BARCHA MENULAR (KESHDAN)", 
                        data: JSON.parse(cachedData) 
                    };
                }
            }
        } catch (redisError) {
            console.error(`[REDIS READ ERROR] Menyu keshini o'qishda xatolik:`, redisError.message);
        }

        console.log(`[CACHE MISS] Menyu MongoDB'dan yuklanmoqda... Tenant: ${tenantId}`);
        const data = await Menu.find().lean(); 

        try {
            if (redisClient && redisClient.isOpen && data && data.length > 0) {
                await redisClient.setEx(keys.menuAll, 43200, JSON.stringify(data)); // 12 soat kesh
                console.log(`[CACHE SET] Yangi menyu keshga yozildi.`);
            }
        } catch (redisWriteError) {
            console.error(`[REDIS WRITE ERROR] Keshga yozishda xatolik:`, redisWriteError.message);
        }

        return { success: true, msg: "BARCHA MENULAR (BAZADAN)", data };
    }

    async GetById(req) {
        const { Menu } = req.tenantModels;
        const { id } = req.params;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const keys = this.getCacheKeys(tenantId, id);

        // 1. Redis keshini tekshiramiz
        try {
            if (redisClient && redisClient.isOpen) {
                const cachedItem = await redisClient.get(keys.menuSingle);
                if (cachedItem) {
                    console.log(`[CACHE HIT] Alohida taom keshdan olindi. ID: ${id}`);
                    return { success: true, msg: "MENU TOPILDI (KESHDAN)", data: JSON.parse(cachedItem) };
                }
            }
        } catch (redisError) {
            console.error(`[REDIS SINGLE READ ERROR]`, redisError.message);
        }

        console.log(`[CACHE MISS] Taom bazadan yuklanmoqda... ID: ${id}`);
        const data = await Menu.findById(id).populate('bookings').lean();

        if (!data) throw new BaseError("Menu topilmadi", 404);

        // 2. Keshga yozish
        try {
            if (redisClient && redisClient.isOpen) {
                await redisClient.setEx(keys.menuSingle, 7200, JSON.stringify(data)); // 2 soat kesh
            }
        } catch (redisWriteError) {
            console.error(`[REDIS SINGLE WRITE ERROR]`, redisWriteError.message);
        }

        return { success: true, msg: "MENU TOPILDI", data };
    }

    async Delete(req) {
        const { Menu } = req.tenantModels;
        const { id } = req.params;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const keys = this.getCacheKeys(tenantId, id);

        await Menu.findByIdAndDelete(id);

        // 🔥 KESH TOZALASH: Taom o'chirilgach keshlar ham o'chishi shart
        if (redisClient && redisClient.isOpen) {
            await redisClient.del([keys.menuAll, keys.menuSingle]).catch(err => console.error(err));
        }

        return { status : 200, msg: "Muvaffaqiyatli o'chirildi" };
    }

    //// Kategoriya qismi
    async CreateCategory(req) { 
        const { Category } = req.tenantModels;
        const { action, ...CategoryModel } = req.body;

        if (!CategoryModel.name) {
            throw new BaseError("Kategoriya nomi kiritilishi kerak", 400);
        }

        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const keys = this.getCacheKeys(tenantId);

        if (action === 'create') {
            const data = await Category.create(CategoryModel); 

            // 🔥 KESH TOZALASH: Yangi kategoriya yaratilganda keshni o'chiramiz
            if (redisClient && redisClient.isOpen) {
                await redisClient.del(keys.categoryAll).catch(err => console.error(err));
            }

            return { msg: "Kategoriya yaratildi", data };
        } 
        
        if (action === 'edit') {
            if (!CategoryModel._id) {
                throw new BaseError("Kategoriya ID kiritilishi kerak", 400);
            }
            const updated = await Category.findByIdAndUpdate(
                CategoryModel._id, 
                CategoryModel, 
                { new: true }
            );

            // 🔥 PROFESSIONAL BEST PRACTICE: Kategoriya o'zgarganda ham kategoriya, ham menyu keshini tozalaymiz!
            if (redisClient && redisClient.isOpen) {
                await redisClient.del([keys.categoryAll, keys.menuAll]).catch(err => console.error(err));
            }

            return { msg: "Kategoriya yangilandi", data: updated };
        }

        throw new BaseError("Noto'g'ri amal (action)", 400);
    }

    async GetAllCategories(req) {
        const { Category } = req.tenantModels;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const keys = this.getCacheKeys(tenantId);

        // 1. Redisdan tekshiramiz
        try {
            if (redisClient && redisClient.isOpen) {
                const cachedCategories = await redisClient.get(keys.categoryAll);
                if (cachedCategories) {
                    console.log(`[CACHE HIT] Kategoriyalar Redisdan olindi.`);
                    return JSON.parse(cachedCategories);
                }
            }
        } catch (redisError) {
            console.error(`[REDIS CAT READ ERROR]`, redisError.message);
        }

        console.log(`[CACHE MISS] Kategoriyalar MongoDB'dan olinmoqda...`);
        const categories = await Category.find().sort({ order: 1 }).lean(); 

        // 2. Redisga keshlaymiz
        try {
            if (redisClient && redisClient.isOpen && categories.length > 0) {
                await redisClient.setEx(keys.categoryAll, 43200, JSON.stringify(categories)); // 12 soat
            }
        } catch (redisWriteError) {
            console.error(`[REDIS CAT WRITE ERROR]`, redisWriteError.message);
        }

        return categories;
    }

    /// Cart / Buyurtma berish qismi
    async CreateOrder(req) {
        const { Cart, Tabel } = req.tenantModels;
        const { action, ...orderData } = req.body;
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const keys = this.getCacheKeys(tenantId);

        const data = await Cart.create(orderData);
        await Tabel.findByIdAndUpdate(data.tableId, { status: 1, cartId: data._id }, { new: true });

        // 🔥 KESH TOZALASH: Yangi faol buyurtma ochildi va stol holati 'band' qilib o'zgardi.
        // Stollar xaritasi va carts keshlarini o'chiramiz.
        if (redisClient && redisClient.isOpen) {
            await redisClient.del(keys.tablesAll).catch(err => console.error(err));
            
            // Buyurtmalar ro'yxati keshini tozalash (Dinamik xesh kalitlarni pattern orqali o'chirish)
            const cartCacheKeys = await redisClient.keys(`pos:${tenantId}:carts:*`).catch(() => []);
            if (cartCacheKeys.length > 0) {
                await redisClient.del(cartCacheKeys).catch(err => console.error(err));
            }
        }

        return data;
    }

    async UpdateOrder(req) {
        const { Cart } = req.tenantModels;
        const { id, orderData } = req.body; 
        const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
        const keys = this.getCacheKeys(tenantId);

        const data = await Cart.findByIdAndUpdate(
            id, 
            { edit: true, ...orderData }, 
            { new: true, runValidators: true }
        );

        if (!data) {
            throw new BaseError("Buyurtma topilmadi", 404);
        }   

        // 🔥 KESH TOZALASH: Buyurtma tarkibi yangilandi (masalan yangi taom qo'shildi).
        // Bu stol monitoringi ekraniga ham ta'sir qiladi, shuning uchun stollar va carts keshini portlatamiz.
        if (redisClient && redisClient.isOpen) {
            await redisClient.del(keys.tablesAll).catch(err => console.error(err));
            
            const cartCacheKeys = await redisClient.keys(`pos:${tenantId}:carts:*`).catch(() => []);
            if (cartCacheKeys.length > 0) {
                await redisClient.del(cartCacheKeys).catch(err => console.error(err));
            }
        }

        return data;
    }
}

module.exports = new MenuService();