import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  ScanBarcode,
  Search,
  Tag,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
  Store,
  Layers,
  Award,
  Clock,
  ArrowRight,
  Info,
  X,
  Check,
  ChevronRight,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import { ProductWithMultiUnit, ProductUnitVariant, LOYALTY_POINT_RULES } from '@oriental/types';

export const PriceCheckerStation: React.FC = () => {
  const { products, formatStock } = useEcosystem();

  // Scanning & Search State
  const [searchInput, setSearchInput] = useState<string>('');
  const [scannedProduct, setScannedProduct] = useState<ProductWithMultiUnit | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductUnitVariant | null>(null);
  const [searchHistory, setSearchHistory] = useState<ProductWithMultiUnit[]>([]);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Kiosk Terminal Configuration
  const [isKioskMode, setIsKioskMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('id-ID'));
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );

  // Auto-Reset Timer (15 seconds after scan, return to standby screen)
  const [resetCountdown, setResetCountdown] = useState<number>(15);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Category Filter for On-Screen Browser
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Sound Effect Beep for Supermarket Scanner Kiosk
  const playScanChime = (isSuccess: boolean = true) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isSuccess) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch scanner beep
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, ctx.currentTime); // Low buzz for not found
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio might be suppressed by browser autoplay policies
    }
  };

  // Keep barcode input automatically focused so scanner hardware works seamlessly
  useEffect(() => {
    const keepFocus = () => {
      if (document.activeElement?.tagName !== 'INPUT') {
        barcodeInputRef.current?.focus();
      }
    };
    keepFocus();
    const interval = setInterval(keepFocus, 2000);
    return () => clearInterval(interval);
  }, [scannedProduct]);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID'));
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-Reset Timer logic
  useEffect(() => {
    let countdownInterval: any;
    if (scannedProduct && isTimerRunning) {
      countdownInterval = setInterval(() => {
        setResetCountdown((prev) => {
          if (prev <= 1) {
            handleResetToStandby();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [scannedProduct, isTimerRunning]);

  // Handle Scanning / Selecting a Product
  const handleSelectProduct = (prod: ProductWithMultiUnit, variant?: ProductUnitVariant) => {
    const activeVar = variant || prod.variants.find((v) => v.isBaseUnit) || prod.variants[0];
    setScannedProduct(prod);
    setSelectedVariant(activeVar);
    setSearchInput('');
    setScanMessage(null);
    setResetCountdown(15);
    setIsTimerRunning(true);
    playScanChime(true);

    // Save to quick history
    setSearchHistory((prev) => {
      const filtered = prev.filter((p) => p.id !== prod.id);
      return [prod, ...filtered].slice(0, 6);
    });
  };

  // Process barcode input (fired on change for rapid scanners, or enter key)
  const handleBarcodeInput = (val: string) => {
    setSearchInput(val);
    const trimmed = val.trim();
    if (!trimmed) return;

    // Direct match against barcode variant
    for (const prod of products) {
      const matchedVariant = prod.variants.find((v) => v.barcode === trimmed);
      if (matchedVariant) {
        handleSelectProduct(prod, matchedVariant);
        return;
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const trimmed = searchInput.trim().toLowerCase();

    // 1. Barcode match
    for (const prod of products) {
      const matchedVariant = prod.variants.find(
        (v) => v.barcode.toLowerCase() === trimmed || v.skuSuffix.toLowerCase() === trimmed,
      );
      if (matchedVariant) {
        handleSelectProduct(prod, matchedVariant);
        return;
      }
    }

    // 2. Name or Base SKU match
    const foundByName = products.find(
      (p) =>
        p.name.toLowerCase().includes(trimmed) ||
        p.baseSku.toLowerCase().includes(trimmed) ||
        p.category.toLowerCase().includes(trimmed),
    );

    if (foundByName) {
      handleSelectProduct(foundByName);
      return;
    }

    // Not found feedback
    playScanChime(false);
    setScanMessage(`Barang dengan barcode atau nama "${searchInput}" tidak ditemukan di database.`);
    setTimeout(() => setScanMessage(null), 4000);
  };

  const handleResetToStandby = () => {
    setScannedProduct(null);
    setSelectedVariant(null);
    setSearchInput('');
    setScanMessage(null);
    setIsTimerRunning(false);
    setResetCountdown(15);
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  // Keyboard shortcut: Esc to reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleResetToStandby();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter products for category browsing
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];
  const displayedBrowseProducts = products.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category === selectedCategory;
  });

  return (
    <div
      className={`min-h-screen flex flex-col font-sans select-none transition-all duration-300 ${
        isKioskMode
          ? 'fixed inset-0 z-50 bg-[#F4F6F9] overflow-y-auto'
          : 'bg-[#F8FAFC]'
      }`}
    >
      {/* ======================================================== */}
      {/* KIOSK STATION TOP HEADER                                  */}
      {/* ======================================================== */}
      <header className="bg-white border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
            <ScanBarcode className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                ORIENTAL SWALAYAN
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider border border-emerald-200">
                Station Cek Harga
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Pengecekan Harga Retail Resmi • Stand Scanner Mandiri #01
            </p>
          </div>
        </div>

        {/* Station Controls & Digital Clock */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-mono text-sm font-extrabold text-slate-800 tracking-wider">
              {currentTime} WIB
            </span>
            <span className="text-[11px] text-slate-400 capitalize">{currentDate}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
            title={soundEnabled ? 'Suara Scanner Aktif' : 'Suara Scanner Senyap'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Kiosk Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsKioskMode(!isKioskMode)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
              isKioskMode
                ? 'bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            {isKioskMode ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar Kiosk</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Layar Penuh (Kiosk)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN KIOSK INTERACTION SURFACE                           */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start">
        {/* Hidden / Focus Auto-Capture Input */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative flex items-center">
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => handleBarcodeInput(e.target.value)}
              placeholder="Arahkan Barcode ke Scanner atau Ketik Nama / Kode Barang..."
              className="w-full pl-12 pr-28 py-3.5 sm:py-4 bg-white border-2 border-emerald-500/80 rounded-2xl text-slate-900 font-mono text-sm sm:text-base font-bold shadow-lg shadow-emerald-500/10 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
            />
            <ScanBarcode className="w-6 h-6 text-emerald-600 absolute left-4 pointer-events-none animate-pulse" />
            <div className="absolute right-2 flex items-center gap-1.5">
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Cek Harga
              </button>
            </div>
          </div>
        </form>

        {/* Not Found Alert Banner */}
        {scanMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <X className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{scanMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* ACTIVE PRODUCT RESULT DISPLAY                            */}
        {/* ======================================================== */}
        {scannedProduct && selectedVariant ? (
          <div className="space-y-4 animate-fadeIn">
            {/* Top Bar with Countdown Timer & Reset Button */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-slate-800">
                  Data Produk Ditemukan ({scannedProduct.name})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset otomatis dalam:</span>
                  <strong className="text-emerald-700 font-extrabold text-xs">{resetCountdown}s</strong>
                </div>
                <button
                  type="button"
                  onClick={handleResetToStandby}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Barang Lain (Esc)</span>
                </button>
              </div>
            </div>

            {/* Main Price Presentation Hero Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Product Photo & Multi-Unit Selector (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-full h-64 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-4 relative overflow-hidden group">
                    {scannedProduct.imageUrl ? (
                      <img
                        src={scannedProduct.imageUrl}
                        alt={scannedProduct.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <ShoppingBag className="w-20 h-20 text-slate-300 stroke-[1.5]" />
                    )}
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-xl text-[11px] shadow-2xs">
                      {scannedProduct.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      SKU: {scannedProduct.baseSku}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl font-black text-slate-900 leading-snug">
                      {scannedProduct.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-2">
                      <span>Barcode: {selectedVariant.barcode}</span>
                      <span>•</span>
                      <span>Satuan: {selectedVariant.unitName}</span>
                    </p>
                  </div>
                </div>

                {/* Multi-Unit Retail Packaging Selector */}
                {scannedProduct.variants.length > 1 && (
                  <div className="pt-3 border-t border-slate-100">
                    <label className="text-[11px] font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                      Pilihan Kemasan Retail:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {scannedProduct.variants.map((v) => {
                        const isVarActive = selectedVariant.unitName === v.unitName;
                        return (
                          <button
                            key={v.unitName}
                            type="button"
                            onClick={() => {
                              setSelectedVariant(v);
                              playScanChime(true);
                              setResetCountdown(15);
                            }}
                            className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                              isVarActive
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">{v.unitName}</span>
                              {isVarActive && (
                                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                                  ✓
                                </span>
                              )}
                            </div>
                            <p className="text-slate-900 font-extrabold text-sm mt-1 font-mono">
                              Rp {v.price.toLocaleString('id-ID')}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {v.multiplier > 1 ? `Isi ${v.multiplier} unit` : 'Kemasan Satuan'}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Giant Retail Price & Store Info (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Giant Retail Price Hero Box */}
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-700/20 relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        HARGA RETAIL RESMI SWALAYAN
                      </span>
                      <span className="text-emerald-100 text-xs font-medium">
                        Sudah Termasuk PPN
                      </span>
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-emerald-200">IDR</span>
                        <span className="text-4xl sm:text-6xl font-black font-sans tracking-tight">
                          {selectedVariant.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-emerald-100 text-sm font-semibold mt-1">
                        Harga berlaku per kemasan <strong className="text-white">{selectedVariant.unitName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Bulk / Multi-Unit Savings Banner */}
                  {selectedVariant.multiplier > 1 ? (
                    <div className="relative z-10 mt-4 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold block">Harga Kemasan Grosir / Dus</span>
                        <span className="text-emerald-100 text-[11px]">
                          Setara Rp{' '}
                          {Math.round(selectedVariant.price / selectedVariant.multiplier).toLocaleString('id-ID')}{' '}
                          per unit satuan
                        </span>
                      </div>
                      <span className="font-mono bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-xs">
                        HEMAT BELI DUS
                      </span>
                    </div>
                  ) : (
                    <div className="relative z-10 mt-4 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold block">Tersedia Kemasan Dus / Karton</span>
                        <span className="text-emerald-100 text-[11px]">
                          Cek pilihan kemasan di sebelah kiri untuk pembelian partai besar
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Decorative background circles */}
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
                  <div className="absolute right-24 -top-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
                </div>

                {/* Store Stock Availability & Member Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stock Status Card */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Ketersediaan Stok Toko</h4>
                        <p className="text-[11px] text-slate-500">Rak Swalayan Oriental</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="text-2xl font-black text-slate-900 font-sans">
                        {scannedProduct.totalStockInBaseUnits}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5 font-medium">
                        {scannedProduct.baseUnitName} tersedia di rak
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                      ✓ Barang siap diambil & ditransaksikan di kasir
                    </p>
                  </div>

                  {/* Member One Identity Loyalty Benefit Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-5 border border-amber-200/90 shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-200 flex items-center justify-center text-amber-800">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-950">Benefit Member One Identity</h4>
                        <p className="text-[11px] text-amber-700">Tunjukkan barcode member di kasir</p>
                      </div>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed pt-1">
                      Kumpulkan <strong>Poin Loyalitas</strong> (Rp 100k = 1 Poin) dan{' '}
                      <strong>Kupon Undian Doorprize</strong> (Rp 150k = 1 Kupon) untuk setiap transaksi di kasir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STANDBY KIOSK SCREEN (Waiting for Scan)                  */
          /* ======================================================== */
          <div className="space-y-6 animate-fadeIn">
            {/* Animated Laser Scanner Graphic Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-emerald-300 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
              {/* Pulsing Scanner Target */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center mb-6 shadow-inner shadow-emerald-500/10">
                <Barcode className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-700 stroke-[1.5]" />
                {/* Horizontal Laser Line animation */}
                <div className="absolute inset-x-2 h-0.5 bg-rose-500 shadow-md shadow-rose-500 animate-bounce" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ARAHKAN BARCODE PRODUK KE SCANNER
              </h2>
              <p className="text-sm text-slate-500 max-w-lg mt-2 leading-relaxed">
                Dekatkan kode barcode pada kemasan barang ke arah sensor scanner station, atau ketik nama
                produk pada kolom pencarian di atas untuk melihat harga retail resmi.
              </p>

              {/* 3 Guidance Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-8">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-left">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                    1
                  </span>
                  <p className="font-bold text-slate-800 text-xs">Pilih Produk</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ambil produk dari rak swalayan</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-left">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                    2
                  </span>
                  <p className="font-bold text-slate-800 text-xs">Arahkan Barcode</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sensor otomatis membaca barcode</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-left">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                    3
                  </span>
                  <p className="font-bold text-slate-800 text-xs">Harga Tampil</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Harga retail & promo langsung terlihat</p>
                </div>
              </div>
            </div>

            {/* Quick Test / Popular Products Chips */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Uji Cepat / Produk Populer Swalayan:
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Klik salah satu produk untuk simulasi cek harga</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {products.slice(0, 6).map((prod) => {
                  const baseVar = prod.variants.find((v) => v.isBaseUnit) || prod.variants[0];
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleSelectProduct(prod, baseVar)}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition cursor-pointer flex flex-col justify-between group shadow-2xs"
                    >
                      <div className="w-full h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-2 overflow-hidden">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition"
                          />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <p className="font-bold text-slate-800 text-xs truncate">{prod.name}</p>
                      <p className="text-emerald-700 font-extrabold text-xs mt-1 font-mono">
                        Rp {baseVar.price.toLocaleString('id-ID')}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {baseVar.barcode}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Browser Section */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Jelajahi Katalog Retail Berdasarkan Kategori:
                </h3>

                {/* Category Pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat === 'ALL' ? 'Semua Kategori' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {displayedBrowseProducts.map((p) => {
                  const baseVar = p.variants.find((v) => v.isBaseUnit) || p.variants[0];
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p, baseVar)}
                      className="p-3 bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl flex items-center justify-between cursor-pointer transition shadow-2xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Barcode: {baseVar.barcode}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-xs text-slate-900 font-mono block">
                          Rp {baseVar.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-400">{baseVar.unitName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* KIOSK FOOTER TICKER BANNER                               */}
      {/* ======================================================== */}
      <footer className="bg-slate-900 text-white py-3 px-4 sm:px-8 mt-auto border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              <strong>Oriental Swalayan:</strong> Belanja mudah, harga pasti retail, dan kumpulkan poin loyalitas One Identity.
            </span>
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            Kiosk Terminal v1.0 • Tekan ESC untuk kembali ke Standby
          </div>
        </div>
      </footer>
    </div>
  );
};
