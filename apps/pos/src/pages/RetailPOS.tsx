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
  ChevronLeft,
  Building2,
  Smartphone,
  Wallet,
  Landmark,
  Calendar,
  TicketPercent,
  Flame,
  ScanBarcode,
  Maximize2,
  BookmarkCheck,
  History,
  Layers,
} from 'lucide-react';
import { LOYALTY_POINT_RULES, ProductWithMultiUnit, ProductUnitVariant } from '@oriental/types';
import { useEcosystem, RetailCartItem } from '../context/EcosystemContext';

export interface ParkedCart {
  id: string;
  timestamp: string;
  memberCode: string;
  memberName: string;
  items: RetailCartItem[];
  promoId: string;
  grandTotal: number;
}

export const RUNNING_PROMOS = [
  { item: 'Minyak Goreng Oriental 2L', promo: 'Tebus Murah Rp 28.000 (Min. Belanja 100rb)' },
  { item: 'Beras Premium Pulen 5Kg', promo: 'Diskon 5% Khusus Member One Identity' },
  { item: 'Indomie Goreng Spc (Karton)', promo: 'Beli 2 Karton Hemat Rp 10.000' },
  { item: 'Maklon Minyak Goreng Oriental 1L', promo: 'Poin Ganda Maklon (1pt / 10rb)' },
];

export interface VisualPromoItem {
  id: string;
  item: string;
  promo: string;
  tag: string;
  badgeBg: string;
  gradientBg: string;
  borderCol: string;
  imageUrl: string;
  discountNote: string;
  targetPromoId?: string;
}

export const VISUAL_PROMOS: VisualPromoItem[] = [
  {
    id: 'promo-1',
    item: 'Minyak Goreng Oriental 2L',
    promo: 'Tebus Murah Rp 28.000',
    tag: 'TEBUS MURAH',
    badgeBg: 'bg-amber-600 text-white',
    gradientBg: 'from-amber-500/10 via-orange-500/10 to-amber-50/70',
    borderCol: 'border-amber-200/90',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
    discountNote: 'Min. Belanja Rp 100.000 (Hemat Rp 6.000)',
    targetPromoId: 'PROMO-TEBUS-01',
  },
  {
    id: 'promo-2',
    item: 'Beras Premium Pulen 5Kg',
    promo: 'Diskon 5% Member One Identity',
    tag: 'MEMBER ONLY',
    badgeBg: 'bg-emerald-600 text-white',
    gradientBg: 'from-emerald-500/10 via-teal-500/10 to-emerald-50/70',
    borderCol: 'border-emerald-200/90',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    discountNote: 'Cashback 5% Poin Ekstra + Potongan Langsung',
    targetPromoId: 'PROMO-MEMBER-01',
  },
  {
    id: 'promo-3',
    item: 'Indomie Goreng Spc (Karton)',
    promo: 'Beli 2 Karton Hemat Rp 10.000',
    tag: 'HEMAT PAKET',
    badgeBg: 'bg-rose-600 text-white',
    gradientBg: 'from-rose-500/10 via-red-500/10 to-rose-50/70',
    borderCol: 'border-rose-200/90',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
    discountNote: 'Promo bundling all varian mi instan dus',
    targetPromoId: 'PROMO-B2G1-01',
  },
  {
    id: 'promo-4',
    item: 'Roti Manis Oriental Bakery (Maklon)',
    promo: 'Poin Reward Ganda (2x Poin)',
    tag: 'POIN 2X GANDA',
    badgeBg: 'bg-purple-600 text-white',
    gradientBg: 'from-purple-500/10 via-indigo-500/10 to-purple-50/70',
    borderCol: 'border-purple-200/90',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    discountNote: '1 Poin per Rp 10.000 lini produk pabrikan',
    targetPromoId: 'NONE',
  },
  {
    id: 'promo-5',
    item: 'Promo Gajian Akhir Bulan',
    promo: 'Potongan Rp 25.000 Langsung',
    tag: 'VOUCHER CASHBACK',
    badgeBg: 'bg-blue-600 text-white',
    gradientBg: 'from-blue-500/10 via-sky-500/10 to-blue-50/70',
    borderCol: 'border-blue-200/90',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&auto=format&fit=crop&q=80',
    discountNote: 'Gunakan Voucher PAYDAY25K (Min. Rp 100.000)',
    targetPromoId: 'VOUCHER-PAYDAY-25K',
  },
];

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

export interface RetailPromo {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'PERCENTAGE' | 'NOMINAL' | 'BUY_X_GET_Y' | 'MEMBER_VOUCHER';
  value: number;
  minSpend: number;
  maxDiscount?: number;
  requiresMember?: boolean;
  quotaType: 'DAILY' | 'PERIOD' | 'UNLIMITED'; // Kuota Harian vs Kuota Periode
  totalQuota: number;
  usedQuota: number;
  validFrom: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  dailyResetDate?: string; // YYYY-MM-DD
}

export const INITIAL_RETAIL_PROMOS: RetailPromo[] = [
  {
    id: 'NONE',
    code: 'NONE',
    name: 'Tanpa Promo / Voucher',
    description: 'Harga reguler swalayan tanpa potongan promo',
    type: 'NOMINAL',
    value: 0,
    minSpend: 0,
    quotaType: 'UNLIMITED',
    totalQuota: 999999,
    usedQuota: 0,
    validFrom: '2026-01-01',
    validUntil: '2030-12-31',
  },
  {
    id: 'VCR_MBR_10K',
    code: 'MEMBER10K',
    name: 'Voucher Potongan Member Rp 10.000',
    description: 'Potongan Rp 10.000 belanja min. Rp 30.000 (Khusus Member One Identity)',
    type: 'MEMBER_VOUCHER',
    value: 10000,
    minSpend: 30000,
    requiresMember: true,
    quotaType: 'DAILY',
    totalQuota: 30, // 30 voucher per hari
    usedQuota: 7,  // 7 terpakai hari ini, sisa 23
    validFrom: '2026-09-01',
    validUntil: '2026-12-31',
  },
  {
    id: 'VCR_MBR_5K_NO_MIN',
    code: 'WELCOME5K',
    name: 'Voucher Belanja Member Rp 5.000 (Tanpa Min. Belanja)',
    description: 'Potongan langsung Rp 5.000 tanpa batas minimum belanja untuk member setia',
    type: 'MEMBER_VOUCHER',
    value: 5000,
    minSpend: 0,
    requiresMember: true,
    quotaType: 'DAILY',
    totalQuota: 50, // 50 voucher per hari
    usedQuota: 14,
    validFrom: '2026-09-01',
    validUntil: '2026-12-31',
  },
  {
    id: 'VCR_MBR_GAJIAN_25K',
    code: 'SUPER25K',
    name: 'Voucher Spesial Payday Member Rp 25.000',
    description: 'Potongan Rp 25.000 belanja min. Rp 100.000 (Periode Promo Gajian Akhir Bulan)',
    type: 'MEMBER_VOUCHER',
    value: 25000,
    minSpend: 100000,
    requiresMember: true,
    quotaType: 'PERIOD',
    totalQuota: 100, // 100 kuota periode kampanye
    usedQuota: 45,
    validFrom: '2026-09-20',
    validUntil: '2026-10-05',
  },
  {
    id: 'DISC_5_PCT',
    code: 'SWALAYAN5',
    name: 'Diskon Swalayan 5% (Member & Umum)',
    description: 'Potongan 5% untuk total belanja di atas Rp 100.000 (Maks. potongan Rp 20.000)',
    type: 'PERCENTAGE',
    value: 5,
    minSpend: 100000,
    maxDiscount: 20000,
    quotaType: 'DAILY',
    totalQuota: 100, // 100 per hari
    usedQuota: 38,
    validFrom: '2026-09-01',
    validUntil: '2026-12-31',
  },
  {
    id: 'DISC_10_PCT',
    code: 'WEEKEND10',
    name: 'Diskon Super Weekend 10%',
    description: 'Potongan 10% untuk total belanja di atas Rp 200.000 (Maks. potongan Rp 35.000)',
    type: 'PERCENTAGE',
    value: 10,
    minSpend: 200000,
    maxDiscount: 35000,
    quotaType: 'PERIOD',
    totalQuota: 50, // 50 kuota per periode
    usedQuota: 42,
    validFrom: '2026-09-25',
    validUntil: '2026-10-10',
  },
  {
    id: 'BUY_2_GET_1',
    code: 'HEMATB2G1',
    name: 'Beli 2 Gratis 1 (Promo Hemat)',
    description: 'Gratis 1 produk termurah saat belanja 3 item atau lebih di keranjang',
    type: 'BUY_X_GET_Y',
    value: 0,
    minSpend: 0,
    quotaType: 'DAILY',
    totalQuota: 40,
    usedQuota: 18,
    validFrom: '2026-09-01',
    validUntil: '2026-12-31',
  },
  {
    id: 'VCR_MBR_FLASH_50K',
    code: 'FLASH50K',
    name: 'Voucher Member Flash Sale Rp 50.000',
    description: 'Potongan Rp 50.000 belanja min. Rp 150.000 (Kuota Terbatas Harian - Khusus Member)',
    type: 'MEMBER_VOUCHER',
    value: 50000,
    minSpend: 150000,
    requiresMember: true,
    quotaType: 'DAILY',
    totalQuota: 10,
    usedQuota: 10, // Kuota Harian Habis (0 Sisa)
    validFrom: '2026-09-01',
    validUntil: '2026-12-31',
  },
];

