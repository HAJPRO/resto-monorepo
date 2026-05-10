import { PrinterStore } from "../../stores/index.store";
import { generatePrintContent } from "../index.util";
import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { UsbSerial } from 'capacitor-usb-serial';
import { useToast } from "../../UI/utils/useToast";

// Standart printer UUID lari
export const PRINTER_SERVICE_UUID = "000018f0-0000-1000-8000-00805f9b34fb";
const PRINTER_CHARACTERISTIC_UUID = "00002af1-0000-1000-8000-00805f9b34fb";

export const printReceipt = async (orderData, activeTemplate) => {
  const pStore = PrinterStore();
  const { toast } = useToast();
  const printer = pStore.connectedPrinter;

  if (!printer) {
    toast.error("Printer ulanmagan! Sozlamalardan printerni ulang.");
    return false;
  }

  if (!activeTemplate) {
    toast.error("Faol shablon topilmadi!");
    return false;
  }

  try {
    const content = generatePrintContent(orderData, activeTemplate);
    
    /**
     * MUHIM: Xitoycha yozuvlarni yo'qotish uchun UTF-8 dan voz kechamiz.
     * Matnni 8-bitli ASCII/Latin formatiga o'tkazamiz.
     */
    const data = new Uint8Array(content.length);
    for (let i = 0; i < content.length; i++) {
      // Har bir belgini 0-255 oralig'idagi baytga aylantiramiz
      data[i] = content.charCodeAt(i) & 0xFF;
    }

    if (printer.type === 'bluetooth') {
      /**
       * CHUNKING LOGIC: 512 bayt limitidan oshmaslik uchun 
       * va printerni qizib ketishidan saqlash uchun bo'laklab yuboramiz.
       */
      const chunkSize = 100; 
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        await BleClient.write(
          printer.id,
          PRINTER_SERVICE_UUID,
          PRINTER_CHARACTERISTIC_UUID,
          numbersToDataView(Array.from(chunk))
        );
        
        // Printer protsessoriga nafas olish uchun vaqt (15ms)
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    } 
    else if (printer.type === 'usb') {
      // USB orqali yuborishda matn ko'rinishida yuboramiz
      await UsbSerial.write({ data: content });
    }

    toast.success("Chek chop etishga yuborildi");
    return true;

  } catch (error) {
    console.error("Print Error:", error);
    toast.error("Chop etishda xatolik: " + error.message);
    return false;
  }
};