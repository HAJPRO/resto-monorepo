import { defineStore } from "pinia";
import { Capacitor } from "@capacitor/core";
import { BleClient } from '@capacitor-community/bluetooth-le';
import { UsbSerial } from 'capacitor-usb-serial';
import { useToast } from "../../UI/utils/useToast";
import { printReceipt, PRINTER_SERVICE_UUID } from "../../utils/index.util";
import { CheckTemplateStore } from "../../stores/index.store";

export const PrinterStore = defineStore("PrinterStore", {
  state: () => ({
    printers: JSON.parse(localStorage.getItem("active_printers") || "[]"),
    isSearching: false,
    loading: false
  }),

  actions: {
    // --- 1. ROLNI O'ZGARTIRISH (Siz so'ragan asosiy funksiya) ---
   async updateRole(id, newRole) {
      const { toast } = useToast();
      const printer = this.printers.find(p => p.id === id);
      if (printer) {
        printer.role = newRole; // 'cashier', 'kitchen' yoki 'bar'
        this.syncStorage();
        toast.success(`Printer vazifasi "${newRole}"ga o'zgartirildi`);
      }
    },
    // --- 1. BLUETOOTH ULASH (8.1.3 VERSION COMPATIBLE) ---
    async scanBluetooth() {
      const { toast } = useToast();
      this.isSearching = true;

      try {
        // 1. Bluetooth interfeysini ishga tushirish
        await BleClient.initialize();

        // 2. Qurilmani qidirish va tanlash
        // acceptAllDevices: true qilinishi UUID xatolarini oldini oladi
        const device = await BleClient.requestDevice({
          optionalServices: [PRINTER_SERVICE_UUID],
          acceptAllDevices: true 
        });

        this.loading = true;

        // 3. HAQIQIY ULANISH (CONNECT)
        // 8.1.3-da connect chaqirilishi va callback berilishi shart
        await BleClient.connect(device.deviceId, (deviceId) => {
          console.warn(`Printer aloqadan uzildi: ${deviceId}`);
          this.updateStatus(deviceId, 'offline');
        });

        // 4. MTU REQUEST (Katta hajmdagi cheklarni uzilishlarsiz chiqarish uchun)
        try {
          // Ko'p printerlar 512 baytli paketlarni qo'llab-quvvatlaydi
          await BleClient.requestMtu(device.deviceId, 512);
        } catch (mtuErr) {
          console.log("MTU o'rnatish imkoni bo'lmadi, standartda davom etiladi.");
        }

        const printerData = {
          name: device.name || 'BT Printer',
          id: device.deviceId,
          type: 'bluetooth',
          role: 'cashier',
          status: 'online'
        };

        this.addPrinter(printerData);
        toast.success("Bluetooth printer muvaffaqiyatli ulandi!");

      } catch (error) {
        console.error("Bluetooth Connection Error:", error);
        if (error.name !== 'NotFoundError') {
          toast.error(`Ulanish xatosi: ${error.message || 'Noma\'lum xato'}`);
        }
      } finally {
        this.isSearching = false;
        this.loading = false;
      }
    },

    // --- 2. USB ULASH ---
    async scanUSB() {
      const { toast } = useToast();
      this.loading = true;
      try {
        if (Capacitor.isNativePlatform()) {
          const devices = await UsbSerial.getDevices();
          if (devices && devices.devices.length > 0) {
            const dev = devices.devices[0];
            const printerData = {
              name: dev.productName || 'USB Printer',
              id: dev.deviceId.toString(),
              type: 'usb',
              role: 'cashier',
              status: 'online'
            };
            this.addPrinter(printerData);
            toast.success("USB Printer qo'shildi!");
          } else {
            toast.info("Ulangan USB qurilma topilmadi");
          }
        }
      } catch (error) {
        toast.error("USB ulanishda xatolik");
      } finally {
        this.loading = false;
      }
    },

    // --- 3. IP (WIFI) PRINTER ---
    async connectToDevice(device, type = 'wifi') {
      const { toast } = useToast();
      if (!device.id) return toast.error("IP manzil xato");

      const printerData = {
        name: device.name || 'Network Printer',
        id: device.id,
        type: type,
        role: device.role || 'kitchen',
        status: 'online'
      };

      this.addPrinter(printerData);
      toast.success("Tarmoq printeri saqlandi!");
    },

    // --- YORDAMCHI LOGIKA ---

    addPrinter(printer) {
      const index = this.printers.findIndex(p => p.id === printer.id);
      if (index !== -1) {
        // Eski ma'lumotlarni saqlab, statusni yangilash
        this.printers[index] = { ...this.printers[index], ...printer };
      } else {
        this.printers.push({ ...printer, createdAt: new Date().toISOString() });
      }
      this.syncStorage();
    },

    updateStatus(id, status) {
      const printer = this.printers.find(p => p.id === id);
      if (printer) {
        printer.status = status;
        this.syncStorage();
      }
    },

    removeDevice(id) {
      this.printers = this.printers.filter(p => p.id !== id);
      this.syncStorage();
    },

    syncStorage() {
      localStorage.setItem("active_printers", JSON.stringify(this.printers));
    },

   // --- 4. PECHAT QILISH (ROUTING) ---
async handlePrint(order, targetRole = 'cashier') {
  const tStore = CheckTemplateStore();
  await tStore.GetActiveTemplate();
  const template = tStore.config || JSON.parse(localStorage.getItem("active_check_template"));

  // Rolga mos keladigan barcha printerlarni olamiz (turi farq qilmaydi)
  const targetPrinters = this.printers.filter(p => p.role === targetRole);
  
  if (targetPrinters.length === 0) {
    console.log(`${targetRole} uchun printer topilmadi.`);
    return false;
  }

  this.loading = true;
  
  // Barcha printerlarga bir vaqtning o'zida yuborish
  const printPromises = targetPrinters.map(async (printer) => {
    try {
      // printerData ichida type bor ('usb', 'bluetooth' yoki 'wifi')
      // printReceipt funksiyasi shu type'ga qarab o'zi yo'naltiradi
      const result = await printReceipt(order, template, printer);
      
      if (result) {
        this.updateStatus(printer.id, 'online');
      } else {
        this.updateStatus(printer.id, 'offline');
      }
      return result;
    } catch (e) {
      this.updateStatus(printer.id, 'offline');
      return false;
    }
  });

  const results = await Promise.all(printPromises);
  this.loading = false;
  
  // Kamida bittasi muvaffaqiyatli bo'lsa true qaytaradi
  return results.some(res => res === true);
}

    // Component ichida yoki Store'da:
// async printAll(order) {
//   const tStore = CheckTemplateStore();
//   const template = tStore.config;

//   // 1. Kassa chekini chiqarish
//   await this.handlePrint(order, 'cashier', cashierContent);

//   // 2. Oshxona chekini chiqarish
//   await this.handlePrint(order, 'kitchen', kitchenContent);
// }
  }
});