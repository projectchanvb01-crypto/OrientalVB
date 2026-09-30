import React, { useState } from 'react';
import {
  X,
  Gift,
  Sparkles,
  Search,
  CheckCircle,
  Calendar,
  Printer,
  ShieldCheck,
  Ticket,
  Scissors,
  Eye,
  Info,
  ExternalLink,
  Award,
} from 'lucide-react';
import { MemberOneIdentity } from '@oriental/types';

interface DoorprizeDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberOneIdentity;
}

export const DoorprizeDrawerModal: React.FC<DoorprizeDrawerModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMasterFlyer, setShowMasterFlyer] = useState(false);
  const [selectedSingleCoupon, setSelectedSingleCoupon] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter coupons
  const coupons = (member.doorprizeCoupons || []).filter((code) =>
    code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-widest text-amber-100 font-bold">
                  Program Undian Akbar 2026 - 2027
                </span>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold border border-white/30">
                  Periode 01 Sept 2026 - 30 Sept 2027
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Kupon Undian Doorprize: {member.fullName}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMasterFlyer(!showMasterFlyer)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-white/30"
              title="Lihat master desain fisik kupon undian"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desain Master</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Master Flyer Preview (Toggleable) */}
        {showMasterFlyer && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 animate-fadeIn space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Master Desain Kupon Resmi (Desain Doorprize 2026-2027.png)</span>
              </div>
              <span className="text-[11px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                Format: ORT-KUPYYMM-urutan (Maks. 2500 Kupon/Bln)
              </span>
            </div>
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md max-h-48 flex items-center justify-center bg-black/5">
              <img
                src="/doorprize-design.png"
                alt="Desain Doorprize Oriental 2026-2027"
                className="w-full object-contain max-h-48"
              />
            </div>
          </div>
        )}

        {/* Member & Standard Rule Summary Bar */}
        <div className="p-4 sm:p-5 bg-amber-50/50 border-b border-amber-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[11px]">Barcode Member:</span>
              <span className="font-bold text-slate-800 text-sm">{member.barcode}</span>
            </div>
            <div className="h-7 w-px bg-amber-200 hidden sm:block" />
            <div>
              <span className="text-slate-500 block text-[11px]">ID Pelanggan:</span>
              <span className="font-bold text-slate-800 text-sm">{member.memberCode}</span>
            </div>
            <div className="h-7 w-px bg-amber-200 hidden sm:block" />
            <div>
              <span className="text-slate-500 block text-[11px]">Total Kupon Aktif:</span>
              <span className="font-bold text-amber-800 text-sm">
                {member.doorprizeCoupons?.length || 0} Lembar
              </span>
            </div>
            <div className="h-7 w-px bg-amber-200 hidden sm:block" />
            <div>
              <span className="text-slate-500 block text-[11px]">Standar Penomoran:</span>
              <span className="font-bold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ORT-KUPYYMM-urutan(4 DIGIT)
              </span>
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor kupon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs font-mono"
            />
          </div>
        </div>

        {/* Coupons List - Rendered identical to Desain Doorprize 2026-2027.png */}
        <div id="printable-coupons-area" className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 max-h-[500px]">
          {coupons.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Ticket className="w-12 h-12 mx-auto text-amber-300" />
              <p className="text-sm font-medium text-slate-600">
                {searchQuery
                  ? `Tidak ada kupon yang cocok dengan "${searchQuery}"`
                  : 'Member ini belum memiliki kupon undian aktif.'}
              </p>
              <p className="text-xs text-slate-400">
                Setiap transaksi kelipatan Rp 150.000 otomatis menerbitkan kupon format ORT-KUPYYMM-urutan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((couponCode, idx) => (
                <div
                  key={couponCode}
                  className="rounded-2xl border-2 border-amber-300 overflow-hidden shadow-sm hover:shadow-md transition bg-white"
                >
                  {/* Physical 2-ply coupon ticket layout replica */}
                  <div className="grid grid-cols-1 md:grid-cols-12 min-h-[140px]">
                    {/* LEFT SECTION (Sobekan Toko / Arsip Kasir - ~35%) */}
                    <div className="md:col-span-4 p-3.5 bg-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-amber-400 relative">
                      <div className="space-y-2">
                        {/* Logo header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                              O
                            </div>
                            <span className="text-xs font-black tracking-tight text-slate-900">
                              oriental <span className="font-normal text-[9px] text-slate-500">Retail | F&B</span>
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                            Sobekan Toko
                          </span>
                        </div>

                        {/* Yellow coupon number box */}
                        <div className="bg-amber-100/90 border border-amber-300 rounded-lg p-1.5 text-center">
                          <span className="text-[9px] uppercase font-bold text-amber-900 tracking-wider block">
                            NOMOR KUPON
                          </span>
                          <span className="text-xs sm:text-sm font-black font-mono text-slate-900 tracking-wider">
                            {couponCode}
                          </span>
                        </div>

                        {/* Fields */}
                        <div className="space-y-1 text-[10px] font-mono">
                          <div>
                            <span className="text-slate-400 block text-[9px]">NOMOR MEMBER (BARCODE):</span>
                            <span className="font-bold text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 block truncate">
                              {member.barcode} ({member.memberCode})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">NAMA TERDAFTAR (KTP):</span>
                            <span className="font-semibold text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 block truncate">
                              {member.fullName}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">NOMOR HANDPHONE:</span>
                            <span className="font-semibold text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 block truncate">
                              {member.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>NOTA: INV-RET-RESMI</span>
                        <span className="text-amber-700 font-bold">ARSP PERUSAHAAN</span>
                      </div>

                      {/* Notches for perforation */}
                      <div className="hidden md:block absolute -right-2 top-0 w-4 h-4 rounded-full bg-slate-100 border border-amber-300" />
                      <div className="hidden md:block absolute -right-2 bottom-0 w-4 h-4 rounded-full bg-slate-100 border border-amber-300" />
                    </div>

                    {/* RIGHT SECTION (Lembar Pelanggan / Kotak Undian - ~65%) */}
                    <div className="md:col-span-8 p-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-900 flex flex-col justify-between relative overflow-hidden">
                      {/* Top Header */}
                      <div className="relative z-10 flex items-start justify-between gap-2 border-b border-amber-500/30 pb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-amber-900 text-amber-100 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                              PERIODE: 01 SEPT 2026 - 30 SEPT 2027
                            </span>
                            <span className="bg-white/80 text-amber-900 text-[9px] px-2 py-0.5 rounded-full font-bold font-mono">
                              KUPON #{idx + 1}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight mt-1">
                            Kupon Undian Member Swalayan Oriental
                          </h4>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                            Hadiah Akbar
                          </span>
                          <span className="text-[9px] text-amber-900 font-semibold">
                            Elektronik & Perabotan
                          </span>
                        </div>
                      </div>

                      {/* Customer Fields Grid */}
                      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-[10px] font-mono">
                        <div className="bg-white/90 backdrop-blur-xs p-1.5 rounded-lg border border-amber-400/60">
                          <span className="text-[9px] text-slate-500 block">NOMOR MEMBER (BARCODE):</span>
                          <span className="font-extrabold text-slate-900 block truncate">
                            {member.barcode} ({member.memberCode})
                          </span>
                        </div>
                        <div className="bg-white/90 backdrop-blur-xs p-1.5 rounded-lg border border-amber-400/60">
                          <span className="text-[9px] text-slate-500 block">NAMA TERDAFTAR (KTP):</span>
                          <span className="font-extrabold text-slate-900 block truncate">
                            {member.fullName}
                          </span>
                        </div>
                        <div className="bg-white/90 backdrop-blur-xs p-1.5 rounded-lg border border-amber-400/60">
                          <span className="text-[9px] text-slate-500 block">ALAMAT:</span>
                          <span className="font-semibold text-slate-900 block truncate">
                            {member.address || 'Watampone / Makassar'}
                          </span>
                        </div>
                        <div className="bg-white/90 backdrop-blur-xs p-1.5 rounded-lg border border-amber-400/60">
                          <span className="text-[9px] text-slate-500 block">NOMOR HP (WHATSAPP):</span>
                          <span className="font-extrabold text-slate-900 block truncate">
                            {member.phone}
                          </span>
                        </div>
                      </div>

                      {/* Prominent Gold Box: NOMOR KUPON */}
                      <div className="relative z-10 bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 p-2 rounded-xl border border-amber-300 text-white flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-200 shrink-0" />
                          <div>
                            <span className="text-[9px] uppercase font-bold text-amber-200 tracking-wider block">
                              NOMOR KUPON RESMI
                            </span>
                            <span className="text-sm sm:text-base font-black font-mono tracking-widest text-white">
                              {couponCode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-amber-900 font-mono">
                            SAH & TERDAFTAR
                          </span>
                        </div>
                      </div>

                      {/* Ambient background decoration */}
                      <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 bg-white/20 rounded-full blur-xl pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
            <Info className="w-4 h-4 text-amber-600" />
            <span>
              Format Kupon Resmi: <strong>ORT-KUPYYMM-urutan(4 DIGIT)</strong>. Kuota maks. 2500 kupon/bulan.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Kupon Fisik
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