export const RETAIL_PROMOS = INITIAL_RETAIL_PROMOS;

export interface PromoEligibilityResult {
  isEligible: boolean;
  discount: number;
  reason?: string;
  remainingQuota: number;
}

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
    outletsList,
    activeOutletId,
    activeOutlet,
    setActiveOutletId,
    isEffectiveOnline,
    pendingOfflineCount,
    isOfflineSimulated,
  } = useEcosystem();

  // Real-time Clock (Integrated Top Action Bar)
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showOutletDropdown, setShowOutletDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Online / Offline Sync Status (Design UI.docx: merah/mencolok jika internet terputus)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 5x3 Product Grid Pagination (15 items per page as requested in Design UI.docx)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 15;

  // Variant / Multi-tier Modal State (Tampil setelah product card ditekan manual)
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<ProductWithMultiUnit | null>(null);
  const [showVariantModal, setShowVariantModal] = useState<boolean>(false);

  // Parkir Transaksi State (F7)
  const [parkedCarts, setParkedCarts] = useState<ParkedCart[]>([]);
  const [showParkedModal, setShowParkedModal] = useState<boolean>(false);

  // Input ref for Member search hotkey (F4)
  const memberInputRef = useRef<HTMLInputElement>(null);

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
  const [memberBarcodeQuery, setMemberBarcodeQuery] = useState('');
  const [memberSearchInModal, setMemberSearchInModal] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'QRIS' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'ORIENTAL_PAY' | 'LAINNYA'>('TUNAI');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [qrisPaidSuccess, setQrisPaidSuccess] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>('BCA');
  const [cardLast4, setCardLast4] = useState<string>('');
  const [cardRefNumber, setCardRefNumber] = useState<string>('');
  const [selectedCreditProvider, setSelectedCreditProvider] = useState<string>('Visa');
  const [selectedOtherMethod, setSelectedOtherMethod] = useState<string>('GoPay');
  const [otherRefNumber, setOtherRefNumber] = useState<string>('');

  // Visual Promo Carousel State (Auto-advance + pause on hover)
  const [activePromoIndex, setActivePromoIndex] = useState<number>(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setActivePromoIndex((prev) => (prev + 1) % VISUAL_PROMOS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);
  
  // Promo & Voucher System State (Daily & Period Quota Tracking)
  const [promosList, setPromosList] = useState<RetailPromo[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('oriental_retail_promos');
    if (saved) {
      try {
        const parsed: RetailPromo[] = JSON.parse(saved);
        return INITIAL_RETAIL_PROMOS.map((init) => {
          const found = parsed.find((p) => p.id === init.id);
          if (found) {
            // Auto reset daily quota if date changed
            if (found.quotaType === 'DAILY' && found.dailyResetDate && found.dailyResetDate !== today) {
              return { ...found, usedQuota: 0, dailyResetDate: today };
            }
            return found;
          }
          return { ...init, dailyResetDate: today };
        });
      } catch (e) {
        console.warn('Error reading saved promos:', e);
      }
    }
    return INITIAL_RETAIL_PROMOS.map((p) => ({ ...p, dailyResetDate: today }));
  });

  // Persist promos list to localStorage
  useEffect(() => {
    localStorage.setItem('oriental_retail_promos', JSON.stringify(promosList));
  }, [promosList]);

  const [selectedPromoId, setSelectedPromoId] = useState<string>('NONE');
  const [promoVoucherInput, setPromoVoucherInput] = useState<string>('');
  const [promoFilterTab, setPromoFilterTab] = useState<'ALL' | 'MEMBER_VOUCHER' | 'STORE_PROMO'>('ALL');

  const selectedPromo = promosList.find((p) => p.id === selectedPromoId) || promosList[0];
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showShiftDetailsModal, setShowShiftDetailsModal] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<{
    invoiceNumber: string;
    items: RetailCartItem[];
    grandTotal: number;
    subtotalAmount?: number;
    discountAmount?: number;
    promoName?: string;
    paidAmount: number;
    changeAmount: number;
    pointsEarned: number;
    couponsEarned: number;
    couponCodes?: string[];
    paymentMethodUsed?: string;
  } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const shelfScrollRef = useRef<HTMLDivElement>(null);

  // Smooth Horizontal Product Shelf Scrolling
  const scrollShelf = (direction: 'left' | 'right') => {
    if (shelfScrollRef.current) {
      shelfScrollRef.current.scrollBy({
        left: direction === 'left' ? -380 : 380,
        behavior: 'smooth',
      });
    }
  };

  const handleShelfWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (shelfScrollRef.current && Math.abs(e.deltaY) > 0) {
      shelfScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Member Barcode Search Handlers (Physical Card)
  const handleMemberBarcodeSearch = (val: string) => {
    setMemberBarcodeQuery(val);
    const trimmed = val.trim();
    if (trimmed.length >= 8) {
      const found = membersList.find(
        (m) =>
          m.barcode === trimmed ||
          m.memberCode.toLowerCase() === trimmed.toLowerCase() ||
          m.phone === trimmed,
      );
      if (found) {
        selectActiveMember(found.memberCode);
        setMemberBarcodeQuery('');
      }
    }
  };

  const applyMemberBarcode = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    const found = membersList.find(
      (m) =>
        m.barcode === trimmed ||
        m.memberCode.toLowerCase() === trimmed.toLowerCase() ||
        m.phone === trimmed ||
        m.fullName.toLowerCase().includes(trimmed.toLowerCase()),
    );
    if (found) {
      selectActiveMember(found.memberCode);
      setMemberBarcodeQuery('');
    } else {
      alert(`Member dengan barcode atau identitas "${trimmed}" tidak ditemukan.`);
    }
  };

  // Save active shift changes to localStorage
  useEffect(() => {
    localStorage.setItem('oriental_retail_shift', JSON.stringify(currentShift));
  }, [currentShift]);

  // Subtotal Calculation
  const subtotal = retailCart.reduce((sum, item) => sum + item.subtotal, 0);

  // Check Promo / Voucher Eligibility with Quota & Member Rules
  const checkPromoEligibility = (
    promo: RetailPromo,
    items: RetailCartItem[],
    sub: number,
    mbr: typeof activeMember,
  ): PromoEligibilityResult => {
    if (!promo || promo.id === 'NONE') {
      return { isEligible: true, discount: 0, remainingQuota: 999999 };
    }

    const today = new Date().toISOString().split('T')[0];
    const remainingQuota = Math.max(0, promo.totalQuota - promo.usedQuota);

    // 1. Quota Check (Daily or Period)
    if (promo.quotaType !== 'UNLIMITED' && remainingQuota <= 0) {
      return {
        isEligible: false,
        discount: 0,
        reason:
          promo.quotaType === 'DAILY'
            ? 'Kuota harian sudah habis untuk hari ini (0 sisa)'
            : 'Kuota periode promo ini telah habis',
        remainingQuota: 0,
      };
    }

    // 2. Validity Date Check
    if (today < promo.validFrom || today > promo.validUntil) {
      return {
        isEligible: false,
        discount: 0,
        reason: `Masa berlaku promo ${promo.validFrom} s/d ${promo.validUntil}`,
        remainingQuota,
      };
    }

    // 3. Member Requirement Check
    const isWalkIn = !mbr || mbr.memberCode === 'NON-MEMBER' || mbr.id === 'MEM-000';
    if (promo.requiresMember && isWalkIn) {
      return {
        isEligible: false,
        discount: 0,
        reason: 'Khusus member terdaftar One Identity (Pilih/Scan member terlebih dahulu)',
        remainingQuota,
      };
    }

    // 4. Cart Empty Check
    if (items.length === 0 || sub <= 0) {
      return {
        isEligible: false,
        discount: 0,
        reason: 'Keranjang belanja masih kosong',
        remainingQuota,
      };
    }

    // 5. Min Spend Check
    if (sub < promo.minSpend) {
      const shortage = promo.minSpend - sub;
      return {
        isEligible: false,
        discount: 0,
        reason: `Min. belanja Rp ${promo.minSpend.toLocaleString('id-ID')} (Kurang Rp ${shortage.toLocaleString('id-ID')})`,
        remainingQuota,
      };
    }

    // 6. Calculate Discount Amount
    let discount = 0;
    if (promo.type === 'NOMINAL' || promo.type === 'MEMBER_VOUCHER') {
      discount = Math.min(promo.value, sub);
    } else if (promo.type === 'PERCENTAGE') {
      const rawPct = Math.round((sub * promo.value) / 100);
      discount = promo.maxDiscount ? Math.min(rawPct, promo.maxDiscount) : rawPct;
    } else if (promo.type === 'BUY_X_GET_Y') {
      const totalQty = items.reduce((sum, it) => sum + it.quantity, 0);
      if (totalQty >= 3 && items.length > 0) {
        discount = Math.min(...items.map((it) => it.unitPrice));
      } else {
        return {
          isEligible: false,
          discount: 0,
          reason: 'Minimal 3 item produk dalam keranjang untuk promo Beli 2 Gratis 1',
          remainingQuota,
        };
      }
    }

    return {
      isEligible: true,
      discount,
      remainingQuota,
    };
  };

  // Apply Voucher Code Handler
  const handleApplyVoucherCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    const found = promosList.find((p) => p.code.toUpperCase() === trimmed);
    if (!found) {
      alert(`Kode voucher "${trimmed}" tidak valid atau tidak ditemukan.`);
      return;
    }
    const check = checkPromoEligibility(found, retailCart, subtotal, activeMember);
    setSelectedPromoId(found.id);
    setPromoVoucherInput('');
    if (!check.isEligible) {
      alert(`Voucher "${found.name}" dipilih, namun saat ini belum aktif: ${check.reason}`);
    } else {
      alert(`Voucher "${found.name}" berhasil diterapkan! Potongan: Rp ${check.discount.toLocaleString('id-ID')}`);
      setShowPromoModal(false);
    }
  };

  const promoStatus = checkPromoEligibility(selectedPromo, retailCart, subtotal, activeMember);
  const discountTotal = promoStatus.isEligible ? promoStatus.discount : 0;
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
      : paymentMethod === 'ORIENTAL_PAY'
      ? activeMember.memberCode !== 'NON-MEMBER' && (activeMember.orientalPayBalance || 0) >= grandTotal && grandTotal > 0
      : grandTotal > 0; // KARTU is sufficient if card swipe is done

  const changeAmount = paymentMethod === 'TUNAI' && isPaymentSufficient ? paidAmount - grandTotal : 0;
  const shortageAmount =
    paymentMethod === 'TUNAI'
      ? (!isPaymentSufficient ? grandTotal - paidAmount : 0)
      : paymentMethod === 'ORIENTAL_PAY'
      ? Math.max(0, grandTotal - (activeMember.orientalPayBalance || 0))
      : 0;

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

  // 5x3 Grid Pagination calculations
  const totalPages = Math.max(1, Math.ceil(displayedProducts.length / ITEMS_PER_PAGE));
  const currentProducts = displayedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset page when category filter or search input changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, barcodeInput]);

  // Parkir Transaksi (F7) Handlers
  const handleParkCart = () => {
    if (retailCart.length === 0) {
      if (parkedCarts.length > 0) {
        setShowParkedModal(true);
      } else {
        alert('Keranjang kasir kosong, tidak ada transaksi untuk diparkir.');
      }
      return;
    }

    const newParked: ParkedCart = {
      id: `PRK-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      memberCode: activeMember.memberCode,
      memberName: activeMember.fullName,
      items: [...retailCart],
      promoId: selectedPromoId,
      grandTotal,
    };

    setParkedCarts((prev) => [newParked, ...prev]);
    clearRetailCart();
    selectActiveMember('NON-MEMBER');
    setSelectedPromoId('NONE');
  };

  const handleRestoreParked = (parked: ParkedCart) => {
    if (retailCart.length > 0) {
      const confirmSwap = confirm(
        'Masih ada item di keranjang belanja saat ini. Apakah Anda ingin menimpa dengan transaksi parkir ini?',
      );
      if (!confirmSwap) return;
    }
    clearRetailCart();
    parked.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        for (let i = 0; i < item.quantity; i++) {
          addToRetailCart(prod, item.unitVariant);
        }
      }
    });
    selectActiveMember(parked.memberCode);
    setSelectedPromoId(parked.promoId);
    setParkedCarts((prev) => prev.filter((p) => p.id !== parked.id));
    setShowParkedModal(false);
  };

  // Auto focus barcode input
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Standardized Keyboard Shortcuts:
  // [F2] Barcode Search
  // [F4] Member Search / Input
  // [F6] Promo / Voucher
  // [F7] Parkir Transaksi
  // [F8] Bersihkan Keranjang
  // [F9] / [F12] Bayar / Checkout
  // [Esc] Tutup Modal / Batal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (memberInputRef.current) {
          memberInputRef.current.focus();
          memberInputRef.current.select();
        } else {
          setShowMemberModal(true);
        }
      } else if (e.key === 'F6') {
        e.preventDefault();
        setShowPromoModal(true);
      } else if (e.key === 'F7') {
        e.preventDefault();
        handleParkCart();
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (retailCart.length > 0) {
          if (confirm('Bersihkan seluruh keranjang belanja kasir saat ini?')) {
            clearRetailCart();
          }
        }
      } else if (e.key === 'F9' || e.key === 'F12') {
        e.preventDefault();
        if (retailCart.length > 0 && !showPaymentModal && currentShift.isOpen) {
          setPaidAmount(grandTotal);
          setPaymentMethod('TUNAI');
          setQrisPaidSuccess(false);
          setShowPaymentModal(true);
        }
      } else if (e.key === 'Escape') {
        setShowPaymentModal(false);
        setShowReceiptModal(false);
        setShowPromoModal(false);
        setShowCloseShiftModal(false);
        setShowMemberModal(false);
        setShowVariantModal(false);
        setShowParkedModal(false);
        setShowShiftDetailsModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    retailCart.length,
    showPaymentModal,
    grandTotal,
    currentShift.isOpen,
    parkedCarts,
    activeMember,
    selectedPromoId,
  ]);

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
        alert('Harap selesaikan atau konfirmasikan pembayaran QRIS terlebih dahulu.');
      }
      return;
    }

    let paymentMethodDescription = 'Tunai (Cash)';
    if (paymentMethod === 'TUNAI') {
      paymentMethodDescription = 'Tunai (Cash)';
    } else if (paymentMethod === 'QRIS') {
      paymentMethodDescription = 'QRIS Dinamis BI';
    } else if (paymentMethod === 'DEBIT_CARD') {
      paymentMethodDescription = `Debit Card (${selectedBank})${cardLast4 ? ` - ****${cardLast4}` : ''}${cardRefNumber ? ` [EDC: ${cardRefNumber}]` : ''}`;
    } else if (paymentMethod === 'CREDIT_CARD') {
      paymentMethodDescription = `Kredit Card (${selectedCreditProvider})${cardLast4 ? ` - ****${cardLast4}` : ''}${cardRefNumber ? ` [Appr: ${cardRefNumber}]` : ''}`;
    } else if (paymentMethod === 'ORIENTAL_PAY') {
      paymentMethodDescription = 'ORIENTAL_PAY';
    } else if (paymentMethod === 'LAINNYA') {
      paymentMethodDescription = `${selectedOtherMethod}${otherRefNumber ? ` [Ref: ${otherRefNumber}]` : ''}`;
    }

    const effectivePaid = paymentMethod === 'TUNAI' ? paidAmount : grandTotal;

    // Deduct quota if an active quota-bound promo was used
    if (selectedPromo.id !== 'NONE' && discountTotal > 0 && selectedPromo.quotaType !== 'UNLIMITED') {
      setPromosList((prev) =>
        prev.map((p) => {
          if (p.id === selectedPromo.id) {
            return {
              ...p,
              usedQuota: Math.min(p.totalQuota, p.usedQuota + 1),
            };
          }
          return p;
        }),
      );
    }

    // Eksekusi transaksi di EcosystemContext (potong stok, tambah poin, simpan ke Dexie & API)
    const result = addRetailTransaction(
      effectivePaid,
      paymentMethod === 'ORIENTAL_PAY' ? 'ORIENTAL_PAY' : paymentMethodDescription,
      discountTotal,
    );

    // Update sales totals in active shift
    setCurrentShift((prev) => ({
      ...prev,
      totalCashSales: paymentMethod === 'TUNAI' ? prev.totalCashSales + grandTotal : prev.totalCashSales,
      totalQrisSales: paymentMethod === 'QRIS' ? prev.totalQrisSales + grandTotal : prev.totalQrisSales,
      totalCardSales: (paymentMethod === 'DEBIT_CARD' || paymentMethod === 'CREDIT_CARD' || paymentMethod === 'LAINNYA' || paymentMethod === 'ORIENTAL_PAY') ? prev.totalCardSales + grandTotal : prev.totalCardSales,
      totalTransactions: prev.totalTransactions + 1,
    }));

    setLastInvoice({
      ...result,
      subtotalAmount: subtotal,
      discountAmount: discountTotal,
      promoName: selectedPromo.id !== 'NONE' && discountTotal > 0 ? selectedPromo.name : undefined,
      paymentMethodUsed: paymentMethodDescription,
    });
    setShowPaymentModal(false);
    setShowReceiptModal(true);

    // Reset promo after transaction completes
    setSelectedPromoId('NONE');
    setMemberBarcodeQuery('');
    setCardLast4('');
    setCardRefNumber('');
    setOtherRefNumber('');

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
    <div className="flex flex-col gap-2.5 h-full overflow-hidden">
      {/* ======================================================== */}
      {/* COMBINED TOP ACTION BAR: ORIENTAL SWALAYAN               */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl px-4 py-2 shadow-2xs shrink-0">
        {/* Left: Title & Active Branch Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              OS
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 font-heading tracking-tight leading-none">
                Oriental Swalayan
              </h1>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Kasir Retail Point of Sale
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Active Branch Context Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOutletDropdown(!showOutletDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-mono transition cursor-pointer shadow-2xs"
              title="Klik untuk beralih konteks cabang"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-800 max-w-[130px] sm:max-w-[180px] truncate">
                {activeOutlet.name}
              </span>
              <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded font-bold">
                {activeOutlet.code}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showOutletDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn space-y-1">
                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Pilih Konteks Cabang Operasional:
                </p>
                {outletsList.map((outlet) => (
                  <button
                    key={outlet.id}
                    type="button"
                    onClick={() => {
                      setActiveOutletId(outlet.id);
                      setShowOutletDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${
                      outlet.id === activeOutletId
                        ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{outlet.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{outlet.address}</p>
                    </div>
                    {outlet.id === activeOutletId && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Clock, Sync Status, Cashier Shift, Shortcuts */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Real-time Clock */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-xs text-slate-700 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold">{currentTime || '12:00:00'} WIB</span>
          </div>

          {/* Sync Status: High-visibility Red when Offline! */}
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
              title="KONEKSI TERPUTUS! Transaksi disimpan lokal di IndexedDB • Klik untuk pulihkan status Online"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
              <span>OFFLINE (IndexedDB)</span>
            </button>
          )}

          {/* Shift Kasir Status (Sensitive drawer cash balance HIDDEN as requested) */}
          <button
            type="button"
            onClick={() => setShowShiftDetailsModal(true)}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
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
            <span className="text-slate-600 font-medium truncate max-w-[90px]">
              {currentShift.cashierName}
            </span>
          </button>

          {/* Promo (F6) Shortcut */}
          <button
            type="button"
            onClick={() => setShowPromoModal(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer shadow-2xs ${
              selectedPromo.id !== 'NONE'
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
            title="Pilih Promo / Voucher Belanja (F6)"
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">
              {selectedPromo.id !== 'NONE' ? selectedPromo.name : 'Promo (F6)'}
            </span>
          </button>

          {/* Parkir Transaksi (F7) Shortcut Button */}
          <button
            type="button"
            onClick={handleParkCart}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer shadow-2xs ${
              parkedCarts.length > 0
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
            title="Parkir atau Pulihkan Transaksi (F7)"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Parkir (F7)</span>
            {parkedCarts.length > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {parkedCarts.length}
              </span>
            )}
          </button>

          {/* Station Cek Harga Shortcut */}
          <a
            href="/price-checker"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer shadow-2xs"
            title="Buka Kiosk Station Cek Harga"
          >
            <ScanBarcode className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline">Cek Harga</span>
          </a>

          {/* Tutup Shift Button */}
          {currentShift.isOpen ? (
            <button
              type="button"
              onClick={handleOpenCloseShiftModal}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tutup Shift</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowOpenShiftModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Buka Shift</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Layar Penuh (Fullscreen F11)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Offline Mode Warning Banner (Sprint 7 PWA Resilience) */}
      {!isEffectiveOnline && (
        <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-mono shadow-md animate-pulse shrink-0">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>PERINGATAN: MODE OFFLINE KASIR AKTIF</strong> — Jaringan internet terputus atau mode simulasi aktif. Seluruh transaksi kasir tetap berjalan lancar dan disimpan lokal di Dexie.js ({pendingOfflineCount} nota menunggu sinkronisasi).
            </span>
          </div>
          <span className="bg-rose-900 text-rose-200 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-rose-700 shrink-0 ml-3">
            DEXIE LOCAL READY
          </span>
        </div>
      )}

      {/* Main POS Split Layout: 8 Cols Left (Catalog), 4 Cols Right (Cart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        {/* LEFT: Product Catalog & Search */}
        <div className="lg:col-span-8 flex flex-col gap-2.5 h-full overflow-hidden">
          {/* Search Bar with Barcode Icon & F2 Hotkey Indicator */}
          <div className="relative w-full shrink-0">
            <Search className="w-4 h-4 absolute left-4 top-3 text-slate-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Cari nama barang atau scan barcode produk [F2]..."
              value={barcodeInput}
              onChange={(e) => handleBarcodeInput(e.target.value)}
              className="w-full pl-11 pr-24 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs shadow-2xs transition font-sans"
            />
            <div className="absolute right-3 top-2 flex items-center gap-1.5">
              {barcodeInput && (
                <button
                  type="button"
                  onClick={() => setBarcodeInput('')}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                F2
              </span>
              <Barcode className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Rounded Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 shrink-0 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border shadow-2xs ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              );
            })}
          </div>

          {/* Catalog Header (Clean 5-Column layout, no pagination friction) */}
          <div className="flex items-center justify-between px-1 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Katalog Produk Swalayan
              </span>
              <span className="text-[11px] text-emerald-800 font-mono bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                {displayedProducts.length} Produk Tersedia
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
              5 Kolom • Scroll Vertikal Cepat
            </div>
          </div>

          {/* Product Cards Shelf - 5-Column Grid with Smooth Vertical Scrolling */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            {displayedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-1">
                <p className="text-sm font-semibold text-slate-600">Tidak ada produk yang cocok</p>
                <p className="text-xs text-slate-400">Silakan ubah filter kategori atau kata kunci pencarian barcode.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
                {displayedProducts.map((prod) => {
                  const baseVariant = prod.variants.find((v) => v.isBaseUnit) || prod.variants[0];
                  const hasMultiVariants = prod.variants.length > 1;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        if (hasMultiVariants) {
                          setSelectedProductForVariant(prod);
                          setShowVariantModal(true);
                        } else if (baseVariant) {
                          addToRetailCart(prod, baseVariant);
                        }
                      }}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-150 p-2.5 flex flex-col justify-between cursor-pointer group hover:border-emerald-400 select-none relative"
                    >
                      {/* Product Image: STRICT 1:1 Aspect Ratio */}
                      <div className="w-full aspect-square rounded-xl bg-slate-50 flex items-center justify-center p-2 mb-2 overflow-hidden shrink-0 border border-slate-100 relative group-hover:bg-slate-100/60 transition">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-xs"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-slate-400" />
                        )}

                        {hasMultiVariants && (
                          <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" />
                            {prod.variants.length} Satuan
                          </span>
                        )}
                      </div>

                      {/* Text Details */}
                      <div className="flex-1 flex flex-col justify-between min-h-0">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider truncate">
                              {prod.category}
                            </p>
                            {prod.isMaklonProduct && (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                                Maklon
                              </span>
                            )}
                          </div>
                          <h4 className="text-slate-900 font-bold text-xs line-clamp-2 leading-snug min-h-[32px]" title={prod.name}>
                            {prod.name}
                          </h4>
                        </div>

                        {/* Pricing & Unit Info */}
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-baseline justify-between">
                          <span className="text-slate-900 font-black text-xs sm:text-sm font-sans truncate">
                            IDR {(baseVariant?.price || 0).toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-1">
                            /{baseVariant?.unitName || prod.baseUnitName}
                          </span>
                        </div>
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
          {/* COMPONENT: Visual Interactive Promo Carousel (Di Atas Cart) */}
          {(() => {
            const currentPromo = VISUAL_PROMOS[activePromoIndex] || VISUAL_PROMOS[0];
            return (
              <div
                onMouseEnter={() => setIsCarouselPaused(true)}
                onMouseLeave={() => setIsCarouselPaused(false)}
                className={`bg-gradient-to-r ${currentPromo.gradientBg} border ${currentPromo.borderCol} rounded-2xl p-2.5 mb-2 shrink-0 shadow-2xs transition-all duration-300 relative group overflow-hidden`}
              >
                {/* Carousel Top Navigation Bar */}
                <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                      Promo Berjalan Hari Ini
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${currentPromo.badgeBg} shadow-2xs`}>
                      {currentPromo.tag}
                    </span>
                  </div>

                  {/* Slide Navigator & Indicators */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-slate-500 font-bold">
                      {activePromoIndex + 1}/{VISUAL_PROMOS.length}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          setActivePromoIndex((prev) =>
                            prev === 0 ? VISUAL_PROMOS.length - 1 : prev - 1,
                          )
                        }
                        className="w-5 h-5 rounded-md bg-white/80 hover:bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs transition cursor-pointer"
                        title="Promo Sebelumnya"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePromoIndex((prev) => (prev + 1) % VISUAL_PROMOS.length)
                        }
                        className="w-5 h-5 rounded-md bg-white/80 hover:bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs transition cursor-pointer"
                        title="Promo Selanjutnya"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Carousel Active Slide Content */}
                <div className="flex items-center gap-2.5">
                  {/* Thumbnail Banner Image */}
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative">
                    <img
                      src={currentPromo.imageUrl}
                      alt={currentPromo.item}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Promo Details & Headline */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {currentPromo.item}
                    </h4>
                    <p className="text-xs font-black text-rose-600 truncate">
                      {currentPromo.promo}
                    </p>
                    <p className="text-[10px] text-slate-600 font-medium truncate">
                      {currentPromo.discountNote}
                    </p>
                  </div>

                  {/* Action Button: Apply / Select */}
                  <button
                    type="button"
                    onClick={() => {
                      if (currentPromo.targetPromoId && currentPromo.targetPromoId !== 'NONE') {
                        setSelectedPromoId(currentPromo.targetPromoId);
                      }
                      setShowPromoModal(true);
                    }}
                    className="px-2 py-1 bg-white hover:bg-amber-500 hover:text-white border border-amber-300 text-amber-900 text-[10px] font-bold rounded-lg shadow-2xs transition cursor-pointer shrink-0"
                    title="Buka / Terapkan Promo Ini (F6)"
                  >
                    Terapkan (F6)
                  </button>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center justify-center gap-1 mt-1.5 pt-1 border-t border-slate-200/40">
                  {VISUAL_PROMOS.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePromoIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activePromoIndex
                          ? 'w-5 bg-amber-600'
                          : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={`Promo ke-${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-3.5 sm:p-4 flex flex-col flex-1 overflow-hidden min-h-0">
            {/* Cart Header (Renamed to 'Keranjang Belanja', NO Daftar Member button) */}
            <div className="flex items-center justify-between pb-2 mb-1 shrink-0 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-700" />
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  Keranjang Belanja
                </h2>
                {retailCart.length > 0 && (
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                    {retailCart.reduce((s, it) => s + it.quantity, 0)} item
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {retailCart.length > 0 && (
                  <button
                    type="button"
                    onClick={handleParkCart}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200"
                    title="Parkir Transaksi Ini (F7)"
                  >
                    <History className="w-3 h-3" /> Parkir (F7)
                  </button>
                )}
                {retailCart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bersihkan seluruh isi keranjang belanja?')) {
                        clearRetailCart();
                      }
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200"
                    title="Kosongkan Keranjang (F8)"
                  >
                    <Trash2 className="w-3 h-3" /> Batal (F8)
                  </button>
                )}
              </div>
            </div>

            {/* Member One Identity Module (Compact / Collapsible with Interchangeable Member before Final Tx) */}
            {activeMember.memberCode === 'NON-MEMBER' ? (
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-2.5 my-1.5 shadow-2xs shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Member One Identity
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMemberModal(true)}
                    className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg transition cursor-pointer"
                  >
                    Pilih Member (F4)
                  </button>
                </div>

                {/* Compact Barcode Scan Input for Physical Card */}
                <div className="relative">
                  <Barcode className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    ref={memberInputRef}
                    type="text"
                    value={memberBarcodeQuery}
                    onChange={(e) => handleMemberBarcodeSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyMemberBarcode(memberBarcodeQuery);
                      }
                    }}
                    placeholder="Scan / ketik barcode kartu fisik (82xxxxxx)... [F4]"
                    className="w-full pl-8 pr-14 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono shadow-2xs"
                  />
                  {memberBarcodeQuery && (
                    <button
                      type="button"
                      onClick={() => applyMemberBarcode(memberBarcodeQuery)}
                      className="absolute right-1 top-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg cursor-pointer transition"
                    >
                      Cari
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Compact Member Selected Banner with Ganti / Lepas Options */
              <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-2.5 my-1.5 shadow-2xs shrink-0 animate-fadeIn">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">
                      {activeMember.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {activeMember.fullName}
                        </span>
                        {activeMember.barcode && (
                          <span className="text-[9px] font-mono bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                            💳 {activeMember.barcode}
                          </span>
                        )}
                        {activeMember.currentTier && (
                          <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded">
                            {activeMember.currentTier}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>⭐ {activeMember.totalLoyaltyPoints} Poin</span>
                        <span>•</span>
                        <span>{activeMember.doorprizeCoupons?.length || 0} Kupon</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          Dompet: Rp {(activeMember.orientalPayBalance || 0).toLocaleString('id-ID')}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: Ganti Member or Hapus Member */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowMemberModal(true)}
                      className="text-[10px] font-bold text-amber-800 bg-white hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg transition cursor-pointer"
                      title="Ganti Member Lain"
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={() => selectActiveMember('NON-MEMBER')}
                      className="text-slate-400 hover:text-rose-600 p-1 hover:bg-white rounded-lg transition cursor-pointer"
                      title="Lepas Member"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

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
            <div className="border-t border-slate-100 pt-3 mt-auto shrink-0 space-y-2.5">
              {/* Interactive Member Voucher / Promo Selection Card */}
              {selectedPromo.id !== 'NONE' ? (
                <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs shadow-2xs">
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-start gap-2 min-w-0">
                      <TicketPercent className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs truncate">{selectedPromo.name}</span>
                          <span className="font-mono text-[9px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                            {selectedPromo.code}
                          </span>
                        </div>
                        {selectedPromo.quotaType !== 'UNLIMITED' && (
                          <p className="text-[10px] text-amber-800 font-medium mt-0.5">
                            {selectedPromo.quotaType === 'DAILY'
                              ? `Kuota Harian: Sisa ${Math.max(0, selectedPromo.totalQuota - selectedPromo.usedQuota)}/${selectedPromo.totalQuota} Hari Ini`
                              : `Kuota Periode: Sisa ${Math.max(0, selectedPromo.totalQuota - selectedPromo.usedQuota)}/${selectedPromo.totalQuota}`}
                          </p>
                        )}
                        {!promoStatus.isEligible && (
                          <p className="text-[10px] text-rose-600 font-bold mt-0.5 flex items-center gap-1">
                            <span>⚠️ {promoStatus.reason}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowPromoModal(true)}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline px-1 cursor-pointer"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPromoId('NONE')}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer rounded-full"
                        title="Hapus Voucher"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPromoModal(true)}
                  className="w-full py-2 px-3 border border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <TicketPercent className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
                    <span>Gunakan Voucher / Promo Member</span>
                  </div>
                  <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-mono font-bold">
                    Pilih (F4)
                  </span>
                </button>
              )}

              {/* Price Breakdown Calculation */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Subtotal Belanja</span>
                  <span className="text-slate-800 font-bold font-sans">
                    IDR {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-bold animate-fadeIn">
                    <span className="flex items-center gap-1">
                      <span>Potongan Diskon ({selectedPromo.name.slice(0, 24)})</span>
                    </span>
                    <span className="font-sans">-IDR {discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-900 text-sm font-extrabold block">Total Tagihan</span>
                    {discountTotal > 0 && (
                      <span className="text-[10px] text-emerald-600 font-medium">Hemat IDR {discountTotal.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                  <span className="text-emerald-700 font-black text-lg font-sans">
                    IDR {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Primary Green Checkout Button */}
              <button
                disabled={retailCart.length === 0}
                onClick={() => {
                  setPaidAmount(grandTotal);
                  setPaymentMethod('TUNAI');
                  setQrisPaidSuccess(false);
                  setShowPaymentModal(true);
                }}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-2xl text-center text-sm shadow-md shadow-emerald-700/20 transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Checkout / Bayar (IDR {grandTotal.toLocaleString('id-ID')})</span>
              </button>

              <div className="mt-1 text-center">
                <p className="text-[10px] text-slate-400">
                  Pilihan Pembayaran: Cash • QRIS • Debit Card • Kredit Card • Lainnya
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM HOTKEY GUIDE BAR (STANDARISASI HOTKEY POS)        */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2 flex items-center justify-between gap-3 text-xs shadow-2xs shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
            <span className="font-black text-slate-900 bg-slate-200 px-1 rounded">F2</span>
            <span>Cari Barcode</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
            <span className="font-black text-slate-900 bg-slate-200 px-1 rounded">F4</span>
            <span>Input Member</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
            <span className="font-black text-slate-900 bg-slate-200 px-1 rounded">F6</span>
            <span>Promo / Voucher</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
            <span className="font-black text-blue-900 bg-blue-200 px-1 rounded">F7</span>
            <span>Parkir Transaksi ({parkedCarts.length})</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
            <span className="font-black text-rose-900 bg-rose-200 px-1 rounded">F8</span>
            <span>Batal / Bersihkan</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            <span className="font-black text-emerald-900 bg-emerald-200 px-1 rounded">F9 / F12</span>
            <span>Bayar / Checkout</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
            <span className="font-black text-slate-700 bg-slate-200 px-1 rounded">Esc</span>
            <span>Tutup Modal</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono hidden xl:block">
          Tekan tombol keyboard untuk aksi kasir cepat
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL PILIH VARIAN / MULTI TIER SATUAN PRODUK             */}
      {/* ======================================================== */}
      {showVariantModal && selectedProductForVariant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl shadow-2xl bg-white space-y-4 animate-fadeIn border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {selectedProductForVariant.imageUrl ? (
                    <img
                      src={selectedProductForVariant.imageUrl}
                      alt={selectedProductForVariant.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {selectedProductForVariant.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {selectedProductForVariant.name}
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    Pilih satuan kemasan yang diinginkan pelanggan:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVariantModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Available Variants / Units */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {selectedProductForVariant.variants.map((v) => {
                const isBase = v.isBaseUnit;
                return (
                  <button
                    key={v.unitName}
                    type="button"
                    onClick={() => {
                      addToRetailCart(selectedProductForVariant, v);
                      setShowVariantModal(false);
                    }}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between transition cursor-pointer text-left group shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                        isBase
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {v.unitName.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{v.unitName}</h4>
                          {isBase ? (
                            <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                              Satuan Eceran (Dasar)
                            </span>
                          ) : (
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold font-mono border border-blue-200">
                              Isi {v.multiplier} {selectedProductForVariant.baseUnitName}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Barcode: {v.barcode}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm font-sans block group-hover:text-emerald-700">
                        IDR {v.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold group-hover:underline">
                        + Tambah ke Keranjang
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Pilih salah satu satuan untuk otomatis masuk ke keranjang belanja kasir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DAFTAR TRANSAKSI DIPARKIR (F7)                     */}
      {/* ======================================================== */}
      {showParkedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl shadow-2xl bg-white space-y-4 animate-fadeIn border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Daftar Transaksi Diparkir</h3>
                  <p className="text-xs text-slate-500">Pilih transaksi yang ingin dipulihkan ke keranjang kasir</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowParkedModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {parkedCarts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm font-semibold text-slate-600">Tidak ada transaksi yang sedang diparkir</p>
                <p className="text-xs text-slate-400 mt-1">Tekan F7 saat keranjang terisi untuk memarkir transaksi.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {parkedCarts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/70 flex items-center justify-between transition gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {p.id}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{p.timestamp}</span>
                        <span className="text-xs font-bold text-slate-800">• {p.memberName}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {p.items.length} jenis produk • Total: <strong>IDR {p.grandTotal.toLocaleString('id-ID')}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRestoreParked(p)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Pulihkan
                      </button>
                      <button
                        type="button"
                        onClick={() => setParkedCarts((prev) => prev.filter((item) => item.id !== p.id))}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Transaksi Parkir Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL MEMBER LOYALTY SELECTOR                            */}
      {/* ======================================================== */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl shadow-xl bg-white space-y-3.5 animate-fadeIn border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Pilih Member Loyalty (One Identity)</h3>
                  <p className="text-[11px] text-slate-500">Scan barcode kartu fisik atau cari data member</p>
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

            {/* Barcode & Identity Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={memberSearchInModal}
                onChange={(e) => setMemberSearchInModal(e.target.value)}
                placeholder="Scan Barcode Kartu (82xxxxxx) / Nama / No HP..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono shadow-2xs"
                autoFocus
              />
              {memberSearchInModal && (
                <button
                  type="button"
                  onClick={() => setMemberSearchInModal('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Scan Physical Card Simulation Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] text-slate-400 whitespace-nowrap">Simulasi Kartu Fisik:</span>
              {membersList.slice(0, 3).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    selectActiveMember(m.memberCode);
                    setShowMemberModal(false);
                  }}
                  className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-mono px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition shadow-2xs"
                  title={`Scan kartu ${m.fullName}`}
                >
                  💳 {m.barcode} ({m.fullName.split(' ')[0]})
                </button>
              ))}
            </div>

            {/* Member List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {membersList
                .filter((m) => {
                  if (!memberSearchInModal) return true;
                  const q = memberSearchInModal.toLowerCase();
                  return (
                    m.barcode.includes(q) ||
                    m.memberCode.toLowerCase().includes(q) ||
                    m.fullName.toLowerCase().includes(q) ||
                    m.phone.includes(q) ||
                    (m.businessName && m.businessName.toLowerCase().includes(q))
                  );
                })
                .map((m) => {
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
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-xs text-slate-900">{m.fullName}</p>
                          <span className="text-[9px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 font-bold">
                            💳 {m.barcode}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ID: {m.memberCode} • HP: {m.phone}
                        </p>
                        {m.businessName && (
                          <p className="text-[10px] text-emerald-700 font-medium truncate">
                            {m.businessName}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-amber-700 text-xs block">{m.totalLoyaltyPoints} Poin</span>
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
          <div className="glass-panel-elevated w-full max-w-xl p-5 sm:p-6 rounded-3xl shadow-2xl bg-white space-y-4 animate-fadeIn max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <TicketPercent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Voucher & Promo Member Retail</h3>
                  <p className="text-xs text-slate-500">Katalog diskon, kuota harian & promo periode berjalan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Identity Status Indicator */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-2.5 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                  {activeMember.fullName.charAt(0)}
                </div>
                <div className="truncate">
                  <span className="font-bold text-slate-900">{activeMember.fullName}</span>
                  <span className="text-slate-500 text-[11px] ml-1.5 font-mono">({activeMember.memberCode})</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  ★ {activeMember.totalLoyaltyPoints} Poin
                </span>
              </div>
            </div>

            {/* Manual Voucher Code Input Bar */}
            <div className="flex gap-2 shrink-0">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={promoVoucherInput}
                  onChange={(e) => setPromoVoucherInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyVoucherCode(promoVoucherInput);
                    }
                  }}
                  placeholder="Ketik Kode Voucher (cth: MEMBER10K, WELCOME5K, SUPER25K)"
                  className="w-full px-3 py-2 pl-9 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
                <TicketPercent className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="button"
                onClick={() => handleApplyVoucherCode(promoVoucherInput)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Terapkan
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setPromoFilterTab('ALL')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer ${
                  promoFilterTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Promo ({promosList.length})
              </button>
              <button
                type="button"
                onClick={() => setPromoFilterTab('MEMBER_VOUCHER')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer ${
                  promoFilterTab === 'MEMBER_VOUCHER'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Voucher Member ({promosList.filter((p) => p.type === 'MEMBER_VOUCHER').length})
              </button>
              <button
                type="button"
                onClick={() => setPromoFilterTab('STORE_PROMO')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer ${
                  promoFilterTab === 'STORE_PROMO'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Promo Swalayan ({promosList.filter((p) => p.type !== 'MEMBER_VOUCHER' && p.id !== 'NONE').length})
              </button>
            </div>

            {/* List of Available Promos & Vouchers */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-0">
              {promosList
                .filter((p) => {
                  if (promoFilterTab === 'MEMBER_VOUCHER') return p.type === 'MEMBER_VOUCHER';
                  if (promoFilterTab === 'STORE_PROMO') return p.type !== 'MEMBER_VOUCHER' && p.id !== 'NONE';
                  return true;
                })
                .map((p) => {
                  const isSelected = selectedPromo.id === p.id;
                  const eligibility = checkPromoEligibility(p, retailCart, subtotal, activeMember);
                  const remainingQuota = Math.max(0, p.totalQuota - p.usedQuota);
                  const isQuotaExhausted = p.quotaType !== 'UNLIMITED' && remainingQuota <= 0;

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border transition text-xs space-y-2.5 ${
                        isSelected
                          ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-1 ring-amber-400'
                          : isQuotaExhausted
                          ? 'bg-slate-50/60 border-slate-200 opacity-60'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      {/* Top Row: Promo Name & Type Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded">
                              {p.code}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                            {p.requiresMember && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded font-mono">
                                Member One Identity
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-normal">{p.description}</p>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <span className="shrink-0 flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                            ✓ Terpasang
                          </span>
                        )}
                      </div>

                      {/* Quota & Periode Badge Bar */}
                      {p.quotaType !== 'UNLIMITED' && (
                        <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-medium">
                            <span className="text-slate-600 flex items-center gap-1">
                              {p.quotaType === 'DAILY' ? (
                                <>
                                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                                  <strong className="text-slate-800">Kuota Harian:</strong> Sisa {remainingQuota} dari {p.totalQuota} hari ini
                                </>
                              ) : (
                                <>
                                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                  <strong className="text-slate-800">Kuota Periode:</strong> Sisa {remainingQuota} dari {p.totalQuota}
                                </>
                              )}
                            </span>
                            <span
                              className={`font-mono font-bold px-1.5 py-0.2 rounded text-[9px] ${
                                isQuotaExhausted
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : remainingQuota <= 5
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isQuotaExhausted ? 'KUOTA HABIS' : `${remainingQuota} TERSISA`}
                            </span>
                          </div>

                          {/* Quota Progress Bar */}
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isQuotaExhausted
                                  ? 'bg-rose-500'
                                  : remainingQuota <= 5
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, (p.usedQuota / p.totalQuota) * 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-slate-400">
                            <span>Masa Berlaku: {p.validFrom} s/d {p.validUntil}</span>
                            <span>{p.usedQuota} telah diklaim</span>
                          </div>
                        </div>
                      )}

                      {/* Requirements & Action Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                        <div className="text-[10px]">
                          {p.minSpend > 0 ? (
                            <span className="text-slate-500 font-medium">
                              Min. Belanja: <strong className="text-slate-800">Rp {p.minSpend.toLocaleString('id-ID')}</strong>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold">Tanpa Batas Minimum Belanja</span>
                          )}

                          {!eligibility.isEligible && (
                            <p className="text-rose-600 font-bold mt-0.5">
                              ⚠️ {eligibility.reason}
                            </p>
                          )}
                          {eligibility.isEligible && p.id !== 'NONE' && (
                            <p className="text-emerald-700 font-bold mt-0.5">
                              ✨ Potongan: Rp {eligibility.discount.toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          {isSelected ? (
                            <button
                              type="button"
                              onClick={() => setSelectedPromoId('NONE')}
                              className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Lepas Voucher
                            </button>
                          ) : isQuotaExhausted ? (
                            <button
                              type="button"
                              disabled
                              className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed border border-slate-200"
                            >
                              Kuota Habis
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPromoId(p.id);
                                setShowPromoModal(false);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                                eligibility.isEligible
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {eligibility.isEligible ? 'Gunakan Voucher' : 'Pilih Voucher Ini'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Bottom Close Button */}
            <div className="pt-2 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Tutup Katalog Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: MULTI-PAYMENT CHECKOUT ENGINE                    */}
      {/* Cash, QRIS, Debit Card, Kredit Card, Transfer / E-Wallet */}
      {/* ======================================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated w-full max-w-lg p-6 rounded-3xl shadow-2xl bg-white space-y-4 animate-fadeIn border border-slate-200">
            {/* Header & Total Nominal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pembayaran Kasir Retail</h3>
                <p className="text-xs text-slate-500">Pilih metode bayar transaksi belanja</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">TOTAL NOMINAL</span>
                <span className="text-emerald-600 font-mono text-xl sm:text-2xl font-black">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
                {discountTotal > 0 && (
                  <span className="text-[10px] text-emerald-700 block font-semibold">
                    (Hemat Rp {discountTotal.toLocaleString('id-ID')})
                  </span>
                )}
              </div>
            </div>

            {/* Member & Rewards Summary Banner */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-slate-800">{activeMember.fullName}</span>
                  {activeMember.barcode && (
                    <span className="ml-1.5 font-mono text-[10px] bg-white border border-amber-300 text-amber-900 px-1 py-0.5 rounded font-bold">
                      💳 {activeMember.barcode}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 text-[11px] text-amber-900 font-medium">
                +{pointsEarned} Poin {couponsEarned > 0 && `• +${couponsEarned} Kupon`}
              </div>
            </div>

            {/* Voucher & Price Breakdown in Payment Modal */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Belanja ({retailCart.reduce((s, it) => s + it.quantity, 0)} item):</span>
                <span className="font-semibold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <TicketPercent className="w-3.5 h-3.5" />
                    <span>Potongan Voucher ({selectedPromo.name}):</span>
                  </span>
                  <span>-Rp {discountTotal.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold pt-1 border-t border-slate-200 text-sm">
                <span>Total Bersih Bayar:</span>
                <span className="text-emerald-700 font-black">Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* 6-Method Selector Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setPaymentMethod('TUNAI')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  paymentMethod === 'TUNAI'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('QRIS');
                  setQrisPaidSuccess(false);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  paymentMethod === 'QRIS'
                    ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4 text-amber-600" />
                <span className="text-[11px]">QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DEBIT_CARD')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  paymentMethod === 'DEBIT_CARD'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-[11px]">Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px]">Kredit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ORIENTAL_PAY')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  paymentMethod === 'ORIENTAL_PAY'
                    ? 'bg-white text-purple-700 shadow-xs border border-purple-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4 text-purple-600" />
                <span className="text-[11px]">Oriental Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('LAINNYA')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  paymentMethod === 'LAINNYA'
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4 text-slate-500" />
                <span className="text-[11px]">Lainnya</span>
              </button>
            </div>

            {/* TAB CONTENT 1: TUNAI (CASH) */}
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
                      type="button"
                      onClick={() => setPaidAmount(nom)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono text-slate-700 border border-slate-200 transition cursor-pointer"
                    >
                      Rp {nom.toLocaleString('id-ID')}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPaidAmount(grandTotal)}
                    className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-mono font-bold hover:bg-emerald-100 transition cursor-pointer"
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

            {/* TAB CONTENT 2: QRIS DINAMIS */}
            {paymentMethod === 'QRIS' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border-2 border-emerald-500 shadow-md flex flex-col items-center justify-center">
                  <QrCode className="w-28 h-28 text-slate-900" />
                  <span className="text-[9px] font-mono font-bold text-slate-500">QRIS STANDAR BI</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">QRIS Dinamis Swalayan Oriental</p>
                  <p className="text-[11px] text-slate-500">
                    Nominal tagihan: <strong className="text-emerald-600 font-mono">Rp {grandTotal.toLocaleString('id-ID')}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">NMID: ID1026008892110</p>
                </div>
                <button
                  type="button"
                  onClick={() => setQrisPaidSuccess(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer ${
                    qrisPaidSuccess
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{qrisPaidSuccess ? 'QRIS Terkonfirmasi Lunas!' : 'Simulasikan Pembayaran QRIS Sukses'}</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT 3: DEBIT CARD */}
            {paymentMethod === 'DEBIT_CARD' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1.5 font-bold">Pilih Bank EDC Debit:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['BCA', 'Mandiri', 'BRI', 'BNI', 'CIMB Niaga', 'Permata'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          selectedBank === bank
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">4 Digit Terakhir Kartu</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                      placeholder="Misal: 4821"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Nomor Trace / APPR EDC</label>
                    <input
                      type="text"
                      value={cardRefNumber}
                      onChange={(e) => setCardRefNumber(e.target.value)}
                      placeholder="Misal: 881923"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Gesek / insert kartu debit pada mesin EDC {selectedBank}, pastikan struk transaksi tercetak sebelum klik selesaikan.
                </p>
              </div>
            )}

            {/* TAB CONTENT 4: KREDIT CARD */}
            {paymentMethod === 'CREDIT_CARD' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1.5 font-bold">Pilih Jaringan Kartu Kredit:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Visa', 'Mastercard', 'JCB', 'BCA Card', 'Mandiri Card', 'Lainnya'].map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setSelectedCreditProvider(prov)}
                        className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          selectedCreditProvider === prov
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">4 Digit Terakhir Kartu</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                      placeholder="Misal: 9283"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Approval Code EDC</label>
                    <input
                      type="text"
                      value={cardRefNumber}
                      onChange={(e) => setCardRefNumber(e.target.value)}
                      placeholder="Misal: APPR-5521"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Pembayaran kartu kredit {selectedCreditProvider}. Pastikan verifikasi PIN/tanda tangan telah valid di terminal EDC.
                </p>
              </div>
            )}

            {/* TAB CONTENT 5: ORIENTAL PAY (CLOSED-LOOP WALLET) */}
            {paymentMethod === 'ORIENTAL_PAY' && (
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                      OP
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Oriental Pay</p>
                      <p className="text-[10px] text-purple-700 font-medium">Dompet Tertutup (Closed-Loop One Identity)</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded-full font-mono">
                    Bebas Biaya Admin (0%)
                  </span>
                </div>

                {/* Member Identity & Balance Status */}
                {activeMember.memberCode === 'NON-MEMBER' ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Member One Identity Belum Terpilih</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Oriental Pay hanya dapat digunakan oleh member terdaftar One Identity. Silakan pilih atau scan kartu member di keranjang terlebih dahulu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-white border border-purple-200 rounded-xl shadow-2xs space-y-1.5 font-mono">
                      <div className="flex justify-between text-slate-600">
                        <span>Pemilik Dompet:</span>
                        <span className="font-bold text-slate-900 font-sans">{activeMember.fullName}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Nomor Member:</span>
                        <span className="font-bold text-slate-800">{activeMember.memberCode}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Tier Loyalitas:</span>
                        <span className="font-bold text-purple-700">{activeMember.currentTier || 'REGULER'}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 pt-1.5 border-t border-slate-100 font-bold">
                        <span>Saldo Tersedia:</span>
                        <span className="text-sm text-purple-700 font-black">
                          Rp {(activeMember.orientalPayBalance || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {(activeMember.orientalPayBalance || 0) >= grandTotal ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Saldo Mencukupi untuk Pembayaran Ini</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-mono text-emerald-700">
                          <span>Sisa Saldo Setelah Transaksi:</span>
                          <strong>Rp {((activeMember.orientalPayBalance || 0) - grandTotal).toLocaleString('id-ID')}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Saldo Oriental Pay Tidak Cukup</span>
                        </div>
                        <p className="text-[11px] font-mono text-rose-700">
                          Kurang: <strong>-Rp {(grandTotal - (activeMember.orientalPayBalance || 0)).toLocaleString('id-ID')}</strong>. Silakan top up di Member Portal atau gunakan metode tunai/QRIS.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-400 italic">
                  *Sesuai regulasi BI & Addendum PRD v2.1 §5: Saldo bersifat closed-loop (hanya berlaku belanja internal, tidak dapat ditransfer ke bank/P2P).
                </p>
              </div>
            )}

            {/* TAB CONTENT 6: METODE PEMBAYARAN LAINNYA (TRANSFER VA & E-WALLET) */}
            {paymentMethod === 'LAINNYA' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1.5 font-bold">Pilih Channel Pembayaran:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['GoPay', 'OVO', 'DANA', 'ShopeePay', 'BCA VA', 'Mandiri VA'].map((channel) => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => setSelectedOtherMethod(channel)}
                        className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          selectedOtherMethod === channel
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Nomor Referensi / ID Transaksi (Opsional)</label>
                  <input
                    type="text"
                    value={otherRefNumber}
                    onChange={(e) => setOtherRefNumber(e.target.value)}
                    placeholder="Contoh: REF-202609-8812"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <p className="text-[11px] text-slate-500">
                  Verifikasi saldo atau notifikasi mutasi masuk pada aplikasi {selectedOtherMethod} sebelum menyelesaikan transaksi.
                </p>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!isPaymentSufficient}
                onClick={handleCompleteTransaction}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${
                  isPaymentSufficient
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {isPaymentSufficient
                  ? `Selesaikan Pembayaran (Rp ${grandTotal.toLocaleString('id-ID')})`
                  : paymentMethod === 'TUNAI'
                  ? 'Uang Tunai Kurang'
                  : paymentMethod === 'QRIS'
                  ? 'Konfirmasi QRIS Dahulu'
                  : paymentMethod === 'ORIENTAL_PAY'
                  ? (activeMember.memberCode === 'NON-MEMBER' ? 'Pilih Member One Identity' : 'Saldo Dompet Kurang')
                  : 'Lengkapi Data'}
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
                <p>Metode     : {lastInvoice.paymentMethodUsed === 'ORIENTAL_PAY' ? 'Oriental Pay (Dompet Internal)' : (lastInvoice.paymentMethodUsed || 'Tunai')}</p>
                <p>Member ID  : {activeMember.memberCode} ({activeMember.fullName.split(' ')[0]})</p>
                {activeMember.currentTier && activeMember.memberCode !== 'NON-MEMBER' && (
                  <p>Loyalty    : Tier {activeMember.currentTier} {activeMember.currentTier === 'PLATINUM' ? '(+15% Bonus Poin)' : activeMember.currentTier === 'GOLD' ? '(+10% Bonus Poin)' : ''}</p>
                )}
                {activeMember.barcode && <p>Kartu Fisik: {activeMember.barcode}</p>}
                {lastInvoice.paymentMethodUsed === 'ORIENTAL_PAY' && (
                  <p>Sisa Saldo : Rp {(activeMember.orientalPayBalance || 0).toLocaleString('id-ID')}</p>
                )}
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
                  <span>Rp {(lastInvoice.subtotalAmount ?? lastInvoice.grandTotal).toLocaleString('id-ID')}</span>
                </div>
                {lastInvoice.discountAmount && lastInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Diskon ({lastInvoice.promoName || 'Voucher Member'}):</span>
                    <span>-Rp {lastInvoice.discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-1 border-t border-dotted border-gray-300">
                  <span>Total Tagihan:</span>
                  <span>Rp {lastInvoice.grandTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{paymentMethod === 'TUNAI' ? 'Tunai Diterima:' : 'Metode Bayar:'}</span>
                  <span className="font-semibold text-right max-w-[170px] truncate">
                    {paymentMethod === 'TUNAI' ? `Rp ${lastInvoice.paidAmount.toLocaleString('id-ID')}` : (lastInvoice.paymentMethodUsed || paymentMethod)}
                  </span>
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
