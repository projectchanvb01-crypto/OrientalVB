import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Printer,
  Sparkles,
  Gift,
  Search,
  Wifi,
  AlertTriangle,
  RotateCcw,
  Clock,
  PowerOff,
  Tag,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Banknote,
  Check,
  X,
  FileText,
  ShoppingBag,
  Award,
  User,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { LOYALTY_POINT_RULES, ProductWithMultiUnit, ProductUnitVariant } from '@oriental/types';
import { useEcosystem, RetailCartItem } from '../context/EcosystemContext';

interface CashierShift {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  initialCashFloat: number; // Modal Awal Kasir
  totalCashSales: number;
  totalQrisSales: number;
  totalCardSales: number;
  totalTransactions: number;
  isOpen: boolean;
  actualCashCounted?: number;
  cashDifference?: number;
  notes?: string;
}

interface RetailPromo {
  id: string;
  name: string;
  description: string;
  type: 'PERCENTAGE' | 'NOMINAL' | 'BUY_X_GET_Y' | 'MEMBER_VOUCHER';
  value: number;
  minSpend: number;
  requiresMember?: boolean;
}

const RETAIL_PROMOS: RetailPromo[] = [
  {
    id: 'NONE',
    name: 'Tanpa Promo',
    description: 'Harga reguler swalayan',
    type: 'NOMINAL',
    value: 0,
    minSpend: 0,
  },
  {
    id: 'MEMBER_VOUCHER_10K',
    name: 'Voucher Member Rp 10.000',
    description: 'Potongan Rp 10.000 belanja min. Rp 50.000 (Khusus Member One Identity)',
    type: 'MEMBER_VOUCHER',
    value: 10000,
    minSpend: 50000,
    requiresMember: true,
  },
  {
    id: 'DISC_5_PCT',
    name: 'Diskon Swalayan 5%',
    description: 'Potongan 5% untuk total belanja di atas Rp 150.000',
    type: 'PERCENTAGE',
    value: 5,
    minSpend: 150000,
  },
  {
    id: 'DISC_10_PCT',
    name: 'Diskon Super Hemat 10%',
    description: 'Potongan 10% untuk total belanja di atas Rp 300.000',
    type: 'PERCENTAGE',
    value: 10,
    minSpend: 300000,
  },
  {
    id: 'BUY_2_GET_1',
    name: 'Beli 2 Gratis 1 (Promo Hemat)',
    description: 'Gratis 1 produk termurah saat belanja 3 item atau lebih di keranjang',
    type: 'BUY_X_GET_Y',
    value: 0,
    minSpend: 0,
  },
];

