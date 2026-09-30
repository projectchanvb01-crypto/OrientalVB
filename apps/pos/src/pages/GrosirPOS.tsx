import React, { useState, useEffect } from 'react';
import {
  Package,
  FileText,
  Printer,
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles,
  Gift,
  Box,
  UtensilsCrossed,
  Building2,
  Store,
  RefreshCw,
  AlertCircle,
  Plus,
  Minus,
  Search,
  Copy,
  Download,
  X,
  Layers,
  Calendar,
  Check,
  CreditCard,
  Banknote,
  Receipt,
  ShieldAlert,
  Lock,
  AlertTriangle,
  Clock,
  Wifi,
  ChevronDown,
} from 'lucide-react';
import { LOYALTY_POINT_RULES, ProductWithMultiUnit } from '@oriental/types';
import { useEcosystem } from '../context/EcosystemContext';
import { posApi } from '../lib/api';

const BRANCHES = [
  'Cabang Utama Bone',
  'Cabang Makassar Sentral',
  'Cabang Maros',
  'Cabang Gowa',
];

interface GrosirOrderItem {
  productId: string;
  name: string;
  category?: string;
  unit: string;
  packMultiplier: number;
  dusPrice: number;
  balPrice: number;
  paletPrice: number;
  ukmPrice: number;
  selectedQty: number;
  selectedTier: 'DUS' | 'BAL' | 'PALET' | 'UKM';
}

