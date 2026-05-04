import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper";

// Swiper modullarini ulash
SwiperCore.use([Navigation, Pagination, Autoplay]);

// Slayder opsiyalari
export const sliderOptions = {
    slidesPerView: 1,
    spaceBetween: 10,
    autoplay: { delay: 5000, disableOnInteraction: false },
    loop: true,
    pagination: { clickable: true },
    navigation: true,
};

// Rasmlarni to‘liq ekranda ochish funksiyasi (URL yoki Base64)
export const openImageFullScreen = (src) => {
    const win = window.open();
    win.document.write(`
    <html>
      <head>
        <title>Rasm</title>
        <style>
          html, body {
            margin: 0;
            height: 100%;
            background: black;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${src}" />
      </body>
    </html>
  `);
};

// Swiper komponentlarini ham export qilamiz
export { Swiper, SwiperSlide };
