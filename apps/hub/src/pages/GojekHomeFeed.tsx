import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  Award, 
  GraduationCap, 
  Recycle, 
  CreditCard, 
  Gift, 
  Calendar, 
  MoreHorizontal, 
  ArrowUp, 
  Plus, 
  Minus,
  History, 
  ChevronRight, 
  ChevronDown,
  Sparkles, 
  Star, 
  Flame, 
  Clock, 
  Tag, 
  QrCode, 
  Wallet, 
  CheckCircle2, 
  ArrowRight,
  Truck,
  ShieldCheck,
  Percent,
  PlayCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Layers,
  Bell,
  Heart,
  Crown,
  Download
} from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import { HubTabId } from '../components/layout/HubLayout';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

interface GojekHomeFeedProps {
  onNavigateTab: (tab: HubTabId) => void;
}

export const GojekHomeFeed: React.FC<GojekHomeFeedProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, 
    activeMember,
    topUpOrientalPay,
    products
  } = useEcosystem();

  const orientalPayBalance = activeMember?.orientalPayBalance ?? 2450000;
  const loyaltyPoints = activeMember?.totalLoyaltyPoints ?? 12850;

  // Search keyword & cycling placeholder
  const [searchKeyword, setSearchKeyword] = useState('');
  const placeholders = [
    'Cari "Minyak Goreng 2L"...',
    'Cari "Beras Premium 5Kg"...',
    'Cari "SOP Barista & Dapur"...',
    'Cari "Jual Minyak Jelantah"...',
    'Cari "Saus Sambal Jerigen"...',
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Balance visibility toggle
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Active Promo Carousel
  const [activePromoIndex, setActivePromoIndex] = useState(0);

  // Location selector state
  const [selectedLocation, setSelectedLocation] = useState('Makassar (Pusat Distribusi)');
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Cart quantities tracked in Home Feed
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  // Modals state
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(100000);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrMode, setQrMode] = useState<'MEMBER_CARD' | 'QRIS_DINAMIS'>('MEMBER_CARD');
  const [showAllServicesModal, setShowAllServicesModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCartCheckoutModal, setShowCartCheckoutModal] = useState(false);
  const [selectedVideoCourse, setSelectedVideoCourse] = useState<{
    title: string;
    category: string;
    duration: string;
    instructor: string;
    points: string[];
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Greeting by time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi ☀️';
    if (hour < 15) return 'Selamat Siang 🌤️';
    if (hour < 18) return 'Selamat Sore 🌇';
    return 'Selamat Malam 🌙';
  };

  // Live countdown timer for the promo banner (12:23:30 style)
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 23, seconds: 30 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const promoCards = [
    {
      id: 1,
      badge: 'Weekend Seru',
      title: 'Jalan-Jalan Belanja Bahan Baku Resto Diskon 15%',
      subtitle: 'Minyak Goreng, Beras Pulen, Saus & Bumbu Dapur',
      code: 'GOWEEKEND',
      bgGradient: 'from-[#00AA13] via-[#009110] to-[#00700D]',
      illustration: '🛒🍲',
    },
    {
      id: 2,
      badge: 'Ekspedisi Laut Hemat',
      title: 'Subsidi Ongkir Surabaya–Makassar Partai Besar',
      subtitle: 'Hemat hingga Rp 18.000/CBM khusus order Bal & Palet',
      code: 'KAPALLAUT',
      bgGradient: 'from-teal-600 via-teal-700 to-emerald-800',
      illustration: '⚓📦',
    },
    {
      id: 3,
      badge: 'Cuan Minyak Jelantah',
      title: 'Jual Jelantah Dapat Ekstra Saldo Oriental Pay',
      subtitle: 'Tukar Rp 9.500/kg langsung ke saldo belanja bahan',
      code: 'JELANTAHCUAN',
      bgGradient: 'from-amber-600 via-orange-600 to-amber-700',
      illustration: '♻️🪙',
    },
  ];

  // Cart item management
  const updateProductQty = (productId: string, delta: number) => {
    setCartQuantities(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const totalCartItemsCount = Object.values(cartQuantities).reduce((a, b) => a + b, 0);
  const totalCartPrice = Object.entries(cartQuantities).reduce((sum, [id, qty]) => {
    const prod = INITIAL_PRODUCTS.find(p => p.id === id);
    const price = prod?.variants[0]?.price || 30000;
    return sum + (price * qty);
  }, 0);

  const handleCopyPromoCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setToastMessage(`Kode promo ${code} berhasil disalin!`);
    setTimeout(() => {
      setCopiedCode(null);
      setToastMessage(null);
    }, 3000);
  };

  const handleExecuteTopUp = () => {
    if (topUpAmount > 0) {
      topUpOrientalPay(
        activeMember?.id || 'mem-001',
        topUpAmount,
        'MANUAL_DEPOSIT',
        `TOPUP-${Date.now().toString().slice(-4)}`
      );
      setShowTopUpModal(false);
      setToastMessage(`Top Up Rp ${topUpAmount.toLocaleString('id-ID')} berhasil masuk ke Oriental Pay!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-4 pb-28 select-none antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER & SEARCH BAR (Gojek Mobile Superapp Exact Styling) */}
      <div className="space-y-3 pt-1">
        {/* Location & Greetings */}
        <div className="flex items-center justify-between px-1">
          <button 
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 text-xs text-slate-700 font-medium hover:text-emerald-700 transition"
          >
            <MapPin className="w-4 h-4 text-[#00AA13] shrink-0" />
            <span className="font-extrabold text-slate-900 truncate max-w-[190px]">
              {selectedLocation}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 font-mono flex items-center gap-1">
              <span>🏅</span> Gold VIP
            </span>
          </div>
        </div>

        {/* Gojek Pill Search Bar */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 flex items-center gap-2.5 bg-[#F2F4F7] hover:bg-slate-200/70 transition px-4 py-2.5 rounded-full border border-slate-200/80 shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={placeholders[placeholderIndex]}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Profile Avatar with Red Notification Dot */}
          <button 
            onClick={() => onNavigateTab('MEMBERS')}
            className="relative w-10 h-10 rounded-full bg-emerald-100 border-2 border-[#00AA13] flex items-center justify-center text-[#00AA13] font-black text-xs shrink-0 shadow-xs hover:scale-105 active:scale-95 transition"
            title="Profil Member One Identity"
          >
            {activeMember?.fullName?.slice(0, 2).toUpperCase() || 'BS'}
            <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </div>

      {/* 2. GOPAY-STYLE "ORIENTAL PAY" WALLET FLOATING CARD */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/90 space-y-3">
        {/* Wallet Balance Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00AA13] to-teal-500 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-extrabold font-mono tracking-wider uppercase leading-none">
                  ORIENTAL PAY
                </span>
                <button
                  onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                  className="text-slate-400 hover:text-slate-600 transition"
                  title={isBalanceHidden ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
                >
                  {isBalanceHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
              <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                {isBalanceHidden ? 'Rp ••••••••' : `Rp ${orientalPayBalance.toLocaleString('id-ID')}`}
              </div>
            </div>
          </div>

          {/* Koin Loyalty / Points */}
          <button 
            onClick={() => onNavigateTab('MEMBERS')}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 px-3 py-1.5 rounded-2xl transition text-left"
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            <div>
              <div className="text-[9px] text-amber-700 font-bold uppercase leading-none">Koin Poin</div>
              <div className="text-xs font-black text-slate-800 font-mono">
                {loyaltyPoints.toLocaleString('id-ID')}
              </div>
            </div>
          </button>
        </div>

        {/* Gojek Circular Action Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          {/* Bayar QRIS */}
          <button
            onClick={() => {
              setQrMode('MEMBER_CARD');
              setShowQrModal(true);
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#00AED6] group-hover:bg-[#0098bc] active:scale-95 text-white flex items-center justify-center transition shadow-xs">
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Bayar</span>
          </button>

          {/* Isi Saldo / Top Up */}
          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#00AED6] group-hover:bg-[#0098bc] active:scale-95 text-white flex items-center justify-center transition shadow-xs">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Isi Saldo</span>
          </button>

          {/* Riwayat Mutasi */}
          <button
            onClick={() => onNavigateTab('ECOSYSTEM')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#00AED6] group-hover:bg-[#0098bc] active:scale-95 text-white flex items-center justify-center transition shadow-xs">
              <History className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Riwayat</span>
          </button>

          {/* Lainnya */}
          <button
            onClick={() => setShowAllServicesModal(true)}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#00AED6] group-hover:bg-[#0098bc] active:scale-95 text-white flex items-center justify-center transition shadow-xs">
              <MoreHorizontal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Lainnya</span>
          </button>
        </div>
      </div>

      {/* 3. FEATURED SERVICE POPOUT CARD (Like GoRide in Screenshot!) */}
      <div 
        onClick={() => onNavigateTab('UKM_SUPPLY')}
        className="relative bg-gradient-to-r from-[#00AA13] via-[#009311] to-[#007A0E] rounded-3xl p-4 text-white shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99] transition-all overflow-hidden flex items-center justify-between"
      >
        <div className="space-y-1.5 z-10 max-w-[70%]">
          <span className="text-[9px] font-mono font-black uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 tracking-wider">
            ★ Layanan Utama • TOP 30 Hari
          </span>
          <h3 className="text-base font-black tracking-tight leading-tight">
            OriSupply Bahan Baku Resto
          </h3>
          <p className="text-[11px] text-white/90 leading-snug">
            Pasokan sembako, beras, minyak & kemasan antar langsung ke dapur resto Anda.
          </p>
          <div className="pt-1 flex items-center gap-1 text-xs font-bold text-emerald-200 group">
            <span>Buka Katalog Pengadaan</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 3D Emoticon / Graphic Illustration */}
        <div className="text-5xl shrink-0 z-10 animate-bounce duration-1000 drop-shadow-md">
          🚚🍲
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* 4. 4x2 SERVICE GRID ICONS (Gojek Exact Squircle Style) */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/90">
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
          {/* 1. OriSupply (GoFood/GoMart equivalent) */}
          <button
            onClick={() => onNavigateTab('UKM_SUPPLY')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-rose-50 group-hover:bg-rose-100 active:scale-95 text-[#EE2737] flex items-center justify-center transition shadow-2xs border border-rose-100">
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">OriSupply</span>
          </button>

          {/* 2. White Label (Maklon & Escrow) */}
          <button
            onClick={() => onNavigateTab('WHITELABEL')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-purple-50 group-hover:bg-purple-100 active:scale-95 text-[#880088] flex items-center justify-center transition shadow-2xs border border-purple-100">
              <Award className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">White Label</span>
          </button>

          {/* 3. OriLearn (Video SOP Dapur & Barista) */}
          <button
            onClick={() => onNavigateTab('ECOSYSTEM')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-blue-50 group-hover:bg-blue-100 active:scale-95 text-[#0077B6] flex items-center justify-center transition shadow-2xs border border-blue-100">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">OriLearn</span>
          </button>

          {/* 4. Jual Limbah (GoSend style Pickup) */}
          <button
            onClick={() => onNavigateTab('UKM_SUPPLY')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 active:scale-95 text-[#00AA13] flex items-center justify-center transition shadow-2xs border border-emerald-100">
              <Recycle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Jual Limbah</span>
          </button>

          {/* 5. One Identity (Kartu & QR Member) */}
          <button
            onClick={() => onNavigateTab('MEMBERS')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-cyan-50 group-hover:bg-cyan-100 active:scale-95 text-[#00AED6] flex items-center justify-center transition shadow-2xs border border-cyan-100">
              <CreditCard className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Member QR</span>
          </button>

          {/* 6. Doorprize Berkah */}
          <button
            onClick={() => onNavigateTab('MEMBERS')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-amber-50 group-hover:bg-amber-100 active:scale-95 text-[#F59E0B] flex items-center justify-center transition shadow-2xs border border-amber-100">
              <Gift className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Doorprize</span>
          </button>

          {/* 7. Standing Order (Langganan Rutin) */}
          <button
            onClick={() => onNavigateTab('UKM_SUPPLY')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 active:scale-95 text-[#4F46E5] flex items-center justify-center transition shadow-2xs border border-indigo-100">
              <Calendar className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Langganan</span>
          </button>

          {/* 8. Lainnya */}
          <button
            onClick={() => setShowAllServicesModal(true)}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-slate-100 group-hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition shadow-2xs border border-slate-200/80">
              <MoreHorizontal className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Lainnya</span>
          </button>
        </div>
      </div>

      {/* 5. SUBSCRIPTION BANNER (Langganan PLUS Exact Style from Screenshot!) */}
      <div 
        onClick={() => setShowSubscriptionModal(true)}
        className="bg-gradient-to-r from-[#D7FF38] via-[#85F961] to-[#36DC42] p-3.5 rounded-2xl shadow-xs border border-emerald-300 flex items-center justify-between text-slate-900 cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition duration-200"
        title="Klik untuk lihat keuntungan Langganan PLUS"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl drop-shadow-xs">🪙</span>
          <div>
            <div className="text-[10px] text-emerald-950 font-extrabold leading-tight">
              Harga spesial buat mitra UKM Kuliner!
            </div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
              <span>Langganan</span>
              <span className="bg-[#003810] text-[#D7FF38] font-mono text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider shadow-xs">
                PLUS ➔
              </span>
            </div>
          </div>
        </div>

        {/* Live Countdown Clock Badge (Red badge in screenshot!) */}
        <div className="bg-[#EE2737] text-white px-2.5 py-1 rounded-xl text-[10px] font-mono font-black flex items-center gap-1 shadow-xs tracking-tight">
          <Clock className="w-3 h-3 stroke-[2.5]" />
          <span>
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* 6. "PROMO YANG WAJIB DICEK" (Gojek Green Carousel Cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-base text-slate-900 tracking-tight">
            Promo yang wajib dicek
          </h3>
          <button 
            onClick={() => onNavigateTab('MEMBERS')}
            className="text-xs font-bold text-[#00AA13] hover:underline"
          >
            Lihat Semua
          </button>
        </div>

        {/* Horizontal Scroll / Carousel Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-md">
          <div className={`transition-all duration-500 bg-gradient-to-r ${promoCards[activePromoIndex].bgGradient} p-5 flex items-center justify-between`}>
            <div className="space-y-2 max-w-[70%]">
              <span className="text-[9px] font-mono font-black bg-white text-slate-900 px-2.5 py-0.5 rounded-full inline-block shadow-xs uppercase">
                {promoCards[activePromoIndex].badge}
              </span>
              <h4 className="text-base font-black leading-snug tracking-tight">
                {promoCards[activePromoIndex].title}
              </h4>
              <p className="text-[11px] text-white/90 leading-tight">
                {promoCards[activePromoIndex].subtitle}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="text-[10px] font-mono font-black bg-black/30 border border-white/20 px-2.5 py-1 rounded-lg">
                  KODE: {promoCards[activePromoIndex].code}
                </span>
                <button
                  onClick={() => handleCopyPromoCode(promoCards[activePromoIndex].code)}
                  className="px-3 py-1 bg-white text-slate-900 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition shadow-xs"
                >
                  {copiedCode === promoCards[activePromoIndex].code ? 'Tersalin ✓' : 'Salin'}
                </button>
              </div>
            </div>

            <div className="text-5xl shrink-0 drop-shadow-md">
              {promoCards[activePromoIndex].illustration}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-1.5 py-2.5 bg-black/20">
            {promoCards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActivePromoIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activePromoIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 7. "RESTO DENGAN RATING JEMPOLAN" / KATALOG POPULER UKM */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-slate-900 leading-tight tracking-tight">
                Bahan Baku Rating Jempolan
              </h3>
              <span className="text-[9px] font-bold font-mono bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded border border-slate-200">
                Ad
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Pasokan terlaris untuk Resto, Warung & Kafe
            </span>
          </div>
          <button 
            onClick={() => onNavigateTab('UKM_SUPPLY')}
            className="text-xs font-bold text-[#00AA13] hover:underline"
          >
            Katalog Lengkap ➔
          </button>
        </div>

        {/* Grid Product Cards with Stepper */}
        {(() => {
          const filtered = INITIAL_PRODUCTS.filter(prod => {
            if (!searchKeyword.trim()) return true;
            return prod.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                   prod.category.toLowerCase().includes(searchKeyword.toLowerCase());
          });
          const list = filtered.length > 0 ? filtered.slice(0, 6) : INITIAL_PRODUCTS.slice(0, 4);

          return (
            <div className="grid grid-cols-2 gap-3">
              {list.map((prod) => {
            const qty = cartQuantities[prod.id] || 0;
            const price = prod.variants[0]?.price || 30000;
            const strikedPrice = Math.round(price * 1.12);

            return (
              <div 
                key={prod.id}
                className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-2">
                  {/* Product Image */}
                  <div className="relative h-32 rounded-2xl bg-slate-100 overflow-hidden">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[9px] font-black font-mono bg-[#00AA13] text-white px-2 py-0.5 rounded-full shadow-xs">
                      Diskon B2B
                    </span>
                  </div>

                  {/* Rating & Sold count */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-black text-slate-800">4.9</span>
                    <span>(1.2rb+ terjual)</span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                    {prod.name}
                  </h4>
                </div>

                {/* Price & Add to Cart button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2.5">
                  <div>
                    <div className="text-[10px] text-slate-400 line-through">
                      Rp {strikedPrice.toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs font-black text-[#00AA13] font-mono">
                      Rp {price.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => updateProductQty(prod.id, 1)}
                      className="px-3 py-1.5 rounded-xl bg-[#00AA13] hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-xl">
                      <button
                        onClick={() => updateProductQty(prod.id, -1)}
                        className="text-emerald-800 hover:text-rose-600 font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-black text-xs text-emerald-950">{qty}</span>
                      <button
                        onClick={() => updateProductQty(prod.id, 1)}
                        className="text-emerald-800 hover:text-emerald-600 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
          );
        })()}
      </div>

      {/* 8. KURSUS EDUKASI ORIENTAL LEARN */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-black text-base text-slate-900 leading-tight tracking-tight">
              Edukasi Kuliner & Dapur (OriLearn)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Video SOP, Kuis Kompetensi & Sertifikat Kelulusan
            </span>
          </div>
          <button 
            onClick={() => onNavigateTab('ECOSYSTEM')}
            className="text-xs font-bold text-[#00AA13] hover:underline"
          >
            Semua Modul ➔
          </button>
        </div>

        <div className="space-y-2.5">
          <div 
            onClick={() => setSelectedVideoCourse({
              title: 'Standarisasi Resep & Efisiensi Bahan Masakan Warung',
              category: 'SOP Dapur • 15 Menit',
              duration: '15:20',
              instructor: 'Chef Hendra (Head of Culinary Training)',
              points: [
                'Standar Takaran Minyak Goreng & Bumbu per Porsi',
                'Teknik Penyimpanan Beras & Tepung Bebas Kutu',
                'Filter & Daur Ulang Minyak Jelantah ke Jerigen Khusus',
                'Pencatatan Kartu Stok Harian Menggunakan Aplikasi'
              ]
            })}
            className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0077B6] flex items-center justify-center shrink-0">
              <PlayCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                SOP Dapur • 15 Menit
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                Standarisasi Resep & Efisiensi Bahan Masakan Warung
              </h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                Trik potong susut limbah dapur hingga di bawah 3%
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div 
            onClick={() => setSelectedVideoCourse({
              title: 'Kalibrasi Mesin Espresso & Teknik Steaming Susu',
              category: 'Barista Skill • 20 Menit',
              duration: '20:45',
              instructor: 'Barista Andi (Indonesian Barista Champion Judge)',
              points: [
                'Setting Grind Size Burr Grinder Sesuai Kelembaban Udara',
                'Yield Extraction Ratio 1:2 (18g Dose -> 36g Liquid)',
                'Teknik Microfoam Steaming Susu untuk Latte Art',
                'Cleaning & Backflush Routine Espresso Machine Tiap Tutup Shift'
              ]
            })}
            className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3 hover:bg-slate-50 active:scale-[0.99] transition cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#F59E0B] flex items-center justify-center shrink-0">
              <PlayCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                Barista Skill • 20 Menit
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                Kalibrasi Mesin Espresso & Teknik Steaming Susu
              </h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                Konsistensi rasa kopi susu kekinian untuk omzet tinggi
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 9. FLOATING STICKY QUICK-CART BAR (Like GoFood / GrabFood in screenshot!) */}
      {totalCartItemsCount > 0 && (
        <div className="fixed bottom-18 inset-x-4 max-w-sm mx-auto z-40 animate-slideUp">
          <div 
            onClick={() => setShowCartCheckoutModal(true)}
            className="bg-[#00AA13] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer hover:bg-emerald-700 active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium leading-none text-white/90">
                  {totalCartItemsCount} Bahan Baku Dipilih
                </div>
                <div className="text-sm font-black font-mono mt-0.5">
                  Rp {totalCartPrice.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-extrabold bg-white text-[#00AA13] px-3 py-1.5 rounded-xl shadow-xs">
              <span>Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL TOP UP ORIENTAL PAY */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#00AED6] text-white flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Isi Saldo Oriental Pay</h3>
                  <p className="text-[10px] text-slate-400 font-mono">BCA Virtual Account / Kasir Toko</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-500">Nomor Virtual Account:</div>
                <div className="font-black text-slate-800 text-sm">8200 102 2608 001</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText('82001022608001');
                  setToastMessage('Nomor Virtual Account berhasil disalin!');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                title="Salin No VA"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Pilih nominal cepat isi saldo:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[50000, 100000, 250000, 500000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition ${
                    topUpAmount === amt
                      ? 'border-[#00AED6] bg-cyan-50 text-[#007799]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Rp {amt.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Nominal Custom:</label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00AED6]"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteTopUp}
                className="px-4 py-2 bg-[#00AED6] hover:bg-[#0098bc] text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-900/20"
              >
                Konfirmasi Top Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL BAYAR QRIS & BARCODE MEMBER */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-900 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-5 h-5 text-[#00AA13]" />
                <h3 className="font-bold text-sm">Pembayaran & Check-in</h3>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {/* Toggle QRIS vs Barcode */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setQrMode('MEMBER_CARD')}
                className={`py-1.5 rounded-xl text-xs font-bold transition ${
                  qrMode === 'MEMBER_CARD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Barcode Member
              </button>
              <button
                onClick={() => setQrMode('QRIS_DINAMIS')}
                className={`py-1.5 rounded-xl text-xs font-bold transition ${
                  qrMode === 'QRIS_DINAMIS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                QRIS Oriental Pay
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {qrMode === 'MEMBER_CARD' 
                ? 'Tunjukkan barcode ke kasir untuk kumpulkan poin & identifikasi member:'
                : 'Pindai QR ini untuk pembayaran langsung dari saldo dompet Oriental Pay:'}
            </p>

            {/* Animated Laser Scanner Line */}
            <div className="relative p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner overflow-hidden">
              <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-300 mx-auto flex flex-col items-center justify-center relative">
                <QrCode className="w-36 h-36 text-slate-900" />
                <span className="text-[10px] font-mono font-black text-slate-700 mt-1">
                  {activeMember?.barcode || '82000080'}
                </span>
                {/* Red Laser Line */}
                <div className="absolute inset-x-2 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse top-1/2"></div>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-800">
              {activeMember?.fullName || 'Budi Santoso'} • {activeMember?.memberCode || '102-260820-01'}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* 12. MODAL GANTI LOKASI CABANG */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00AA13]" />
                <h3 className="font-bold text-sm">Pilih Cabang / Wilayah</h3>
              </div>
              <button 
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Makassar (Pusat Distribusi)', detail: 'Jl. Boulevard Panakkukang No. 12', time: 'Estimasi Antar: 30 Mnt' },
                { name: 'Bone (Watampone)', detail: 'Jl. Ahmad Yani No. 88, Watampone', time: 'Estimasi Antar: 45 Mnt' },
              ].map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    setSelectedLocation(loc.name);
                    setShowLocationModal(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    selectedLocation === loc.name
                      ? 'border-[#00AA13] bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{loc.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{loc.detail}</div>
                    <div className="text-[9px] text-[#00AA13] font-mono mt-0.5 font-bold">{loc.time}</div>
                  </div>
                  {selectedLocation === loc.name && <CheckCircle2 className="w-4 h-4 text-[#00AA13]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 13. MODAL SEMUA LAYANAN */}
      {showAllServicesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm">Semua Layanan Oriental</h3>
              <button 
                onClick={() => setShowAllServicesModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <button 
                onClick={() => { setShowAllServicesModal(false); onNavigateTab('UKM_SUPPLY'); }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#EE2737] flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">B2B Supply</span>
              </button>

              <button 
                onClick={() => { setShowAllServicesModal(false); onNavigateTab('WHITELABEL'); }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#880088] flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">White Label</span>
              </button>

              <button 
                onClick={() => { setShowAllServicesModal(false); onNavigateTab('ECOSYSTEM'); }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0077B6] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">OriLearn</span>
              </button>

              <button 
                onClick={() => { setShowAllServicesModal(false); onNavigateTab('MEMBERS'); }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">Doorprize</span>
              </button>

              <button 
                onClick={() => { setShowAllServicesModal(false); onNavigateTab('UKM_SUPPLY'); }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00AA13] flex items-center justify-center">
                  <Recycle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">Jemput Minyak</span>
              </button>

              <button 
                onClick={() => { setShowAllServicesModal(false); onNavigateTab('MEMBERS'); }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#00AED6] flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">One Identity</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 14. MODAL LANGGANAN PLUS (Gojek PLUS Equivalent) */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00AA13] to-teal-500 text-white flex items-center justify-center shadow-xs">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Langganan PLUS UKM</h3>
                  <p className="text-[10px] text-emerald-700 font-bold">Hemat s/d Rp 450.000 / Bulan</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSubscriptionModal(false)} 
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 rounded-2xl border border-emerald-200">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-emerald-950">Biaya Langganan Bulanan</span>
                <span className="text-base font-black font-mono text-[#00AA13]">
                  Rp 49.000<span className="text-[10px] text-slate-500 font-sans font-medium"> /bln</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Dapat dibatalkan kapan saja melalui Oriental Superapp</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800">Keuntungan Eksklusif Mitra PLUS:</div>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Gratis Ongkir</strong> Armada Truk se-Makassar & Gowa tanpa minimum order</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Fasilitas Tempo (TOP) 30 Hari</strong> Bunga 0% langsung disetujui</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Harga Pabrik Spesial</strong> Potongan Rp 2.500/karton Minyak & Beras</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Prioritas Pengiriman Pagi</strong> Jam 06:00 - 08:00 WITA sebelum dapur buka</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSubscriptionModal(false);
                setToastMessage('Selamat! Langganan PLUS Anda telah aktif. Nikmati Gratis Ongkir & TOP 30 Hari!');
                setTimeout(() => setToastMessage(null), 4000);
              }}
              className="w-full py-3 bg-[#00AA13] hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-900/20 active:scale-95 transition cursor-pointer"
            >
              Aktifkan Langganan PLUS Sekarang
            </button>
          </div>
        </div>
      )}

      {/* 15. QUICK CART CHECKOUT SHEET / MODAL */}
      {showCartCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#00AA13]" />
                <h3 className="font-extrabold text-sm">Checkout Cepat B2B</h3>
              </div>
              <button 
                onClick={() => setShowCartCheckoutModal(false)} 
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {Object.entries(cartQuantities).map(([id, qty]) => {
                const prod = INITIAL_PRODUCTS.find(p => p.id === id);
                if (!prod) return null;
                const price = prod.variants[0]?.price || 30000;
                return (
                  <div key={id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{prod.name}</div>
                        <div className="text-[10px] text-[#00AA13] font-mono font-bold">
                          Rp {price.toLocaleString('id-ID')} / unit
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-0.5">
                      <button onClick={() => updateProductQty(id, -1)} className="text-slate-600 hover:text-rose-600 font-bold px-1">-</button>
                      <span className="text-xs font-bold font-mono px-1">{qty}</span>
                      <button onClick={() => updateProductQty(id, 1)} className="text-slate-600 hover:text-emerald-600 font-bold px-1">+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery & Payment Info */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Alamat Kirim:</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[170px]">
                  {activeMember?.address || 'Jl. Boulevard Panakkukang, Makassar'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Metode Bayar:</span>
                <span className="font-bold text-[#00AA13]">Oriental Pay (Saldo: Rp {orientalPayBalance.toLocaleString('id-ID')})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkir Armada Truk:</span>
                <span className="font-bold text-emerald-600">GRATIS (Promo Mitra)</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-sm text-slate-900">
                <span>Total Tagihan:</span>
                <span className="text-[#00AA13] font-mono">Rp {totalCartPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCartCheckoutModal(false);
                  onNavigateTab('UKM_SUPPLY');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Katalog Lengkap
              </button>
              <button
                onClick={() => {
                  setShowCartCheckoutModal(false);
                  setCartQuantities({});
                  setToastMessage(`Pesanan B2B Rp ${totalCartPrice.toLocaleString('id-ID')} berhasil dipesan! Truk segera meluncur.`);
                  setTimeout(() => setToastMessage(null), 4000);
                }}
                className="flex-1 py-2.5 bg-[#00AA13] hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-900/20 active:scale-95 transition cursor-pointer"
              >
                Bayar & Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 16. ORILEARN VIDEO PLAYER SOP MODAL */}
      {selectedVideoCourse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm truncate">{selectedVideoCourse.category}</h3>
              </div>
              <button 
                onClick={() => setSelectedVideoCourse(null)} 
                className="text-slate-400 hover:text-slate-600 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {/* Mock Video Screen */}
            <div className="relative bg-slate-950 rounded-2xl h-44 overflow-hidden flex flex-col justify-between p-3 text-white shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/80">
                <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold">1080p HD</span>
                <span>{selectedVideoCourse.duration}</span>
              </div>
              <div className="self-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-95 transition shadow-lg">
                <PlayCircle className="w-8 h-8 fill-white/80 text-slate-950" />
              </div>
              <div>
                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-1">
                  <div className="bg-[#00AA13] w-2/5 h-full rounded-full"></div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-white/70">
                  <span>04:12</span>
                  <span>{selectedVideoCourse.duration}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-xs text-slate-900 leading-snug">{selectedVideoCourse.title}</h4>
              <p className="text-[10px] text-slate-500 font-mono">Instruktur: {selectedVideoCourse.instructor}</p>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
              <div className="text-[11px] font-bold text-slate-800">Checklist SOP Utama:</div>
              {selectedVideoCourse.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-600">
                  <span className="text-[#00AA13] font-bold">{idx + 1}.</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setToastMessage('SOP PDF berhasil diunduh ke perangkat Anda!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </button>
              <button
                onClick={() => {
                  setSelectedVideoCourse(null);
                  onNavigateTab('ECOSYSTEM');
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Kuis Kompetensi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
