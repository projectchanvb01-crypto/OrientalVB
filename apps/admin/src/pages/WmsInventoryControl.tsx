import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ship,
  TrendingUp,
  Scale,
  Plus,
  ArrowRight,
  Calculator,
  Percent,
  Search,
  Building,
  Truck,
  FileCheck,
  Tag,
  Printer,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ProductBatch,
  BatchWarningLevel,
  DynamicUnitConversion,
  SupplierItem,
  ShippingRouteItem,
  LandedCostInput,
  LandedCostBreakdown,
  SupplierComparisonItem,
} from '@oriental/types';
import { wmsApi } from '../lib/api';
import { cn } from '../lib/utils';
import { useEcosystem } from '../context/EcosystemContext';

export const WmsInventoryControl: React.FC = () => {
  const { products } = useEcosystem();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'FEFO' | 'LANDED_COST' | 'COMPARING' | 'CONVERSIONS' | 'NEW_BATCH'>('FEFO');

  // Batches & FEFO state
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [fefoFilter, setFefoFilter] = useState<'ALL' | 'RED' | 'AMBER' | 'GREEN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [warningSummary, setWarningSummary] = useState<any>({
    redCount: 2,
    amberCount: 2,
    greenCount: 2,
    redStockValue: 3260000,
  });

  // Dynamic Conversions state
  const [conversions, setConversions] = useState<DynamicUnitConversion[]>([]);
  const [newConvProduct, setNewConvProduct] = useState(products[0]?.id || 'p-001');
  const [newConvName, setNewConvName] = useState('');
  const [newConvMultiplier, setNewConvMultiplier] = useState(12);
  const [newConvBarcode, setNewConvBarcode] = useState('');
  const [newConvPrice, setNewConvPrice] = useState(0);

  // Suppliers & Routes
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [shippingRoutes, setShippingRoutes] = useState<ShippingRouteItem[]>([]);

  // Landed Cost Calculator State
  const [calcInput, setCalcInput] = useState<LandedCostInput>({
    lengthCm: 42,
    widthCm: 28,
    heightCm: 32,
    unitsPerCarton: 6,
    totalCartons: 100,
    factoryPricePerUnit: 30500,
    supplierIsPkp: true,
    shippingRouteId: 'route-sub-upg',
  });
  const [landedCostResult, setLandedCostResult] = useState<LandedCostBreakdown | null>(null);

  // Comparing Tool State
  const [compareProductId, setCompareProductId] = useState('p-001');
  const [comparisons, setComparisons] = useState<SupplierComparisonItem[]>([]);

  // New Batch GRN Form State
  const [grnProductId, setGrnProductId] = useState(products[0]?.id || 'p-001');
  const [grnBatchNumber, setGrnBatchNumber] = useState('');
  const [grnExpiryDate, setGrnExpiryDate] = useState('2027-06-30');
  const [grnQty, setGrnQty] = useState(60);
  const [grnCostPrice, setGrnCostPrice] = useState(32000);
  const [grnSupplier, setGrnSupplier] = useState('PT Sinar Pangan Nusantara (Surabaya)');
  const [grnSuccessMsg, setGrnSuccessMsg] = useState('');

  // Initial Load from API with fallback
  useEffect(() => {
    loadWmsData();
  }, []);

  const loadWmsData = async () => {
    try {
      const [fetchedBatches, summary, fetchedConvs, fetchedSups, fetchedRoutes] = await Promise.all([
        wmsApi.getBatches(),
        wmsApi.getWarningSummary(),
        wmsApi.getConversions(),
        wmsApi.getSuppliers(),
        wmsApi.getShippingRoutes(),
      ]);

      if (fetchedBatches) setBatches(fetchedBatches);
      if (summary) setWarningSummary(summary);
      if (fetchedConvs) setConversions(fetchedConvs);
      if (fetchedSups) setSuppliers(fetchedSups);
      if (fetchedRoutes) {
        setShippingRoutes(fetchedRoutes);
        if (fetchedRoutes[0]?.id) {
          setCalcInput((prev: LandedCostInput) => ({ ...prev, shippingRouteId: fetchedRoutes[0].id }));
        }
      }

      // Initial comparison
      const cmp = await wmsApi.compareSuppliers(compareProductId);
      if (cmp) setComparisons(cmp);

      // Initial landed cost calc
      calculateLandedCostInitial(fetchedRoutes?.[0]?.id || 'route-sub-upg');
    } catch (err) {
      console.error('Error loading WMS data:', err);
    }
  };

  const calculateLandedCostInitial = async (routeId: string) => {
    const input: LandedCostInput = {
      ...calcInput,
      shippingRouteId: routeId,
    };
    const res = await wmsApi.calculateLandedCost(input);
    if (res) setLandedCostResult(res);
  };

  const handleCalculateLandedCost = async () => {
    const res = await wmsApi.calculateLandedCost(calcInput);
    if (res) setLandedCostResult(res);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === grnProductId) || products[0];
    const dto = {
      productId: grnProductId,
      productName: prod?.name || 'Minyak Goreng SunCo 2L Pouch',
      sku: prod?.baseSku || 'MKO-SNC-2L',
      batchNumber: grnBatchNumber || `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: grnExpiryDate,
      stockQty: Number(grnQty),
      costPrice: Number(grnCostPrice),
      supplierName: grnSupplier,
    };

    const newB = await wmsApi.createBatch(dto);
    if (newB) {
      setBatches((prev) => [newB, ...prev]);
      setGrnSuccessMsg(`Batch ${newB.batchNumber} berhasil dicatat ke sistem FEFO!`);
      setTimeout(() => setGrnSuccessMsg(''), 4000);
      setActiveTab('FEFO');
    }
  };

  const handleAddConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConvName) return;
    const dto = {
      productId: newConvProduct,
      unitName: newConvName,
      multiplierQty: Number(newConvMultiplier),
      barcode: newConvBarcode || `899${Date.now().toString().slice(-9)}`,
      isDefaultB2b: true,
      priceEstimate: Number(newConvPrice) || undefined,
    };

    const created = await wmsApi.createConversion(dto);
    if (created) {
      setConversions((prev) => [...prev, created]);
      setNewConvName('');
      setNewConvBarcode('');
      setNewConvPrice(0);
    }
  };

  const handleDeleteConversion = async (id: string) => {
    const ok = await wmsApi.deleteConversion(id);
    if (ok) {
      setConversions((prev) => prev.filter((c) => c.id !== id));
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
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
              Sprint 8 Engine • WMS & Logistics Control
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
              One-Person Company Ready
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Boxes className="w-7 h-7 text-indigo-400" />
            WMS Cerdas, FEFO & Landed Cost Laut
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Pusat kendali masa simpan barang (FEFO), pencegahan kerugian kedaluwarsa, kalkulasi kubikasi ekspedisi laut ($m^3$ CBM), serta perbandingan efisiensi supplier.
          </p>
        </div>

        {/* Quick KPI Badges */}
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

      {/* Warning Alert if Red batches exist */}
      {warningSummary.redCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Peringatan Dini FEFO: {warningSummary.redCount} Batch Mendekati Kedaluwarsa!
              </p>
              <p className="text-xs text-rose-700">
                Total modal berisiko: <strong>Rp {warningSummary.redStockValue?.toLocaleString('id-ID')}</strong>. Sistem siap mengaktifkan status <em>Auto-Promo Clearance</em>.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('FEFO');
              setFefoFilter('RED');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm"
          >
            <span>Tinjau Batch Merah</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('FEFO')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
            activeTab === 'FEFO'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
          )}
        >
          <Clock className="w-4 h-4" />
          <span>1. Tabel Umur Produk & FEFO</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-800 text-indigo-100">
            {batches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('LANDED_COST')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
            activeTab === 'LANDED_COST'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
          )}
        >
          <Ship className="w-4 h-4" />
          <span>2. Kalkulator Landed Cost CBM Laut</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPARING')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
            activeTab === 'COMPARING'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
          )}
        >
          <Scale className="w-4 h-4" />
          <span>3. Komparasi Multi-Supplier</span>
        </button>

        <button
          onClick={() => setActiveTab('CONVERSIONS')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
            activeTab === 'CONVERSIONS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
          )}
        >
          <Layers className="w-4 h-4" />
          <span>4. Satuan Konversi Dinamis</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {conversions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('NEW_BATCH')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ml-auto',
            activeTab === 'NEW_BATCH'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300',
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Input GRN + Batch Baru</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TABEL UMUR PRODUK & FEFO MONITOR */}
      {/* ======================================================== */}
      {activeTab === 'FEFO' && (
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
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        {/* Level Badge */}
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

                        {/* Product Info */}
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

                        {/* Batch Number */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                          {batch.batchNumber}
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                          {batch.expiryDate}
                        </td>

                        {/* Days Remaining */}
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

                        {/* Stock */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {batch.stockQty} Unit
                        </td>

                        {/* Cost Price */}
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          Rp {batch.costPrice.toLocaleString('id-ID')}
                        </td>

                        {/* Status & Actions */}
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
                                title="Generate label harga coret & promo digital"
                              >
                                <Tag className="w-3 h-3" />
                                <span>Auto-Promo Ready</span>
                              </button>
                            ) : isAmber ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                Prioritas Rak Depan (FEFO)
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
      {/* TAB 2: KALKULATOR LANDED COST CBM EKSPEDISI LAUT */}
      {/* ======================================================== */}
      {activeTab === 'LANDED_COST' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Input */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Parameter Kubikasi & Pengiriman</h3>
                  <p className="text-[11px] text-slate-500">Kalkulasi biaya kapal per $m^3$ (CBM) ke Makassar</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">
                Formula Laut
              </span>
            </div>

            {/* Dimension Inputs */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Dimensi 1 Karton / Master Box (Panjang x Lebar x Tinggi dalam CM):
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Panjang (cm)</span>
                  <input
                    type="number"
                    value={calcInput.lengthCm}
                    onChange={(e) => setCalcInput({ ...calcInput, lengthCm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Lebar (cm)</span>
                  <input
                    type="number"
                    value={calcInput.widthCm}
                    onChange={(e) => setCalcInput({ ...calcInput, widthCm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Tinggi (cm)</span>
                  <input
                    type="number"
                    value={calcInput.heightCm}
                    onChange={(e) => setCalcInput({ ...calcInput, heightCm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Quantity & Packaging */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Isi Unit per Karton
                </label>
                <input
                  type="number"
                  value={calcInput.unitsPerCarton}
                  onChange={(e) => setCalcInput({ ...calcInput, unitsPerCarton: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  placeholder="Misal: 6 pouch / 24 pcs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rencana Pesanan (Total Karton)
                </label>
                <input
                  type="number"
                  value={calcInput.totalCartons}
                  onChange={(e) => setCalcInput({ ...calcInput, totalCartons: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  placeholder="Misal: 100 karton"
                />
              </div>
            </div>

            {/* Price & PKP Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Harga Beli Pabrik (per Pcs/Unit)
                </label>
                <input
                  type="number"
                  value={calcInput.factoryPricePerUnit}
                  onChange={(e) => setCalcInput({ ...calcInput, factoryPricePerUnit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  placeholder="Rp..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Status Supplier PKP?
                </label>
                <select
                  value={calcInput.supplierIsPkp ? 'YES' : 'NO'}
                  onChange={(e) => setCalcInput({ ...calcInput, supplierIsPkp: e.target.value === 'YES' })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="YES">✅ PKP (PPN 11% Dapat Dikreditkan)</option>
                  <option value="NO">❌ Non-PKP (Tanpa Faktur Masukan)</option>
                </select>
              </div>
            </div>

            {/* Route Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Pilih Rute Ekspedisi Laut & Pelabuhan:
              </label>
              <select
                value={calcInput.shippingRouteId}
                onChange={(e) => setCalcInput({ ...calcInput, shippingRouteId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {shippingRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.expeditionName} • {r.originPort} ➔ {r.destinationPort} (Rp {r.ratePerCbm.toLocaleString('id-ID')}/CBM)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCalculateLandedCost}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Hitung Ulang Landed Cost Aktual</span>
            </button>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-6 space-y-4">
            {landedCostResult ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Hasil Simulasi Landed Cost
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      HPP Bersih & Rekomendasi Jual
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Volume Pengiriman</span>
                    <span className="text-lg font-black font-mono text-indigo-700">
                      {landedCostResult.totalCbm} $m^3$ (CBM)
                    </span>
                  </div>
                </div>

                {/* Big Metric Box */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 text-white p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Net Landed Cost / Pcs (HPP Akhir)
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                      Rp {landedCostResult.totalLandedCostPerUnit.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Pabrik: Rp {calcInput.factoryPricePerUnit.toLocaleString('id-ID')} + Ongkir: Rp {landedCostResult.logisticsCostPerUnit.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-teal-50 border border-indigo-200 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-indigo-900 block">
                      Rekomendasi Harga Retail (+25%)
                    </span>
                    <span className="text-2xl font-black font-mono text-indigo-900 mt-1 block">
                      Rp {landedCostResult.recommendedRetailPrice.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                      Estimasi Margin: {landedCostResult.marginPercentageAtRetail}% (Rp {landedCostResult.estimatedGrossProfitAtRetail.toLocaleString('id-ID')}/pcs)
                    </span>
                  </div>
                </div>

                {/* Logistics Cost Breakdown Table */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Rincian Alokasi Biaya Logistik:
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Unit Datang:</span>
                      <span className="font-mono font-bold text-slate-900">{landedCostResult.totalUnits} Pcs ({calcInput.totalCartons} Karton)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Ongkos Kapal Laut ({landedCostResult.totalCbm} CBM):</span>
                      <span className="font-mono text-slate-900">Rp {landedCostResult.seaFreightCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Bongkar Pelabuhan (Handling):</span>
                      <span className="font-mono text-slate-900">Rp {landedCostResult.portHandlingCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Trucking ke Gudang Makassar:</span>
                      <span className="font-mono text-slate-900">Rp {landedCostResult.truckingCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
                      <span>Total Biaya Logistik Lintas Pulau:</span>
                      <span className="font-mono text-indigo-600">Rp {landedCostResult.totalLogisticsCost.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* B2B Recommended Wholesale Price */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-amber-600" />
                    <span>Rekomendasi Harga Grosir B2B (+12% Margin):</span>
                  </div>
                  <span className="font-mono font-black text-amber-900 text-sm">
                    Rp {landedCostResult.recommendedWholesalePrice.toLocaleString('id-ID')} / Pcs
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KOMPARASI MULTI-SUPPLIER */}
      {/* ======================================================== */}
      {activeTab === 'COMPARING' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Komparasi Sumber Barang & Efisiensi Suplier</h3>
              <p className="text-xs text-slate-500">Membandingkan harga pabrik luar pulau vs distributor lokal setelah ongkos kapal & pajak.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono font-bold uppercase">Produk:</span>
              <select
                value={compareProductId}
                onChange={(e) => setCompareProductId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {comparisons.map((item, idx) => (
              <div
                key={item.supplierId}
                className={cn(
                  'rounded-3xl p-5 border relative flex flex-col justify-between transition-all duration-200',
                  item.isRecommended
                    ? 'bg-gradient-to-b from-indigo-50/70 to-white border-indigo-300 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 shadow-sm',
                )}
              >
                {item.isRecommended && (
                  <div className="absolute -top-3 left-6 bg-indigo-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Rekomendasi Terbaik</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                        {item.locationCity}
                      </span>
                      {item.isPkp ? (
                        <span className="text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          PKP (Faktur Pajak)
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Non-PKP
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{item.supplierName}</h4>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Harga Pabrik/Beli:</span>
                      <span className="font-mono font-bold text-slate-800">
                        Rp {item.factoryPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ongkos Laut per Unit:</span>
                      <span className="font-mono text-slate-600">+Rp {item.logisticsCostPerUnit.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900">
                      <span>Landed Cost Riil:</span>
                      <span className="font-mono text-indigo-700">
                        Rp {item.netLandedCostPerUnit.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Rute Pengiriman:</span>
                      <span className="truncate max-w-[160px] text-slate-700 font-medium">{item.routeTitle}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Lead Time Pengiriman:</span>
                      <span className="font-mono font-semibold text-slate-800">{item.estimatedLeadTime} Hari</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-emerald-800">Margin di Harga Jual Retail:</span>
                      <span className="font-mono font-black text-emerald-700">
                        {item.marginPct}% (Rp {item.marginRp.toLocaleString('id-ID')})
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl">
                    "{item.recommendationReason}"
                  </p>
                </div>

                <button
                  onClick={() => alert(`Membuat Purchase Order (PO) langsung ke ${item.supplierName}...`)}
                  className={cn(
                    'mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs',
                    item.isRecommended
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800',
                  )}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Pilih Supplier & Buat PO</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SATUAN KONVERSI DINAMIS */}
      {/* ======================================================== */}
      {activeTab === 'CONVERSIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Add Conversion */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Satuan Kemasan Baru</h3>
                <p className="text-[11px] text-slate-500">Dus, Bal, Renceng, Karton tanpa batasan kaku</p>
              </div>
            </div>

            <form onSubmit={handleAddConversion} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Produk:</label>
                <select
                  value={newConvProduct}
                  onChange={(e) => setNewConvProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.baseSku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Satuan Kemasan:</label>
                <input
                  type="text"
                  value={newConvName}
                  onChange={(e) => setNewConvName(e.target.value)}
                  placeholder="Misal: Dus 24, Bal 10 Kg, Renceng 12"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Pcs (Multiplier):</label>
                  <input
                    type="number"
                    value={newConvMultiplier}
                    onChange={(e) => setNewConvMultiplier(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Harga Jual B2B:</label>
                  <input
                    type="number"
                    value={newConvPrice}
                    onChange={(e) => setNewConvPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    placeholder="Rp..."
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Barcode Kemasan (Opsional):</label>
                <input
                  type="text"
                  value={newConvBarcode}
                  onChange={(e) => setNewConvBarcode(e.target.value)}
                  placeholder="Scan barcode dus/kemasan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Satuan Konversi</span>
              </button>
            </form>
          </div>

          {/* List Conversions */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Daftar Satuan Dinamis Terdaftar</span>
              <span className="text-[10px] font-mono text-slate-400 font-normal">
                {conversions.length} Satuan Aktif
              </span>
            </h3>

            <div className="divide-y divide-slate-100">
              {conversions.map((conv) => {
                const prod = products.find((p) => p.id === conv.productId);
                return (
                  <div key={conv.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{conv.unitName}</span>
                        <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                          = {conv.multiplierQty} Unit Dasar
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Produk: {prod?.name || 'Minyak Goreng SunCo 2L Pouch'}
                      </p>
                      {conv.barcode && (
                        <span className="text-[10px] font-mono text-slate-400">Barcode: {conv.barcode}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {conv.priceEstimate ? (
                        <span className="font-mono font-bold text-xs text-slate-800">
                          Rp {conv.priceEstimate.toLocaleString('id-ID')}
                        </span>
                      ) : null}
                      <button
                        onClick={() => handleDeleteConversion(conv.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus satuan"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: FORM GRN + BATCH ENTRY */}
      {/* ======================================================== */}
      {activeTab === 'NEW_BATCH' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Goods Receipt Note (GRN) • Sprint 8
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Pencatatan Penerimaan Barang & Nomor Batch
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Setiap penerimaan barang fisik di gudang wajib menyertakan nomor batch dan tanggal kedaluwarsa untuk mengaktifkan sistem FEFO otomatis.
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.baseSku})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Batch Pabrik:</label>
                <input
                  type="text"
                  value={grnBatchNumber}
                  onChange={(e) => setGrnBatchNumber(e.target.value)}
                  placeholder="Contoh: BATCH-2026-11K"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Kedaluwarsa (Expired Date):</label>
                <input
                  type="date"
                  value={grnExpiryDate}
                  onChange={(e) => setGrnExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Harga Pokok Pembelian (HPP):</label>
                <input
                  type="number"
                  value={grnCostPrice}
                  onChange={(e) => setGrnCostPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Supplier Pengirim:</label>
              <select
                value={grnSupplier}
                onChange={(e) => setGrnSupplier(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="PT Sinar Pangan Nusantara (Surabaya)">PT Sinar Pangan Nusantara (Surabaya)</option>
                <option value="CV Makmur Sejahtera (Jakarta)">CV Makmur Sejahtera (Jakarta)</option>
                <option value="Distributor Sembako Lokal Jaya (Makassar)">Distributor Sembako Lokal Jaya (Makassar)</option>
                <option value="Pabrik Minyak Goreng Sawit Lestari (Semarang)">Pabrik Minyak Goreng Sawit Lestari (Semarang)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition cursor-pointer"
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
