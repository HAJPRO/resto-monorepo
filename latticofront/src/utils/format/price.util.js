/**
 * Summani universal formatlash
 * @param {number} amount - Miqdor (masalan: 1250000)
 * @param {string} symbol - Pul birligi (masalan: "so'm", "$", "UZS")
 * @param {string} separator - Ajratuvchi belgi (default: bo'sh joy)
 */
export const formatCurrency = (amount, symbol = "", separator = " ") => {
  if (amount === undefined || amount === null) return `0 ${symbol}`;

  // Raqamni har 3 xonadan keyin ajratish (1 250 000)
  const formattedAmount = amount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  // Pul birligini har doim orqasidan qo'shish
  return `${formattedAmount} ${symbol}`;
};