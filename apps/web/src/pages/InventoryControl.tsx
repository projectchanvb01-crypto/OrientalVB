import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ScanBarcode,
  Search,
  Plus,
  ArrowRight,
  Tag,
  Check,
  Calendar,
  Layers,
  Sparkles,
  ClipboardCheck,
  RefreshCw,
} from 'lucide-react';
import { ProductBatch, BatchWarningLevel } from '@oriental/types';
import { wmsApi } from '../lib/api';
import { cn } from '../lib/utils';
import { useEcosystem } from '../context/EcosystemContext';

// Helper to generate unique batch number
const generateUniqueBatchNumber = (prefix: string = 'BATCH'): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
};

export const InventoryControl: React.FC = () => {
  const { products } = useEcosystem();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'FEFO_TABLE' | 'DAILY_INSPECTION' | 'NEW_GRN'>('FEFO_TABLE');

  // Batches state
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [fefoFilter, setFefoFilter] = useState<'ALL' | 'RED' | 'AMBER' | 'GREEN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [warningSummary, setWarningSummary] = useState<any>({
    redCount: 2,
    amberCount: 2,
    greenCount: 2,
    redStockValue: 3260000,
  });

  // Daily Inspection State (Scan Barcode Flow)
  const [barcodeInput, setBarcodeInput] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<any>(null);
  const [productBatches, setProductBatches] = useState<ProductBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [inspectPhysicalStock, setInspectPhysicalStock] = useState<number>(0);
  const [inspectExpiryDate, setInspectExpiryDate] = useState<string>('');
  const [inspectCondition, setInspectCondition] = useState<'BAIK' | 'DUS_PENYOK' | 'KEMASAN_RUSAK'>('BAIK');
  const [inspectNotes, setInspectNotes] = useState('');
  const [inspectSuccessMsg, setInspectSuccessMsg] = useState('');

  // GRN State with Auto-Generated Unique Batch Number
  const [grnProductId, setGrnProductId] = useState(products[0]?.id || 'p-001');
  const [grnBatchNumber, setGrnBatchNumber] = useState(generateUniqueBatchNumber('BATCH'));
  const [grnExpiryDate, setGrnExpiryDate] = useState('2027-06-30');
  const [grnQty, setGrnQty] = useState(60);
  const [grnCostPrice, setGrnCostPrice] = useState(32000);
  const [grnSupplier, setGrnSupplier] = useState('PT Sinar Pangan Nusantara (Surabaya)');
  const [grnSuccessMsg, setGrnSuccessMsg] = useState('');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const [fetchedBatches, summary] = await Promise.all([
        wmsApi.getBatches(),
        wmsApi.getWarningSummary(),
      ]);
      if (fetchedBatches) setBatches(fetchedBatches);
      if (summary) setWarningSummary(summary);
    } catch (err) {
      console.error('Error loading batches:', err);
    }
  };

  // Barcode Lookup Flow
  const handleBarcodeSearch = (codeToSearch: string) => {
    const trimmed = codeToSearch.trim();
    if (!trimmed) return;

    // Find product matching barcode or SKU
    const found = products.find(
      (p) =>
        p.baseSku?.toLowerCase() === trimmed.toLowerCase() ||
        p.variants?.some((v) => v.barcode === trimmed) ||
        p.name.toLowerCase().includes(trimmed.toLowerCase()),
    );

    if (found) {
      setMatchedProduct(found);
      const bList = batches.filter((b) => b.productId === found.id || b.sku === found.baseSku);
      setProductBatches(bList);
      if (bList.length > 0) {
        setSelectedBatchId(bList[0].id);
        setInspectPhysicalStock(bList[0].stockQty);
        setInspectExpiryDate(bList[0].expiryDate);
      } else {
        setSelectedBatchId('NEW_BATCH');
        setInspectPhysicalStock(found.totalStockInBaseUnits || 0);
        setInspectExpiryDate('2026-12-31');
      }
    } else {
      setMatchedProduct(null);
      setProductBatches([]);
      setSelectedBatchId('');
    }
  };

  const handleSelectBatch = (bId: string) => {
    setSelectedBatchId(bId);
    const chosen = batches.find((b) => b.id === bId);
    if (chosen) {
      setInspectPhysicalStock(chosen.stockQty);
      setInspectExpiryDate(chosen.expiryDate);
    }
  };

  // Save Daily Inspection update
  const handleSaveInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedProduct) return;

    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === selectedBatchId) {
          const today = new Date();
          const exp = new Date(inspectExpiryDate);
          const daysRem = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const wLevel: BatchWarningLevel = daysRem <= 30 ? 'RED' : daysRem <= 90 ? 'AMBER' : 'GREEN';

          return {
            ...b,
            stockQty: inspectPhysicalStock,
            expiryDate: inspectExpiryDate,
            daysRemaining: daysRem,
            warningLevel: wLevel,
            status: daysRem <= 0 ? 'EXPIRED' : wLevel === 'RED' ? 'CLEARANCE_PROMO' : 'ACTIVE',
          };
        }
        return b;
      }),
    );

    setInspectSuccessMsg(
      `Pengecekan Harian Berhasil! Batch untuk "${matchedProduct.name}" telah diperbarui. Kondisi fisik: ${inspectCondition}.`,
    );
    setTimeout(() => setInspectSuccessMsg(''), 4000);
  };

  // Handle GRN Submit
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === grnProductId) || products[0];

    const dto = {
      productId: grnProductId,
      productName: prod?.name || 'Minyak Goreng SunCo 2L Pouch',
      sku: prod?.baseSku || 'MKO-SNC-2L',
      batchNumber: grnBatchNumber,
      expiryDate: grnExpiryDate,
      stockQty: Number(grnQty),
      costPrice: Number(grnCostPrice),
      supplierName: grnSupplier,
    };

    const newB = await wmsApi.createBatch(dto);
    if (newB) {
      setBatches((prev) => [newB, ...prev]);
      setGrnSuccessMsg(`Batch ${newB.batchNumber} berhasil dicatat & masuk antrean FEFO!`);
      // Re-generate a fresh unique batch number for next entry
      setGrnBatchNumber(generateUniqueBatchNumber('BATCH'));
      setTimeout(() => setGrnSuccessMsg(''), 4000);
      setActiveSubTab('FEFO_TABLE');
    }
  };

  // Filtered Batches
  const filteredBatches = batches.filter((b) => {
    const matchFilter = fefoFilter === 'ALL' || b.warningLevel === fefoFilter;
    const matchSearch =
      b.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
              Divisi Warehouse • Sub-Divisi Inventory Control
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/30 text-teal-300 border border-teal-500/40">
              FEFO & Daily Inspection
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Boxes className="w-7 h-7 text-emerald-400" />
            Inventory Control & Pengecekan Umur Barang
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Pusat pemantauan tanggal kedaluwarsa (FEFO First Expired First Out), inspeksi harian kondisi fisik stok via scan barcode, dan pencatatan nomor batch pabrik.
          </p>
        </div>

        {/* Warning Metric Counters */}
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/20 border border-rose-500/40 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-rose-300 block">Level Merah (≤30d)</span>
            <span className="text-xl font-black text-rose-400">{warningSummary.redCount} Batch</span>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">Level Kuning (31-90d)</span>
            <span className="text-xl font-black text-amber-400">{warningSummary.amberCount} Batch</span>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Level Hijau (&gt;90d)</span>
            <span className="text-xl font-black text-emerald-400">{warningSummary.greenCount} Batch</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('FEFO_TABLE')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
            activeSubTab === 'FEFO_TABLE'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
          )}
        >
          <Clock className="w-4 h-4" />
          <span>1. Tabel Umur Produk & FEFO</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-800 text-emerald-100">
            {batches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('DAILY_INSPECTION')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
            activeSubTab === 'DAILY_INSPECTION'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
          )}
        >
          <ScanBarcode className="w-4 h-4" />
          <span>2. Cek Harian Expired & Update Batch (Barcode Scan)</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('NEW_GRN');
            setGrnBatchNumber(generateUniqueBatchNumber('BATCH'));
          }}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ml-auto',
            activeSubTab === 'NEW_GRN'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300',
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Input GRN + Batch Baru</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: TABEL UMUR PRODUK & FEFO MONITOR */}
      {/* ======================================================== */}
      {activeSubTab === 'FEFO_TABLE' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari SKU, Nama Produk, No. Batch..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Filter:</span>
              <button
                onClick={() => setFefoFilter('ALL')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
                  fefoFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                Semua ({batches.length})
              </button>
              <button
                onClick={() => setFefoFilter('RED')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer',
                  fefoFilter === 'RED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200',
                )}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Merah (≤30d)</span>
              </button>
              <button
                onClick={() => setFefoFilter('AMBER')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer',
                  fefoFilter === 'AMBER'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200',
                )}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Kuning (31-90d)</span>
              </button>
              <button
                onClick={() => setFefoFilter('GREEN')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer',
                  fefoFilter === 'GREEN'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
                )}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Hijau (&gt;90d)</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Level FEFO</th>
                    <th className="py-3 px-4">Nama Produk & SKU</th>
                    <th className="py-3 px-4">Nomor Batch</th>
                    <th className="py-3 px-4">Tgl Expired</th>
                    <th className="py-3 px-4">Sisa Waktu</th>
                    <th className="py-3 px-4">Stok Batch</th>
                    <th className="py-3 px-4">HPP Modal</th>
                    <th className="py-3 px-4">Status & Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.map((batch) => {
                    const isRed = batch.warningLevel === 'RED';
                    const isAmber = batch.warningLevel === 'AMBER';

                    return (
                      <tr
                        key={batch.id}
                        className={cn(
                          'hover:bg-slate-50/80 transition',
                          isRed && 'bg-rose-50/40',
                          isAmber && 'bg-amber-50/30',
                        )}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isRed ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-600 text-white flex items-center gap-1 w-fit shadow-xs">
                              <AlertTriangle className="w-3 h-3" />
                              <span>LEVEL MERAH</span>
                            </span>
                          ) : isAmber ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500 text-slate-950 flex items-center gap-1 w-fit shadow-xs">
                              <Clock className="w-3 h-3" />
                              <span>LEVEL KUNING</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>LEVEL HIJAU</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{batch.productName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {batch.sku}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate max-w-[160px]">
                              {batch.supplierName}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                          {batch.batchNumber}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                          {batch.expiryDate}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'font-mono font-bold text-xs px-2 py-0.5 rounded',
                              isRed
                                ? 'text-rose-700 bg-rose-100 font-black'
                                : isAmber
                                ? 'text-amber-800 bg-amber-100'
                                : 'text-emerald-700 bg-emerald-50',
                            )}
                          >
                            {batch.daysRemaining} Hari Lagi
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {batch.stockQty} Unit
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          Rp {batch.costPrice.toLocaleString('id-ID')}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {isRed ? (
                              <button
                                onClick={() =>
                                  alert(
                                    `[Autonomous Promo Engine]: Men-generate label harga cetak A6 & push promo digital untuk ${batch.productName} (Sisa ${batch.daysRemaining} hari).`,
                                  )
                                }
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                              >
                                <Tag className="w-3 h-3" />
                                <span>Auto-Promo Ready</span>
                              </button>
                            ) : isAmber ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                Prioritas Rak Depan
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                                Stok Aman (Buffer)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: CEK HARIAN EXPIRED & SCAN BARCODE FLOW */}
      {/* ======================================================== */}
      {activeSubTab === 'DAILY_INSPECTION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner & Input Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                SOP Harian Inventory Control
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                <ScanBarcode className="w-5 h-5 text-emerald-600" />
                <span>Pengecekan Fisik & Scan Barcode</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan barcode fisik barang di rak untuk menarik data produk, lalu perbarui tanggal expired dan stok real-time.
              </p>
            </div>

            {/* Barcode Search / Scan Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Scan Barcode atau Ketik SKU Produk:
              </label>
              <div className="relative">
                <ScanBarcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => {
                    setBarcodeInput(e.target.value);
                    handleBarcodeSearch(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBarcodeSearch(barcodeInput);
                    }
                  }}
                  placeholder="Arahkan scanner atau ketik e.g. MKO-SNC-2L / 8991234..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-emerald-500/40 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/20"
                  autoFocus
                />
              </div>

              {/* Quick Picks for Demo */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold">Pilih Cepat:</span>
                {products.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setBarcodeInput(p.baseSku);
                      handleBarcodeSearch(p.baseSku);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono transition cursor-pointer"
                  >
                    {p.name.split(' ')[0]} ({p.baseSku})
                  </button>
                ))}
              </div>
            </div>

            {/* Matched Product Details Card */}
            {matchedProduct ? (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                    Produk Terdeteksi
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{matchedProduct.category}</span>
                </div>
                <h4 className="text-sm font-black text-slate-900">{matchedProduct.name}</h4>
                <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
                  <span>SKU: {matchedProduct.baseSku}</span>
                  <span>•</span>
                  <span>Total Persediaan: {matchedProduct.totalStockInBaseUnits} {matchedProduct.baseUnitName}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                Scan barcode barang atau pilih produk dari tombol di atas untuk memulai inspeksi harian.
              </div>
            )}
          </div>

          {/* Form Update Batch & Expiry */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Formulir Rekonsiliasi Batch
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Pilih Batch & Update Data Kedaluwarsa
              </h3>
            </div>

            {inspectSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{inspectSuccessMsg}</span>
              </div>
            )}

            {matchedProduct ? (
              <form onSubmit={handleSaveInspection} className="space-y-4 text-xs">
                {/* Batch Selector */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Pilih Batch yang Sedang Diinspeksi:
                  </label>
                  {productBatches.length > 0 ? (
                    <select
                      value={selectedBatchId}
                      onChange={(e) => handleSelectBatch(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {productBatches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchNumber} • Exp: {b.expiryDate} ({b.daysRemaining} hari lagi) • Stok: {b.stockQty} unit
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      Belum ada batch terdaftar untuk produk ini.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Physical Stock Count */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Stok Fisik Terhitung di Rak:
                    </label>
                    <input
                      type="number"
                      value={inspectPhysicalStock}
                      onChange={(e) => setInspectPhysicalStock(Number(e.target.value))}
                      min="0"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Tanggal Kedaluwarsa Tertera (Exp Date):
                    </label>
                    <input
                      type="date"
                      value={inspectExpiryDate}
                      onChange={(e) => setInspectExpiryDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Condition Selector */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kondisi Fisik Kemasan Produk:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectCondition('BAIK')}
                      className={cn(
                        'py-2 px-3 rounded-xl font-bold border transition text-center cursor-pointer',
                        inspectCondition === 'BAIK'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
                      )}
                    >
                      ✅ Kondisi Baik
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectCondition('DUS_PENYOK')}
                      className={cn(
                        'py-2 px-3 rounded-xl font-bold border transition text-center cursor-pointer',
                        inspectCondition === 'DUS_PENYOK'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
                      )}
                    >
                      ⚠️ Dus Penyok
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectCondition('KEMASAN_RUSAK')}
                      className={cn(
                        'py-2 px-3 rounded-xl font-bold border transition text-center cursor-pointer',
                        inspectCondition === 'KEMASAN_RUSAK'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
                      )}
                    >
                      ❌ Kemasan Rusak/Bocor
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Catatan Temuan Lapangan:
                  </label>
                  <input
                    type="text"
                    value={inspectNotes}
                    onChange={(e) => setInspectNotes(e.target.value)}
                    placeholder="Contoh: Baris depan rak A2, sisa 10 pcs dimajukan sesuai aturan FEFO..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Simpan Hasil Pengecekan Harian</span>
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Formulir aktif setelah produk dipilih di panel sebelah kiri.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: FORM GRN DENGAN UNIQUE BATCH NUMBER AUTO-GEN */}
      {/* ======================================================== */}
      {activeSubTab === 'NEW_GRN' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Goods Receipt Note (GRN) • Divisi Warehouse
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Penerimaan Barang Masuk & Penomoran Batch Unik
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Nomor batch otomatis digenerate unik oleh sistem dan dapat dioverride sesuai nomor lot pada kemasan pabrik.
            </p>
          </div>

          {grnSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{grnSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pilih Produk:</label>
              <select
                value={grnProductId}
                onChange={(e) => setGrnProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.baseSku})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Batch Number with Auto-generate and Regenerate Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Nomor Batch (Unik):</label>
                  <button
                    type="button"
                    onClick={() => setGrnBatchNumber(generateUniqueBatchNumber('BATCH'))}
                    className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    title="Generate nomor unik baru"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={grnBatchNumber}
                  onChange={(e) => setGrnBatchNumber(e.target.value)}
                  placeholder="BATCH-YYYYMMDD-XXXX"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-indigo-500 bg-indigo-50/20"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Kedaluwarsa (Expired Date):</label>
                <input
                  type="date"
                  value={grnExpiryDate}
                  onChange={(e) => setGrnExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jumlah Fisik Diterima (Qty):</label>
                <input
                  type="number"
                  value={grnQty}
                  onChange={(e) => setGrnQty(Number(e.target.value))}
                  min="1"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Harga Pokok Pembelian (HPP):</label>
                <input
                  type="number"
                  value={grnCostPrice}
                  onChange={(e) => setGrnCostPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Supplier Pengirim:</label>
              <select
                value={grnSupplier}
                onChange={(e) => setGrnSupplier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="PT Sinar Pangan Nusantara (Surabaya)">PT Sinar Pangan Nusantara (Surabaya)</option>
                <option value="CV Makmur Sejahtera (Jakarta)">CV Makmur Sejahtera (Jakarta)</option>
                <option value="Distributor Sembako Lokal Jaya (Makassar)">Distributor Sembako Lokal Jaya (Makassar)</option>
                <option value="Pabrik Minyak Goreng Sawit Lestari (Semarang)">Pabrik Minyak Goreng Sawit Lestari (Semarang)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Penerimaan Barang & Aktifkan FEFO</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
