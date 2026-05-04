// utils/imageConverter.js
export const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // Faylni o'qishni boshlash
        reader.readAsDataURL(file);
        // O'qib bo'lingach natijani qaytarish
        reader.onload = () => resolve(reader.result);
        // Xatolik bo'lsa
        reader.onerror = (error) => reject(error);
    });
};