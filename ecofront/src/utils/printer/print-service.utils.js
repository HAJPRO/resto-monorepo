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



export const generatePrintContent = (order, template) => {
  let c = COMMANDS.RESET;
  c += COMMANDS.SET_LATIN_PAGE;
  
  const width = template.paperWidth === 58 ? 32 : 48;
  const separator = "-".repeat(width) + "\n";

  // 1. KORXONA MA'LUMOTLARI (PROFESSIONAL HEADER)
c += COMMANDS.CENTER;

if (template.companyName) {
  // Kompaniya nomi - Maksimal urg'u
  c += COMMANDS.BOLD_ON + COMMANDS.DOUBLE_SIZE;
  c += `${clean(template.companyName).toUpperCase()}\n`;
  c += COMMANDS.NORMAL_SIZE + COMMANDS.BOLD_OFF;
}

// Manzil va Kontaktlarni mantiqiy bloklarga ajratamiz
if (template.showLogo) {
  c += "\n"; // Nomdan keyin kichik bo'shliq

  if (template.address) {
    // Manzilni biroz ajratib ko'rsatish
    c += `Manzil:${clean(template.address)}\n`;
  }

  // Kontaktlar bloki
  if (template.phone || template.socials) {
    let contactLine = "";
    
    if (template.phone) contactLine += `Tel: ${template.phone}`;
    
    // Agar telefon ham, ijtimoiy tarmoq ham bo'lsa, ularni ajratib yozamiz
    if (template.phone && template.socials) {
      c += `${contactLine}\n`;
      c += `${clean(template.socials).toLowerCase()}\n`;
    } else {
      c += `Telegram:${contactLine}${clean(template.socials).toLowerCase()}\n`;
    }
  }
}
// Header tugaganini bildiruvchi chiroyli chiziq
c += "\n"; // Footer matni yopishib qolmasligi uchun
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

    // Balansni formatlash (Masalan: 1 250 000 so'm)
    const balanceValue = Number(order.customerId.balance || 0);
    const formattedBalance = balanceValue.toLocaleString('ru-RU'); // 1 000 000 ko'rinishiga keltiradi
    const currency = template.currency || "so'm";

    // Balans holatiga qarab belgi qo'yish (ixtiyoriy)
    const label = balanceValue < 0 ? "QARZDORLIK:" : "BALANS:";
    
    // Natija: BALANS: 50 000 so'm
    c += `${label} ${formattedBalance} ${currency}\n`;
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
  // c += COMMANDS.CENTER;
  // if (template.showFiscal) {
  //   c += "FISKAL CHEK\n";
  //   if (order._id) c += `ID: ${order._id.substring(order._id.length - 8)}\n`;
  // } else {
  //   c += "FISKAL CHEK EMAS\n";
  // }

// 7. FOOTER (MARKAZDA VA CHIROYLI)
  c += COMMANDS.CENTER; // Printer darajasida markazlash
  
  // if (template.footerText) {
  //   c += `${clean(template.footerText)}\n`;
  //   c += separator;
  // }

  c += "\n";
  c += COMMANDS.BOLD_ON;
  c += "TASHRIFINGIZ UCHUN RAHMAT!\n";
  c += "YANA KUTIB QOLAMIZ!\n";
  c += COMMANDS.BOLD_OFF;

  // 7. FINISH
  c += COMMANDS.LEFT; // Kesishdan oldin holatni tiklash
  c += "\n".repeat(4); 
  c += COMMANDS.CUT;

  return c;
};

export const generateKitchenContent = (order, template) => {
  let c = COMMANDS.RESET;
  c += COMMANDS.SET_LATIN_PAGE;
  
  const width = template.paperWidth === 58 ? 32 : 48;
  const separator = "-".repeat(width) + "\n";

  // 1. HEADER (STOL VA VAQT)
  c += COMMANDS.CENTER;
  c += COMMANDS.BOLD_ON + COMMANDS.DOUBLE_SIZE;
  if (order.tableId?.number) {
    c += `STOL: ${order.tableId.number}\n`;
  }
  c += COMMANDS.NORMAL_SIZE;
  
  const date = order.createdAt ? new Date(order.createdAt) : new Date();
  const timeStr = date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  c += `VAQT: ${timeStr}\n`;
  c += COMMANDS.BOLD_OFF;
  c += separator;

  // 2. OFITSIANT
  c += COMMANDS.LEFT;
  if (order.staffId?.firstname) {
    c += `OFITSIANT: ${clean(order.staffId.firstname)}\n`;
  }
  c += separator;

  // 3. MAHSULOTLAR SARLAVHASI
  c += COMMANDS.BOLD_ON;
  // Sarlavhani ustunlarga moslaymiz (Nomi, Soni, Narxi)
  if (width === 32) {
    // 58mm printer uchun qisqaroq
    c += formatRow("NOMI", "S/NARX", width) + "\n";
  } else {
    // 80mm printer uchun kengroq
    c += formatRow("MAHSULOT NOMI", "SONI x NARX", width) + "\n";
  }
  c += COMMANDS.BOLD_OFF;
  c += separator;

  // 4. MAHSULOTLAR RO'YXATI
  order.items.forEach(item => {
    const name = clean(item.name).toUpperCase();
    const qty = item.quantity;
    const price = item.price.toLocaleString(); // Narxni formatlash
    const total = (item.quantity * item.price).toLocaleString();

    // Birinchi qator: Mahsulot nomi va jami summasi (Bold qilingan)
    c += COMMANDS.BOLD_ON;
    c += formatRow(name, total, width) + "\n";
    c += COMMANDS.BOLD_OFF;

    // Ikkinchi qator: Miqdori va donasining narxi (Kichikroq ko'rinishda)
    const detailStr = `   ${qty} x ${price}`;
    c += detailStr + "\n";

    // Agar mahsulotga izoh bo'lsa
    if (item.comment) {
      c += `   *IZOH: ${clean(item.comment)}\n`;
    }
  });

  c += separator;

  // 5. UMUMIY SUMMA (Agar oshxonaga jami summa ham kerak bo'lsa)
  if (order.finalTotal) {
    c += COMMANDS.BOLD_ON + COMMANDS.RIGHT;
    c += `JAMI: ${order.finalTotal.toLocaleString()} ${template.currency || "so'm"}\n`;
    c += COMMANDS.BOLD_OFF;
  }

  // 6. FINISH
  c += "\n".repeat(3); 
  c += COMMANDS.CUT;

  return c;
};