export const GrosirPOS: React.FC = () => {
  const {
    products,
    formatStock,
    activeMember,
    membersList,
    selectActiveMember,
    addB2BTransaction,
    checkMemberTopCreditStatus,
    settleMemberReceivable,
    currentUser,
  } = useEcosystem();

  // Top System Bar State
  const [activeBranch, setActiveBranch] = useState<string>('Cabang Utama Bone');
  const [showBranchMenu, setShowBranchMenu] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Real-time clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // B2B Channel Scheme (Auto-detect from business code 100 vs 900)
  const [b2bChannel, setB2BChannel] = useState<'UKM_SUPPLY' | 'GROSIR'>('UKM_SUPPLY');
  const [selectedMemberCode, setSelectedMemberCode] = useState<string>(activeMember.memberCode);

  const currentMember =
    membersList.find((m) => m.memberCode === selectedMemberCode) || activeMember;

  const [selectedBusinessCode, setSelectedBusinessCode] = useState<string>(
    currentMember.businessProfiles?.[0]?.businessCode || `${currentMember.memberCode}-01-100`,
  );

  const currentBusiness =
    currentMember.businessProfiles?.find((b) => b.businessCode === selectedBusinessCode) ||
    currentMember.businessProfiles?.[0] || {
      businessCode: `${currentMember.memberCode}-01-100`,
      businessName: currentMember.businessName || currentMember.fullName,
      businessType: 'Retail / F&B',
      businessLocation: currentMember.address || 'Watampone / Makassar',
    };

  // Auto-detect B2B channel based strictly on selected business code
  useEffect(() => {
    const code = selectedBusinessCode || '';
    if (code.endsWith('-900') || code.includes('-900') || code.endsWith('900')) {
      setB2BChannel('GROSIR');
    } else if (code.endsWith('-100') || code.includes('-100') || code.endsWith('100')) {
      setB2BChannel('UKM_SUPPLY');
    } else if (currentBusiness.businessType?.toLowerCase().includes('grosir')) {
      setB2BChannel('GROSIR');
    } else {
      setB2BChannel('UKM_SUPPLY');
    }
  }, [selectedBusinessCode, currentBusiness.businessType]);

  // Fast Search & Filter (PRD Deliverable 1)
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'DUS' | 'BAL' | 'PALET'>('ALL');

  // Synchronize order items directly from integrated `products` inventory (Multi-Tier: Dus, Bal, Palet, UKM)
  const [orderItems, setOrderItems] = useState<GrosirOrderItem[]>(() => {
    return products.map((prod) => {
      const packVariant = prod.variants.find((v) => !v.isBaseUnit) || prod.variants[0];
      const dusPrice = prod.grosirDusPrice || packVariant.price;
      const balPrice = prod.grosirBalPrice || Math.round(dusPrice * 0.98);
      const paletPrice = prod.grosirPaletPrice || Math.round(dusPrice * 0.95);
      const ukmPrice = prod.ukmPrice || Math.round(dusPrice * 0.985);
      return {
        productId: prod.id,
        name: prod.name,
        category: prod.category,
        unit: prod.packUnitName ? prod.packUnitName.toUpperCase() : 'PACK',
        packMultiplier: prod.unitsPerPack,
        dusPrice,
        balPrice,
        paletPrice,
        ukmPrice,
        selectedQty: 1,
        selectedTier: 'DUS',
      };
    });
  });

  // Keep order items mapped if products inventory changes
  useEffect(() => {
    setOrderItems((prevItems) => {
      return products.map((prod) => {
        const existing = prevItems.find((pi) => pi.productId === prod.id);
        const packVariant = prod.variants.find((v) => !v.isBaseUnit) || prod.variants[0];
        const dusPrice = prod.grosirDusPrice || packVariant.price;
        const balPrice = prod.grosirBalPrice || Math.round(dusPrice * 0.98);
        const paletPrice = prod.grosirPaletPrice || Math.round(dusPrice * 0.95);
        const ukmPrice = prod.ukmPrice || Math.round(dusPrice * 0.985);
        return {
          productId: prod.id,
          name: prod.name,
          category: prod.category,
          unit: prod.packUnitName ? prod.packUnitName.toUpperCase() : 'PACK',
          packMultiplier: prod.unitsPerPack,
          dusPrice,
          balPrice,
          paletPrice,
          ukmPrice,
          selectedQty: existing ? existing.selectedQty : 0,
          selectedTier: existing ? existing.selectedTier : 'DUS',
        };
      });
    });
  }, [products]);

  // Payment Terms & TOP Management (PRD Deliverable 4)
  const [paymentType, setPaymentType] = useState<'CASH' | 'TERMIN'>('CASH');
  const [termsPeriod, setTermsPeriod] = useState<'TOP 7 Hari' | 'TOP 14 Hari' | 'TOP 30 Hari'>('TOP 14 Hari');
  const [activeTabCopy, setActiveTabCopy] = useState<'LEMBAR_1' | 'LEMBAR_2' | 'LEMBAR_3'>('LEMBAR_1');
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${b2bChannel === 'UKM_SUPPLY' ? 'UKM' : 'GRO'}-${Date.now().toString().slice(-6)}`,
  );
  const [transactionCompleted, setTransactionCompleted] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [raw3PlyText, setRaw3PlyText] = useState<{
    lembar1FakturPenjualan?: string;
    lembar2SuratJalanChecker?: string;
    lembar3ArsipPembukuan?: string;
    allCopiesJoined?: string;
  } | null>(null);
  const [showCreditLockModal, setShowCreditLockModal] = useState(false);
  const [creditLockDetails, setCreditLockDetails] = useState<any>(null);
  const [settleToast, setSettleToast] = useState(false);
  const [copySuccessToast, setCopySuccessToast] = useState(false);

  // Calculate TOP due date
  const topDaysNumber = paymentType === 'TERMIN' ? (termsPeriod.includes('7') ? 7 : termsPeriod.includes('30') ? 30 : 14) : 0;
  const dueDateObj = new Date(Date.now() + topDaysNumber * 86400000);
  const dueDateStr = dueDateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Filter items actively selected in order (qty > 0)
  const activeOrderList = orderItems.filter((item) => item.selectedQty > 0);

  const grandTotal = activeOrderList.reduce((sum, item) => {
    let price = item.dusPrice;
    if (item.selectedTier === 'BAL') price = item.balPrice;
    if (item.selectedTier === 'PALET') price = item.paletPrice;
    if (item.selectedTier === 'UKM') price = item.ukmPrice;
    return sum + price * item.selectedQty;
  }, 0);

  // Sprint 9: Real-time Credit Limit & Overdue Check (PRD §8.1 & §2.5)
  const currentCreditCheck = checkMemberTopCreditStatus(currentMember.memberCode, grandTotal);

  // Dynamic Point Calculation (PRD Acceptance Criteria: Grosir Rp 200.000 = 1 pt, UKM Rp 50.000 = 1 pt)
  const pointRate =
    b2bChannel === 'UKM_SUPPLY'
      ? LOYALTY_POINT_RULES.UKM_SUPPLY_SPEND_PER_POINT
      : LOYALTY_POINT_RULES.GROSIR_SPEND_PER_POINT;

  const pointsEarned = Math.floor(grandTotal / pointRate);
  const couponsEarned = Math.floor(grandTotal / LOYALTY_POINT_RULES.DOORPRIZE_SPEND_PER_COUPON);

  // Quick Search filter items
  const filteredOrderItems = orderItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.unit.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (tierFilter === 'ALL') return true;
    if (tierFilter === 'DUS') return item.unit.includes('DOS') || item.unit.includes('DUS') || item.unit.includes('KARTON');
    if (tierFilter === 'BAL') return item.unit.includes('BAL');
    if (tierFilter === 'PALET') return item.unit.includes('ZAK') || item.unit.includes('KARUNG') || item.paletPrice > 0;
    return true;
  });

  // Fetch continuous form text from backend API driver
  const fetchContinuousFormText = async (invNum: string) => {
    const itemsPayload = activeOrderList.map((item) => {
      let unitPrice = item.dusPrice;
      if (item.selectedTier === 'BAL') unitPrice = item.balPrice;
      if (item.selectedTier === 'PALET') unitPrice = item.paletPrice;
      if (item.selectedTier === 'UKM') unitPrice = item.ukmPrice;
      return {
        name: item.name,
        qty: item.selectedQty,
        unit: item.unit,
        price: unitPrice,
        subtotal: unitPrice * item.selectedQty,
      };
    });

    const res = await posApi.preview3Ply({
      invoiceNumber: invNum,
      customerName: currentBusiness.businessName,
      items: itemsPayload,
      grandTotal,
      channelType: b2bChannel,
      paymentType,
      termsPeriod,
      dueDateStr: paymentType === 'TERMIN' ? dueDateStr : undefined,
    });

    if (res) {
      setRaw3PlyText(res);
    }
  };

  const handleCheckoutB2B = async () => {
    if (activeOrderList.length === 0 || grandTotal === 0) {
      alert('Pilih setidaknya 1 produk dengan jumlah lebih dari 0.');
      return;
    }

    // Sprint 9: TOP Credit Lock & Overdue Check (PRD Addendum §8.1 & §2.5)
    if (paymentType === 'TERMIN') {
      const creditStatus = checkMemberTopCreditStatus(currentMember.memberCode, grandTotal);
      if (!creditStatus.allowed) {
        setCreditLockDetails(creditStatus);
        setShowCreditLockModal(true);
        return;
      }
    }

    // Check inventory stock availability before processing
    for (const item of activeOrderList) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        let mult = item.packMultiplier;
        if (item.selectedTier === 'PALET') {
          mult = prod.paletMultiplier || prod.unitsPerPack * 10;
        }
        const requiredBaseUnits = item.selectedQty * mult;
        if (prod.totalStockInBaseUnits < requiredBaseUnits) {
          alert(
            `Stok tidak mencukupi untuk "${prod.name}".\nKebutuhan: ${item.selectedQty} ${item.unit} (${requiredBaseUnits} ${prod.baseUnitName}).\nTersedia: ${formatStock(prod)}.`,
          );
          return;
        }
      }
    }

    const customerDisplayName = currentBusiness.businessName;
    const payloadItems = activeOrderList.map((item) => {
      let unitPrice = item.dusPrice;
      if (item.selectedTier === 'BAL') unitPrice = item.balPrice;
      if (item.selectedTier === 'PALET') unitPrice = item.paletPrice;
      if (item.selectedTier === 'UKM') unitPrice = item.ukmPrice;
      return {
        productId: item.productId,
        productName: item.name,
        unit: item.unit,
        multiplier: item.packMultiplier,
        quantity: item.selectedQty,
        tier: item.selectedTier,
        unitPrice,
        subtotal: unitPrice * item.selectedQty,
      };
    });

    const result = addB2BTransaction(
      payloadItems,
      grandTotal,
      paymentType,
      customerDisplayName,
      b2bChannel,
      {
        topDays: paymentType === 'TERMIN' ? topDaysNumber : undefined,
        dueDate: paymentType === 'TERMIN' ? dueDateStr : undefined,
      },
    );

    setInvoiceNumber(result.invoiceNumber);
    setTransactionCompleted(true);

    // Fetch official 3-ply dot-matrix continuous text from backend driver
    await fetchContinuousFormText(result.invoiceNumber);

    // Automatically display the Continuous 3-Ply Print Driver Modal
    setShowPrintModal(true);
  };

  const handleResetOrder = () => {
    setOrderItems((prev) => prev.map((i) => ({ ...i, selectedQty: 0 })));
    setInvoiceNumber(
      `INV-${b2bChannel === 'UKM_SUPPLY' ? 'UKM' : 'GRO'}-${Date.now().toString().slice(-6)}`,
    );
    setTransactionCompleted(false);
    setRaw3PlyText(null);
  };

  const handleCopyRawEscp = () => {
    const textToCopy =
      raw3PlyText?.allCopiesJoined ||
      `FAKTUR ORIENTAL GROSIR CONTINUOUS FORM\nNo: ${invoiceNumber}\nTotal: Rp ${grandTotal.toLocaleString('id-ID')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccessToast(true);
    setTimeout(() => setCopySuccessToast(false), 2500);
  };

  const handleDownloadRawTxt = () => {
    const textContent =
      raw3PlyText?.allCopiesJoined ||
      `FAKTUR ORIENTAL GROSIR CONTINUOUS FORM\nNo: ${invoiceNumber}\nTotal: Rp ${grandTotal.toLocaleString('id-ID')}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NOTA_3_PLY_${invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col gap-3.5 overflow-hidden">
      {/* ======================================================== */}
      {/* COMBINED TOP SYSTEM BAR: ORIENTAL ENTERPRISE             */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs shrink-0">
        {/* Left: Title & Subtitle & Active Branch Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-black text-sm shadow-xs ring-2 ring-amber-100">
              OE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 font-heading tracking-tight leading-none">
                  Oriental Enterprise
                </h1>
                <span className="text-[10px] uppercase tracking-wider text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-md font-mono border border-amber-300">
                  B2B Wholesale
                </span>
                {paymentType === 'TERMIN' && (
                  <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-300 font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-600" />
                    TOP: {termsPeriod}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Penjualan B2B Partai Besar & Pengadaan Bahan Baku F&B
              </p>
            </div>
          </div>

          {/* Active Branch Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{activeBranch}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showBranchMenu && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                {BRANCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setActiveBranch(b);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 transition flex items-center justify-between ${
                      activeBranch === b ? 'font-bold text-amber-900 bg-amber-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{b}</span>
                    {activeBranch === b && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Clock, Sync Status (Red if Offline), Operator / Kasir, Total Transaksi */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Real-time Clock */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-xs text-slate-700 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold">{currentTime || '12:00:00'} WIB</span>
          </div>

          {/* Sync Status: High-visibility Red when Offline */}
          {isOnline ? (
            <button
              type="button"
              onClick={() => setIsOnline(false)}
              className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-mono font-bold shadow-2xs hover:bg-emerald-100 transition cursor-pointer"
              title="Koneksi Normal • Klik untuk simulasi Offline"
            >
              <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              <span className="hidden md:inline">Online Sync</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOnline(true)}
              className="flex items-center gap-2 text-xs text-white bg-rose-600 border border-rose-700 px-3 py-1.5 rounded-xl font-mono font-black shadow-md shadow-rose-600/30 animate-pulse hover:bg-rose-700 transition cursor-pointer"
              title="KONEKSI TERPUTUS! Transaksi B2B disimpan di antrean lokal • Klik untuk pulihkan status Online"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
              <span>OFFLINE (Antrean Lokal)</span>
            </button>
          )}

          {/* Operator Aktif */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-600">Operator:</span>
            <span className="font-bold text-slate-900 truncate max-w-[120px]">
              {currentUser?.name ? currentUser.name.split(' ')[0] : 'Admin B2B'}
            </span>
          </div>

          {/* Total Transaksi B2B Widget */}
          <div className="bg-amber-50/80 border border-amber-200 px-3 py-1 rounded-xl text-right shadow-2xs">
            <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">Total B2B</p>
            <p className="text-sm sm:text-base font-black text-amber-900 font-mono leading-none">
              Rp {grandTotal.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace: Fixed height, Internal Scrolling Only */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left: Wholesale Order Table (Scrollable Items) */}
        <div className="lg:col-span-6 glass-panel p-4 rounded-2xl flex flex-col overflow-hidden min-h-0">
          <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-slate-200 gap-2 shrink-0">
            <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Daftar Muatan & Pengadaan Produk</span>
            </h2>

            {/* Payment Method Selector (PRD Deliverable 4: Cash vs Termin TOP) */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Metode:</span>
              <button
                onClick={() => setPaymentType('CASH')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  paymentType === 'CASH'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" /> Cash (Lunas)
              </button>
              <button
                onClick={() => setPaymentType('TERMIN')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  paymentType === 'TERMIN'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Termin (TOP)
              </button>
            </div>
          </div>

          {/* Member & Business Unit Selection */}
          <div className="space-y-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2.5 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 block mb-0.5 font-semibold text-[11px]">
                  Member One Identity:
                </label>
                <select
                  value={selectedMemberCode}
                  onChange={(e) => {
                    const newMemberCode = e.target.value;
                    setSelectedMemberCode(newMemberCode);
                    selectActiveMember(newMemberCode);
                    const m = membersList.find((x) => x.memberCode === newMemberCode);
                    if (m && m.businessProfiles && m.businessProfiles.length > 0) {
                      const firstCode = m.businessProfiles[0].businessCode;
                      setSelectedBusinessCode(firstCode);
                    } else if (m) {
                      setSelectedBusinessCode(`${m.memberCode}-01-100`);
                    }
                  }}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer text-xs"
                >
                  {membersList.map((m) => (
                    <option key={m.id} value={m.memberCode}>
                      {m.fullName} ({m.memberCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-0.5 font-semibold text-[11px]">
                  Unit Usaha Tujuan Transaksi:
                </label>
                <select
                  value={selectedBusinessCode}
                  onChange={(e) => setSelectedBusinessCode(e.target.value)}
                  className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-amber-900 font-extrabold focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer text-xs"
                >
                  {currentMember.businessProfiles && currentMember.businessProfiles.length > 0 ? (
                    currentMember.businessProfiles.map((b) => (
                      <option key={b.businessCode} value={b.businessCode}>
                        {b.businessName} ({b.businessCode})
                      </option>
                    ))
                  ) : (
                    <option value={`${currentMember.memberCode}-01-100`}>
                      {currentMember.businessName || currentMember.fullName} (Default)
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Location & Terms of Payment (TOP: 7, 14, 30 Hari) */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-600 px-1 gap-2 pt-1 border-t border-slate-200">
              <span className="truncate max-w-[200px]">
                Alamat: <strong className="text-slate-800">{currentBusiness.businessLocation}</strong>
              </span>

              {paymentType === 'TERMIN' ? (
                <div className="flex items-center gap-1.5 bg-amber-100/70 px-2 py-1 rounded-lg border border-amber-300">
                  <span className="text-amber-900 font-bold">Termin:</span>
                  <select
                    value={termsPeriod}
                    onChange={(e) => setTermsPeriod(e.target.value as any)}
                    className="p-0.5 bg-white border border-amber-400 rounded text-amber-900 font-bold text-xs"
                  >
                    <option value="TOP 7 Hari">TOP 7 Hari</option>
                    <option value="TOP 14 Hari">TOP 14 Hari</option>
                    <option value="TOP 30 Hari">TOP 30 Hari</option>
                  </select>
                  <span className="text-amber-800 text-[10px] font-semibold">
                    (JT: {dueDateStr.split(',')[1]?.trim() || dueDateStr})
                  </span>
                </div>
              ) : (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Lunas Seketika (Cash)
                </span>
              )}
            </div>

            {/* Plafon Kredit & Piutang SAK Status Card (PRD Addendum §8.1 & §2.5) */}
            <div
              className={`p-2.5 rounded-xl border text-[11px] font-mono transition ${
                currentCreditCheck.hasOverdue
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : currentCreditCheck.projectedReceivables > currentCreditCheck.creditLimit &&
                    paymentType === 'TERMIN'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <ShieldAlert
                    className={`w-3.5 h-3.5 ${
                      currentCreditCheck.hasOverdue ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  />
                  Plafon Kredit (TOP) & Kartu Piutang:
                </span>
                {currentCreditCheck.hasOverdue ? (
                  <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded font-bold text-[10px] flex items-center gap-1 animate-pulse">
                    <Lock className="w-3 h-3" /> FAKTUR OVERDUE / MACET
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Status Lancar
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <p className="text-slate-500">Plafon Limit:</p>
                  <p className="font-bold text-slate-800">
                    Rp {(currentCreditCheck.creditLimit || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Piutang Berjalan:</p>
                  <p className="font-bold text-rose-700">
                    Rp {(currentCreditCheck.currentReceivables || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Sisa Plafon:</p>
                  <p
                    className={`font-bold ${
                      currentCreditCheck.creditLimit - currentCreditCheck.currentReceivables <= 0
                        ? 'text-rose-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    Rp{' '}
                    {Math.max(
                      0,
                      currentCreditCheck.creditLimit - currentCreditCheck.currentReceivables,
                    ).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {currentCreditCheck.hasOverdue && (
                <div className="mt-1.5 pt-1.5 border-t border-rose-200 text-[10px] text-rose-800">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    Faktur Melewati Jatuh Tempo (Hard Lock SAK):
                  </p>
                  <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                    {currentCreditCheck.overdueInvoices.map((inv: string, idx: number) => (
                      <li key={idx} className="font-semibold">
                        {inv}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[9px] mt-1 text-rose-600 italic">
                    *Sesuai PRD §8.1 & §2.5, order termin baru otomatis diblokir sampai tagihan tertunggak dilunasi.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Search & Package Tier Filters (PRD Deliverable 1) */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 shrink-0">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari partai besar (Dus, Bal, Palet, Karung)..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono">
              <span className="text-slate-400 text-[10px]">Filter:</span>
              <button
                type="button"
                onClick={() => setTierFilter('ALL')}
                className={`px-2 py-1 rounded-md cursor-pointer transition ${
                  tierFilter === 'ALL'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setTierFilter('DUS')}
                className={`px-2 py-1 rounded-md cursor-pointer transition ${
                  tierFilter === 'DUS'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Dus
              </button>
              <button
                type="button"
                onClick={() => setTierFilter('BAL')}
                className={`px-2 py-1 rounded-md cursor-pointer transition ${
                  tierFilter === 'BAL'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Bal
              </button>
              <button
                type="button"
                onClick={() => setTierFilter('PALET')}
                className={`px-2 py-1 rounded-md cursor-pointer transition ${
                  tierFilter === 'PALET'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Palet
              </button>
            </div>
          </div>

          {/* Integrated Products Catalog with Multi-Tier Pricing (PRD Deliverable 2) */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2.5">
            {filteredOrderItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                Tidak ada produk partai besar yang cocok dengan "{searchQuery}".
              </div>
            ) : (
              filteredOrderItems.map((item) => {
                const matchedProduct = products.find((p) => p.id === item.productId);
                const stockText = matchedProduct ? formatStock(matchedProduct) : 'N/A';
                const availablePacks = matchedProduct
                  ? Math.floor(matchedProduct.totalStockInBaseUnits / item.packMultiplier)
                  : 0;

                let currentPrice = item.dusPrice;
                if (item.selectedTier === 'BAL') currentPrice = item.balPrice;
                if (item.selectedTier === 'PALET') currentPrice = item.paletPrice;
                if (item.selectedTier === 'UKM') currentPrice = item.ukmPrice;

                const isOutOfStock = availablePacks <= 0;

                return (
                  <div
                    key={item.productId}
                    className={`p-2.5 rounded-xl border transition shadow-2xs space-y-1.5 ${
                      item.selectedQty > 0
                        ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">{item.name}</p>
                          {item.category && (
                            <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold flex items-center gap-1">
                            <Box className="w-3 h-3 text-emerald-600" />
                            Stok: {stockText}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            (Tersedia: {availablePacks} {item.unit})
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-amber-700 font-bold text-xs sm:text-sm">
                          Rp {(currentPrice * (item.selectedQty || 0)).toLocaleString('id-ID')}
                        </span>
                        {item.selectedQty > 0 && (
                          <p className="text-[9px] text-slate-400 font-mono">
                            @{currentPrice.toLocaleString('id-ID')} / {item.unit} ({item.selectedTier})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 pt-1 border-t border-slate-100">
                      {/* Multi-Tier Pricing Buttons (PRD Deliverable 2) */}
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-mono text-slate-400">Tier:</span>

                        {/* Tier 1: Dus (Harga Grosir 1) */}
                        <button
                          type="button"
                          onClick={() =>
                            setOrderItems((prev) =>
                              prev.map((i) =>
                                i.productId === item.productId ? { ...i, selectedTier: 'DUS' } : i,
                              ),
                            )
                          }
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                            item.selectedTier === 'DUS'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-2xs ring-1 ring-amber-300'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Harga Grosir 1 (Dus/Karton)"
                        >
                          Dus: Rp {item.dusPrice.toLocaleString('id-ID')}
                        </button>

                        {/* Tier 2: Bal (Harga Grosir 2) */}
                        <button
                          type="button"
                          onClick={() =>
                            setOrderItems((prev) =>
                              prev.map((i) =>
                                i.productId === item.productId ? { ...i, selectedTier: 'BAL' } : i,
                              ),
                            )
                          }
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                            item.selectedTier === 'BAL'
                              ? 'bg-amber-200 text-amber-950 border border-amber-400 font-bold shadow-2xs ring-1 ring-amber-300'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Harga Grosir 2 (Bal / Multi-pack)"
                        >
                          Bal: Rp {item.balPrice.toLocaleString('id-ID')}
                        </button>

                        {/* Tier 3: Palet (Harga Grosir Distributor) */}
                        <button
                          type="button"
                          onClick={() =>
                            setOrderItems((prev) =>
                              prev.map((i) =>
                                i.productId === item.productId ? { ...i, selectedTier: 'PALET' } : i,
                              ),
                            )
                          }
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                            item.selectedTier === 'PALET'
                              ? 'bg-purple-100 text-purple-950 border border-purple-300 font-bold shadow-2xs ring-1 ring-purple-300'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Harga Grosir Distributor (Palet / Partai Ekstra Besar)"
                        >
                          Palet: Rp {item.paletPrice.toLocaleString('id-ID')}
                        </button>

                        {/* Tier 4: UKM (Harga Pengadaan Khusus Kuliner F&B) */}
                        {b2bChannel === 'UKM_SUPPLY' && (
                          <button
                            type="button"
                            onClick={() =>
                              setOrderItems((prev) =>
                                prev.map((i) =>
                                  i.productId === item.productId ? { ...i, selectedTier: 'UKM' } : i,
                                ),
                              )
                            }
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                              item.selectedTier === 'UKM'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-2xs ring-1 ring-emerald-300'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Harga Khusus Kontrak Pasokan UKM Kuliner"
                          >
                            UKM: Rp {item.ukmPrice.toLocaleString('id-ID')}
                          </button>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setOrderItems((prev) =>
                              prev.map((i) =>
                                i.productId === item.productId
                                  ? { ...i, selectedQty: Math.max(0, i.selectedQty - 1) }
                                  : i,
                              ),
                            )
                          }
                          className="p-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <input
                          type="number"
                          min="0"
                          max={availablePacks}
                          value={item.selectedQty}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(availablePacks, Number(e.target.value)));
                            setOrderItems((prev) =>
                              prev.map((i) =>
                                i.productId === item.productId ? { ...i, selectedQty: val } : i,
                              ),
                            );
                          }}
                          className="w-12 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-amber-500 shadow-2xs"
                        />

                        <button
                          type="button"
                          disabled={isOutOfStock || item.selectedQty >= availablePacks}
                          onClick={() =>
                            setOrderItems((prev) =>
                              prev.map((i) =>
                                i.productId === item.productId
                                  ? { ...i, selectedQty: Math.min(availablePacks, i.selectedQty + 1) }
                                  : i,
                              ),
                            )
                          }
                          className="p-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-30 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <span className="text-[10px] font-mono font-medium text-slate-600 ml-1">
                          {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reward Badges Preview */}
          <div className="p-2.5 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between text-xs gap-2 shrink-0 mt-2 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-[11px]">
                Poin {b2bChannel === 'UKM_SUPPLY' ? 'UKM (Rp 50k/pt)' : 'Grosir (Rp 200k/pt)'}:{' '}
                <strong className="text-amber-800">+{pointsEarned} Poin</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-purple-600" />
              <span className="text-[11px]">
                Kupon Doorprize:{' '}
                <strong className="text-purple-800">+{couponsEarned} Kupon</strong>
              </span>
            </div>
          </div>

          {/* Order Summary & Primary Checkout Action (B2B Checkout Workflow) */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-200 shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Muatan Order B2B:</p>
                <p className="text-xs font-bold text-slate-800 font-mono">
                  {activeOrderList.length} Produk ({activeOrderList.reduce((acc, x) => acc + (x.selectedQty || 0), 0)} Pack/Dus)
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500 font-medium">Total B2B:</p>
                <p className="text-base sm:text-lg font-black text-amber-900 font-mono">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckoutB2B}
              disabled={activeOrderList.length === 0}
              className={`w-full py-2.5 px-4 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                paymentType === 'TERMIN' && !currentCreditCheck.allowed
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
              }`}
            >
              {paymentType === 'TERMIN' && !currentCreditCheck.allowed ? (
                <>
                  <Lock className="w-4 h-4" /> Order Terkunci (Plafon / Overdue SAK)
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Proses Order & Cetak Nota Continuous 3-Ply
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Dot-Matrix 3-Ply Continuous Paper Simulator (PRD Deliverable 3) */}
        <div className="lg:col-span-6 glass-panel p-4 rounded-2xl flex flex-col overflow-hidden min-h-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2 shrink-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Format Cetak Nota Continuous 3 Rangkap</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchContinuousFormText(invoiceNumber);
                  setShowPrintModal(true);
                }}
                className="text-xs px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Full 3 Rangkap
              </button>

              {transactionCompleted && (
                <button
                  onClick={handleResetOrder}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Baru
                </button>
              )}
            </div>
          </div>

          {/* Copy Selector Tabs (Lembar 1 Putih, Lembar 2 Merah/Kuning, Lembar 3 Biru) */}
          <div className="flex gap-2 mb-2 shrink-0">
            <button
              onClick={() => setActiveTabCopy('LEMBAR_1')}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] sm:text-[11px] font-semibold font-mono transition cursor-pointer ${
                activeTabCopy === 'LEMBAR_1'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-400 font-bold ring-1 ring-slate-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lembar 1: Faktur Penjualan (Putih)
            </button>
            <button
              onClick={() => setActiveTabCopy('LEMBAR_2')}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] sm:text-[11px] font-semibold font-mono transition cursor-pointer ${
                activeTabCopy === 'LEMBAR_2'
                  ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-400 font-bold ring-1 ring-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lembar 2: Surat Jalan (Kuning)
            </button>
            <button
              onClick={() => setActiveTabCopy('LEMBAR_3')}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] sm:text-[11px] font-semibold font-mono transition cursor-pointer ${
                activeTabCopy === 'LEMBAR_3'
                  ? 'bg-sky-100 text-sky-950 shadow-sm border border-sky-400 font-bold ring-1 ring-sky-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lembar 3: Arsip SAK (Biru)
            </button>
          </div>

          {/* Continuous Form Display with side tractor-feed pin simulation */}
          <div
            className={`flex-1 p-4 rounded-xl font-mono text-xs shadow-xl transition-colors duration-200 overflow-y-auto relative ${
              activeTabCopy === 'LEMBAR_1'
                ? 'bg-amber-50 text-slate-900 border-2 border-slate-300'
                : activeTabCopy === 'LEMBAR_2'
                ? 'bg-amber-100/90 text-amber-950 border-2 border-amber-400'
                : 'bg-sky-50 text-sky-950 border-2 border-sky-400'
            }`}
          >
            {/* Perforated Top Header */}
            <div className="border-b-2 border-dashed border-current pb-2 mb-2 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm tracking-wider">
                  {b2bChannel === 'UKM_SUPPLY'
                    ? 'ORIENTAL UKM KULINER SUPPLY CHAIN'
                    : 'ORIENTAL GROSIR NUSANTARA'}
                </p>
                <p className="text-[10px]">
                  {b2bChannel === 'UKM_SUPPLY'
                    ? 'Pengadaan Bahan Baku Terjadwal F&B'
                    : 'Pusat Distribusi Sembako & Bahan Baku Grosir'}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold uppercase px-2 py-0.5 border border-current text-[9px] rounded">
                  {activeTabCopy === 'LEMBAR_1'
                    ? 'LEMBAR 1: FAKTUR PENJUALAN ASLI (PUTIH)'
                    : activeTabCopy === 'LEMBAR_2'
                    ? 'LEMBAR 2: SURAT JALAN & CHECKER (KUNING)'
                    : 'LEMBAR 3: ARSIP PEMBUKUAN SAK (BIRU)'}
                </span>
                <p className="text-[10px] mt-1 font-bold">{invoiceNumber}</p>
              </div>
            </div>

            {/* Clean Invoice Header */}
            <div className="grid grid-cols-2 text-[10px] pb-2 border-b border-dashed border-current mb-2 gap-2">
              <div>
                <p>
                  Kepada: <strong>{currentBusiness.businessName}</strong>
                </p>
                <p>Alamat / Lokasi: {currentBusiness.businessLocation}</p>
                <p className="mt-0.5">
                  Status Pembayaran:{' '}
                  <strong>
                    {paymentType === 'CASH'
                      ? 'LUNAS (TUNAI / CASH)'
                      : `TERMIN / KREDIT (${termsPeriod})`}
                  </strong>
                </p>
                {paymentType === 'TERMIN' && (
                  <p className="text-[9px] text-amber-900 font-bold">
                    Jatuh Tempo: {dueDateStr}
                  </p>
                )}
              </div>
              <div className="text-right space-y-0.5">
                <p>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                <p>
                  No. Faktur: <strong>{invoiceNumber}</strong>
                </p>
                <p>
                  ID Pelanggan: <strong>{currentMember.memberCode}</strong>
                </p>
              </div>
            </div>

            {/* Table of Items */}
            <div className="space-y-1 mb-2.5">
              <div className="grid grid-cols-12 font-bold border-b border-current pb-1 text-[10px]">
                <span className="col-span-5">NAMA BARANG</span>
                <span className="col-span-2 text-center">QTY / SAT</span>
                <span className="col-span-2 text-center">TIER</span>
                <span className="col-span-3 text-right">JUMLAH</span>
              </div>
              {activeOrderList.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  Belum ada item yang dipilih dalam muatan
                </div>
              ) : (
                activeOrderList.map((i) => {
                  let pr = i.dusPrice;
                  if (i.selectedTier === 'BAL') pr = i.balPrice;
                  if (i.selectedTier === 'PALET') pr = i.paletPrice;
                  if (i.selectedTier === 'UKM') pr = i.ukmPrice;
                  return (
                    <div key={i.productId} className="grid grid-cols-12 text-[10px] py-0.5">
                      <span className="col-span-5 truncate">{i.name}</span>
                      <span className="col-span-2 text-center font-bold">
                        {i.selectedQty} {i.unit}
                      </span>
                      <span className="col-span-2 text-center">
                        <span className="text-[9px] px-1 py-0.2 rounded border border-current">
                          {i.selectedTier}
                        </span>
                      </span>
                      <span className="col-span-3 text-right font-bold">
                        Rp {(pr * i.selectedQty).toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total Pembelian */}
            <div className="border-t-2 border-dashed border-current pt-1.5 flex justify-between items-center text-xs font-bold">
              <span>TOTAL PEMBELIAN</span>
              <span className="text-sm">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>

            {/* Document Purpose Notice */}
            <div className="mt-2.5 p-1.5 border border-current rounded text-[9px] leading-tight">
              {activeTabCopy === 'LEMBAR_1' && (
                <p>★ LEMBAR 1 (Putih): Faktur Penjualan Asli / Bukti Lunas diserahkan kepada Pembeli.</p>
              )}
              {activeTabCopy === 'LEMBAR_2' && (
                <p>
                  ★ LEMBAR 2 (Kuning/Merah): Surat Jalan & Verifikasi Fisik Checker Gudang / Muatan Ekspedisi.
                </p>
              )}
              {activeTabCopy === 'LEMBAR_3' && (
                <p>★ LEMBAR 3 (Biru/Hijau): Arsip Kasir untuk Dasar Pembukuan Keuangan SAK & Kartu Piutang.</p>
              )}
            </div>

            {/* 3 Column Signature Block */}
            <div className="grid grid-cols-3 text-center text-[9px] pt-3 mt-2 border-t border-dotted border-current">
              <div>
                <p>Diterima Oleh,</p>
                <div className="h-7"></div>
                <p className="border-t border-current mx-2 pt-0.5">( Pembeli / Toko )</p>
              </div>
              <div>
                <p>Checker Muatan,</p>
                <div className="h-7"></div>
                <p className="border-t border-current mx-2 pt-0.5">( Petugas Gudang )</p>
              </div>
              <div>
                <p>Kasir Oriental,</p>
                <div className="h-7"></div>
                <p className="border-t border-current mx-2 pt-0.5">( Bagian Keuangan )</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification Simulasi Pelunasan Piutang */}
      {settleToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>Pelunasan piutang berhasil disimulasikan! Status kredit member kini kembali normal.</span>
        </div>
      )}

      {/* HARD LOCK MODAL: PLAFON KREDIT / FAKTUR TERTUNGGAK (PRD §8.1 & §2.5) */}
      {showCreditLockModal && creditLockDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-rose-500 overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="p-4 bg-gradient-to-r from-rose-700 to-red-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Order B2B Terkunci (Hard Lock SAK)</h3>
                  <p className="text-[11px] text-rose-200">
                    PRD Addendum §8.1 & §2.5: Kontrol Plafon Piutang & Faktur Jatuh Tempo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreditLockModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-700">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 leading-relaxed font-mono">
                {creditLockDetails.reason}
              </div>

              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pelanggan:</span>
                  <span className="font-bold text-slate-800">
                    {currentMember.fullName} ({currentMember.memberCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plafon Disetujui Admin Manager:</span>
                  <span className="font-bold text-slate-800">
                    Rp {(creditLockDetails.creditLimit || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Piutang Berjalan Belum Lunas:</span>
                  <span className="font-bold text-rose-700">
                    Rp {(creditLockDetails.currentReceivables || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nilai Order Baru Ini:</span>
                  <span className="font-bold text-amber-700">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-300">
                  <span className="font-semibold text-slate-700">Proyeksi Total Piutang:</span>
                  <span className="font-bold text-rose-800">
                    Rp {(creditLockDetails.projectedReceivables || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {creditLockDetails.hasOverdue && creditLockDetails.overdueInvoices?.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-[11px]">
                  <p className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Daftar Faktur Tertunggak:
                  </p>
                  <ul className="list-disc pl-4 text-amber-800 space-y-0.5 font-mono text-[10px]">
                    {creditLockDetails.overdueInvoices.map((inv: string, i: number) => (
                      <li key={i}>{inv}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-[11px] leading-relaxed">
                <p className="font-bold">Opsi Tindakan Kasir:</p>
                <p className="mt-0.5">
                  1. Alihkan transaksi ke <strong>Cash (Lunas)</strong> jika pembeli ingin membawa muatan saat ini.
                </p>
                <p className="mt-0.5">
                  2. Lakukan pelunasan faktur macet atau ajukan kenaikan plafon ke <strong>Admin Manager</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  settleMemberReceivable(
                    currentMember.memberCode,
                    creditLockDetails.currentReceivables,
                  );
                  setShowCreditLockModal(false);
                  setSettleToast(true);
                  setTimeout(() => setSettleToast(false), 3000);
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Simulasi Pelunasan Piutang Kasir
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPaymentType('CASH');
                    setShowCreditLockModal(false);
                  }}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Banknote className="w-4 h-4" /> Ganti ke Cash (Lunas)
                </button>
                <button
                  onClick={() => setShowCreditLockModal(false)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTINUOUS FORM 3-PLY PRINT DRIVER MODAL (PRD Deliverable 3) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    Driver Cetak Nota Continuous Form 3 Rangkap (Dot-Matrix ESC/P)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    No. Faktur: {invoiceNumber} | Kertas Continuous Matrix 9.5" x 11"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Printer className="w-4 h-4" /> Print Semua 3 Rangkap
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Toolbar */}
            <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-600">Pelanggan:</span>
                <strong className="text-slate-900">{currentBusiness.businessName}</strong>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">Metode:</span>
                <strong className={paymentType === 'CASH' ? 'text-emerald-700' : 'text-amber-700'}>
                  {paymentType === 'CASH' ? 'LUNAS (Cash)' : `Kredit (${termsPeriod})`}
                </strong>
                {paymentType === 'TERMIN' && (
                  <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                    JT: {dueDateStr}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyRawEscp}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-mono font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copySuccessToast ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin Teks ESC/P
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadRawTxt}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-mono font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Raw (.txt)
                </button>
              </div>
            </div>

            {/* Modal Body: Interactive 3-Ply Continuous Paper Preview */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-slate-200/60">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Lembar 1: Putih (Faktur Penjualan Asli) */}
                <div className="p-3.5 rounded-xl bg-white border-2 border-slate-400 text-slate-900 font-mono text-[11px] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="border-b-2 border-dashed border-slate-800 pb-2 mb-2 flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs">ORIENTAL GROSIR NUSANTARA</p>
                        <p className="text-[9px] text-slate-600">Pusat Grosir Bahan Baku & Sembako</p>
                      </div>
                      <span className="font-bold px-1.5 py-0.2 border border-slate-800 text-[8px] bg-slate-100 rounded">
                        LEMBAR 1: PUTIH
                      </span>
                    </div>

                    <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2 mb-2">
                      <p>
                        Dokumen: <strong>FAKTUR PENJUALAN ASLI</strong>
                      </p>
                      <p>No. Faktur: {invoiceNumber}</p>
                      <p>Pelanggan: {currentBusiness.businessName}</p>
                      <p>
                        Status:{' '}
                        <strong>
                          {paymentType === 'CASH' ? 'LUNAS (Cash)' : `TERMIN (${termsPeriod})`}
                        </strong>
                      </p>
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="grid grid-cols-12 font-bold border-b border-slate-400 pb-0.5 text-[9px]">
                        <span className="col-span-6">ITEM</span>
                        <span className="col-span-2 text-center">QTY</span>
                        <span className="col-span-4 text-right">JUMLAH</span>
                      </div>
                      {activeOrderList.map((i) => {
                        let pr = i.dusPrice;
                        if (i.selectedTier === 'BAL') pr = i.balPrice;
                        if (i.selectedTier === 'PALET') pr = i.paletPrice;
                        if (i.selectedTier === 'UKM') pr = i.ukmPrice;
                        return (
                          <div key={i.productId} className="grid grid-cols-12 text-[9px] py-0.5">
                            <span className="col-span-6 truncate">{i.name}</span>
                            <span className="col-span-2 text-center font-bold">
                              {i.selectedQty} {i.unit}
                            </span>
                            <span className="col-span-4 text-right font-bold">
                              Rp {(pr * i.selectedQty).toLocaleString('id-ID')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="border-t-2 border-dashed border-slate-800 pt-1 flex justify-between font-bold text-[11px]">
                      <span>TOTAL:</span>
                      <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-[8px] text-slate-500 mt-1 italic">
                      ★ Hak Pelanggan (Bukti Lunas/Penjualan Sah)
                    </p>
                    <div className="grid grid-cols-3 text-center text-[8px] pt-3 mt-2 border-t border-dotted border-slate-400">
                      <div>
                        <p>Pembeli</p>
                        <div className="h-5"></div>
                        <p className="border-t border-slate-400 mx-1">( . . . . )</p>
                      </div>
                      <div>
                        <p>Checker</p>
                        <div className="h-5"></div>
                        <p className="border-t border-slate-400 mx-1">( . . . . )</p>
                      </div>
                      <div>
                        <p>Kasir</p>
                        <div className="h-5"></div>
                        <p className="border-t border-slate-400 mx-1">( . . . . )</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lembar 2: Kuning/Merah (Surat Jalan & Checker Gudang) */}
                <div className="p-3.5 rounded-xl bg-amber-100/90 border-2 border-amber-400 text-amber-950 font-mono text-[11px] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="border-b-2 border-dashed border-amber-800 pb-2 mb-2 flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs">ORIENTAL GROSIR NUSANTARA</p>
                        <p className="text-[9px] text-amber-800">Dokumen Kontrol Fisik Muatan</p>
                      </div>
                      <span className="font-bold px-1.5 py-0.2 border border-amber-800 text-[8px] bg-amber-200 rounded">
                        LEMBAR 2: KUNING
                      </span>
                    </div>

                    <div className="text-[10px] space-y-0.5 border-b border-dashed border-amber-300 pb-2 mb-2">
                      <p>
                        Dokumen: <strong>SURAT JALAN & CHECKER</strong>
                      </p>
                      <p>No. Faktur: {invoiceNumber}</p>
                      <p>Pelanggan: {currentBusiness.businessName}</p>
                      <p>Lokasi Kirim: {currentBusiness.businessLocation}</p>
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="grid grid-cols-12 font-bold border-b border-amber-400 pb-0.5 text-[9px]">
                        <span className="col-span-6">ITEM</span>
                        <span className="col-span-2 text-center">QTY</span>
                        <span className="col-span-4 text-right">STATUS</span>
                      </div>
                      {activeOrderList.map((i) => (
                        <div key={i.productId} className="grid grid-cols-12 text-[9px] py-0.5">
                          <span className="col-span-6 truncate">{i.name}</span>
                          <span className="col-span-2 text-center font-bold">
                            {i.selectedQty} {i.unit}
                          </span>
                          <span className="col-span-4 text-right text-emerald-800 font-bold">
                            [OK CHECK]
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="border-t-2 border-dashed border-amber-800 pt-1 flex justify-between font-bold text-[11px]">
                      <span>TOTAL MUATAN:</span>
                      <span>{activeOrderList.reduce((acc, x) => acc + x.selectedQty, 0)} Pack/Dus</span>
                    </div>
                    <p className="text-[8px] text-amber-800 mt-1 italic">
                      ★ Diserahkan ke Petugas Gudang & Ekspedisi
                    </p>
                    <div className="grid grid-cols-3 text-center text-[8px] pt-3 mt-2 border-t border-dotted border-amber-500">
                      <div>
                        <p>Penerima</p>
                        <div className="h-5"></div>
                        <p className="border-t border-amber-700 mx-1">( . . . . )</p>
                      </div>
                      <div>
                        <p>Checker</p>
                        <div className="h-5"></div>
                        <p className="border-t border-amber-700 mx-1">( . . . . )</p>
                      </div>
                      <div>
                        <p>Driver</p>
                        <div className="h-5"></div>
                        <p className="border-t border-amber-700 mx-1">( . . . . )</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lembar 3: Biru (Arsip Pembukuan SAK & Kartu Piutang) */}
                <div className="p-3.5 rounded-xl bg-sky-100/90 border-2 border-sky-400 text-sky-950 font-mono text-[11px] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="border-b-2 border-dashed border-sky-800 pb-2 mb-2 flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs">ORIENTAL GROSIR NUSANTARA</p>
                        <p className="text-[9px] text-sky-800">Pencatatan Keuangan SAK</p>
                      </div>
                      <span className="font-bold px-1.5 py-0.2 border border-sky-800 text-[8px] bg-sky-200 rounded">
                        LEMBAR 3: BIRU
                      </span>
                    </div>

                    <div className="text-[10px] space-y-0.5 border-b border-dashed border-sky-300 pb-2 mb-2">
                      <p>
                        Dokumen: <strong>ARSIP PEMBUKUAN SAK</strong>
                      </p>
                      <p>No. Faktur: {invoiceNumber}</p>
                      <p>Pelanggan: {currentBusiness.businessName}</p>
                      <p>
                        Metode:{' '}
                        <strong>
                          {paymentType === 'CASH' ? 'KAS MASUK (Cash)' : `PIUTANG (${termsPeriod})`}
                        </strong>
                      </p>
                      {paymentType === 'TERMIN' && (
                        <p className="font-bold text-red-800">Jatuh Tempo: {dueDateStr}</p>
                      )}
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="grid grid-cols-12 font-bold border-b border-sky-400 pb-0.5 text-[9px]">
                        <span className="col-span-6">ITEM</span>
                        <span className="col-span-2 text-center">QTY</span>
                        <span className="col-span-4 text-right">SUBTOTAL</span>
                      </div>
                      {activeOrderList.map((i) => {
                        let pr = i.dusPrice;
                        if (i.selectedTier === 'BAL') pr = i.balPrice;
                        if (i.selectedTier === 'PALET') pr = i.paletPrice;
                        if (i.selectedTier === 'UKM') pr = i.ukmPrice;
                        return (
                          <div key={i.productId} className="grid grid-cols-12 text-[9px] py-0.5">
                            <span className="col-span-6 truncate">{i.name}</span>
                            <span className="col-span-2 text-center font-bold">
                              {i.selectedQty} {i.unit}
                            </span>
                            <span className="col-span-4 text-right font-bold">
                              Rp {(pr * i.selectedQty).toLocaleString('id-ID')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="border-t-2 border-dashed border-sky-800 pt-1 flex justify-between font-bold text-[11px]">
                      <span>TOTAL SAK:</span>
                      <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-[8px] text-sky-800 mt-1 italic">
                      ★ Arsip Internal Kasir & Bagian Piutang
                    </p>
                    <div className="grid grid-cols-3 text-center text-[8px] pt-3 mt-2 border-t border-dotted border-sky-500">
                      <div>
                        <p>Pembeli</p>
                        <div className="h-5"></div>
                        <p className="border-t border-sky-700 mx-1">( . . . . )</p>
                      </div>
                      <div>
                        <p>Kasir</p>
                        <div className="h-5"></div>
                        <p className="border-t border-sky-700 mx-1">( . . . . )</p>
                      </div>
                      <div>
                        <p>Akunting</p>
                        <div className="h-5"></div>
                        <p className="border-t border-sky-700 mx-1">( . . . . )</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>Format dot-matrix continuous 3 rangkap siap dicetak tanpa baris terpotong.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={handleTriggerPrint}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Sekarang (Continuous Form)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY AREA: Conforms strictly to 9.5" x 11" 3-ply continuous paper with page-break */}
      <div id="continuous-form-print-area" className="hidden">
        {/* PLY 1: Faktur Penjualan Asli (Lembar 1 Putih) */}
        <div className="print-page-break font-mono text-xs text-black">
          <div>
            <div className="border-b-2 border-black pb-2 mb-2 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm tracking-wider">ORIENTAL GROSIR NUSANTARA</p>
                <p className="text-[10px]">Pusat Distribusi Partai Besar & Sembako Nusantara</p>
              </div>
              <div className="text-right">
                <span className="font-bold uppercase px-2 py-0.5 border border-black text-[9px]">
                  LEMBAR 1: FAKTUR PENJUALAN ASLI (PUTIH)
                </span>
                <p className="text-[10px] mt-1 font-bold">{invoiceNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 text-[10px] pb-2 border-b border-black mb-2 gap-2">
              <div>
                <p>
                  Pelanggan: <strong>{currentBusiness.businessName}</strong>
                </p>
                <p>Alamat: {currentBusiness.businessLocation}</p>
                <p>
                  Status Pembayaran:{' '}
                  <strong>
                    {paymentType === 'CASH'
                      ? 'LUNAS (CASH / TUNAI)'
                      : `TERMIN / KREDIT (${termsPeriod})`}
                  </strong>
                </p>
                {paymentType === 'TERMIN' && <p>Jatuh Tempo: {dueDateStr}</p>}
              </div>
              <div className="text-right">
                <p>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                <p>No. Faktur: {invoiceNumber}</p>
                <p>ID Member: {currentMember.memberCode}</p>
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <div className="grid grid-cols-12 font-bold border-b border-black pb-1 text-[10px]">
                <span className="col-span-5">NAMA BARANG</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-2 text-center">TIER</span>
                <span className="col-span-3 text-right">JUMLAH</span>
              </div>
              {activeOrderList.map((i) => {
                let pr = i.dusPrice;
                if (i.selectedTier === 'BAL') pr = i.balPrice;
                if (i.selectedTier === 'PALET') pr = i.paletPrice;
                if (i.selectedTier === 'UKM') pr = i.ukmPrice;
                return (
                  <div key={i.productId} className="grid grid-cols-12 text-[10px] py-0.5">
                    <span className="col-span-5">{i.name}</span>
                    <span className="col-span-2 text-center font-bold">
                      {i.selectedQty} {i.unit}
                    </span>
                    <span className="col-span-2 text-center">{i.selectedTier}</span>
                    <span className="col-span-3 text-right font-bold">
                      Rp {(pr * i.selectedQty).toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="border-t-2 border-black pt-2 flex justify-between font-bold text-sm">
              <span>TOTAL PEMBELIAN</span>
              <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-[9px] mt-1">★ Dokumen Asli untuk Pelanggan (Bukti Pembayaran Sah).</p>
            <div className="grid grid-cols-3 text-center text-[10px] pt-6 mt-4 border-t border-black">
              <div>
                <p>Tanda Terima Pelanggan,</p>
                <div className="h-10"></div>
                <p className="border-t border-black mx-4">( {currentBusiness.businessName.slice(0, 16)} )</p>
              </div>
              <div>
                <p>Checker Muatan Gudang,</p>
                <div className="h-10"></div>
                <p className="border-t border-black mx-4">( Petugas Checker )</p>
              </div>
              <div>
                <p>Kasir Keuangan,</p>
                <div className="h-10"></div>
                <p className="border-t border-black mx-4">( Bagian Kasir )</p>
              </div>
            </div>
          </div>
        </div>

        {/* PLY 2: Surat Jalan & Checker Gudang (Lembar 2 Kuning/Merah) */}
        <div className="print-page-break font-mono text-xs text-black">
          <div>
            <div className="border-b-2 border-black pb-2 mb-2 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm tracking-wider">ORIENTAL GROSIR NUSANTARA</p>
                <p className="text-[10px]">Surat Jalan & Verifikasi Fisik Muatan Gudang</p>
              </div>
              <div className="text-right">
                <span className="font-bold uppercase px-2 py-0.5 border border-black text-[9px]">
                  LEMBAR 2: SURAT JALAN & CHECKER (KUNING)
                </span>
                <p className="text-[10px] mt-1 font-bold">{invoiceNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 text-[10px] pb-2 border-b border-black mb-2 gap-2">
              <div>
                <p>
                  Tujuan Pengiriman: <strong>{currentBusiness.businessName}</strong>
                </p>
                <p>Alamat / Lokasi: {currentBusiness.businessLocation}</p>
                <p>
                  Status Pembayaran:{' '}
                  <strong>
                    {paymentType === 'CASH' ? 'LUNAS (CASH)' : `TERMIN (${termsPeriod})`}
                  </strong>
                </p>
              </div>
              <div className="text-right">
                <p>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                <p>No. Faktur: {invoiceNumber}</p>
                <p>ID Member: {currentMember.memberCode}</p>
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <div className="grid grid-cols-12 font-bold border-b border-black pb-1 text-[10px]">
                <span className="col-span-5">NAMA BARANG</span>
                <span className="col-span-2 text-center">QTY FISIK</span>
                <span className="col-span-2 text-center">SATUAN</span>
                <span className="col-span-3 text-right">PARAF CHECK</span>
              </div>
              {activeOrderList.map((i) => (
                <div key={i.productId} className="grid grid-cols-12 text-[10px] py-0.5">
                  <span className="col-span-5">{i.name}</span>
                  <span className="col-span-2 text-center font-bold">{i.selectedQty}</span>
                  <span className="col-span-2 text-center">{i.unit} ({i.selectedTier})</span>
                  <span className="col-span-3 text-right font-bold">[  OK  ]</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="border-t-2 border-black pt-2 flex justify-between font-bold text-sm">
              <span>TOTAL KUANTITAS MUATAN</span>
              <span>{activeOrderList.reduce((acc, x) => acc + x.selectedQty, 0)} Pack / Dus</span>
            </div>
            <p className="text-[9px] mt-1">
              ★ Lembar Pengawasan Checker Gudang & Supir Ekspedisi Pengiriman.
            </p>
            <div className="grid grid-cols-3 text-center text-[10px] pt-6 mt-4 border-t border-black">
              <div>
                <p>Penerima Barang,</p>
                <div className="h-10"></div>
                <p className="border-t border-black mx-4">( Toko Penerima )</p>
              </div>
              <div>
                <p>Checker Muatan Gudang,</p>
                <div className="h-10"></div>
                <p className="border-t border-black mx-4">( Petugas Checker )</p>
              </div>
              <div>
                <p>Pengemudi / Supir,</p>
                <div className="h-10"></div>
                <p className="border-t border-black mx-4">( Petugas Ekspedisi )</p>
              </div>
            </div>
          </div>
        </div>

        {/* PLY 3: Arsip Pembukuan SAK & Piutang (Lembar 3 Biru) */}
        <div className="print-page-break font-mono text-xs text-black">
          <div>
            <div className="border-b-2 border-black pb-2 mb-2 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm tracking-wider">ORIENTAL GROSIR NUSANTARA</p>
                <p className="text-[10px]">Arsip Pembukuan Keuangan SAK & Administrasi Piutang</p>
              </div>
              <div className="text-right">
                <span className="font-bold uppercase px-2 py-0.5 border border-black text-[9px]">
                  LEMBAR 3: ARSIP PEMBUKUAN SAK (BIRU)
                </span>
                <p className="text-[10px] mt-1 font-bold">{invoiceNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 text-[10px] pb-2 border-b border-black mb-2 gap-2">
              <div>
                <p>
                  Pelanggan: <strong>{currentBusiness.businessName}</strong>
                </p>
                <p>Alamat: {currentBusiness.businessLocation}</p>
                <p>
                  Buku Akun:{' '}
                  <strong>
                    {paymentType === 'CASH'
                      ? '1-1000 KAS & BANK (CASH)'
                      : `1-1200 PIUTANG USAHA GROSIR (${termsPeriod})`}
                  </strong>
                </p>
                {paymentType === 'TERMIN' && (
                  <p className="font-bold">Tgl Jatuh Tempo: {dueDateStr}</p>
                )}
              </div>
              <div className="text-right">
                <p>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                <p>No. Faktur: {invoiceNumber}</p>
                <p>ID Member: {currentMember.memberCode}</p>
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <div className="grid grid-cols-12 font-bold border-b border-black pb-1 text-[10px]">
                <span className="col-span-5">NAMA BARANG</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-2 text-center">HARGA</span>
                <span className="col-span-3 text-right">JUMLAH</span>
              </div>
              {activeOrderList.map((i) => {
                let pr = i.dusPrice;
                if (i.selectedTier === 'BAL') pr = i.balPrice;
                if (i.selectedTier === 'PALET') pr = i.paletPrice;
                if (i.selectedTier === 'UKM') pr = i.ukmPrice;
                return (
                  <div key={i.productId} className="grid grid-cols-12 text-[10px] py-0.5">
                    <span className="col-span-5">{i.name}</span>
                    <span className="col-span-2 text-center font-bold">
                      {i.selectedQty} {i.unit}
                    </span>
                    <span className="col-span-2 text-center">Rp {pr.toLocaleString('id-ID')}</span>
                    <span className="col-span-3 text-right font-bold">
                      Rp {(pr * i.selectedQty).toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="border-t-2 border-black pt-2 flex justify-between font-bold text-sm">
              <span>TOTAL PEMBUKUAN SAK</span>
              <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-[9px] mt-1">
              ★ Arsip Kasir untuk Dasar Verifikasi Pembukuan Keuangan SAK & Kartu Piutang.
            </p>
            <div className="grid grid-cols-3 text-center text-[10px] pt-6 mt-4 border-t border-black">
              <div>
                <p>Pelanggan,</p>
                <div className="h-10"></div>
                <p className="border-t border-black mx-4">( Pembeli / Toko )</p>
              </div>
              <div>
                <p>Kasir Keuangan,</p>
                <div className="h-10"></div>
                <p className="border-t border-black mx-4">( Bagian Kasir )</p>
              </div>
              <div>
                <p>Bagian Akuntansi,</p>
                <div className="h-10"></div>
                <p className="border-t border-black mx-4">( Finance SAK )</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
