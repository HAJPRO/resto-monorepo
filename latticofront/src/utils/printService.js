export const printProductQR = (product) => {
  if (!product?.qr || !product?.name) return;

  const safeName = product.name;
  const safeCode = product.code || 'ID-000000';
  const formattedPrice = new Intl.NumberFormat('uz-UZ').format(product.salePrice || product.costPrice || 0 );

  const windowTarget = `Print_${product._id}`;
  const printWindow = window.open('', windowTarget, 'width=400,height=550');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="uz">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=JetBrains+Mono:wght@700&display=swap');
          
          @page { size: auto; margin: 0mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; }

          body { 
            margin: 0; padding: 10px;
            background-color: #f1f5f9;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex; flex-direction: column; align-items: center;
          }

          /* Buttons */
          .no-print { display: flex; gap: 8px; margin-bottom: 12px; }
          .btn { 
            padding: 8px 16px; border-radius: 8px; border: none; 
            font-size: 11px; font-weight: 800; cursor: pointer;
          }
          .btn-indigo { background: #4f46e5; color: white; }

          /* Card Design */
          .label-card {
            width: 56mm;
            background: #ffffff;
            padding: 5mm 3mm;
            text-align: center;
            position: relative;
          }

          /* Compact QR */
          .qr-box {
            margin-bottom: 2mm;
            display: inline-block;
            padding: 1mm;
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 4mm;
          }
          .qr-box img {
            width: 30mm; height: 30mm;
            display: block;
            image-rendering: -webkit-optimize-contrast;
          }

          .product-title {
            font-size: 11pt; font-weight: 800; color: #0f172a;
            margin: 0 0 3mm 0; line-height: 1.1;
            text-transform: uppercase;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          }

          /* Price Section */
          .price-wrap {
            background: #1e1b4b; color: #ffffff;
            padding: 2.5mm 1mm; border-radius: 3mm; margin-bottom: 3mm;
          }
          .price-val { font-size: 16pt; font-weight: 800; display: flex; align-items: baseline; justify-content: center; gap: 1mm; }
          .price-currency { font-size: 8pt; opacity: 0.8; }

          /* Professional Code/Artikul Block */
          .id-block {
            display: flex; flex-direction: column; align-items: center;
            border-top: 0.5mm dashed #e2e8f0; padding-top: 3mm;
          }
          .id-header {
            font-size: 7pt; font-weight: 800; color: #94a3b8;
            text-transform: uppercase; letter-spacing: 1.5px;
            margin-bottom: 2px;
          }
          .id-value {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10pt; color: #1e1b4b;
            background: #f8fafc;
            padding: 2px 8px;
            border-radius: 4px;
            border: 0.3mm solid #e2e8f0;
          }

          @media print {
            .no-print { display: none !important; }
            body { background: white; padding: 0; }
            .label-card { width: 100%; border: none; padding: 4mm 2mm; }
            .price-wrap { background: #000 !important; color: white !important; }
            .id-value { border: none !important; background: transparent !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="btn btn-indigo" onclick="window.print()">PRINT</button>
          <button class="btn" onclick="window.close()" style="background:white; color:#64748b; border:1px solid #e2e8f0">CLOSE</button>
        </div>

        <div class="label-card">
          <div class="qr-box">
            <img src="${product.qr}" id="qrImg" />
          </div>

          <h1 class="product-title">${safeName}</h1>

          <div class="price-wrap">
            <div class="price-val">
              ${formattedPrice}
              <span class="price-currency">UZS</span>
            </div>
          </div>

          <div class="id-block">
            <span class="id-value">Kod:${safeCode}</span>
          </div>
        </div>

        <script>
          const img = document.getElementById('qrImg');
          const init = () => { setTimeout(() => { window.print(); }, 300); };
          if (img.complete) init(); else img.onload = init;
        <\/script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};