export const RetailPOS: React.FC = () => {
  const {
    member,
    activeMember,
    membersList,
    selectActiveMember,
    products,
    retailCart,
    addToRetailCart,
    updateRetailCartQty,
    clearRetailCart,
    formatStock,
    addRetailTransaction,
    currentUser,
  } = useEcosystem();

  // Shift Kasir State (Loaded from localStorage or default initialized)
  const [currentShift, setCurrentShift] = useState<CashierShift>(() => {
    const saved = localStorage.getItem('oriental_retail_shift');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading saved shift:', e);
      }
    }
    return {
      id: `SHF-${Date.now().toString().slice(-4)}`,
      cashierId: currentUser.id || 'usr-003',
      cashierName: currentUser.name || 'Siti Rahma',
      openedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      initialCashFloat: 300000,
      totalCashSales: 0,
      totalQrisSales: 0,
      totalCardSales: 0,
      totalTransactions: 0,
      isOpen: true,
    };
  });

  // Modals state
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showZReportModal, setShowZReportModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Shift Open Form state
  const [openCashFloatInput, setOpenCashFloatInput] = useState<number>(300000);

  // Shift Close Form state
  const [actualCashCountedInput, setActualCashCountedInput] = useState<number>(0);
  const [shiftNotesInput, setShiftNotesInput] = useState<string>('');
  const [lastClosedShift, setLastClosedShift] = useState<CashierShift | null>(null);

  // Scanner & Checkout State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'QRIS' | 'KARTU'>('TUNAI');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [qrisPaidSuccess, setQrisPaidSuccess] = useState<boolean>(false);
  const [cardRefNumber, setCardRefNumber] = useState<string>('');
  const [selectedPromo, setSelectedPromo] = useState<RetailPromo>(RETAIL_PROMOS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showShiftDetailsModal, setShowShiftDetailsModal] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<{
    invoiceNumber: string;
    items: RetailCartItem[];
    grandTotal: number;
    paidAmount: number;
    changeAmount: number;
    pointsEarned: number;
    couponsEarned: number;
    couponCodes?: string[];
  } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Save active shift changes to localStorage
  useEffect(() => {
    localStorage.setItem('oriental_retail_shift', JSON.stringify(currentShift));
  }, [currentShift]);

  // Subtotal & Promo Discount Calculations
  const subtotal = retailCart.reduce((sum, item) => sum + item.subtotal, 0);

  const calculatePromoDiscount = (promo: RetailPromo, items: RetailCartItem[], sub: number): number => {
    if (!promo || promo.id === 'NONE') return 0;
    if (sub < promo.minSpend) return 0;

    if (promo.type === 'NOMINAL' || promo.type === 'MEMBER_VOUCHER') {
      return Math.min(promo.value, sub);
    }
    if (promo.type === 'PERCENTAGE') {
      return Math.round((sub * promo.value) / 100);
    }
    if (promo.type === 'BUY_X_GET_Y') {
      const totalQty = items.reduce((sum, it) => sum + it.quantity, 0);
      if (totalQty >= 3 && items.length > 0) {
        const minPrice = Math.min(...items.map((it) => it.unitPrice));
        return minPrice;
      }
    }
    return 0;
  };

  const discountTotal = calculatePromoDiscount(selectedPromo, retailCart, subtotal);
  const grandTotal = Math.max(0, subtotal - discountTotal);

  // PRD Loyalty Logic:
  // Retail: Rp 100.000 = 1 Poin | Doorprize: Rp 150.000 = 1 Kupon
  const pointsEarned = Math.floor(grandTotal / LOYALTY_POINT_RULES.RETAIL_SPEND_PER_POINT);
  const couponsEarned = Math.floor(grandTotal / LOYALTY_POINT_RULES.DOORPRIZE_SPEND_PER_COUPON);

  // Kembalian & Validasi Anti-Minus
  const isPaymentSufficient =
    paymentMethod === 'TUNAI'
      ? paidAmount >= grandTotal && grandTotal > 0
      : paymentMethod === 'QRIS'
      ? qrisPaidSuccess && grandTotal > 0
      : grandTotal > 0; // KARTU is sufficient if card swipe is done

  const changeAmount = paymentMethod === 'TUNAI' && isPaymentSufficient ? paidAmount - grandTotal : 0;
  const shortageAmount = paymentMethod === 'TUNAI' && !isPaymentSufficient ? grandTotal - paidAmount : 0;

  // Expected Cash In Drawer = Modal Awal + Penjualan Tunai
  const expectedCashInDrawer = currentShift.initialCashFloat + currentShift.totalCashSales;
  const cashDifference = actualCashCountedInput - expectedCashInDrawer;

  // Category Filter & Search
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const displayedProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;
    const matchesSearch =
      !barcodeInput ||
      prod.name.toLowerCase().includes(barcodeInput.toLowerCase()) ||
      prod.variants.some((v) => v.barcode.includes(barcodeInput));
    return matchesCategory && matchesSearch;
  });

  // Auto focus barcode input
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Keyboard Shortcuts: F12 (Bayar), F4 (Promo), F2 (Barcode), Esc (Close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        if (retailCart.length > 0 && !showPaymentModal && currentShift.isOpen) {
          setPaidAmount(grandTotal);
          setPaymentMethod('TUNAI');
          setQrisPaidSuccess(false);
          setShowPaymentModal(true);
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        setShowPromoModal(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setShowPaymentModal(false);
        setShowReceiptModal(false);
        setShowPromoModal(false);
        setShowCloseShiftModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [retailCart.length, showPaymentModal, grandTotal, currentShift.isOpen]);

  // Scan barcode otomatis saat membaca barcode produk, varian unit, atau kartu member One Identity
  const handleBarcodeInput = (val: string) => {
    setBarcodeInput(val);
    const trimmed = val.trim();
    if (trimmed.length >= 8) {
      // Check if scanned barcode is a Member One Identity card
      const matchingMember = membersList.find(
        (m) => m.barcode === trimmed || m.memberCode === trimmed,
      );
      if (matchingMember) {
        selectActiveMember(matchingMember.memberCode);
        setBarcodeInput('');
        return;
      }

      // Check product variants
      for (const prod of products) {
        const matchingVariant = prod.variants.find((v) => v.barcode === trimmed);
        if (matchingVariant) {
          addToRetailCart(prod, matchingVariant);
          setBarcodeInput('');
          return;
        }
      }
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const trimmed = barcodeInput.trim();

    // 1. Check if input is a Member barcode / member code
    const matchingMember = membersList.find(
      (m) =>
        m.barcode === trimmed ||
        m.memberCode.toLowerCase() === trimmed.toLowerCase() ||
        m.phone === trimmed,
    );
    if (matchingMember) {
      selectActiveMember(matchingMember.memberCode);
      setBarcodeInput('');
      return;
    }

    // 2. Search by exact barcode in variants
    for (const prod of products) {
      const matchingVariant = prod.variants.find((v) => v.barcode === trimmed);
      if (matchingVariant) {
        addToRetailCart(prod, matchingVariant);
        setBarcodeInput('');
        return;
      }
    }

    // 3. Search by product name (default to base unit)
    const foundByName = products.find((p) =>
      p.name.toLowerCase().includes(trimmed.toLowerCase()),
    );
    if (foundByName) {
      const baseVariant = foundByName.variants.find((v) => v.isBaseUnit) || foundByName.variants[0];
      addToRetailCart(foundByName, baseVariant);
      setBarcodeInput('');
      return;
    }

    alert(`Produk atau Member dengan barcode/nama "${barcodeInput}" tidak ditemukan.`);
  };

  // Selesaikan Transaksi Pembayaran
  const handleCompleteTransaction = () => {
    if (!currentShift.isOpen) {
      alert('Shift kasir belum dibuka! Silakan buka shift kasir terlebih dahulu.');
      setShowOpenShiftModal(true);
      return;
    }

    if (!isPaymentSufficient) {
      if (paymentMethod === 'TUNAI') {
        alert(`Uang pembayaran tunai kurang sebesar Rp ${shortageAmount.toLocaleString('id-ID')}`);
      } else if (paymentMethod === 'QRIS') {
        alert('Harap selesaikan pembayaran QRIS terlebih dahulu.');
      }
      return;
    }

    const effectivePaid = paymentMethod === 'TUNAI' ? paidAmount : grandTotal;

    // Eksekusi transaksi di EcosystemContext (potong stok, tambah poin, simpan ke Dexie & API)
    const result = addRetailTransaction(effectivePaid, paymentMethod, discountTotal);

    // Update sales totals in active shift
    setCurrentShift((prev) => ({
      ...prev,
      totalCashSales: paymentMethod === 'TUNAI' ? prev.totalCashSales + grandTotal : prev.totalCashSales,
      totalQrisSales: paymentMethod === 'QRIS' ? prev.totalQrisSales + grandTotal : prev.totalQrisSales,
      totalCardSales: paymentMethod === 'KARTU' ? prev.totalCardSales + grandTotal : prev.totalCardSales,
      totalTransactions: prev.totalTransactions + 1,
    }));

    setLastInvoice(result);
    setShowPaymentModal(false);
    setShowReceiptModal(true);

    // Reset promo after transaction completes
    setSelectedPromo(RETAIL_PROMOS[0]);

    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 500);
  };

  // Shift Management Handlers
  const handleOpenShift = () => {
    const newShift: CashierShift = {
      id: `SHF-${Date.now().toString().slice(-4)}`,
      cashierId: currentUser.id || 'usr-003',
      cashierName: currentUser.name || 'Siti Rahma',
      openedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      initialCashFloat: openCashFloatInput,
      totalCashSales: 0,
      totalQrisSales: 0,
      totalCardSales: 0,
      totalTransactions: 0,
      isOpen: true,
    };
    setCurrentShift(newShift);
    setShowOpenShiftModal(false);
  };

  const handleOpenCloseShiftModal = () => {
    setActualCashCountedInput(expectedCashInDrawer);
    setShiftNotesInput('');
    setShowCloseShiftModal(true);
  };

  const handleConfirmCloseShift = () => {
    const closedShift: CashierShift = {
      ...currentShift,
      closedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      actualCashCounted: actualCashCountedInput,
      cashDifference: actualCashCountedInput - expectedCashInDrawer,
      notes: shiftNotesInput,
      isOpen: false,
    };

    setCurrentShift(closedShift);
    setLastClosedShift(closedShift);
    setShowCloseShiftModal(false);
    setShowZReportModal(true);
  };

  return (
    <div className="flex flex-col gap-3.5 h-full overflow-hidden">
      {/* ======================================================== */}
      {/* TOP HEADER: SaaS Retail POS (matching reference mockup)   */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between pb-1 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            SaaS Retail POS
          </h1>
        </div>

        {/* Top Right: Shift Status, Promo, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Shift Status Pill */}
          <button
            type="button"
            onClick={() => setShowShiftDetailsModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs transition cursor-pointer shadow-2xs"
            title="Klik untuk lihat detail Shift Kasir"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                currentShift.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold text-slate-700">
              Shift #{currentShift.id.slice(-4)}
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-emerald-700 font-bold">
              Rp {expectedCashInDrawer.toLocaleString('id-ID')}
            </span>
          </button>

          {/* Promo (F4) Button */}
          <button
            type="button"
            onClick={() => setShowPromoModal(true)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              selectedPromo.id !== 'NONE'
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">
              {selectedPromo.id !== 'NONE' ? selectedPromo.name : 'Promo (F4)'}
            </span>
          </button>

          {/* Tutup Shift Button */}
          {currentShift.isOpen ? (
            <button
              type="button"
              onClick={handleOpenCloseShiftModal}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-full text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tutup Shift</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowOpenShiftModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Buka Shift</span>
            </button>
          )}

          {/* Profile User Icon with Chevron Down (exact match to reference mockup) */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200">
            <button
              type="button"
              onClick={() => setShowShiftDetailsModal(true)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 transition cursor-pointer"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              <User className="w-4 h-4" />
            </button>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main POS Split Layout: 8 Cols Left (Catalog), 4 Cols Right (Cart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 overflow-hidden min-h-0">
        {/* LEFT: Product Catalog & Search */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
          {/* Search Bar matching reference image */}
          <div className="relative w-full shrink-0">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Search"
              value={barcodeInput}
              onChange={(e) => handleBarcodeInput(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200/90 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 text-sm shadow-2xs transition"
            />
            {barcodeInput ? (
              <button
                type="button"
                onClick={() => setBarcodeInput('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <div className="absolute right-4 top-3.5 text-slate-400">
                <Barcode className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Rounded-full Category Pills matching reference image */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'bg-white text-slate-900 border-2 border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid - 4 Columns */}
          <div className="flex-1 overflow-y-auto pr-1">
            {displayedProducts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-1">
                <p className="text-sm font-semibold text-slate-600">Tidak ada produk yang cocok</p>
                <p className="text-xs text-slate-400">Silakan ubah filter kategori atau kata kunci pencarian barcode.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {displayedProducts.map((prod) => {
                  const baseVariant = prod.variants.find((v) => v.isBaseUnit) || prod.variants[0];
                  return (
                    <div
                      key={prod.id}
                      onClick={() => baseVariant && addToRetailCart(prod, baseVariant)}
                      className="bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all duration-200 p-3.5 flex flex-col justify-between cursor-pointer group hover:border-slate-300"
                    >
                      {/* Product Image Container */}
                      <div className="w-full h-32 rounded-xl bg-slate-50 flex items-center justify-center p-2 mb-2.5 overflow-hidden select-none">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="max-h-28 w-auto object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-xs"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-slate-400" />
                        )}
                      </div>

                      {/* Text Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-slate-400 text-xs font-normal mb-0.5 truncate">
                            {prod.category}
                          </p>
                          <h4 className="text-slate-900 font-bold text-xs sm:text-sm line-clamp-1 leading-snug">
                            {prod.name}
                          </h4>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-slate-900 font-extrabold text-sm sm:text-base font-sans">
                            IDR {(baseVariant?.price || 0).toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            /{baseVariant?.unitName || prod.baseUnitName}
                          </span>
                        </div>

                        {/* Multi-unit variant pills (Satuan bertingkat: Dus, Bal, Karton) */}
                        {prod.variants.length > 1 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {prod.variants.map((v) => (
                              <button
                                key={v.unitName}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToRetailCart(prod, v);
                                }}
                                className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer font-medium whitespace-nowrap active:scale-95 ${
                                  v.isBaseUnit
                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                }`}
                                title={`Tambah 1 ${v.unitName} (Rp ${v.price.toLocaleString('id-ID')})`}
                              >
                                +{v.unitName}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Active Cashier Cart Panel */}
        <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col h-full overflow-hidden">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-2 mb-1 shrink-0">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Cart
              </h2>
              {retailCart.length > 0 && (
                <button
                  type="button"
                  onClick={clearRetailCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Member Loyalty Banner matching reference mockup */}
            <div
              onClick={() => setShowMemberModal(true)}
              className="bg-amber-50/50 hover:bg-amber-50 border border-amber-200/70 rounded-2xl p-3 flex items-center justify-between mb-4 cursor-pointer transition shadow-2xs shrink-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Member Loyalty</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activeMember.fullName} ({activeMember.totalLoyaltyPoints} Pts)
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
              {retailCart.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-600">Keranjang kasir kosong</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pilih produk di katalog untuk transaksi.</p>
                </div>
              ) : (
                retailCart.map((item) => {
                  const itemProd = products.find((p) => p.id === item.productId);
                  return (
                    <div
                      key={`${item.productId}-${item.unitVariant.unitName}`}
                      className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          {itemProd?.imageUrl ? (
                            <img
                              src={itemProd.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">{item.productName}</p>
                          <p className="text-slate-900 font-extrabold text-xs mt-0.5 font-sans">
                            IDR {item.unitPrice.toLocaleString('id-ID')}
                            <span className="font-normal text-slate-400 text-[10px] ml-1">
                              • {item.unitVariant.unitName}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Stepper matching reference image */}
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shrink-0 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateRetailCartQty(item.productId, item.unitVariant.unitName, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900 min-w-[20px] text-center font-sans">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRetailCartQty(item.productId, item.unitVariant.unitName, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Subtotal & Checkout Bottom Bar */}
            <div className="border-t border-slate-100 pt-3.5 mt-auto shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-sm font-medium">Subtotal</span>
                <span className="text-slate-900 font-extrabold text-base font-sans">
                  IDR {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>

              {discountTotal > 0 && (
                <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-2">
                  <span>Diskon ({selectedPromo.name})</span>
                  <span>-IDR {discountTotal.toLocaleString('id-ID')}</span>
                </div>
              )}

              {/* Primary Green Checkout Button */}
              <button
                disabled={retailCart.length === 0}
                onClick={() => {
                  setPaidAmount(grandTotal);
                  setPaymentMethod('TUNAI');
                  setQrisPaidSuccess(false);
                  setShowPaymentModal(true);
                }}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-xl text-center text-sm shadow-sm transition active:scale-[0.99] cursor-pointer"
              >
                Checkout
              </button>

              {/* Quick Tender Options: Cash, QRIS, Card */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button
                  type="button"
                  disabled={retailCart.length === 0}
                  onClick={() => {
                    setPaidAmount(grandTotal);
                    setPaymentMethod('TUNAI');
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-40"
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Cash
                </button>
                <button
                  type="button"
                  disabled={retailCart.length === 0}
                  onClick={() => {
                    setPaidAmount(grandTotal);
                    setPaymentMethod('QRIS');
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-40"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-600" /> QRIS
                </button>
                <button
                  type="button"
                  disabled={retailCart.length === 0}
                  onClick={() => {
                    setPaidAmount(grandTotal);
                    setPaymentMethod('KARTU');
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-40"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL MEMBER LOYALTY SELECTOR                            */}
      {/* ======================================================== */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl shadow-xl bg-white space-y-4 animate-fadeIn border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Pilih Member Loyalty</h3>
                  <p className="text-[11px] text-slate-500">Poin: Rp 100rb = 1 Poin | Kupon: Rp 150rb = 1 Kupon</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {membersList.map((m) => {
                const isSelected = activeMember.memberCode === m.memberCode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      selectActiveMember(m.memberCode);
                      setShowMemberModal(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{m.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Kode: {m.memberCode}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-700 text-xs">{m.totalLoyaltyPoints} Poin</span>
                      <p className="text-[10px] text-purple-700 font-medium">
                        {m.doorprizeCoupons?.length || 0} Kupon
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL SHIFT DETAILS & SUMMARY                            */}
      {/* ======================================================== */}
      {showShiftDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl shadow-xl bg-white space-y-4 animate-fadeIn border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Status Shift Kasir</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShiftDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nomor Shift:</span>
                <span className="font-mono font-bold text-slate-800">#{currentShift.id.slice(-4)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Petugas Kasir:</span>
                <span className="font-bold text-slate-800">{currentShift.cashierName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Waktu Buka Shift:</span>
                <span className="font-mono text-slate-800">{currentShift.openedAt}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Modal Kas Awal:</span>
                <span className="font-mono font-bold text-emerald-700">
                  Rp {currentShift.initialCashFloat.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total Transaksi Selesai:</span>
                <span className="font-bold text-slate-800">{currentShift.totalTransactions} Tx</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Saldo Kas Drawer (Laci Kasir):</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  Rp {expectedCashInDrawer.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowShiftDetailsModal(false);
                  handleOpenCloseShiftModal();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer text-center"
              >
                Tutup Shift & Z-Report
              </button>
              <button
                type="button"
                onClick={() => setShowShiftDetailsModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: BUKA SHIFT KASIR BARU                           */}
      {/* ======================================================== */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated w-full max-w-md p-6 rounded-3xl shadow-2xl bg-white space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Buka Shift Kasir Baru</h3>
                <p className="text-xs text-slate-500">Pencatatan kas drawer awal sebelum transaksi dimulai.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs text-slate-600">
              <p>
                Petugas Kasir: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})
              </p>
              <p>
                Waktu Buka: <strong className="text-slate-900 font-mono">{new Date().toLocaleString('id-ID')}</strong>
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Modal Kas Awal Kasir (Cash Float di Laci Kas)
              </label>
              <input
                type="number"
                value={openCashFloatInput || ''}
                onChange={(e) => setOpenCashFloatInput(Number(e.target.value))}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xl focus:outline-none focus:border-emerald-500 shadow-xs"
              />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[100000, 200000, 300000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setOpenCashFloatInput(amt)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono font-medium text-slate-700 border border-slate-200 transition"
                  >
                    Rp {amt / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOpenShiftModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleOpenShift}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                Mulai Buka Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TUTUP SHIFT & REKONSILIASI KAS (Z-REPORT)       */}
      {/* ======================================================== */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated w-full max-w-lg p-6 rounded-3xl shadow-2xl bg-white space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <PowerOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Penutupan Shift & Rekonsiliasi Kas</h3>
                  <p className="text-xs text-slate-500">Rekonsiliasi fisik uang laci vs sistem kasir (Z-Report)</p>
                </div>
              </div>
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Shift Financial Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                  Informasi Shift
                </span>
                <p>Kasir: <strong className="text-slate-900">{currentShift.cashierName}</strong></p>
                <p>Jam Buka: <strong className="text-slate-900 font-mono">{currentShift.openedAt}</strong></p>
                <p>Total Nota: <strong className="text-emerald-700 font-mono">{currentShift.totalTransactions} Transaksi</strong></p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                  Rincian Penjualan Shift
                </span>
                <p>Penjualan Tunai: <strong className="text-slate-900 font-mono">Rp {currentShift.totalCashSales.toLocaleString('id-ID')}</strong></p>
                <p>Penjualan QRIS: <strong className="text-slate-900 font-mono">Rp {currentShift.totalQrisSales.toLocaleString('id-ID')}</strong></p>
                <p>Penjualan Kartu: <strong className="text-slate-900 font-mono">Rp {currentShift.totalCardSales.toLocaleString('id-ID')}</strong></p>
              </div>
            </div>

            {/* Expected Cash Drawer */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-800 font-semibold">Estimasi Kas Sistem di Laci Drawer:</p>
                <p className="text-[10px] text-emerald-600 font-mono">
                  (Modal Awal: Rp {currentShift.initialCashFloat.toLocaleString('id-ID')} + Tunai: Rp {currentShift.totalCashSales.toLocaleString('id-ID')})
                </p>
              </div>
              <span className="text-xl font-black text-emerald-700 font-mono">
                Rp {expectedCashInDrawer.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Actual Cash Input */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Hitungan Uang Fisik Kasir di Laci (Uang Kertas + Koin)
              </label>
              <input
                type="number"
                value={actualCashCountedInput || ''}
                onChange={(e) => setActualCashCountedInput(Number(e.target.value))}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xl focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

            {/* Variance Difference Badge */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                cashDifference === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : cashDifference > 0
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {cashDifference === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  {cashDifference === 0
                    ? 'Status Kas: SEIMBANG (MATCH 100%)'
                    : cashDifference > 0
                    ? 'Status Kas: LEBIH / SURPLUS'
                    : 'Status Kas: SELISIH KURANG (DEFISIT)'}
                </span>
              </div>
              <span className="font-mono text-sm">
                {cashDifference === 0
                  ? 'Rp 0'
                  : `${cashDifference > 0 ? '+' : ''}Rp ${cashDifference.toLocaleString('id-ID')}`}
              </span>
            </div>

            {/* Shift Notes */}
            <div>
              <label className="text-xs text-slate-600 block mb-1">Catatan Serah Terima Shift (Opsional):</label>
              <textarea
                rows={2}
                value={shiftNotesInput}
                onChange={(e) => setShiftNotesInput(e.target.value)}
                placeholder="Catatan kondisi uang kecil, kendala printer, atau catatan serah terima..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseShiftModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseShift}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                Konfirmasi Tutup Shift (Z-Report)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: Z-REPORT THERMAL PRINT SLIP                     */}
      {/* ======================================================== */}
      {showZReportModal && lastClosedShift && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated w-full max-w-sm p-6 rounded-3xl shadow-2xl bg-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Slip Z-Report Selesai
              </h3>
              <button onClick={() => setShowZReportModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            {/* Z-Report Thermal Preview */}
            <div className="bg-white text-slate-900 p-4 rounded-xl font-mono text-xs leading-relaxed border border-slate-300 shadow-inner">
              <div className="text-center pb-2 border-b border-dashed border-gray-400">
                <p className="font-extrabold text-sm">ORIENTAL RETAIL SWALAYAN</p>
                <p className="text-[10px] text-slate-600">LAPORAN PENUTUPAN SHIFT (Z-REPORT)</p>
                <p className="text-[10px] text-slate-500 font-mono">Shift ID: {lastClosedShift.id}</p>
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
                <p>Kasir      : {lastClosedShift.cashierName}</p>
                <p>Jam Buka   : {lastClosedShift.openedAt}</p>
                <p>Jam Tutup  : {lastClosedShift.closedAt}</p>
                <p>Total Nota : {lastClosedShift.totalTransactions} Transaksi</p>
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Modal Awal (Float):</span>
                  <span>Rp {lastClosedShift.initialCashFloat.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penjualan Tunai:</span>
                  <span>Rp {lastClosedShift.totalCashSales.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penjualan QRIS:</span>
                  <span>Rp {lastClosedShift.totalQrisSales.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penjualan Kartu:</span>
                  <span>Rp {lastClosedShift.totalCardSales.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-dotted border-gray-300">
                  <span>Total Omset Shift:</span>
                  <span>
                    Rp{' '}
                    {(
                      lastClosedShift.totalCashSales +
                      lastClosedShift.totalQrisSales +
                      lastClosedShift.totalCardSales
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                <div className="flex justify-between font-semibold">
                  <span>Kas Sistem Drawer:</span>
                  <span>Rp {(lastClosedShift.initialCashFloat + lastClosedShift.totalCashSales).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Fisik Kas Dihitung:</span>
                  <span>Rp {(lastClosedShift.actualCashCounted || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800">
                  <span>Selisih Fisik:</span>
                  <span>Rp {(lastClosedShift.cashDifference || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {lastClosedShift.notes && (
                <div className="py-1 text-[10px] text-slate-600 border-b border-dashed border-gray-400">
                  <p>Catatan: {lastClosedShift.notes}</p>
                </div>
              )}

              <div className="pt-3 text-[10px] text-center space-y-4">
                <div className="flex justify-between px-4 pt-2">
                  <div className="text-center">
                    <p>Kasir Bertugas</p>
                    <div className="h-8" />
                    <p className="border-t border-slate-400 pt-0.5">({lastClosedShift.cashierName})</p>
                  </div>
                  <div className="text-center">
                    <p>Supervisor / SPV</p>
                    <div className="h-8" />
                    <p className="border-t border-slate-400 pt-0.5">( .................... )</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.print()}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition"
              >
                <Printer className="w-4 h-4" /> Cetak Slip Z
              </button>
              <button
                onClick={() => setShowZReportModal(false)}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: PROMO & VOUCHER ENGINE (F4)                     */}
      {/* ======================================================== */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated w-full max-w-md p-6 rounded-3xl shadow-2xl bg-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Pilih Promo & Voucher Retail</h3>
              </div>
              <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {RETAIL_PROMOS.map((p) => {
                const isSelected = selectedPromo.id === p.id;
                const isEligible = subtotal >= p.minSpend;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPromo(p);
                      setShowPromoModal(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left border transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{p.name}</span>
                        {p.requiresMember && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                            Khusus Member
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                      {p.minSpend > 0 && (
                        <p className="text-[10px] text-amber-700 font-mono mt-1">
                          Min. Belanja: Rp {p.minSpend.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 mt-0.5">
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                          ✓
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowPromoModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: MULTI-PAYMENT (TUNAI, QRIS, KARTU)              */}
      {/* ======================================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated w-full max-w-md p-6 rounded-3xl shadow-2xl bg-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pembayaran Kasir Retail</h3>
                <p className="text-xs text-slate-500">Pilih metode bayar pelanggan (F12)</p>
              </div>
              <span className="text-emerald-600 font-mono text-xl font-black">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentMethod('TUNAI')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'TUNAI'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('QRIS');
                  setQrisPaidSuccess(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'QRIS'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('KARTU')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'KARTU'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Kartu EDC</span>
              </button>
            </div>

            {/* METHOD 1: TUNAI */}
            {paymentMethod === 'TUNAI' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1.5 font-medium">
                    Uang Diterima dari Pelanggan (Tunai)
                  </label>
                  <input
                    type="number"
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xl focus:outline-none focus:border-emerald-500 shadow-xs"
                    autoFocus
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[20000, 50000, 100000, 200000, 500000].map((nom) => (
                    <button
                      key={nom}
                      onClick={() => setPaidAmount(nom)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono text-slate-700 border border-slate-200 transition"
                    >
                      Rp {nom.toLocaleString('id-ID')}
                    </button>
                  ))}
                  <button
                    onClick={() => setPaidAmount(grandTotal)}
                    className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-mono font-bold hover:bg-emerald-100 transition"
                  >
                    Uang Pas
                  </button>
                </div>

                {/* Kembalian / Selisih Kurang */}
                {isPaymentSufficient ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <span className="text-sm text-slate-700">Kembalian Kasir:</span>
                    <span className="text-xl font-bold text-emerald-700 font-mono">
                      Rp {changeAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between text-rose-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <span className="text-xs font-semibold">Uang Pembayaran Kurang:</span>
                    </div>
                    <span className="text-base font-bold text-rose-600 font-mono">
                      - Rp {shortageAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* METHOD 2: QRIS DINAMIS */}
            {paymentMethod === 'QRIS' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl border-2 border-emerald-500 shadow-md flex flex-col items-center justify-center">
                  <QrCode className="w-32 h-32 text-slate-900" />
                  <span className="text-[9px] font-mono font-bold text-slate-500">QRIS STANDAR BI</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Scan QRIS Dinamis Pelanggan</p>
                  <p className="text-[11px] text-slate-500">
                    Nominal tagihan: <strong className="text-emerald-600 font-mono">Rp {grandTotal.toLocaleString('id-ID')}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQrisPaidSuccess(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto ${
                    qrisPaidSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{qrisPaidSuccess ? 'QRIS Terkonfirmasi Lunas!' : 'Simulasikan Pembayaran QRIS Sukses'}</span>
                </button>
              </div>
            )}

            {/* METHOD 3: KARTU DEBIT / KREDIT */}
            {paymentMethod === 'KARTU' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Nomor Approval / Trace EDC (Opsional)</label>
                  <input
                    type="text"
                    value={cardRefNumber}
                    onChange={(e) => setCardRefNumber(e.target.value)}
                    placeholder="Contoh: APPR-881923"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Pastikan struk EDC telah berhasil dicetak dari mesin gesek sebelum menyelesaikan nota kasir.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                disabled={!isPaymentSufficient}
                onClick={handleCompleteTransaction}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${
                  isPaymentSufficient
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {isPaymentSufficient ? 'Selesaikan Transaksi' : 'Uang Belum Cukup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: THERMAL RECEIPT 80MM PREVIEW                    */}
      {/* ======================================================== */}
      {showReceiptModal && lastInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated w-full max-w-sm p-6 rounded-3xl shadow-2xl bg-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" /> Transaksi Berhasil!
              </h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
                ✕
              </button>
            </div>

            <div
              id="thermal-receipt-area"
              className="bg-white text-slate-900 p-4 rounded-xl font-mono text-xs leading-relaxed shadow-sm border border-slate-200"
            >
              <div className="text-center pb-2 border-b border-dashed border-gray-400">
                <p className="font-bold text-sm">ORIENTAL RETAIL SWALAYAN</p>
                <p className="text-[10px] text-slate-600">Jl. Gatot Subroto No. 88, Pusat Ekosistem</p>
                <p className="text-[10px] text-slate-600">NPWP: 01.234.567.8-901.000</p>
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[10px]">
                <p>No. Faktur : {lastInvoice.invoiceNumber}</p>
                <p>Kasir      : {currentShift.cashierName}</p>
                <p>Tanggal    : {new Date().toLocaleString('id-ID')}</p>
                <p>Member ID  : {member.code} ({member.name.split(' ')[0]})</p>
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 space-y-1">
                {lastInvoice.items.map((item) => (
                  <div key={`${item.productId}-${item.unitVariant.unitName}`} className="flex justify-between">
                    <div>
                      <p>{item.productName} ({item.unitVariant.unitName})</p>
                      <p className="text-[10px] text-gray-600">
                        {item.quantity} x Rp {item.unitPrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <span className="font-bold">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-amber-800 font-bold">
                    <span>Diskon Promo:</span>
                    <span>-Rp {discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-1 border-t border-dotted border-gray-300">
                  <span>Total Tagihan:</span>
                  <span>Rp {lastInvoice.grandTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{paymentMethod === 'TUNAI' ? 'Tunai Diterima:' : `Dibayar via ${paymentMethod}:`}</span>
                  <span>Rp {lastInvoice.paidAmount.toLocaleString('id-ID')}</span>
                </div>
                {paymentMethod === 'TUNAI' && (
                  <div className="flex justify-between font-bold">
                    <span>Kembalian:</span>
                    <span>Rp {lastInvoice.changeAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {/* Loyalty & Doorprize Coupon Section */}
              <div className="pt-2 text-center text-[10px] space-y-1">
                <p className="font-bold text-emerald-800">
                  ★ POIN LOYALITAS DIDAPAT: +{lastInvoice.pointsEarned} POIN ★
                </p>
                {lastInvoice.couponsEarned > 0 && (
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-300 text-amber-950 my-1 space-y-1">
                    <p className="font-extrabold text-[11px] text-amber-900">
                      🎁 KUPON UNDIAN DOORPRIZE (+{lastInvoice.couponsEarned}) 🎁
                    </p>
                    <p className="text-[9px] text-amber-800">Periode: 01 Sept 2026 - 30 Sept 2027</p>
                    <div className="flex flex-wrap gap-1 justify-center pt-0.5">
                      {lastInvoice.couponCodes?.map((code) => (
                        <span
                          key={code}
                          className="bg-white border border-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono shadow-2xs"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[9px] text-gray-600 mt-1 font-semibold">
                  Saldo Poin Member Terkini: {activeMember.totalLoyaltyPoints} Poin
                </p>
                <p className="text-[9px] text-gray-500 mt-1">
                  Terima kasih telah berbelanja di Oriental Retail!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => window.print()}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition"
              >
                <Printer className="w-4 h-4" /> Cetak Struk
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailPOS;
