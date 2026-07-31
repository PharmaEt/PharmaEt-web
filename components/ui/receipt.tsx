"use client";

import { Printer } from "lucide-react";

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface ReceiptData {
  saleId: string;
  date: string;
  time: string;
  cashier: string;
  paymentMethod: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  branch?: string;
}

interface ReceiptProps {
  data: ReceiptData;
  onPrint?: () => void;
}

function QRCodePlaceholder({ value }: { value: string }) {
  const size = 120;
  const modules = 21;
  const cellSize = size / modules;

  const cells: boolean[][] = [];
  for (let r = 0; r < modules; r++) {
    cells[r] = [];
    for (let c = 0; c < modules; c++) {
      const inFinder = (r < 7 && c < 7) || (r < 7 && c >= modules - 7) || (r >= modules - 7 && c < 7);
      const inBorder = inFinder && (r === 0 || r === 6 || c === 0 || c === 6 || c === modules - 7 || c === modules - 1 || r === modules - 7 || r === modules - 1);
      const inInner = inFinder && r >= 2 && r <= 4 && c >= 2 && c <= 4;
      const inInner2 = inFinder && r >= modules - 5 && r <= modules - 3 && c >= 2 && c <= 4;
      const inInner3 = inFinder && r >= 2 && r <= 4 && c >= modules - 5 && c <= modules - 3;
      if (inBorder || inInner || inInner2 || inInner3) {
        cells[r][c] = true;
      } else {
        const hash = (r * 31 + c * 17 + value.length) % 5;
        cells[r][c] = hash < 2;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <rect width={size} height={size} fill="white" />
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function Receipt({ data, onPrint }: ReceiptProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    const printWindow = window.open("", "_blank", "width=400,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${data.saleId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; width: 300px; padding: 16px; font-size: 12px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .small { font-size: 10px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .divider-thick { border-top: 2px solid #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .items-header { display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 4px; font-weight: bold; }
          .item-row { display: flex; justify-content: space-between; margin: 3px 0; }
          .item-detail { font-size: 10px; color: #555; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 6px; border-top: 2px solid #000; padding-top: 6px; }
          .footer { margin-top: 12px; text-align: center; font-size: 10px; color: #555; }
          .qr { margin: 12px auto; text-align: center; }
          @media print { body { padding: 0; width: 80mm; } }
        </style>
      </head>
      <body>
        <div class="center bold large"> PharmET </div>
        <div class="center small">Licensed Pharmacy</div>
        <div class="center small">${data.branch || "Bole Branch"}</div>
        <div class="center small">Addis Ababa, Ethiopia</div>
        <div class="center small">TIN: 0012345678</div>
        <div class="center small">Tel: +251 91 122 3344</div>

        <div class="divider-thick"></div>

        <div class="center bold">SALE RECEIPT</div>

        <div class="divider"></div>

        <div class="row"><span>BILL #:</span><span class="bold">${data.saleId}</span></div>
        <div class="row"><span>DATE:</span><span>${data.date} ${data.time}</span></div>
        <div class="row"><span>CASHIER:</span><span>${data.cashier}</span></div>
        <div class="row"><span>PAYMENT:</span><span>${data.paymentMethod}</span></div>

        <div class="divider"></div>

        <div class="items-header">
          <span>ITEM</span>
          <span>QTY</span>
          <span>PRICE</span>
        </div>

        ${data.items.map((item) => `
          <div class="item-row">
            <span style="flex:1">${item.name}</span>
            <span style="width:30px;text-align:right">${item.qty}</span>
            <span style="width:60px;text-align:right">${item.total.toFixed(2)}</span>
          </div>
        `).join("")}

        <div class="divider"></div>

        <div class="row"><span>Subtotal:</span><span>${data.subtotal.toFixed(2)} ETB</span></div>
        ${data.discount > 0 ? `<div class="row"><span>Discount:</span><span>-${data.discount.toFixed(2)} ETB</span></div>` : ""}
        <div class="row"><span>VAT (15%):</span><span>${data.tax.toFixed(2)} ETB</span></div>

        <div class="total-row">
          <span>TOTAL</span>
          <span>${data.total.toFixed(2)} ETB</span>
        </div>

        <div class="row" style="margin-top:4px"><span>PAID BY:</span><span class="bold">${data.paymentMethod.toUpperCase()}</span></div>

        <div class="divider-thick"></div>

        <div class="qr">
          ${generateQRCodeSVG(`${data.saleId}|${data.date}|${data.total}`)}
        </div>

        <div class="footer">
          Thank you for your purchase!<br/>
          እናመሰግናለን! / Thank you!
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="receipt-container">
      <div className="mx-auto max-w-[320px] rounded-lg border border-neutral-200 bg-white p-5 font-mono text-xs dark:border-neutral-800 dark:bg-[#0A0A0A]">
        {/* Header */}
        <div className="text-center">
          <p className="text-lg font-bold tracking-wide">PharmET</p>
          <p className="text-[10px] text-neutral-500">Licensed Pharmacy</p>
          <p className="text-[10px] text-neutral-500">{data.branch || "Bole Branch"}</p>
          <p className="text-[10px] text-neutral-500">Addis Ababa, Ethiopia</p>
          <p className="text-[10px] text-neutral-500">TIN: 0012345678</p>
          <p className="text-[10px] text-neutral-500">Tel: +251 91 122 3344</p>
        </div>

        <div className="my-3 border-t-2 border-black" />

        <p className="text-center text-sm font-bold">SALE RECEIPT</p>

        <div className="my-2 border-t border-dashed border-neutral-400" />

        {/* Bill Info */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-500">BILL #:</span>
            <span className="font-bold">{data.saleId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">DATE:</span>
            <span>{data.date} {data.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">CASHIER:</span>
            <span>{data.cashier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">PAYMENT:</span>
            <span>{data.paymentMethod}</span>
          </div>
        </div>

        <div className="my-2 border-t border-dashed border-neutral-400" />

        {/* Items Header */}
        <div className="flex justify-between border-b border-black pb-1 text-[10px] font-bold">
          <span className="flex-1">ITEM</span>
          <span className="w-8 text-right">QTY</span>
          <span className="w-16 text-right">PRICE</span>
        </div>

        {/* Items */}
        {data.items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between py-1">
              <span className="flex-1 truncate">{item.name}</span>
              <span className="w-8 text-right">{item.qty}</span>
              <span className="w-16 text-right">{item.total.toFixed(2)}</span>
            </div>
          </div>
        ))}

        <div className="my-2 border-t border-dashed border-neutral-400" />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal:</span>
            <span>{data.subtotal.toFixed(2)} ETB</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-500">Discount:</span>
              <span className="text-red-600">-{data.discount.toFixed(2)} ETB</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-neutral-500">VAT (15%):</span>
            <span>{data.tax.toFixed(2)} ETB</span>
          </div>
          <div className="flex justify-between border-t-2 border-black pt-2 text-sm font-bold">
            <span>TOTAL</span>
            <span>{data.total.toFixed(2)} ETB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">PAID BY:</span>
            <span className="font-bold">{data.paymentMethod.toUpperCase()}</span>
          </div>
        </div>

        <div className="my-3 border-t-2 border-black" />

        {/* QR Code */}
        <div className="my-3 text-center">
          <QRCodePlaceholder value={`${data.saleId}|${data.date}|${data.total}`} />
          <p className="mt-1 text-[9px] text-neutral-400">SCAN FOR RECEIPT</p>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-neutral-500">
          <p>Thank you for your purchase!</p>
          <p>እናመሰግናለን!</p>
        </div>
      </div>

      {/* Print Button */}
      {onPrint && (
        <button
          onClick={handlePrint}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </button>
      )}
    </div>
  );
}

function generateQRCodeSVG(value: string): string {
  const size = 100;
  const modules = 15;
  const cellSize = size / modules;

  const cells: boolean[][] = [];
  for (let r = 0; r < modules; r++) {
    cells[r] = [];
    for (let c = 0; c < modules; c++) {
      const inFinder = (r < 5 && c < 5) || (r < 5 && c >= modules - 5) || (r >= modules - 5 && c < 5);
      const inBorder = inFinder && (r === 0 || r === 4 || c === 0 || c === 4 || c === modules - 5 || c === modules - 1 || r === modules - 5 || r === modules - 1);
      const inInner = inFinder && r >= 1 && r <= 3 && c >= 1 && c <= 3;
      const inInner2 = inFinder && r >= modules - 4 && r <= modules - 2 && c >= 1 && c <= 3;
      const inInner3 = inFinder && r >= 1 && r <= 3 && c >= modules - 4 && c <= modules - 2;
      if (inBorder || inInner || inInner2 || inInner3) {
        cells[r][c] = true;
      } else {
        const hash = (r * 31 + c * 17 + value.length) % 5;
        cells[r][c] = hash < 2;
      }
    }
  }

  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (cells[r][c]) {
        svg += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }
  svg += `</svg>`;
  return svg;
}
