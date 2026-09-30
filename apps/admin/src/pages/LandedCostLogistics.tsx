import React, { useState, useEffect } from 'react';
import {
  Ship,
  Calculator,
  FileSpreadsheet,
  Scale,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  Truck,
  ArrowRight,
  ShieldCheck,
  Percent,
  FileCheck,
  RefreshCw,
  Printer,
  X,
  FileText,
  DollarSign,
  Info,
} from 'lucide-react';
import { ShippingRouteItem } from '@oriental/types';
import { wmsApi } from '../lib/api';
import { cn } from '../lib/utils';
import { useEcosystem } from '../context/EcosystemContext';

// Multi-Product PO Item Interface
interface MultiPoItem {
  id: string;
  productName: string;
  sku: string;
  totalCartons: number;
  unitsPerCarton: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  factoryPricePerUnit: number;
}

// Multi-Item Supplier Comparison Item Interface
interface MultiSupplierItem {
  id: string;
  itemName: string;
  targetQty: number;
  unit: string;
  priceSup1: number | '';
  priceSup2: number | '';
  priceSup3: number | '';
}

// Multi-Item Supplier Audit Document Interface
interface MultiSupplierAuditDoc {
  id: string;
  docNumber: string;
  date: string;
  inspectorName: string;
  sup1Name: string;
  sup1Terms: string;
  sup2Name: string;
  sup2Terms: string;
  sup3Name: string;
  sup3Terms: string;
  items: MultiSupplierItem[];
  totalSup1: number;
  totalSup2: number;
  totalSup3: number;
  cheapestSupplier: string;
  totalSavings: number;
  justificationNotes: string;
}

