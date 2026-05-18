// 1. Muhit o'zgaruvchilarini yuklaymiz (.env fayldan o'qiydi)
require('dotenv').config(); 
const redis = require('redis');

// 2. Qaysi muhitdaligini aniqlaymiz
const isProduction = process.env.NODE_ENV === 'production';

// 3. Redis URL manzilini olamiz (agar .env ichida topilmasa, default localhost'ga ulanadi)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log(`Redis [${process.env.NODE_ENV || 'development'}] muhitida ulanmoqda...`);

// 4. Muhitga qarab sozlamalar bilan client yaratamiz
const redisClient = redis.createClient({
    url: redisUrl,
    socket: {
        // Production muhitida ulanish uzilsa, qayta ulanish strategiyasi (Reconnect strategy)
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Redisga qayta ulanish urinishlari tugadi. Tizim to‘xtatildi.');
                return new Error('Redis ulanishi butunlay uzildi.');
            }
            // Har safar urinishlar soni ko'paygani sari kutish vaqtini oshiradi (masalan, 500ms, 1000ms...)
            return Math.min(retries * 500, 5000); 
        }
    }
});

// Xatoliklarni kuzatish uchun log
redisClient.on('error', (err) => {
    console.error('Redis amaliyotida xatolik yuz berdi:', err);
});

// 5. Redis serveriga ulanamiz
(async () => {
    try {
        await redisClient.connect();
        console.log(`Redis serverga ulanish [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}] muhitida muvaffaqiyatli bajarildi! 🚀`);
    } catch (error) {
        console.error('Redisga ulanish jarayonida jiddiy xato:', error);
    }
})();

// 6. Clientni eksport qilamiz
module.exports = redisClient;