import React, { useState } from 'react';
import { TableQRRecord } from '../../types/qr';
import {
  Printer,
  Share2,
  Download,
  Trash2,
  Plus,
  QrCode,
  ExternalLink,
  Layers,
  UtensilsCrossed,
  Search,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface TableQRRegistryProps {
  tables: TableQRRecord[];
  onPrintTable: (table: TableQRRecord) => void;
  onPrintAll: () => void;
  onShareTable: (table: TableQRRecord) => void;
  onDeleteTable: (id: string) => void;
  onRegisterNewTable: (tableNumber: string) => void;
  onSelectTableForEditor: (table: TableQRRecord) => void;
}

export const TableQRRegistry: React.FC<TableQRRegistryProps> = ({
  tables,
  onPrintTable,
  onPrintAll,
  onShareTable,
  onDeleteTable,
  onRegisterNewTable,
  onSelectTableForEditor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTableInput, setNewTableInput] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredTables = tables.filter((t) =>
    t.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableInput.trim()) return;
    onRegisterNewTable(newTableInput.trim());
    setNewTableInput('');
    setIsAddOpen(false);
  };

  const handleDownloadSingle = (table: TableQRRecord) => {
    if (!table.dataUrl) return;
    const link = document.createElement('a');
    link.href = table.dataUrl;
    link.download = `CafeLina_${table.tableNumber.replace(/\s+/g, '_')}_QR.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#6B1D1D] text-[#D4AF37] border border-[#D4AF37]/50 flex items-center justify-center font-bold shadow-md shrink-0">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0F172A]">
                የጠረጴዛ QR ኮዶች መዝገብ (Table QR Registry & Stand Manager)
              </h3>
              <span className="bg-[#D4AF37]/20 text-[#6B1D1D] border border-[#D4AF37]/40 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {tables.length} Tables
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage, print, and share official table QR tent stands for table-side customer ordering
            </p>
          </div>
        </div>

        {/* Global Registry Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Plus size={15} className="text-[#6B1D1D]" />
            <span>አዲስ ጠረጴዛ መዝግብ (Add Table)</span>
          </button>

          <button
            type="button"
            onClick={onPrintAll}
            className="px-5 py-2.5 bg-gradient-to-r from-[#6B1D1D] to-[#8B2626] hover:from-[#5A1616] hover:to-[#7A1F1F] text-[#FDF5E6] text-xs font-extrabold rounded-xl flex items-center gap-2 transition shadow-md active:scale-95 cursor-pointer"
          >
            <Printer size={16} className="text-[#D4AF37]" />
            <span>ሁሉንም በአንድ ጊዜ ፕሪንት አድርግ (Print All Stands)</span>
          </button>
        </div>
      </div>

      {/* Add New Table Quick Form Modal */}
      {isAddOpen && (
        <form onSubmit={handleAddNewSubmit} className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-wrap items-center gap-3 animate-fadeIn">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-amber-950 mb-1">
              Table Number or Label (የጠረጴዛ ቁጥር) *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={newTableInput}
              onChange={(e) => setNewTableInput(e.target.value)}
              placeholder="e.g. Table 7, VIP Lounge 1, Terrace 3"
              className="w-full h-10 bg-white border border-amber-300 rounded-xl px-3.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#6B1D1D]"
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <button
              type="submit"
              className="px-4 py-2 bg-[#6B1D1D] hover:bg-[#852323] text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              መዝግብ (Register)
            </button>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              ሰርዝ (Cancel)
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search registered table (e.g. Table 2)..."
            className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-[#6B1D1D] focus:bg-white transition"
          />
        </div>

        <span className="text-xs font-bold text-gray-500">
          Showing {filteredTables.length} of {tables.length} tables
        </span>
      </div>

      {/* Registered Tables Grid */}
      {filteredTables.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
          <QrCode size={36} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold text-gray-600">ምንም የተመዘገበ ጠረጴዛ አልተገኘም (No Tables Found)</p>
          <p className="text-xs text-gray-400">
            Click "Add Table" or generate a QR code with a Table Number above to register your tables.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-3 group"
            >
              {/* Card Header */}
              <div className="flex items-start gap-3">
                {/* QR Thumbnail */}
                <div
                  onClick={() => onSelectTableForEditor(table)}
                  className="w-16 h-16 bg-[#FFFDF9] border border-[#D4AF37]/40 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-xs cursor-pointer group-hover:scale-105 transition-transform"
                  title="Click to load into editor"
                >
                  {table.dataUrl ? (
                    <img
                      src={table.dataUrl}
                      alt={table.tableNumber}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode size={28} className="text-[#6B1D1D]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-serif font-bold text-sm text-[#0F172A] truncate">
                      {table.tableNumber}
                    </h4>
                    <span className="text-[10px] font-sans font-bold text-[#6B1D1D] bg-[#6B1D1D]/10 px-2 py-0.5 rounded-full border border-[#6B1D1D]/20 shrink-0">
                      Active
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-gray-500 truncate mt-0.5">
                    {table.payload}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                    <span>{table.createdAt}</span>
                    <span>•</span>
                    <span className="text-[#6B1D1D] font-bold">
                      {table.printCount ? `Printed ${table.printCount}x` : 'Not printed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-gray-100 text-xs">
                {/* 1. Print Stand */}
                <button
                  type="button"
                  onClick={() => onPrintTable(table)}
                  className="py-1.5 px-2 bg-gradient-to-r from-[#D4AF37] to-[#F6C453] hover:from-[#c9a42f] hover:to-[#ebbb46] text-[#0F172A] font-extrabold rounded-lg flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                  title="Print Table Tent Card"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>

                {/* 2. Share */}
                <button
                  type="button"
                  onClick={() => onShareTable(table)}
                  className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                  title="Share table link"
                >
                  <Share2 size={13} className="text-[#6B1D1D]" />
                  <span>Share</span>
                </button>

                {/* 3. Download */}
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(table)}
                  disabled={!table.dataUrl}
                  className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Download PNG"
                >
                  <Download size={13} />
                  <span>PNG</span>
                </button>

                {/* 4. Delete */}
                <button
                  type="button"
                  onClick={() => onDeleteTable(table.id)}
                  className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
                  title="Remove from registry"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
