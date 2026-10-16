'use client';

import { X, Download, Printer, Calendar } from 'lucide-react';
import { formatHostel } from '@/lib/formatHostel';

export default function QrDisplayModal({ item, isOpen, onClose, onSchedule }) {
  if (!isOpen || !item) return null;

  const handleDownload = () => {
    if (!item.qrCode) return;
    const link = document.createElement('a');
    link.href = item.qrCode;
    link.download = `ecoloop-qr-${item.trackingCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>EcoLoop QR Tag - ${item.trackingCode}</title>
          <style>
            body { font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #ffffff; color: #000000; }
            .card { border: 2px solid #000000; padding: 24px; text-align: center; max-width: 320px; }
            img { width: 200px; height: 200px; }
            h2 { margin: 8px 0 4px; font-weight: bold; letter-spacing: 2px; }
            .code { font-family: monospace; font-size: 16px; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin: 8px 0 16px; }
            p { margin: 4px 0; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>ECOLOOP TELEMETRY</h2>
            <div class="code">${item.trackingCode}</div>
            <img src="${item.qrCode}" />
            <p><strong>ITEM:</strong> ${item.type}</p>
            <p><strong>MASS:</strong> ${item.approxWeight} KG</p>
            <p><strong>STATION:</strong> ${formatHostel(item.userHostel)}</p>
            <p style="font-size: 10px; margin-top: 12px; text-transform: uppercase;">AUSTERE DIGITAL PASSPORT</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-sm w-full overflow-hidden text-center">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-5 relative bg-[#000000]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#5a5a5f] hover:text-[#ffffff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="spacex-caption">// SERIALIZED PASSPORT</div>
          <h2 className="font-['D-DIN-Bold'] text-xl text-[#ffffff] uppercase tracking-wider mt-1">
            DIGITAL HARDWARE TAG
          </h2>
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* Tracking Code Chip */}
          <div className="px-3 py-1 bg-[#000000] text-[#ffffff] font-mono text-xs font-bold mb-4 border border-[#3a3a3f] tracking-widest">
            {item.trackingCode}
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-[#ffffff] border border-[#3a3a3f] mb-6 shadow-xl">
            <img
              src={
                item.qrCode ||
                `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(
                  JSON.stringify({
                    trackingCode: item.trackingCode,
                    type: item.type,
                    approxWeight: item.approxWeight,
                    userHostel: item.userHostel,
                  })
                )}`
              }
              alt={`QR Tag ${item.trackingCode}`}
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* Details */}
          <div className="w-full bg-[#000000] p-4 border border-[#3a3a3f] text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="spacex-caption">CATEGORY:</span>
              <span className="font-mono text-[#ffffff] uppercase">{item.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">APPROX MASS:</span>
              <span className="font-mono text-[#ffffff]">{item.approxWeight} KG</span>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">STATUS:</span>
              <span className="font-mono text-[#ffffff] uppercase">{item.status?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">LOCATION:</span>
              <span className="font-mono text-[#ffffff] uppercase">{formatHostel(item.userHostel)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            {item.status === 'registered' && onSchedule && (
              <button
                onClick={() => {
                  onSchedule(item);
                  onClose();
                }}
                className="w-full btn-spacex"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>SCHEDULE DISPATCH NOW</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                className="btn-spacex btn-spacex-muted py-2 px-3 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SAVE PNG</span>
              </button>
              <button
                onClick={handlePrint}
                className="btn-spacex btn-spacex-muted py-2 px-3 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PRINT TAG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
