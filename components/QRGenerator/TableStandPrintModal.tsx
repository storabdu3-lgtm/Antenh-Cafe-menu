import React, { useState } from 'react';
import { TableQRRecord } from '../../types/qr';
import { Printer, X, UtensilsCrossed, Wifi, QrCode, Layers, CheckCircle2 } from 'lucide-react';

interface TableStandPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableQRRecord[];
  isBatch?: boolean;
}

export const TableStandPrintModal: React.FC<TableStandPrintModalProps> = ({
  isOpen,
  onClose,
  tables,
  isBatch = false,
}) => {
  const [standFormat, setStandFormat] = useState<'tent' | 'acrylic' | 'compact'>('tent');

  if (!isOpen || tables.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-between p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Top Floating Control Toolbar (Hidden on print) */}
      <div className="w-full max-w-5xl bg-[#1E293B] border border-[#D4AF37]/50 shadow-2xl rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-white sticky top-2 z-20 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6B1D1D] to-[#992222] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <Printer size={20} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#FDF5E6]">
              {isBatch
                ? `Print All Table Stands (${tables.length} Tables / ጠረጴዛዎች)`
                : `Print Table Stand: ${tables[0]?.tableNumber || 'Table'}`}
            </h3>
            <p className="text-xs text-[#CBD5E1]">
              High-resolution luxury restaurant table tent & acrylic holder cards
            </p>
          </div>
        </div>

        {/* Format Selectors */}
        <div className="flex items-center gap-1.5 bg-[#0F172A] p-1.5 rounded-xl border border-white/10 text-xs">
          <span className="text-[10px] text-gray-400 font-bold px-2 uppercase">ፎርማት:</span>
          <button
            type="button"
            onClick={() => setStandFormat('tent')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              standFormat === 'tent'
                ? 'bg-[#D4AF37] text-[#0F172A] shadow-xs'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            ባለ 2 ገጽ ቆሞ ካርድ (Folded Tent)
          </button>
          <button
            type="button"
            onClick={() => setStandFormat('acrylic')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              standFormat === 'acrylic'
                ? 'bg-[#D4AF37] text-[#0F172A] shadow-xs'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            አክሪሊክ ስታንድ (Acrylic 4x6")
          </button>
          <button
            type="button"
            onClick={() => setStandFormat('compact')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              standFormat === 'compact'
                ? 'bg-[#D4AF37] text-[#0F172A] shadow-xs'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            ስቲከር (Sticker / Disc)
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F6C453] hover:from-[#c9a42f] hover:to-[#ebbb46] text-[#0F172A] font-extrabold rounded-xl text-xs flex items-center gap-2 transition shadow-lg active:scale-95 cursor-pointer"
          >
            <Printer size={16} />
            <span>ፕሪንት አድርግ (Print Now)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div id="table-stand-printable-area" className="my-6 w-full max-w-4xl space-y-8 flex flex-col items-center">
        {tables.map((tableItem, idx) => (
          <div
            key={tableItem.id || `table-stand-${idx}`}
            className="table-stand-print-target bg-[#FFFDF9] text-[#1E1E1E] shadow-2xl rounded-2xl border-2 border-[#D4AF37]/50 p-6 sm:p-8 w-full max-w-[650px] relative overflow-hidden break-after-page"
            style={{
              minHeight: standFormat === 'tent' ? '700px' : standFormat === 'compact' ? '380px' : '480px',
              maxWidth: standFormat === 'compact' ? '440px' : '650px',
            }}
          >
            {/* Subtle Luxury Corner Ornaments */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none" />
            <div className="absolute inset-5 border border-[#D4AF37]/30 pointer-events-none" />

            {/* SINGLE PANEL VIEW (Used for Acrylic or Top Panel of Tent) */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10 py-2">
              {/* Royal Crest Monogram */}
              <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] p-0.5 bg-[#FFFDF9] shadow-xs flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-dashed border-[#6B1D1D] flex flex-col items-center justify-center">
                  <span className="text-[8px] font-bold text-[#6B1D1D] tracking-widest">LINA</span>
                  <span className="text-[5px] text-[#D4AF37] uppercase font-sans">EST. 2026</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-sans font-extrabold uppercase tracking-[0.25em] text-[#6B1D1D] block">
                  Artisan Roastery & Fine Dining
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E1E1E] uppercase tracking-wider">
                  CAFE LINA
                </h2>
              </div>

              {/* TABLE NUMBER HERO BADGE */}
              <div className="inline-flex items-center gap-2 bg-[#6B1D1D] text-[#FDF5E6] border-2 border-[#D4AF37] px-6 py-2 rounded-2xl shadow-md">
                <UtensilsCrossed size={16} className="text-[#D4AF37]" />
                <span className="text-base sm:text-lg font-serif font-extrabold tracking-widest uppercase">
                  {tableItem.tableNumber.toUpperCase()}
                </span>
              </div>

              {/* HIGH RESOLUTION SCANNABLE QR CODE */}
              <div className="p-3 bg-white border-2 border-[#D4AF37]/60 rounded-2xl shadow-md my-1">
                {tableItem.dataUrl ? (
                  <img
                    src={tableItem.dataUrl}
                    alt={tableItem.tableNumber}
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gray-100 flex items-center justify-center rounded-xl">
                    <QrCode size={64} className="text-[#6B1D1D]" />
                  </div>
                )}
              </div>

              {/* Scan Call-To-Action (Amharic & English) */}
              <div className="max-w-md space-y-1">
                <p className="font-serif font-bold text-xs sm:text-sm text-[#1E1E1E] leading-snug">
                  📱 በስልክዎ ካሜራ ስካን በማድረግ ሜኑ ይመልከቱና በቀጥታ ከዚህ ጠረጴዛ ይዘዙ
                </p>
                <p className="text-[10px] font-sans text-gray-500 italic">
                  Point phone camera at QR code to browse live digital menu, photos & order
                </p>
              </div>

              {/* Guest Wi-Fi Information Box (Compact or Full) */}
              <div className="w-full max-w-sm bg-[#FCF9F2] border border-[#D4AF37]/50 rounded-xl p-2.5 flex items-center justify-between text-xs font-sans shadow-xs mt-1">
                <div className="flex items-center gap-2 text-left">
                  <Wifi size={14} className="text-[#6B1D1D]" />
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-bold block">Free Guest Wi-Fi:</span>
                    <span className="font-bold text-gray-900 text-[11px]">Cafe_Lina_Guest_WiFi</span>
                  </div>
                </div>
                <div className="text-right border-l border-[#D4AF37]/30 pl-3">
                  <span className="text-[9px] text-gray-500 uppercase font-bold block">Password:</span>
                  <span className="font-mono font-bold text-[#6B1D1D] text-[11px]">ArtisanCoffee2026</span>
                </div>
              </div>

              {/* Footer Credentials */}
              <div className="pt-2 text-[9px] font-sans text-gray-500 border-t border-gray-200 w-full flex items-center justify-between">
                <span>Bole Road, Addis Ababa • VAT Inclusive</span>
                <span className="font-serif font-semibold text-[#6B1D1D]">cafelina.com</span>
              </div>
            </div>

            {/* FOLDED TENT: Mirror Side for Standing Fold (If Tent format selected) */}
            {standFormat === 'tent' && (
              <div className="mt-8 pt-8 border-t-2 border-dashed border-[#D4AF37]/60 relative z-10 flex flex-col items-center text-center space-y-3 py-2">
                <div className="w-full flex items-center justify-center gap-2 text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                  <span>✂️ Fold line (የመታጠፊያ መስመር)</span>
                </div>

                <div className="inline-flex items-center gap-2 bg-[#6B1D1D] text-[#FDF5E6] border border-[#D4AF37] px-4 py-1.5 rounded-xl shadow-xs">
                  <UtensilsCrossed size={14} className="text-[#D4AF37]" />
                  <span className="text-sm font-serif font-extrabold tracking-widest uppercase">
                    {tableItem.tableNumber.toUpperCase()}
                  </span>
                </div>

                {/* Scannable QR Code Duplicate for Other Side */}
                <div className="p-2.5 bg-white border border-[#D4AF37]/50 rounded-xl shadow-xs">
                  {tableItem.dataUrl ? (
                    <img
                      src={tableItem.dataUrl}
                      alt={tableItem.tableNumber}
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-gray-100 flex items-center justify-center rounded-lg">
                      <QrCode size={48} className="text-[#6B1D1D]" />
                    </div>
                  )}
                </div>

                <p className="text-[10px] font-serif font-bold text-gray-800">
                  Scan to Order Directly to {tableItem.tableNumber} • Cafe Lina
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Print-specific style tag */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #table-stand-printable-area, #table-stand-printable-area * {
            visibility: visible !important;
          }
          #table-stand-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .table-stand-print-target {
            position: relative !important;
            box-shadow: none !important;
            border: 2px solid #D4AF37 !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 auto 12mm auto !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
