import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Package, 
  Recycle, 
  Search, 
  Wifi, 
  WifiOff, 
  DollarSign, 
  Clock, 
  UserCheck, 
  LogOut, 
  ShieldCheck, 
  AlertTriangle,
  Receipt,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Radio,
  FileText
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

export type PosLaneId = 'RETAIL' | 'GROSIR' | 'WASTE' | 'PRICE_CHECKER';

interface PosLayoutProps {
  activeLane: PosLaneId;
  setActiveLane: (lane: PosLaneId) => void;
  children: React.ReactNode;
}

export const PosLayout: React.FC<PosLayoutProps> = ({
  activeLane,
  setActiveLane,
  children,
}) => {
  const { 
    currentUser,
    isOfflineSimulated,
    setIsOfflineSimulated,
    isNetworkOnline,
    isEffectiveOnline,
    pendingOfflineCount,
    pendingOfflineTransactions,
    triggerSyncOfflineBatch,
    recentSyncLogs,
    refreshPendingSync
  } = useEcosystem();

  const [showClosingModal, setShowClosingModal] = useState(false);
  const [showSyncCenterModal, setShowSyncCenterModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [closingPhysicalCash, setClosingPhysicalCash] = useState<number>(1450000);
  const [closingNotes, setClosingNotes] = useState('');
  const [closingSubmitted, setClosingSubmitted] = useState(false);
  const [shiftClosed, setShiftClosed] = useState(false);

  // Keyboard shortcut listener for fast lane switching (F1-F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveLane('RETAIL');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveLane('GROSIR');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveLane('WASTE');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveLane('PRICE_CHECKER');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveLane]);

  const lanes = [
    {
      id: 'RETAIL' as PosLaneId,
      label: 'Kasir 1&2 Retail',
      sub: 'B2C • Thermal 58/80mm',
      shortcut: 'F1',
      icon: Store,
    },
    {
      id: 'GROSIR' as PosLaneId,
      label: 'Kasir 3 Grosir & B2B',
      sub: 'TOP • Dot-Matrix 3-Ply',
      shortcut: 'F2',
      icon: Package,
    },
    {
      id: 'WASTE' as PosLaneId,
      label: 'Kasir Limbah & Minyak',
      sub: 'Timbangan • Auto-Credit',
      shortcut: 'F3',
      icon: Recycle,
    },
    {
      id: 'PRICE_CHECKER' as PosLaneId,
      label: 'Station Cek Harga',
      sub: 'Kiosk Mandiri Barcode',
      shortcut: 'F4',
      icon: Search,
    },
  ];

  // Drawer threshold check: Alert if cash > Rp 3.000.000
  const drawerCash = 1450000;
  const isDropRequired = drawerCash >= 3000000;

  const handleExecuteBlindClosing = () => {
    setShiftClosed(true);
    setClosingSubmitted(true);
    setTimeout(() => {
      setShowClosingModal(false);
      setClosingSubmitted(false);
    }, 2500);
  };

  const handleExecuteManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const res = await triggerSyncOfflineBatch();
    setIsSyncing(false);
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top POS Header: Terminal & Lane Control */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between shadow-md shrink-0">
        {/* Terminal Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white font-mono">ORIENTAL POS</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                TERMINAL v2.1
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                Port 3001
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Shift #{shiftClosed ? 'CLOSED' : '0042'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{currentUser?.name || 'Kasir 1 - Siti Rahma'}</span>
            </div>
          </div>
        </div>

        {/* Multi-Lane Quick Switcher Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {lanes.map((lane) => {
            const Icon = lane.icon;
            const isActive = activeLane === lane.id;
            return (
              <button
                key={lane.id}
                onClick={() => setActiveLane(lane.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="font-semibold leading-none">{lane.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">{lane.sub}</div>
                </div>
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700 ml-1">
                  {lane.shortcut}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Operational Status Indicators & Shift Control */}
        <div className="flex items-center gap-3">
          {/* Cash Drawer Status */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Uang Kas di Laci</div>
              <div className="text-xs font-bold font-mono text-emerald-400">
                Rp {drawerCash.toLocaleString('id-ID')}
              </div>
            </div>
            {isDropRequired && (
              <span className="flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Setor Brankas!
              </span>
            )}
          </div>

          {/* Interactive PWA Dexie Offline & Sync Indicator Button */}
          <button
            onClick={() => {
              refreshPendingSync();
              setShowSyncCenterModal(true);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition cursor-pointer ${
              !isEffectiveOnline
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
                : pendingOfflineCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Buka Pusat Sinkronisasi PWA Offline Dexie.js"
          >
            {!isEffectiveOnline ? (
              <WifiOff className="w-4 h-4 text-rose-400" />
            ) : pendingOfflineCount > 0 ? (
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-400" />
            )}
            <div className="text-left leading-tight">
              <div className="font-bold">
                {!isEffectiveOnline ? 'OFFLINE (DEXIE)' : 'ONLINE'}
              </div>
              <div className="text-[9px] text-slate-400">
                {pendingOfflineCount > 0 ? `${pendingOfflineCount} Pending Sync` : 'Synced'}
              </div>
            </div>
          </button>

          {/* Blind Closing / End Shift Button */}
          <button
            onClick={() => setShowClosingModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Blind Closing</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 overflow-hidden bg-slate-950">
        {children}
      </main>

      {/* PUSAT SINKRONISASI PWA OFFLINE DEXIE.JS MODAL (Sprint 7 Deliverable) */}
      {showSyncCenterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 text-slate-100 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Pusat Sinkronisasi Offline & Dexie.js</h3>
                  <p className="text-[11px] text-slate-400 font-mono">PWA Service Worker • Sprint 7 Hardening</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncCenterModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {/* Notification Toast */}
            {syncFeedback && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Network & Simulation Control Panel */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Status Hardware Network</div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isNetworkOnline ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                  <span className="font-bold text-sm text-white">
                    {isNetworkOnline ? 'Internet Aktif' : 'Internet Terputus'}
                  </span>
                </div>
              </div>

              {/* Simulation Mode Toggle Button */}
              <div className="space-y-1 text-right">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Simulasi Putus Internet</div>
                <button
                  onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition font-mono border ${
                    isOfflineSimulated
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isOfflineSimulated ? '🔴 SIMULASI OFFLINE (ON)' : '⚪ SIMULASI OFFLINE (OFF)'}
                </button>
              </div>
            </div>

            {/* Queue Counter Card */}
            <div className="flex items-center justify-between p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <HardDrive className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-xs text-slate-400">Antrean Nota di IndexedDB:</div>
                  <div className="text-xl font-black font-mono text-white">
                    {pendingOfflineCount} Transaksi Menunggu
                  </div>
                </div>
              </div>

              <button
                onClick={handleExecuteManualSync}
                disabled={isSyncing || pendingOfflineCount === 0 || !isEffectiveOnline}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition ${
                  pendingOfflineCount === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : !isEffectiveOnline
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 cursor-pointer'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>

            {/* List of Pending Transactions (if any) */}
            {pendingOfflineTransactions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Daftar Transaksi Offline Belum Disinkron:</div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {pendingOfflineTransactions.map((tx) => (
                    <div
                      key={tx.invoiceNumber}
                      className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono"
                    >
                      <div>
                        <div className="font-bold text-amber-400">{tx.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleTimeString('id-ID')} • {tx.items.length} item • {tx.paymentMethod}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">
                          Rp {tx.grandTotal.toLocaleString('id-ID')}
                        </div>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-sans">
                          Pending Sync
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SOP Ringkas Kasir Saat Offline */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SOP Ketahanan Kasir (PRD Sprint 7):</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Kasir tetap dapat scan barcode & cetak nota thermal secara normal walau internet padam.</li>
                <li>Semua nota disimpan aman di Dexie.js IndexedDB dengan jaminan anti-duplikasi nota.</li>
                <li>Poin member & kupon undian dihitung offline dan otomatis diposting saat online kembali.</li>
              </ul>
            </div>

            {/* Modal Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSyncCenterModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blind Closing Modal */}
      {showClosingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Blind Closing Shift #0042</h3>
              </div>
              <button
                onClick={() => setShowClosingModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {closingSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  ✓
                </div>
                <h4 className="font-bold text-lg text-emerald-400">Shift Berhasil Ditutup</h4>
                <p className="text-xs text-slate-400">
                  Selisih kas otomatis dicatat & diposting ke Jurnal Penyesuaian Akuntansi SAK.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sesuai SOP <strong>Blind Closing</strong>, kasir wajib menghitung uang fisik tanpa melihat estimasi sistem. Masukkan total uang tunai yang ada di laci saat ini:
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Uang Fisik Dihitung (Rp):
                    </label>
                    <input
                      type="number"
                      autoFocus
                      placeholder="Contoh: 1450000"
                      value={closingPhysicalCash || ''}
                      onChange={(e) => setClosingPhysicalCash(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Catatan / Keterangan Penutupan:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Catatan pecahan uang koin / voucher..."
                      value={closingNotes}
                      onChange={(e) => setClosingNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setShowClosingModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleExecuteBlindClosing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/30"
                  >
                    Konfirmasi Tutup Shift
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
