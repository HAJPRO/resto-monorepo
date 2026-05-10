const ESC = "\x1B";
const GS = "\x1D";

export const COMMANDS = {
  RESET: `${ESC}@`,
  SET_LATIN_PAGE: `${ESC}t\x12`, 
  CENTER: `${ESC}a\x01`,
  LEFT: `${ESC}a\x00`,
  RIGHT: `${ESC}a\x02`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  DOUBLE_SIZE: `${ESC}!\x30`,
  NORMAL_SIZE: `${ESC}!\x00`,
  CUT: `${GS}V\x42\x00`,
};

const clean = (text) => {
  if (!text) return "";
  // Xitoycha chiqmasligi uchun ASCII formatiga o'tkazish
  return text.toString()
    .replace(/o‘/g, "o'").replace(/O‘/g, "O'")
    .replace(/g‘/g, "g'").replace(/G‘/g, "G'")
    .replace(/sh/g, "sh").replace(/Sh/g, "Sh")
    .replace(/ch/g, "ch").replace(/Ch/g, "Ch")
    .replace(/[^\x00-\x7F]/g, ""); 
};

export const formatRow = (left, right, width = 32) => {
  const l = clean(left);
  const r = clean(right);
  const spaceCount = width - (l.length + r.length);
  return l + " ".repeat(Math.max(0, spaceCount)) + r;
};

// ... COMMANDS va clean funksiyalari o'zgarishsiz qoladi ...







export const generatePrintContent = (order, template) => {
  let c = COMMANDS.RESET;
  c += COMMANDS.SET_LATIN_PAGE;
  
  const width = template.paperWidth === 58 ? 32 : 48;
  const separator = "-".repeat(width) + "\n";

  // 1. KORXONA MA'LUMOTLARI (PROFESSIONAL HEADER)
c += COMMANDS.CENTER;

// Kompaniya nomi - Eng asosiy urg'u
if (template.companyName) {
  c += COMMANDS.BOLD_ON + COMMANDS.DOUBLE_SIZE; // Nomi biroz kattaroq va qalin
  c += `${clean(template.companyName).toUpperCase()}\n`;
  c += COMMANDS.NORMAL_SIZE + COMMANDS.BOLD_OFF; // Keyingi qatorlar uchun normallashtirish
}

// Manzil - Kichikroq va toza
if (template.showLogo && template.address) {
  c += `${clean(template.address)}\n`;
}

// Aloqa ma'lumotlari (Telefon va Ijtimoiy tarmoqlar)
if (template.showLogo && template.phone) {
  c += `Tel: ${template.phone}\n`;
}

// Ijtimoiy tarmoqlar (Telegram, Instagram va h.k.)
if (template.showLogo && template.socials) {
  c += `${clean(template.socials).toLowerCase()}\n`;
}

c += separator; // Chiroyli ajratuvchi chiziq

  // 2. BUYURTMA INFO (Yuborgan obyektga moslandi)
  c += COMMANDS.LEFT;
  // Stol raqami (Sizda tableId.number ko'rinishida)
  if (order.tableId?.number) c += `STOL: ${order.tableId.number}\n`;
  
  // Ofitsiant (Sizda staffId.firstname)
  if (template.showWaiter && order.staffId?.firstname) {
    const waiterName = `${order.staffId.firstname} ${order.staffId.lastname || ''}`;
    c += `OFITSIANT: ${clean(waiterName)}\n`;
  }

  // Mijoz (Sizda customerId.name)
  if (template.showCustomer && order.customerId?.name) {
    c += `MIJOZ: ${clean(order.customerId.name)}\n`;
    c += `Balans: ${clean(order.customerId.balance?.toString() || '0')}\n`;
  }
  
  // Sana (createdAt dan olinadi)
  const date = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr = date.toLocaleString('uz-UZ', { hour12: false }).replace(',', '');
  c += `SANA: ${dateStr}\n`;
  c += separator;

  // 3. MAHSULOTLAR (4 TA USTUN: Nomi, Soni, Narxi, Summasi)
  c += COMMANDS.BOLD_ON;
  if (width === 32) {
    c += "Nomi      Son  Narx    Summa\n";
  } else {
    c += "Mahsulot nomi          Soni   Narxi      Summasi\n";
  }
  c += COMMANDS.BOLD_OFF;

  order.items.forEach(item => {
    let name = clean(item.name);
    const nLimit = width === 32 ? 10 : 20;
    const dName = name.length > nLimit ? name.substring(0, nLimit - 1) + "." : name.padEnd(nLimit);
    
    // 1. Miqdorni formatlash (Masalan: " 12")
    const qty = item.quantity.toString().padStart(3);
    
    // 2. Narxni formatlash (Masalan: "  16 320")
    const prc = Number(Math.round(item.price))
        .toLocaleString('ru-RU') // Mingliklarni probel bilan ajratadi
        .padStart(width === 32 ? 8 : 10);
    
    // 3. Jami summani formatlash (Masalan: "    195 840")
    const total = Number(Math.round(item.totalPrice))
        .toLocaleString('ru-RU') // Mingliklarni probel bilan ajratadi
        .padStart(width === 32 ? 11 : 13);
    
    c += `${dName}${qty}${prc}${total}\n`;
});
  c += separator;

  // 4. TOTALS (Hisob-kitob qismi)
  c += COMMANDS.RIGHT;
  const fRow = (label, val) => {
    const space = width - (label.length + val.length);
    return label + " ".repeat(Math.max(0, space)) + val + "\n";
  };

  const cur = template.currency || "so'm";

  // Subtotal (Sizda: subtotal)
  if (order.subtotal) {
    c += fRow("SUMMA:", `${Number(order.subtotal).toLocaleString()} ${cur}`);
  }
  
  // Xizmat haqi (Sizda: serviceFeeAmount)
  if (template.showService && order.serviceFeeAmount) {
    const sLabel = `XIZMAT (${order.serviceFeePercent || 0}%):`;
    c += fRow(sLabel, `${Number(order.serviceFeeAmount).toLocaleString()} ${cur}`);
  }
  
  // Chegirma (Sizda: discountAmount)
  if (template.showDiscount && order.discountAmount) {
    c += fRow("CHEGIRMA:", `-${Number(order.discountAmount).toLocaleString()} ${cur}`);
  }

  // JAMI (Sizda: finalTotal)
  c += COMMANDS.BOLD_ON;
  const gTotal = `${Number(order.finalTotal).toLocaleString()} ${cur}`;
  c += fRow("JAMI:", gTotal);
  c += COMMANDS.BOLD_OFF;
  c += separator;

  // 5. TO'LOV TURLARI (Dinamik payments massivi)
  if (order.payments && order.payments.length > 0) {
    order.payments.forEach(pay => {
        const type = pay.type === 'cash' ? 'NAQD' : (pay.type === 'debt' ? 'QARZ' : pay.type.toUpperCase());
        c += fRow(`${type}:`, `${Number(pay.amount).toLocaleString()} ${cur}`);
    });
    c += separator;
  }

  // 6. FISKAL VA QR
  c += COMMANDS.CENTER;
  if (template.showFiscal) {
    c += "FISKAL CHEK\n";
    if (order._id) c += `ID: ${order._id.substring(order._id.length - 8)}\n`;
  } else {
    c += "FISKAL CHEK EMAS\n";
  }

  if (template.footerText) {
    c += `\n${clean(template.footerText)}\n`;
  }
  
  // 7. FINISH
  c += "YANA KUTAMIZ!\n";
  c += "\n\n\n\n" + COMMANDS.CUT;
  
  return c;
};