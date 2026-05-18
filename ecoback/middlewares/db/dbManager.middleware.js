const mongoose = require('mongoose');

// Connectionlarni keshda saqlash
const tenantConnections = {};

const getTenantDB = async (dbName) => {
    // 1. Baza nomini tozalash va default qiymat
    const finalDbName = (dbName && dbName.trim() !== '') ? dbName.trim() : "restouz";

    // 2. Keshni tekshirish (Ulanish mavjud va ochiq bo'lsa)
    if (tenantConnections[finalDbName]) {
        const activeConn = tenantConnections[finalDbName];
        // 1 = connected, 2 = connecting
        if (activeConn.readyState === 1 || activeConn.readyState === 2) {
            return activeConn;
        }
        // Agar ulanish yopilgan bo'lsa, keshdan o'chiramiz
        delete tenantConnections[finalDbName];
    }

    const env = (process.env.NODE_ENV || 'development').trim().toLowerCase();
    const isProd = env === 'production';
    
    const baseUrl = isProd ? process.env.SERVER_DB_BASE : process.env.ATLAS_DB_BASE;
    const options = isProd ? process.env.SERVER_DB_OPTS : process.env.ATLAS_DB_OPTS;

    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const fullUrl = `${cleanBaseUrl}${finalDbName}${options || ""}`;

    try {
        // 3. Yangi ulanish hosil qilish
        const conn = mongoose.createConnection(fullUrl, {
            autoIndex: true,
            serverSelectionTimeoutMS: 10000,
            // Multi-tenant uchun muhim sozlamalar:
            maxPoolSize: 10,       // Har bir tenant uchun max ulanishlar soni
            minPoolSize: 2,        // Minimal ochiq turadigan ulanishlar
            socketTimeoutMS: 45000,
        });

        // Event listenerlar (Ulanish holatini kuzatish uchun)
        conn.on('connected', () => console.log(`✅ [${finalDbName}] ulandi`));
        conn.on('error', (err) => console.error(`❌ [${finalDbName}] xatosi:`, err));
        conn.on('disconnected', () => {
            console.log(`⚠️ [${finalDbName}] uzildi`);
            delete tenantConnections[finalDbName]; // Uzilganda keshdan tozalash
        });

        // Ulanishni kutish
        await conn.asPromise();
        
        tenantConnections[finalDbName] = conn;
        return conn;
    } catch (err) {
        console.error(`❌ DB ulanish xatosi (${finalDbName}):`, err.message);
        throw err; 
    }
};

module.exports = { getTenantDB };