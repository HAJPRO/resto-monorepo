import { PrinterStore } from "../../stores/index.store";
import { generatePrintContent, generateKitchenContent } from "../index.util";
import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { UsbSerial } from 'capacitor-usb-serial';
import { useToast } from "../../UI/utils/useToast";

/**
 * Ko'p uchraydigan Generic Printer UUID lari. 
 * Agar ulanmasa, printeringizning texnik hujjatidan buni tekshirish kerak.
 */
export const PRINTER_SERVICE_UUID = "000018f0-0000-1000-8000-00805f9b34fb";
const PRINTER_CHARACTERISTIC_UUID = "00002af1-0000-1000-8000-00805f9b34fb";

export const printReceipt = async (orderData, activeTemplate, printerData) => {
  const { toast } = useToast();

  if (!printerData) return false;
  if (!activeTemplate) {
    toast.error("Faol shablon topilmadi!");
    return false;
  }

  try {
    // 1. SMART CONTENT SELECTION (Role based)
    let content = "";
    // Faqat 'kitchen' emas, 'bar' yoki boshqa ishlab chiqarish rollari uchun ham KitchenContent ishlatamiz
    if (['kitchen', 'bar'].includes(printerData.role)) {
      content = generateKitchenContent(orderData, activeTemplate);
    } else {
      content = generatePrintContent(orderData, activeTemplate);
    }

    // 2. BINARY ENCODING
    const data = new Uint8Array(content.length);
    for (let i = 0; i < content.length; i++) {
      data[i] = content.charCodeAt(i) & 0xFF;
    }

    // 3. BLUETOOTH PRINTING
    if (printerData.type === 'bluetooth') {
      const chunkSize = 120;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await BleClient.write(
          printerData.id,
          PRINTER_SERVICE_UUID,
          PRINTER_CHARACTERISTIC_UUID,
          numbersToDataView(Array.from(chunk))
        );
        await new Promise(r => setTimeout(r, 25));
      }
    } 
    
    // 4. USB PRINTING
    else if (printerData.type === 'usb') {
      await UsbSerial.write({ data: content });
    }

    // 5. WIFI/NETWORK PRINTING
    else if (printerData.type === 'wifi') {
      // Network printerlar uchun HTTP yoki TCP request (printer IP-siga qarab)
      // Bu yerda sizning backend yoki printer bridge'ingizga qarab fetch ishlatish mumkin
      console.log(`WIFI printing to ${printerData.id}`);
      // Masalan: await fetch(`http://${printerData.id}/print`, { method: 'POST', body: content });
    }

    return true;
  } catch (error) {
    console.error(`Print Error (${printerData.name}):`, error);
    return false;
  }
};