export const LandedCostLogistics: React.FC = () => {
  const { products } = useEcosystem();

  // Active Sub-Menu (Fixed Navigation)
  const [activeSubMenu, setActiveSubMenu] = useState<
    'LOGISTIK_LAUT' | 'CALCULATOR' | 'MULTI_PO' | 'SUPPLIER_COMPARE'
  >('MULTI_PO');

  // Print Modals
  const [showPrintPoModal, setShowPrintPoModal] = useState(false);
  const [showPrintAuditModal, setShowPrintAuditModal] = useState<MultiSupplierAuditDoc | null>(null);

  // Sub Menu 1: Shipping Routes State
  const [routes, setRoutes] = useState<ShippingRouteItem[]>([]);
  const [newRouteExpedition, setNewRouteExpedition] = useState('');
  const [newRouteOrigin, setNewRouteOrigin] = useState('Tanjung Perak (Surabaya)');
  const [newRouteDest, setNewRouteDest] = useState('Soekarno-Hatta (Makassar)');
  const [newRouteRate, setNewRouteRate] = useState<number>(450000);
  const [newRouteHandling, setNewRouteHandling] = useState<number>(150000);
  const [newRouteTrucking, setNewRouteTrucking] = useState<number>(350000);
  const [newRouteDays, setNewRouteDays] = useState<number>(5);
  const [routeSuccessMsg, setRouteSuccessMsg] = useState('');

  // Sub Menu 2: Single Product Calculator State
  const [calcLength, setCalcLength] = useState<number>(42);
  const [calcWidth, setCalcWidth] = useState<number>(28);
  const [calcHeight, setCalcHeight] = useState<number>(32);
  const [calcCartons, setCalcCartons] = useState<number>(100);
  const [calcUnitsPerCarton, setCalcUnitsPerCarton] = useState<number>(6);
  const [calcFactoryPrice, setCalcFactoryPrice] = useState<number>(30500);
  const [calcSelectedRouteId, setCalcSelectedRouteId] = useState<string>('route-sub-upg');
  const [calcCustomHandling, setCalcCustomHandling] = useState<number>(150000);
  const [calcCustomTrucking, setCalcCustomTrucking] = useState<number>(350000);

  // Sub Menu 3: Multi-Product PO + Container Ongkir Allocation
  const [multiPoNumber] = useState(`PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [multiPoRouteId, setMultiPoRouteId] = useState<string>('route-sub-upg');
  const [multiPoHandling, setMultiPoHandling] = useState<number>(200000);
  const [multiPoTrucking, setMultiPoTrucking] = useState<number>(400000);
  const [multiPoItems, setMultiPoItems] = useState<MultiPoItem[]>([
    {
      id: 'po-item-1',
      productName: 'Minyak Goreng SunCo 2L Pouch',
      sku: 'MKO-SNC-2L',
      totalCartons: 100,
      unitsPerCarton: 6,
      lengthCm: 42,
      widthCm: 28,
      heightCm: 32,
      factoryPricePerUnit: 30500,
    },
    {
      id: 'po-item-2',
      productName: 'Beras Premium Pandan Wangi 5Kg',
      sku: 'BRS-PDW-5K',
      totalCartons: 80,
      unitsPerCarton: 4,
      lengthCm: 45,
      widthCm: 30,
      heightCm: 25,
      factoryPricePerUnit: 68000,
    },
    {
      id: 'po-item-3',
      productName: 'Susu UHT Full Cream Diamond 1L',
      sku: 'SSU-DMD-1L',
      totalCartons: 50,
      unitsPerCarton: 12,
      lengthCm: 38,
      widthCm: 26,
      heightCm: 24,
      factoryPricePerUnit: 17200,
    },
  ]);

  // Sub Menu 4: Multi-Item Anti-Kickback Supplier Comparison Audit Form
  const [auditDocNumber, setAuditDocNumber] = useState(`AUDIT-TENDER-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [auditInspector, setAuditInspector] = useState('Staf Pengadaan Gudang');
  const [sup1Name, setSup1Name] = useState('PT Sinar Pangan (Surabaya)');
  const [sup1Terms, setSup1Terms] = useState('TOP 14 Hari');

  const [sup2Name, setSup2Name] = useState('Pabrik Sawit Lestari (Semarang)');
  const [sup2Terms, setSup2Terms] = useState('Cash Tempo 7 Hari');

  const [sup3Name, setSup3Name] = useState('Distributor Lokal Jaya (Makassar)');
  const [sup3Terms, setSup3Terms] = useState('Cash On Delivery (COD)');

  const [auditJustification, setAuditJustification] = useState('');

  // Multi-Items Comparison rows (Starts Empty/Blank as requested!)
  const [multiAuditItems, setMultiAuditItems] = useState<MultiSupplierItem[]>([
    {
      id: 'item-cmp-1',
      itemName: 'Minyak Goreng Sawit 2L Pouch',
      targetQty: 600,
      unit: 'Pouch',
      priceSup1: '', // Kosong manual
      priceSup2: '', // Kosong manual
      priceSup3: '', // Kosong manual
    },
    {
      id: 'item-cmp-2',
      itemName: 'Beras Premium 5 Kg',
      targetQty: 320,
      unit: 'Zak',
      priceSup1: '', // Kosong manual
      priceSup2: '', // Kosong manual
      priceSup3: '', // Kosong manual
    },
    {
      id: 'item-cmp-3',
      itemName: 'Tepung Terigu Segitiga Biru 1 Kg',
      targetQty: 500,
      unit: 'Bungkus',
      priceSup1: '', // Kosong manual
      priceSup2: '', // Kosong manual
      priceSup3: '', // Kosong manual
    },
  ]);

  const [savedAuditDocs, setSavedAuditDocs] = useState<MultiSupplierAuditDoc[]>([
    {
      id: 'doc-hist-1',
      docNumber: 'AUDIT-TENDER-2026-104',
      date: '2026-09-24',
      inspectorName: 'Ahmad Fauzi (Purchasing Gudang)',
      sup1Name: 'PT Bogasari Surabaya',
      sup1Terms: 'TOP 30 Hari',
      sup2Name: 'Agen Sembako Jawa',
      sup2Terms: 'TOP 14 Hari',
      sup3Name: 'Distributor Lokal Mks',
      sup3Terms: 'Cash',
      items: [
        {
          id: 'i-1',
          itemName: 'Tepung Terigu 1 Kg',
          targetQty: 1000,
          unit: 'Kg',
          priceSup1: 10400,
          priceSup2: 10800,
          priceSup3: 11500,
        },
      ],
      totalSup1: 10400000,
      totalSup2: 10800000,
      totalSup3: 11500000,
      cheapestSupplier: 'PT Bogasari Surabaya',
      totalSavings: 1100000,
      justificationNotes:
        'Supplier 1 harga paling rendah dengan selisih Rp 1.100.000 dibanding lokal dan memberikan termin 30 hari. Bebas kickback.',
    },
  ]);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const fetched = await wmsApi.getShippingRoutes();
      if (fetched && fetched.length > 0) {
        setRoutes(fetched);
        setCalcSelectedRouteId(fetched[0].id);
        setMultiPoRouteId(fetched[0].id);
        setCalcCustomHandling(fetched[0].handlingFee || 150000);
        setCalcCustomTrucking(fetched[0].truckingFee || 350000);
      }
    } catch (e) {
      console.error('Error loading routes:', e);
    }
  };

  // Add Route
  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteExpedition) return;

    const dto = {
      expeditionName: newRouteExpedition,
      originPort: newRouteOrigin,
      destinationPort: newRouteDest,
      ratePerCbm: Number(newRouteRate),
      handlingFee: Number(newRouteHandling),
      truckingFee: Number(newRouteTrucking),
      estimatedDays: Number(newRouteDays),
    };

    const created = await wmsApi.createShippingRoute(dto);
    if (created) {
      setRoutes((prev) => [...prev, created]);
      setRouteSuccessMsg(`Rute ekspedisi "${created.expeditionName}" berhasil didaftarkan!`);
      setNewRouteExpedition('');
      setTimeout(() => setRouteSuccessMsg(''), 4000);
    }
  };

  // Single Item Landed Cost Calculation
  const selectedRoute = routes.find((r) => r.id === calcSelectedRouteId) || routes[0] || {
    ratePerCbm: 425000,
    minCbm: 1.5,
    handlingFee: 150000,
    truckingFee: 350000,
  };

  const calcCbmPerCarton = (calcLength * calcWidth * calcHeight) / 1000000;
  const calcTotalCbm = calcCbmPerCarton * calcCartons;
  const calcBillableCbm = Math.max(calcTotalCbm, (selectedRoute as any).minCbm || 1);
  const calcSeaFreightCost = calcBillableCbm * selectedRoute.ratePerCbm;
  const calcTotalOngkir = calcSeaFreightCost + Number(calcCustomHandling) + Number(calcCustomTrucking);
  const calcTotalUnits = calcCartons * calcUnitsPerCarton;
  const calcOngkirPerUnit = calcTotalUnits > 0 ? Math.round(calcTotalOngkir / calcTotalUnits) : 0;
  const calcNetLandedCost = calcFactoryPrice + calcOngkirPerUnit;
  const calcTotalInvestment = calcNetLandedCost * calcTotalUnits;

  // Multi-PO Calculation
  const multiPoRoute = routes.find((r) => r.id === multiPoRouteId) || routes[0] || {
    expeditionName: 'Meratus Line Cargo',
    originPort: 'Tanjung Perak (Surabaya)',
    destinationPort: 'Soekarno-Hatta (Makassar)',
    ratePerCbm: 425000,
  };

  const itemsWithCbm = multiPoItems.map((item) => {
    const cbmPerBox = (item.lengthCm * item.widthCm * item.heightCm) / 1000000;
    const totalItemCbm = cbmPerBox * item.totalCartons;
    const totalItemUnits = item.totalCartons * item.unitsPerCarton;
    const factorySubtotal = item.factoryPricePerUnit * totalItemUnits;
    return {
      ...item,
      cbmPerBox,
      totalItemCbm,
      totalItemUnits,
      factorySubtotal,
    };
  });

  const totalPoCbm = itemsWithCbm.reduce((acc, it) => acc + it.totalItemCbm, 0);
  const totalSeaFreight = totalPoCbm * multiPoRoute.ratePerCbm;
  const totalPoLogistics = totalSeaFreight + Number(multiPoHandling) + Number(multiPoTrucking);
  const totalPoFactoryCost = itemsWithCbm.reduce((acc, it) => acc + it.factorySubtotal, 0);
  const grandTotalLandedCost = totalPoFactoryCost + totalPoLogistics;

  // Proportional allocation of logistics cost per product
  const itemsAllocated = itemsWithCbm.map((it) => {
    const cbmSharePct = totalPoCbm > 0 ? it.totalItemCbm / totalPoCbm : 0;
    const allocatedOngkir = Math.round(cbmSharePct * totalPoLogistics);
    const ongkirPerUnit = it.totalItemUnits > 0 ? Math.round(allocatedOngkir / it.totalItemUnits) : 0;
    const landedCostPerUnit = it.factoryPricePerUnit + ongkirPerUnit;
    const itemSubtotalLanded = landedCostPerUnit * it.totalItemUnits;
    return {
      ...it,
      cbmSharePct: (cbmSharePct * 100).toFixed(1),
      allocatedOngkir,
      ongkirPerUnit,
      landedCostPerUnit,
      itemSubtotalLanded,
    };
  });

  const handleAddPoRow = () => {
    const newRow: MultiPoItem = {
      id: `po-item-${Date.now()}`,
      productName: 'Barang Tambahan Baru',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      totalCartons: 50,
      unitsPerCarton: 12,
      lengthCm: 35,
      widthCm: 25,
      heightCm: 25,
      factoryPricePerUnit: 25000,
    };
    setMultiPoItems((prev) => [...prev, newRow]);
  };

  const handleDeletePoRow = (id: string) => {
    setMultiPoItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Multi-Item Comparison Calculations
  const calculatedAuditItems = multiAuditItems.map((item) => {
    const p1 = typeof item.priceSup1 === 'number' ? item.priceSup1 : 0;
    const p2 = typeof item.priceSup2 === 'number' ? item.priceSup2 : 0;
    const p3 = typeof item.priceSup3 === 'number' ? item.priceSup3 : 0;

    const validPrices = [
      { sup: 'A', price: p1, name: sup1Name },
      { sup: 'B', price: p2, name: sup2Name },
      { sup: 'C', price: p3, name: sup3Name },
    ].filter((p) => p.price > 0);

    validPrices.sort((a, b) => a.price - b.price);
    const cheapest = validPrices.length > 0 ? validPrices[0] : null;
    const highest = validPrices.length > 1 ? validPrices[validPrices.length - 1] : null;
    const unitSaving = cheapest && highest ? highest.price - cheapest.price : 0;
    const totalSavingItem = unitSaving * item.targetQty;

    return {
      ...item,
      subtotalSup1: p1 * item.targetQty,
      subtotalSup2: p2 * item.targetQty,
      subtotalSup3: p3 * item.targetQty,
      cheapest,
      unitSaving,
      totalSavingItem,
    };
  });

  const totalBasketSup1 = calculatedAuditItems.reduce((acc, it) => acc + it.subtotalSup1, 0);
  const totalBasketSup2 = calculatedAuditItems.reduce((acc, it) => acc + it.subtotalSup2, 0);
  const totalBasketSup3 = calculatedAuditItems.reduce((acc, it) => acc + it.subtotalSup3, 0);

  const basketOptions = [
    { name: sup1Name, total: totalBasketSup1 },
    { name: sup2Name, total: totalBasketSup2 },
    { name: sup3Name, total: totalBasketSup3 },
  ].filter((b) => b.total > 0);
  basketOptions.sort((a, b) => a.total - b.total);
  const overallCheapest = basketOptions[0] || null;
  const overallExpensive = basketOptions[basketOptions.length - 1] || null;
  const overallEstimatedSavings = overallCheapest && overallExpensive ? overallExpensive.total - overallCheapest.total : 0;

  // Add Item to Comparison Form
  const handleAddAuditItemRow = () => {
    const newItem: MultiSupplierItem = {
      id: `cmp-${Date.now()}`,
      itemName: 'Item Tender Baru',
      targetQty: 100,
      unit: 'Pcs',
      priceSup1: '',
      priceSup2: '',
      priceSup3: '',
    };
    setMultiAuditItems((prev) => [...prev, newItem]);
  };

  const handleDeleteAuditItemRow = (id: string) => {
    setMultiAuditItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Save Multi-Item Audit
  const handleSaveMultiAudit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasMissing = multiAuditItems.some(
      (it) => it.priceSup1 === '' || it.priceSup2 === '' || it.priceSup3 === '',
    );

    if (hasMissing) {
      if (!confirm('Ada harga item yang belum lengkap terisi. Apakah Anda tetap ingin menyimpan berita acara audit ini?')) {
        return;
      }
    }

    const newDoc: MultiSupplierAuditDoc = {
      id: `doc-${Date.now()}`,
      docNumber: auditDocNumber,
      date: new Date().toISOString().split('T')[0],
      inspectorName: auditInspector,
      sup1Name,
      sup1Terms,
      sup2Name,
      sup2Terms,
      sup3Name,
      sup3Terms,
      items: multiAuditItems,
      totalSup1: totalBasketSup1,
      totalSup2: totalBasketSup2,
      totalSup3: totalBasketSup3,
      cheapestSupplier: overallCheapest ? overallCheapest.name : sup1Name,
      totalSavings: overallEstimatedSavings,
      justificationNotes:
        auditJustification ||
        `Rekomendasi sistem: Memilih ${overallCheapest?.name} dengan total nilai keranjang terendah dan penghematan Rp ${overallEstimatedSavings.toLocaleString('id-ID')}. Bebas benturan kepentingan dan kickback.`,
    };

    setSavedAuditDocs((prev) => [newDoc, ...prev]);
    alert(`Berita Acara Komparasi Multi-Item ${auditDocNumber} berhasil disimpan ke arsip pertanggungjawaban!`);
    setAuditDocNumber(`AUDIT-TENDER-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 min-w-0 max-w-full overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
              Divisi Pengadaan & Logistik Lintas Pulau
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
              Anti-Kickback Audit Multi-Item
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Ship className="w-7 h-7 text-indigo-400" />
            Landed Cost Laut & Pengadaan Barang
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Pusat perhitungan ongkos kapal ekspedisi laut per $m^3$ (CBM), cetak dokumen List PO kontainer multi-produk, serta audit komparasi 3 supplier multi-item bebas kickback.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FIXED / STICKY SUB-MENU NAVIGATION BAR (Window Fixed) */}
      {/* ======================================================== */}
      <div className="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur-md py-2.5 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubMenu('MULTI_PO')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
              activeSubMenu === 'MULTI_PO'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
            )}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sub Menu 1: List PO Multi-Produk + Ongkir Kontainer</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-800 text-indigo-100">
              {multiPoItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubMenu('SUPPLIER_COMPARE')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
              activeSubMenu === 'SUPPLIER_COMPARE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
            )}
          >
            <Scale className="w-4 h-4" />
            <span>Sub Menu 2: Komparasi 3 Supplier Multi-Item (Audit)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
              {multiAuditItems.length} Item
            </span>
          </button>

          <button
            onClick={() => setActiveSubMenu('CALCULATOR')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer',
              activeSubMenu === 'CALCULATOR'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
            )}
          >
            <Calculator className="w-4 h-4" />
            <span>Sub Menu 3: Calculator Landed Cost (Single Item)</span>
          </button>

          <button
            onClick={() => setActiveSubMenu('LOGISTIK_LAUT')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ml-auto',
              activeSubMenu === 'LOGISTIK_LAUT'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200',
            )}
          >
            <Truck className="w-4 h-4" />
            <span>Sub Menu 4: Master Ekspedisi Laut</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {routes.length}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB MENU: LIST PO MULTI-PRODUK + ONGKIR KONTAINER */}
      {/* ======================================================== */}
      {activeSubMenu === 'MULTI_PO' && (
        <div className="space-y-6">
          {/* Header Card with Buttons */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    No. PO: {multiPoNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  List Order PO Multi-Produk & Alokasi Kubikasi Kontainer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap barang dihitung CBM fisiknya. Biaya kontainer dan port handling dibagi rata secara proporsional ke HPP tiap barang.
                </p>
              </div>

              {/* ACTION BUTTONS: CETAK PO & TAMBAH BARIS */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPrintPoModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
                  title="Cetak Purchase Order Lengkap dengan Alokasi Ongkir"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen PO & Ongkir</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddPoRow}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Baris Produk</span>
                </button>
              </div>
            </div>

            {/* Container Level Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Ekspedisi Laut:</label>
                <select
                  value={multiPoRouteId}
                  onChange={(e) => setMultiPoRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.expeditionName} (Rp {r.ratePerCbm?.toLocaleString('id-ID')}/CBM)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Handling Pelabuhan Kontainer:</label>
                <input
                  type="number"
                  value={multiPoHandling}
                  onChange={(e) => setMultiPoHandling(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Trucking Gudang Kontainer:</label>
                <input
                  type="number"
                  value={multiPoTrucking}
                  onChange={(e) => setMultiPoTrucking(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Multi-Products Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-3">Nama Produk & SKU</th>
                    <th className="py-3.5 px-3">Dimensi Box ($P \times L \times T$ cm)</th>
                    <th className="py-3.5 px-3">Qty Karton</th>
                    <th className="py-3.5 px-3">Isi / Box</th>
                    <th className="py-3.5 px-3">Total CBM</th>
                    <th className="py-3.5 px-3">Harga Beli Pabrik</th>
                    <th className="py-3.5 px-3">Alokasi Ongkir / Pcs</th>
                    <th className="py-3.5 px-3">Net Landed Cost HPP</th>
                    <th className="py-3.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsAllocated.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={it.productName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMultiPoItems((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, productName: val } : item)),
                            );
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 font-bold text-slate-900"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <input
                            type="number"
                            value={it.lengthCm}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setMultiPoItems((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, lengthCm: val } : item)),
                              );
                            }}
                            className="w-11 px-1 py-1 rounded border border-slate-200 text-center"
                          />
                          <span>x</span>
                          <input
                            type="number"
                            value={it.widthCm}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setMultiPoItems((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, widthCm: val } : item)),
                              );
                            }}
                            className="w-11 px-1 py-1 rounded border border-slate-200 text-center"
                          />
                          <span>x</span>
                          <input
                            type="number"
                            value={it.heightCm}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setMultiPoItems((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, heightCm: val } : item)),
                              );
                            }}
                            className="w-11 px-1 py-1 rounded border border-slate-200 text-center"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={it.totalCartons}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMultiPoItems((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, totalCartons: val } : item)),
                            );
                          }}
                          className="w-16 px-2 py-1 rounded-lg border border-slate-200 font-mono font-bold"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={it.unitsPerCarton}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMultiPoItems((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, unitsPerCarton: val } : item)),
                            );
                          }}
                          className="w-14 px-2 py-1 rounded-lg border border-slate-200 font-mono"
                        />
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {it.totalItemCbm.toFixed(3)} $m^3$
                        <span className="block text-[10px] text-slate-400">({it.cbmSharePct}%)</span>
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={it.factoryPricePerUnit}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMultiPoItems((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, factoryPricePerUnit: val } : item,
                              ),
                            );
                          }}
                          className="w-24 px-2 py-1 rounded-lg border border-slate-200 font-mono text-slate-800"
                        />
                      </td>

                      <td className="py-3 px-3 font-mono text-amber-700 font-semibold">
                        +Rp {it.ongkirPerUnit.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 font-mono font-black text-emerald-700 text-xs">
                        Rp {it.landedCostPerUnit.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeletePoRow(it.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Footer Summary with Print Button */}
            <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                  Rekapitulasi Pengiriman Kontainer ({multiPoItems.length} Produk Terdaftar)
                </span>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span>Total CBM: <strong className="text-indigo-300 font-mono">{totalPoCbm.toFixed(3)} $m^3$</strong></span>
                  <span>•</span>
                  <span>Total Ongkir Kapal: <strong className="text-amber-300 font-mono">Rp {totalPoLogistics.toLocaleString('id-ID')}</strong></span>
                  <span>•</span>
                  <span>Ekspedisi: <strong className="text-slate-200">{multiPoRoute.expeditionName}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">
                    Grand Total Nilai PO (HPP Masuk Gudang)
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    Rp {grandTotalLandedCost.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPrintPoModal(true)}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen PO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB MENU: KOMPARASI 3 PENAWARAN SUPPLIER (MULTI-ITEM FORM) */}
      {/* ======================================================== */}
      {activeSubMenu === 'SUPPLIER_COMPARE' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            {/* Form Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Formulir Audit Pengadaan Multi-Item
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{auditDocNumber}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Komparasi Multi-Item 3 Supplier Rekanan (Anti-Kickback)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input manual harga dari 3 penawaran vendor untuk setiap barang tender. Memastikan pertanggungjawaban transparansi bebas kickback.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddAuditItemRow}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm self-start lg:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item Barang Tender</span>
              </button>
            </div>

            <form onSubmit={handleSaveMultiAudit} className="space-y-5 text-xs">
              {/* Header Info: 3 Suppliers Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Petugas Penginput:</label>
                  <input
                    type="text"
                    value={auditInspector}
                    onChange={(e) => setAuditInspector(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-indigo-700 block mb-1">1. Supplier Rekanan A:</label>
                  <input
                    type="text"
                    value={sup1Name}
                    onChange={(e) => setSup1Name(e.target.value)}
                    placeholder="Nama Supplier 1"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-200 font-bold bg-white"
                    required
                  />
                  <input
                    type="text"
                    value={sup1Terms}
                    onChange={(e) => setSup1Terms(e.target.value)}
                    placeholder="Termin e.g. TOP 14d"
                    className="w-full px-2.5 py-1 rounded border border-slate-200 text-[10px] text-slate-600 mt-1 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-teal-700 block mb-1">2. Supplier Rekanan B:</label>
                  <input
                    type="text"
                    value={sup2Name}
                    onChange={(e) => setSup2Name(e.target.value)}
                    placeholder="Nama Supplier 2"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-teal-200 font-bold bg-white"
                    required
                  />
                  <input
                    type="text"
                    value={sup2Terms}
                    onChange={(e) => setSup2Terms(e.target.value)}
                    placeholder="Termin e.g. Tempo 7d"
                    className="w-full px-2.5 py-1 rounded border border-slate-200 text-[10px] text-slate-600 mt-1 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-700 block mb-1">3. Supplier Rekanan C:</label>
                  <input
                    type="text"
                    value={sup3Name}
                    onChange={(e) => setSup3Name(e.target.value)}
                    placeholder="Nama Supplier 3"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 font-bold bg-white"
                    required
                  />
                  <input
                    type="text"
                    value={sup3Terms}
                    onChange={(e) => setSup3Terms(e.target.value)}
                    placeholder="Termin e.g. COD"
                    className="w-full px-2.5 py-1 rounded border border-slate-200 text-[10px] text-slate-600 mt-1 bg-white"
                  />
                </div>
              </div>

              {/* Multi-Item Tender Comparison Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-3">No</th>
                        <th className="py-3 px-3">Nama Barang / Spesifikasi</th>
                        <th className="py-3 px-3">Target Qty</th>
                        <th className="py-3 px-3 bg-indigo-50/70 text-indigo-900 border-x border-indigo-100">
                          Harga {sup1Name || 'Sup 1'} (Rp)
                        </th>
                        <th className="py-3 px-3 bg-teal-50/70 text-teal-900 border-r border-teal-100">
                          Harga {sup2Name || 'Sup 2'} (Rp)
                        </th>
                        <th className="py-3 px-3 bg-amber-50/70 text-amber-900 border-r border-amber-100">
                          Harga {sup3Name || 'Sup 3'} (Rp)
                        </th>
                        <th className="py-3 px-3">Vendor Termurah</th>
                        <th className="py-3 px-3">Selisih Hemat</th>
                        <th className="py-3 px-3 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calculatedAuditItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMultiAuditItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, itemName: val } : it)),
                                );
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-200 font-bold text-slate-800"
                              placeholder="Nama barang..."
                              required
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1 font-mono">
                              <input
                                type="number"
                                value={item.targetQty}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setMultiAuditItems((prev) =>
                                    prev.map((it, i) => (i === idx ? { ...it, targetQty: val } : it)),
                                  );
                                }}
                                className="w-16 px-1.5 py-1 rounded border border-slate-200 text-center font-bold"
                              />
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMultiAuditItems((prev) =>
                                    prev.map((it, i) => (i === idx ? { ...it, unit: val } : it)),
                                  );
                                }}
                                className="w-14 px-1 py-1 rounded border border-slate-200 text-[10px] text-slate-500 text-center"
                              />
                            </div>
                          </td>

                          {/* Supplier 1 Price Input (Blank initially) */}
                          <td className="py-2.5 px-3 bg-indigo-50/30 border-x border-indigo-100">
                            <input
                              type="number"
                              value={item.priceSup1}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value);
                                setMultiAuditItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, priceSup1: val } : it)),
                                );
                              }}
                              placeholder="Ketik harga..."
                              className="w-28 px-2 py-1 rounded border border-indigo-300 font-mono font-bold bg-white text-slate-900"
                            />
                          </td>

                          {/* Supplier 2 Price Input (Blank initially) */}
                          <td className="py-2.5 px-3 bg-teal-50/30 border-r border-teal-100">
                            <input
                              type="number"
                              value={item.priceSup2}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value);
                                setMultiAuditItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, priceSup2: val } : it)),
                                );
                              }}
                              placeholder="Ketik harga..."
                              className="w-28 px-2 py-1 rounded border border-teal-300 font-mono font-bold bg-white text-slate-900"
                            />
                          </td>

                          {/* Supplier 3 Price Input (Blank initially) */}
                          <td className="py-2.5 px-3 bg-amber-50/30 border-r border-amber-100">
                            <input
                              type="number"
                              value={item.priceSup3}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value);
                                setMultiAuditItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, priceSup3: val } : it)),
                                );
                              }}
                              placeholder="Ketik harga..."
                              className="w-28 px-2 py-1 rounded border border-amber-300 font-mono font-bold bg-white text-slate-900"
                            />
                          </td>

                          {/* Cheapest Auto-Tag */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {item.cheapest ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {item.cheapest.name.split(' ')[0]} (Rp {item.cheapest.price.toLocaleString('id-ID')})
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum ada harga</span>
                            )}
                          </td>

                          {/* Savings */}
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                            {item.unitSaving > 0 ? (
                              <>
                                +Rp {item.unitSaving.toLocaleString('id-ID')}
                                <span className="block text-[10px] text-slate-400">
                                  Total: Rp {item.totalSavingItem.toLocaleString('id-ID')}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteAuditItemRow(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Hapus baris item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Basket Totals */}
                <div className="bg-slate-900 text-white p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Keranjang {sup1Name}:</span>
                    <strong className="text-indigo-300 text-sm">Rp {totalBasketSup1.toLocaleString('id-ID')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Keranjang {sup2Name}:</span>
                    <strong className="text-teal-300 text-sm">Rp {totalBasketSup2.toLocaleString('id-ID')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Total Keranjang {sup3Name}:</span>
                    <strong className="text-amber-300 text-sm">Rp {totalBasketSup3.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/40">
                    <span className="text-emerald-400 text-[10px] block font-bold">Rekomendasi Termurah:</span>
                    <strong className="text-emerald-300 text-sm">{overallCheapest?.name || '-'}</strong>
                    <span className="block text-[10px] text-slate-300">
                      Potensi Hemat: Rp {overallEstimatedSavings.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Justification Textarea */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Pertanggungjawaban / Alasan Keputusan Pemilihan Vendor ke Atasan:
                </label>
                <textarea
                  value={auditJustification}
                  onChange={(e) => setAuditJustification(e.target.value)}
                  placeholder="Contoh: Kami memilih Supplier A karena total penawaran Rp 1.500.000 lebih hemat dan tempo pembayaran 14 hari sesuai kebijakan kas Oriental. Tidak ada kickback atau hubungan afiliasi pribadi."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 text-xs"
                  rows={2}
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Simpan & Kunci Berita Acara Komparasi Supplier</span>
                </button>
              </div>
            </form>
          </div>

          {/* Historical Saved Audit Documents */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Arsip Berita Acara Komparasi Multi-Item yang Telah Disimpan</span>
              <span className="text-[10px] font-mono text-slate-400">{savedAuditDocs.length} Dokumen Audit</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {savedAuditDocs.map((doc) => (
                <div key={doc.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{doc.docNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Tgl: {doc.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Penginput: <strong>{doc.inspectorName}</strong> • Rekanan: {doc.sup1Name}, {doc.sup2Name}, {doc.sup3Name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Vendor Terpilih: {doc.cheapestSupplier}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPrintAuditModal(doc)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
                        title="Cetak Berita Acara Audit"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    "{doc.justificationNotes}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB MENU: CALCULATOR LANDED COST (SINGLE ITEM) */}
      {/* ======================================================== */}
      {activeSubMenu === 'CALCULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Parameters */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Kalkulator CBM & HPP Mendarat
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Kalkulasi Logistik Satuan Tunggal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hitung biaya kapal laut per pcs berdasarkan kubikasi fisik karton tanpa mark up retail.
              </p>
            </div>

            {/* Dimension Inputs */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Dimensi 1 Karton Master Box ($P \times L \times T$ dalam cm):
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Panjang (cm)</span>
                  <input
                    type="number"
                    value={calcLength}
                    onChange={(e) => setCalcLength(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Lebar (cm)</span>
                  <input
                    type="number"
                    value={calcWidth}
                    onChange={(e) => setCalcWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Tinggi (cm)</span>
                  <input
                    type="number"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jumlah Karton Dikirim:</label>
                <input
                  type="number"
                  value={calcCartons}
                  onChange={(e) => setCalcCartons(Number(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Isi Unit per Karton (Pcs):</label>
                <input
                  type="number"
                  value={calcUnitsPerCarton}
                  onChange={(e) => setCalcUnitsPerCarton(Number(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Harga Beli Pabrik Satuan (per Pcs):</label>
              <input
                type="number"
                value={calcFactoryPrice}
                onChange={(e) => setCalcFactoryPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Route Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Rute Ekspedisi Laut:</label>
              <select
                value={calcSelectedRouteId}
                onChange={(e) => {
                  setCalcSelectedRouteId(e.target.value);
                  const matched = routes.find((r) => r.id === e.target.value);
                  if (matched) {
                    setCalcCustomHandling(matched.handlingFee);
                    setCalcCustomTrucking(matched.truckingFee);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.expeditionName} (Rp {r.ratePerCbm?.toLocaleString('id-ID')}/CBM)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Handling Pelabuhan (Rp):</label>
                <input
                  type="number"
                  value={calcCustomHandling}
                  onChange={(e) => setCalcCustomHandling(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Trucking Gudang (Rp):</label>
                <input
                  type="number"
                  value={calcCustomTrucking}
                  onChange={(e) => setCalcCustomTrucking(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Output Card */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Hasil Perhitungan HPP Riil
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">Net Landed Cost di Gudang</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Volume Total</span>
                  <span className="text-base font-black font-mono text-indigo-700">
                    {calcTotalCbm.toFixed(3)} $m^3$ (CBM)
                  </span>
                </div>
              </div>

              {/* Big Highlight Box */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Net Landed Cost per Pcs (HPP Akhir Masuk Gudang)
                </span>
                <span className="text-3xl font-black font-mono text-emerald-400 block">
                  Rp {calcNetLandedCost.toLocaleString('id-ID')}
                </span>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <span>Harga Beli Pabrik:</span>
                  <span className="font-mono">Rp {calcFactoryPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Alokasi Ongkir Kapal per Pcs:</span>
                  <span className="font-mono text-amber-300">+Rp {calcOngkirPerUnit.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Step-by-Step Logistics Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Rincian Transparansi Ongkos Kirim:
                </h4>
                <div className="flex justify-between text-slate-600">
                  <span>Volume 1 Karton:</span>
                  <span className="font-mono">{calcCbmPerCarton.toFixed(4)} $m^3$</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Volume ({calcCartons} Karton):</span>
                  <span className="font-mono font-bold text-slate-900">{calcTotalCbm.toFixed(3)} $m^3$</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kapal Laut ({calcBillableCbm.toFixed(2)} CBM billable):</span>
                  <span className="font-mono">Rp {calcSeaFreightCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Handling Pelabuhan:</span>
                  <span className="font-mono">Rp {Number(calcCustomHandling).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Trucking ke Gudang:</span>
                  <span className="font-mono">Rp {Number(calcCustomTrucking).toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total Biaya Logistik Ekspedisi:</span>
                  <span className="font-mono text-indigo-700">Rp {calcTotalOngkir.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total Nilai Pengadaan ({calcTotalUnits} Unit):</span>
                  <span className="font-mono text-emerald-700">Rp {calcTotalInvestment.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB MENU: MASTER EKSPEDISI LAUT */}
      {/* ======================================================== */}
      {activeSubMenu === 'LOGISTIK_LAUT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Route Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Master Data Ekspedisi
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">Daftarkan Rute Ekspedisi Laut</h3>
            </div>

            {routeSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{routeSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddRoute} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Ekspedisi / Kapal:</label>
                <input
                  type="text"
                  value={newRouteExpedition}
                  onChange={(e) => setNewRouteExpedition(e.target.value)}
                  placeholder="Contoh: Meratus Line Cargo / Pelni Tol Laut"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pelabuhan Asal:</label>
                  <input
                    type="text"
                    value={newRouteOrigin}
                    onChange={(e) => setNewRouteOrigin(e.target.value)}
                    placeholder="Pelabuhan Asal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pelabuhan Tujuan:</label>
                  <input
                    type="text"
                    value={newRouteDest}
                    onChange={(e) => setNewRouteDest(e.target.value)}
                    placeholder="Pelabuhan Tujuan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarif per $m^3$ (CBM):</label>
                  <input
                    type="number"
                    value={newRouteRate}
                    onChange={(e) => setNewRouteRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Waktu (Hari):</label>
                  <input
                    type="number"
                    value={newRouteDays}
                    onChange={(e) => setNewRouteDays(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Biaya Handling Pelabuhan:</label>
                  <input
                    type="number"
                    value={newRouteHandling}
                    onChange={(e) => setNewRouteHandling(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Biaya Trucking ke Gudang:</label>
                  <input
                    type="number"
                    value={newRouteTrucking}
                    onChange={(e) => setNewRouteTrucking(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Master Ekspedisi</span>
              </button>
            </form>
          </div>

          {/* Routes Table */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Daftar Rute Ekspedisi Aktif</span>
              <span className="text-[10px] font-mono text-slate-400 font-normal">{routes.length} Rute</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {routes.map((r) => (
                <div key={r.id} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{r.expeditionName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {r.originPort} ➔ {r.destinationPort}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-indigo-700 block">
                        Rp {r.ratePerCbm?.toLocaleString('id-ID')} / CBM
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Lead Time: {r.estimatedDays} Hari</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CETAK DOKUMEN PURCHASE ORDER (PO) & ONGKIR */}
      {/* ======================================================== */}
      {showPrintPoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp text-slate-900">
            {/* Modal Controls Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <span className="font-black text-slate-900 text-sm">Pratinjau Dokumen Cetak Purchase Order</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/25"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen Sekarang (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintPoModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Printable Document Sheet */}
            <div id="printable-po-doc" className="space-y-6 text-xs text-slate-800 font-sans">
              {/* Company & Document Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-black text-sm flex items-center justify-center">
                      O
                    </div>
                    <span className="font-black tracking-tight text-base font-outfit text-slate-900">
                      ORIENTAL DIGITAL ECOSYSTEM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Divisi Pengadaan Barang & Logistik Antar-Pulau • Pergudangan Utama Makassar
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Telp: +62 811-4400-8800 • Email: purchasing@oriental.co.id
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-base font-black tracking-wider uppercase text-slate-900 block font-mono">
                    PURCHASE ORDER & ONGKIR
                  </span>
                  <span className="text-xs font-bold font-mono text-indigo-700 block">
                    No: {multiPoNumber}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </span>
                </div>
              </div>

              {/* Shipping Logistics Route Box */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Rute & Ekspedisi Pengiriman Kapal:
                  </span>
                  <strong className="text-xs text-slate-900 block mt-0.5">{multiPoRoute.expeditionName}</strong>
                  <span className="text-[11px] text-slate-600 font-mono">
                    {multiPoRoute.originPort} ➔ {multiPoRoute.destinationPort}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Total Kubikasi Kontainer:
                  </span>
                  <strong className="text-sm font-black font-mono text-indigo-700 block mt-0.5">
                    {totalPoCbm.toFixed(3)} $m^3$ (CBM)
                  </strong>
                  <span className="text-[11px] text-slate-600 font-mono">
                    Tarif: Rp {multiPoRoute.ratePerCbm?.toLocaleString('id-ID')}/CBM
                  </span>
                </div>
              </div>

              {/* Product Lines Table */}
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-mono uppercase text-[10px] text-slate-700 border-b border-slate-200">
                    <th className="p-2 border border-slate-200">No</th>
                    <th className="p-2 border border-slate-200">Nama Barang & SKU</th>
                    <th className="p-2 border border-slate-200 text-center">Box</th>
                    <th className="p-2 border border-slate-200 text-center">Isi/Box</th>
                    <th className="p-2 border border-slate-200 text-center">Total Pcs</th>
                    <th className="p-2 border border-slate-200 text-right">CBM Total</th>
                    <th className="p-2 border border-slate-200 text-right">Harga Pabrik</th>
                    <th className="p-2 border border-slate-200 text-right">Ongkir/Pcs</th>
                    <th className="p-2 border border-slate-200 text-right">HPP Mendarat</th>
                    <th className="p-2 border border-slate-200 text-right">Subtotal Landed</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsAllocated.map((it, idx) => (
                    <tr key={it.id} className="border-b border-slate-100 font-mono text-[11px]">
                      <td className="p-2 border border-slate-200 text-center">{idx + 1}</td>
                      <td className="p-2 border border-slate-200 font-sans font-bold text-slate-900">
                        {it.productName}
                      </td>
                      <td className="p-2 border border-slate-200 text-center font-bold">{it.totalCartons}</td>
                      <td className="p-2 border border-slate-200 text-center">{it.unitsPerCarton}</td>
                      <td className="p-2 border border-slate-200 text-center font-bold text-slate-900">
                        {it.totalItemUnits}
                      </td>
                      <td className="p-2 border border-slate-200 text-right text-indigo-700 font-bold">
                        {it.totalItemCbm.toFixed(3)} $m^3$
                      </td>
                      <td className="p-2 border border-slate-200 text-right">
                        Rp {it.factoryPricePerUnit.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-200 text-right text-amber-700 font-semibold">
                        +Rp {it.ongkirPerUnit.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-200 text-right text-emerald-700 font-bold">
                        Rp {it.landedCostPerUnit.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-200 text-right font-black text-slate-900">
                        Rp {it.itemSubtotalLanded.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cost Allocation Summary Box */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                  <span className="font-bold text-slate-700 uppercase font-mono block mb-1">
                    Rincian Alokasi Biaya Ekspedisi Kapal:
                  </span>
                  <div className="flex justify-between">
                    <span>Ongkos Kapal Laut ({totalPoCbm.toFixed(3)} CBM):</span>
                    <span className="font-mono">Rp {totalSeaFreight.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling Pelabuhan Kontainer:</span>
                    <span className="font-mono">Rp {Number(multiPoHandling).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trucking ke Gudang:</span>
                    <span className="font-mono">Rp {Number(multiPoTrucking).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-indigo-700">
                    <span>Total Biaya Logistik:</span>
                    <span className="font-mono">Rp {totalPoLogistics.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1 text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">
                    Grand Total Nilai PO (Landed Cost Masuk Gudang)
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-400 block">
                    Rp {grandTotalLandedCost.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Terdiri dari Rp {totalPoFactoryCost.toLocaleString('id-ID')} (Harga Pabrik) + Rp {totalPoLogistics.toLocaleString('id-ID')} (Ongkir Kontainer)
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-center">
                <div className="space-y-12">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Dibuat Oleh (Purchasing)
                  </span>
                  <span className="block border-t border-slate-300 pt-1 font-bold text-xs">
                    ( .................................... )
                  </span>
                </div>
                <div className="space-y-12">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Penerima Fisik (Staff Gudang)
                  </span>
                  <span className="block border-t border-slate-300 pt-1 font-bold text-xs">
                    ( .................................... )
                  </span>
                </div>
                <div className="space-y-12">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Disetujui Oleh (Super Admin / Owner)
                  </span>
                  <span className="block border-t border-slate-300 pt-1 font-bold text-xs">
                    ( .................................... )
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CETAK BERITA ACARA AUDIT KOMPARASI 3 SUPPLIER */}
      {/* ======================================================== */}
      {showPrintAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-black text-slate-900 text-sm">Pratinjau Berita Acara Audit Komparasi Vendor</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Berita Acara (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintAuditModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="space-y-5 text-xs text-slate-800">
              <div className="text-center space-y-1 border-b pb-3">
                <h2 className="font-black text-base text-slate-900 tracking-wide uppercase font-mono">
                  BERITA ACARA AUDIT KOMPARASI 3 REKANAN SUPPLIER
                </h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  No. Dokumen: {showPrintAuditModal.docNumber} • Tanggal: {showPrintAuditModal.date}
                </p>
                <p className="text-[10px] text-slate-400">
                  Pernyataan Integritas Pengadaan Barang Bebas Benturan Kepentingan & Kickback Personal
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">Petugas Verifikator:</span>
                  <strong>{showPrintAuditModal.inspectorName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Rekomendasi Terpilih:</span>
                  <strong className="text-emerald-700">{showPrintAuditModal.cheapestSupplier}</strong>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[10px] uppercase font-mono text-slate-700 border-b">
                    <th className="p-2 border">Nama Barang</th>
                    <th className="p-2 border text-center">Qty</th>
                    <th className="p-2 border text-right">Harga {showPrintAuditModal.sup1Name}</th>
                    <th className="p-2 border text-right">Harga {showPrintAuditModal.sup2Name}</th>
                    <th className="p-2 border text-right">Harga {showPrintAuditModal.sup3Name}</th>
                  </tr>
                </thead>
                <tbody>
                  {showPrintAuditModal.items.map((it) => (
                    <tr key={it.id} className="border-b font-mono text-[11px]">
                      <td className="p-2 border font-sans font-bold">{it.itemName}</td>
                      <td className="p-2 border text-center">{it.targetQty} {it.unit}</td>
                      <td className="p-2 border text-right">
                        {typeof it.priceSup1 === 'number' ? `Rp ${it.priceSup1.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-2 border text-right">
                        {typeof it.priceSup2 === 'number' ? `Rp ${it.priceSup2.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-2 border text-right">
                        {typeof it.priceSup3 === 'number' ? `Rp ${it.priceSup3.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-900 block text-[11px]">Pertanggungjawaban ke Atasan:</span>
                <p className="text-[11px] text-amber-800 italic">"{showPrintAuditModal.justificationNotes}"</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t text-center">
                <div className="space-y-12">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Petugas Pemeriksa (Gudang/Purchasing)
                  </span>
                  <span className="block border-t border-slate-300 pt-1 font-bold text-xs">
                    ( {showPrintAuditModal.inspectorName} )
                  </span>
                </div>
                <div className="space-y-12">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Mengetahui & Menyetujui (Atasan / Super Admin)
                  </span>
                  <span className="block border-t border-slate-300 pt-1 font-bold text-xs">
                    ( .................................... )
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
