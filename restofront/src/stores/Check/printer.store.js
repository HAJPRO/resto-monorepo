import { defineStore } from "pinia";
import { Capacitor } from "@capacitor/core";
import { BleClient } from '@capacitor-community/bluetooth-le';
import { UsbSerial } from 'capacitor-usb-serial';
import { useToast } from "../../UI/utils/useToast";
import { printReceipt, PRINTER_SERVICE_UUID } from "../../utils/index.util"; // UUID ni ham import qilamiz
import { CheckTemplateStore } from "../../stores/index.store"; // Shablonni olish uchun

export const PrinterStore = defineStore("PrinterStore", {
  state: () => ({
    connectedPrinter: JSON.parse(localStorage.getItem("selected_printer")) || null,
    isSearching: false,
    loading: false
  }),

  actions: {
    // 1. BLUETOOTH SCAN
    async scanBluetooth() {
      const { toast } = useToast();
      this.isSearching = true;
      
      try {
        await BleClient.initialize();
        
        // MUHIM O'ZGARIISH: optionalServices ruxsat olish uchun shart!
        const device = await BleClient.requestDevice({
          optionalServices: [PRINTER_SERVICE_UUID] 
        });

        await BleClient.connect(device.deviceId, (deviceId) => {
          this.disconnect();
          toast.info("Printer bilan aloqa uzildi");
        });

        const printerData = { 
          name: device.name || 'BT Printer', 
          id: device.deviceId,
          type: 'bluetooth'
        };

        this.saveConnection(printerData);
        toast.success("Bluetooth printer ulandi!");
      } catch (error) {
        console.error("BT Error:", error);
        if (error.name !== 'NotFoundError') {
          toast.error("Bluetooth ulanishda xato: " + error.message);
        }
      } finally {
        this.isSearching = false;
      }
    },

    // 2. USB SCAN
    async scanUSB() {
      const { toast } = useToast();
      const isNative = Capacitor.isNativePlatform();

      try {
        if (isNative) {
          const devices = await UsbSerial.getDevices();
          if (devices.devices.length > 0) {
            const dev = devices.devices[0];
            
            await UsbSerial.openDevice({
              deviceId: dev.deviceId,
              portNum: 0,
              baudRate: 9600
            });

            this.saveConnection({ 
              name: dev.productName || 'USB Printer', 
              id: dev.deviceId.toString(),
              type: 'usb' 
            });
            toast.success("USB Printer ulandi!");
          } else {
            toast.error("USB qurilma topilmadi");
          }
        } else {
          const device = await navigator.usb.requestDevice({ filters: [] });
          this.saveConnection({ 
            name: device.productName || 'USB Printer', 
            id: device.serialNumber || 'USB-DEV',
            type: 'usb'
          });
          toast.success("USB Printer (Web) ulandi!");
        }
      } catch (error) {
        toast.error("USB ulanishda xatolik");
      }
    },

    // 3. COMMON ACTIONS
    saveConnection(printer) {
      const data = { 
        ...printer, 
        status: 'online',
        date: new Date().toLocaleString('uz-UZ') 
      };
      this.connectedPrinter = data;
      localStorage.setItem("selected_printer", JSON.stringify(data));
    },

    disconnect() {
      const { toast } = useToast();
      this.connectedPrinter = null;
      localStorage.removeItem("selected_printer");
      toast.info("Printer o'chirildi");
    },

    // PECHAT QILISH ACTIONI
    async handlePrint(order) {
      const tStore = CheckTemplateStore();
      tStore.GetActiveTemplate(); // Faol shablonni yangilash uchun chaqiramiz
    // Faol shablonni olish
      const template = JSON.parse(localStorage.getItem("active_check_template"));
      
      // Diqqat: printReceipt funksiyasiga (order, activeTemplate) berilishi kerak
      const success = await printReceipt(order, template);
      
      if (success) {
        console.log("Pechatga muvaffaqiyatli yuborildi!");
      }
    }
  }
});