const BaseError = require("../../errors/base.error");
   const redisClient = require('../../redis/index.redis'); // Dinamik redis drayverimiz

class TabelService {
    async Create(req) {
        console.log("uq")
        const { Tabel } = req.tenantModels;
       const  {action} = req.body;
       if(action === 'create'){
      const data = await Tabel.create(req.body)
        return { msg: "YANGI TABEL QO'SHMOQCHIMISAN " }
       } else if(action === 'edit'){
        const { _id, ...updateData } = req.body;
        const updatedTabel = await Tabel.findByIdAndUpdate(
            _id,
            updateData,
            { new: true }
        );
        if (!updatedTabel) {
            throw new BaseError("Tabel topilmadi", 404);
        }
    }    return { msg: "TABEL MUVAFFAQIYATLI YARATILDI" }
}

async GetAll(req) {
    const { Tabel } = req.tenantModels;
    
    // 1. Multi-tenant xavfsizligi uchun tenantId ni aniqlaymiz
    const tenantId = req.tenantId || req.headers['tenant-id'] || "default_tenant";
    
    // Kesh kaliti ierarxiyasi: "pos:tenant_id:tables:all"
    const cacheKey = `pos:${tenantId}:tables:all`;

    // 2. Birinchi qadam: Redisdan keshni tekshiramiz
    try {
        if (redisClient && redisClient.isOpen) {
            const cachedTables = await redisClient.get(cacheKey);
            
            if (cachedTables) {
                console.log(`[CACHE HIT] Stollar xaritasi Redisdan olindi (Tenant: ${tenantId})`);
                return { 
                    success: true,
                    msg: "BARCHA TABELLAR VA BRONLAR (KESHDAN)", 
                    data: JSON.parse(cachedTables) 
                };
            }
        }
    } catch (redisError) {
        // Redisda xato bo'lsa dastur to'xtamaydi, shunchaki log qilinadi
        console.error(`[REDIS READ ERROR] Stollar keshini o'qishda xato:`, redisError.message);
    }

    // 3. Ikkinchi qadam: Agar keshda bo'lmasa, og'ir so'rovni MongoDB'dan bajaramiz (Cache Miss)
    console.log(`[CACHE MISS] Stollar va ichki barcha ma'lumotlar MongoDB'dan yuklanmoqda... (Tenant: ${tenantId})`);
    
    const data = await Tabel.find()
        .populate([
            { path: 'bookings' },
            { path: 'zoneId' },
            { 
                path: 'cartId',
                populate: [
                    { path: 'items.foodId', select: 'image' },
                    { path: 'staffId', select: 'firstname lastname' },
                    { path: 'customerId' }
                ]
            }
        ])
        .lean();

    // 4. Uchinchi qadam: Olingan ma'lumotni qisqa muddatga Redisga yozamiz
    try {
        if (redisClient && redisClient.isOpen && data && data.length > 0) {
            // Stollar dinamik bo'lgani uchun keshni uzog'i bilan 60 soniya (1 daqiqa) saqlaymiz.
            // Bu orqali monitoring ekranlari tinimsiz yangilanganda MongoDB'ga og'irlik tushmaydi.
            await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
            console.log(`[CACHE SET] Stollar xaritasi keshga yozildi.`);
        }
    } catch (redisWriteError) {
        console.error(`[REDIS WRITE ERROR] Stollar keshini yozishda xato:`, redisWriteError.message);
    }

    return { 
        success: true,
        msg: "BARCHA TABELLAR VA BRONLAR", 
        data 
    };
}
async GetById(req) {
    const { Tabel } = req.tenantModels;
    const data = await Tabel.findById(req.params.id)
        .populate('bookings')
        .lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun
    return { 
        success: true,
        msg: "TABEL TOPILDI", 
        data 
    };
}

    ///Booking service
  async CreateBooking(req) {
    const { Booking, Tabel } = req.tenantModels;
    const { _id, ...bookingData } = req.body; 

    
    const newBooking = await Booking.create({
        ...bookingData,
        table_id: _id 
    });

   
    const updatedTable = await Tabel.findByIdAndUpdate(
        _id, 
        { 
            $push: { bookings: newBooking._id } // Bronlar ro'yxatiga ID qo'shamiz
        },
        { new: true } // Yangilangan stol ma'lumotini qaytarish uchun
    );

    if (!updatedTable) {
        throw new Error("Stol topilmadi");
    }

    return { 
        success: true,
        msg: "Stol muvaffaqiyatli bron qilindi", 
        data: newBooking 
    };
}
async GetTableBookings(req) {
    const { Booking } = req.tenantModels;
    const bookings = await Booking.find({ table_id: req.params.id });   
    return {
        success: true,
        msg: "Barcha bronlar olindi",
        data: bookings
    };
}
}
module.exports = new TabelService();    