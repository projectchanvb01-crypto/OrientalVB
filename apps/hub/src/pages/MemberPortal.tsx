import React, { useState } from 'react';
import {
  QrCode,
  Sparkles,
  Gift,
  Share2,
  Copy,
  Check,
  History,
  TrendingUp,
  Package,
  Calendar,
  ExternalLink,
  Users,
  CreditCard,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  Eye,
  Store,
  MapPin,
  Phone,
  Barcode,
  Layers,
  Building2,
  Ticket,
  Power,
  ChevronRight,
  Wallet,
  Award,
  Crown,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Zap,
} from 'lucide-react';
import {
  CustomerSegment,
  RegionCode,
  UserRole,
  MemberOneIdentity,
  CustomerTier,
  ProductWithMultiUnit,
} from '@oriental/types';
import { useEcosystem } from '../context/EcosystemContext';
import { MemberRegistrationModal } from '../components/members/MemberRegistrationModal';
import { DoorprizeDrawerModal } from '../components/members/DoorprizeDrawerModal';
import { UserDelegationModal } from '../components/auth/UserDelegationModal';

export const MemberPortal: React.FC = () => {
  const {
    member,
    membersList,
    activeMember,
    selectActiveMember,
    registerNewMember,
    systemUsers,
    currentUser,
    setCurrentUser,
    delegateNewUser,
    toggleUserStatus,
    products,
    topUpOrientalPay,
    evaluateMemberTier,
    influencerLinks,
    generateInfluencerLink,
  } = useEcosystem();

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'card' | 'tier' | 'wallet' | 'affiliate' | 'directory' | 'rbac'>('card');

  // Modals state
  const [showRegModal, setShowRegModal] = useState(false);
  const [showDoorprizeModal, setShowDoorprizeModal] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(500000);
  const [topupSuccessMsg, setTopupSuccessMsg] = useState(false);
  const [selectedDrawerMember, setSelectedDrawerMember] = useState<MemberOneIdentity>(activeMember);

  // Directory Filters
  const [searchDirectory, setSearchDirectory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');

  // Referral / Affiliate State
  const [copiedBusiness, setCopiedBusiness] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'prod-minyak');
  const [affiliateSuccessNotice, setAffiliateSuccessNotice] = useState<string | null>(null);

  // Business Referral Link
  const businessReferralLink = `http://localhost:3000/members?ref=${activeMember.memberCode}`;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleGenerateLink = () => {
    try {
      const generated = generateInfluencerLink(activeMember.id, selectedProductId);
      setAffiliateSuccessNotice(`Tautan berhasil dibuat untuk ${generated.productName}`);
      setTimeout(() => setAffiliateSuccessNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal membuat tautan afiliasi.');
    }
  };

  const handleProcessTopup = () => {
    if (topupAmount <= 0) return;
    topUpOrientalPay(activeMember.id, topupAmount, 'MANUAL_DEPOSIT', `TOPUP-${Date.now().toString().slice(-4)}`);
    setTopupSuccessMsg(true);
    setTimeout(() => {
      setTopupSuccessMsg(false);
      setShowTopupModal(false);
    }, 1500);
  };

  const openDoorprizeDrawer = (m: MemberOneIdentity) => {
    setSelectedDrawerMember(m);
    setShowDoorprizeModal(true);
  };

  // Helper for Tier Badge styles & benefits
  const getTierVisuals = (tier?: CustomerTier) => {
    switch (tier) {
      case CustomerTier.PLATINUM:
        return {
          label: 'PLATINUM',
          badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold',
          cardGradient: 'from-purple-900 via-indigo-900 to-slate-900 border-purple-500/40',
          accentColor: 'text-purple-600',
          perksSummary: 'Diskon Tambahan 1% di Faktur + Bonus Poin 15%',
          minSpend: 70000000,
          nextTier: null,
          nextTarget: null,
        };
      case CustomerTier.GOLD:
        return {
          label: 'GOLD',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
          cardGradient: 'from-amber-900 via-yellow-950 to-slate-900 border-amber-500/40',
          accentColor: 'text-amber-600',
          perksSummary: 'Bonus Poin Loyalitas 10% di Semua Channel',
          minSpend: 40000000,
          nextTier: 'PLATINUM',
          nextTarget: 70000000,
        };
      case CustomerTier.SILVER:
        return {
          label: 'SILVER',
          badgeClass: 'bg-slate-200 text-slate-800 border-slate-300 font-extrabold',
          cardGradient: 'from-slate-800 via-slate-900 to-zinc-950 border-slate-500/40',
          accentColor: 'text-slate-600',
          perksSummary: 'Prioritas Jadwal Pengiriman Standing Order',
          minSpend: 20000000,
          nextTier: 'GOLD',
          nextTarget: 40000000,
        };
      case CustomerTier.BRONZE:
        return {
          label: 'BRONZE',
          badgeClass: 'bg-orange-100 text-orange-900 border-orange-300 font-extrabold',
          cardGradient: 'from-orange-950 via-amber-950 to-stone-900 border-orange-500/40',
          accentColor: 'text-orange-600',
          perksSummary: 'Akses Promo Kuota Khusus Bulanan',
          minSpend: 10000000,
          nextTier: 'SILVER',
          nextTarget: 20000000,
        };
      default:
        return {
          label: 'REGULER',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
          cardGradient: 'from-emerald-800 via-teal-900 to-slate-950 border-emerald-500/40',
          accentColor: 'text-emerald-600',
          perksSummary: 'Katalog Pasokan Harga Standar B2B UKM',
          minSpend: 0,
          nextTier: 'BRONZE',
          nextTarget: 10000000,
        };
    }
  };

  const tierInfo = getTierVisuals(activeMember.currentTier);
  const rollingAvg = activeMember.rolling3MonthAvgSpend || activeMember.totalSpendMonth || 0;
  const recentSpends = activeMember.monthlySpendsRecent || [
    Math.round(rollingAvg * 0.95),
    Math.round(rollingAvg * 1.05),
    activeMember.totalSpendMonth,
  ];

  // Active member's influencer affiliate links
  const memberLinks = influencerLinks.filter(
    (l) => l.memberId === activeMember.id || l.affiliateCode === activeMember.influencerAffiliateCode,
  );

  // Filtered members in database
  const filteredMembers = membersList.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchDirectory.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(searchDirectory.toLowerCase()) ||
      m.phone.includes(searchDirectory) ||
      m.barcode.includes(searchDirectory) ||
      (m.businessName && m.businessName.toLowerCase().includes(searchDirectory.toLowerCase()));

    const matchesRegion = selectedRegion === 'ALL' || m.regionCode === selectedRegion;
    const matchesSegment = selectedSegment === 'ALL' || m.segment === selectedSegment;

    return matchesSearch && matchesRegion && matchesSegment;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top CRM Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-2.5 rounded-2xl border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'card'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Profil & Kartu Member</span>
          </button>

          <button
            onClick={() => setActiveTab('tier')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'tier'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Loyalty Tier UKM</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'tier' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'}`}>
              {tierInfo.label}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Oriental Pay</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'wallet' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'}`}>
              Rp {(activeMember.orientalPayBalance || 0).toLocaleString('id-ID')}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('affiliate')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'affiliate'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Afiliasi & Referral Link</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direktori ({membersList.length})</span>
          </button>

          <button
            onClick={() => {
              if (currentUser.role === UserRole.ADMIN_KASIR) {
                alert('Akses Ditolak: Peran Kasir terisolasi dari Manajemen Staf & Pendelegasian RBAC.');
                return;
              }
              setActiveTab('rbac');
            }}
            disabled={currentUser.role === UserRole.ADMIN_KASIR}
            title={currentUser.role === UserRole.ADMIN_KASIR ? 'Akses Ditolak untuk Akun Kasir' : undefined}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              currentUser.role === UserRole.ADMIN_KASIR
                ? 'text-slate-400 bg-slate-50/60 cursor-not-allowed opacity-60 border border-slate-200'
                : activeTab === 'rbac'
                ? 'bg-slate-800 text-white shadow-xs cursor-pointer'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>RBAC ({systemUsers.length})</span>
          </button>
        </div>

        {/* Active Member Quick Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <span className="text-[11px] text-slate-500 font-mono">Member Aktif:</span>
          <select
            value={activeMember.memberCode}
            onChange={(e) => selectActiveMember(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          >
            {membersList.map((m) => (
              <option key={m.id} value={m.memberCode}>
                {m.fullName} ({m.currentTier || 'REGULER'} - {m.memberCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: KARTU & POIN MEMBER AKTIF                      */}
      {/* ======================================================== */}
      {activeTab === 'card' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Digital Member One Identity Card */}
          <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${tierInfo.cardGradient} border shadow-xl text-white`}>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold font-mono">
                    Oriental One Identity Card
                  </span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-mono border font-extrabold uppercase ${tierInfo.badgeClass}`}>
                    ★ Tier {tierInfo.label}
                  </span>
                  <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    Wilayah {activeMember.regionCode === RegionCode.WATAMPONE ? 'Watampone (102)' : 'Makassar (101)'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{activeMember.fullName}</h2>
                  <p className="text-sm text-slate-200">
                    {activeMember.phone} • {activeMember.segment}
                    {activeMember.businessName && ` • ${activeMember.businessName}`}
                  </p>
                  <p className="text-xs text-amber-200 font-semibold mt-1">
                    Hak Istimewa: {tierInfo.perksSummary}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1.5 rounded-xl font-mono text-sm text-white font-bold tracking-wider shadow-xs">
                    ID: {activeMember.memberCode}
                  </div>
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl font-mono text-xs text-emerald-200 flex items-center gap-1.5">
                    <Barcode className="w-4 h-4" />
                    <span>Barcode: {activeMember.barcode}</span>
                  </div>
                  {activeMember.influencerAffiliateCode && (
                    <div className="bg-purple-900/50 backdrop-blur-md border border-purple-400/30 px-3 py-1.5 rounded-xl font-mono text-xs text-purple-200 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Kode Afiliasi: {activeMember.influencerAffiliateCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                <QrCode className="w-24 h-24 text-slate-900" />
                <span className="text-[10px] font-mono text-slate-700 mt-1 font-bold">SCAN DI KASIR</span>
              </div>
            </div>

            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Quick Metrics Grid: Tier, Wallet, Points, Coupons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Loyalty Tier Card */}
            <div
              onClick={() => setActiveTab('tier')}
              className="glass-panel p-5 rounded-2xl border-purple-200 hover:border-purple-400 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-purple-800 font-bold font-mono">
                  Loyalty Tier UKM
                </span>
                <Crown className="w-4 h-4 text-purple-600 group-hover:scale-110 transition" />
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-black text-purple-950 font-mono">
                  {tierInfo.label}
                </span>
                <span className="block text-[11px] text-purple-700 font-medium mt-0.5">
                  Rata-rata: Rp {rollingAvg.toLocaleString('id-ID')}/bln
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-purple-800 mt-3 font-semibold pt-2 border-t border-purple-100">
                <span>Rincian Rolling 3 Bulan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2. Closed-Loop Oriental Pay Wallet */}
            <div
              onClick={() => setActiveTab('wallet')}
              className="glass-panel p-5 rounded-2xl border-teal-200 hover:border-teal-400 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-teal-800 font-bold font-mono">
                  Oriental Pay (Dompet)
                </span>
                <Wallet className="w-4 h-4 text-teal-600 group-hover:scale-110 transition" />
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-black text-teal-950 font-mono">
                  Rp {(activeMember.orientalPayBalance || 0).toLocaleString('id-ID')}
                </span>
                <span className="block text-[11px] text-teal-700 font-medium mt-0.5">
                  Dompet Tertutup (Closed-Loop)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-teal-800 mt-3 font-semibold pt-2 border-t border-teal-100">
                <span>Buka Dompet & Top-Up</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3. Loyalty Points */}
            <div className="glass-panel p-5 rounded-2xl border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-amber-800 font-bold font-mono">
                  Poin Loyalitas
                </span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {activeMember.totalLoyaltyPoints}
                </span>
                <span className="text-xs text-amber-700 ml-1.5 font-bold">Poin Aktif</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Dapat ditukar voucher / reward
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-amber-100 font-mono">
                {activeMember.currentTier === CustomerTier.PLATINUM
                  ? 'Bonus Poin +15% aktif'
                  : activeMember.currentTier === CustomerTier.GOLD
                  ? 'Bonus Poin +10% aktif'
                  : 'Multi-channel poin standar'}
              </div>
            </div>

            {/* 4. Doorprize Coupons */}
            <div className="glass-panel p-5 rounded-2xl border-purple-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-purple-800 font-bold font-mono">
                    Kupon Doorprize
                  </span>
                  <Gift className="w-4 h-4 text-purple-600" />
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {activeMember.doorprizeCoupons?.length || 0}
                  </span>
                  <button
                    onClick={() => openDoorprizeDrawer(activeMember)}
                    className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Ticket className="w-3 h-3" />
                    <span>Lihat Nomor</span>
                  </button>
                </div>
              </div>
              <span className="block text-[10px] text-slate-500 mt-2 font-mono">
                Kelipatan Rp 150rb per transaksi
              </span>
            </div>
          </div>

          {/* Riwayat Mutasi Poin & Transaksi Member */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Riwayat Transaksi & Mutasi Poin Member</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {activeMember.pointHistory?.length || 0} Catatan Terdata
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                    <th className="py-2.5 px-3">TANGGAL</th>
                    <th className="py-2.5 px-3">NO. INVOICE</th>
                    <th className="py-2.5 px-3">CHANNEL</th>
                    <th className="py-2.5 px-3">DESKRIPSI TRANSAKSI</th>
                    <th className="py-2.5 px-3 text-right">TOTAL BELANJA</th>
                    <th className="py-2.5 px-3 text-center">MUTASI POIN</th>
                    <th className="py-2.5 px-3 text-center">DOORPRIZE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!activeMember.pointHistory || activeMember.pointHistory.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        Belum ada riwayat transaksi pada akun member ini.
                      </td>
                    </tr>
                  ) : (
                    activeMember.pointHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 text-slate-600">{h.date}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{h.invoiceNumber}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              h.channel === 'RETAIL'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : h.channel === 'UKM_SUPPLY'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : h.channel === 'WASTE'
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {h.channel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 max-w-xs truncate">{h.description}</td>
                        <td className="py-3 px-3 text-right text-slate-900 font-bold">
                          Rp {h.transactionAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-amber-700">
                          +{h.pointsEarned} Poin
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-purple-700">
                          +{h.couponsEarned} Kupon
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: LOYALTY TIER UKM (ROLLING 3 BULAN)             */}
      {/* ======================================================== */}
      {activeTab === 'tier' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner Tier Status */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50/40 to-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-purple-700 font-bold font-mono">
                    Program Loyalitas Mitra UKM Kuliner (Addendum PRD v2.1 §4)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${tierInfo.badgeClass}`}>
                    {tierInfo.label}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {activeMember.fullName} ({activeMember.businessName || 'Bisnis UKM'})
                </h2>
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Status loyalitas ditentukan secara otomatis berdasarkan <strong>rata-rata belanja 3 bulan bergulir (Rolling 3-Month Average Spend)</strong>.
                  Evaluasi resmi dijalankan setiap tanggal 1 awal bulan baru.
                </p>
              </div>

              {/* Rolling 3 Month Spend Card */}
              <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-md text-right min-w-[240px]">
                <span className="text-xs font-mono text-purple-800 uppercase block font-semibold">
                  Rata-Rata Belanja 3 Bulan
                </span>
                <span className="text-3xl font-black text-purple-950 font-mono block mt-1">
                  Rp {rollingAvg.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block mt-1">
                  Evaluasi: 1 Okt 2026
                </span>
              </div>
            </div>

            {/* Downgrade Warning Notice if active */}
            {activeMember.downgradeWarning && (
              <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <strong className="block text-sm font-bold text-amber-950">Peringatan Risiko Penurunan Tier (Downgrade Warning)</strong>
                  <p>
                    Laju belanja bulan berjalan akun Anda saat ini berada di bawah batas aman ambang tier {tierInfo.label}.
                    Tingkatkan transaksi pasokan bahan baku sebelum akhir bulan agar rata-rata 3 bulan Anda tetap memenuhi syarat.
                  </p>
                </div>
              </div>
            )}

            {/* Progress to Next Tier */}
            {tierInfo.nextTarget && (
              <div className="mt-6 pt-6 border-t border-purple-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-700 font-semibold">
                    Progres Menuju Tier {tierInfo.nextTier} (Target: Rp {tierInfo.nextTarget.toLocaleString('id-ID')}/bln)
                  </span>
                  <span className="font-bold text-purple-800">
                    {Math.min(100, Math.round((rollingAvg / tierInfo.nextTarget) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((rollingAvg / tierInfo.nextTarget) * 100))}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-mono block text-right">
                  Kurang Rp {Math.max(0, tierInfo.nextTarget - rollingAvg).toLocaleString('id-ID')} untuk naik ke {tierInfo.nextTier}
                </span>
              </div>
            )}
          </div>

          {/* Breakdown 3 Bulan Bergulir */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>Rincian Realisasi Belanja 3 Bulan Terakhir</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-mono block">Bulan Juli 2026 (M-2)</span>
                <span className="text-xl font-black text-slate-900 font-mono block mt-1">
                  Rp {(recentSpends[0] || 0).toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block mt-1">✓ Terverifikasi</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-mono block">Bulan Agustus 2026 (M-1)</span>
                <span className="text-xl font-black text-slate-900 font-mono block mt-1">
                  Rp {(recentSpends[1] || 0).toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block mt-1">✓ Terverifikasi</span>
              </div>

              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200">
                <span className="text-xs text-purple-800 font-mono block font-bold">Bulan September 2026 (Berjalan)</span>
                <span className="text-xl font-black text-purple-950 font-mono block mt-1">
                  Rp {(activeMember.totalSpendMonth || 0).toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-purple-700 font-bold block mt-1">● Berjalan (Realtime)</span>
              </div>
            </div>
          </div>

          {/* Master Table Tier Klasifikasi PRD v2.1 */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Matriks Klasifikasi & Hak Istimewa Tier</h3>
                <p className="text-xs text-slate-500">
                  Pedoman resmi hak diskon faktur dan multiplier poin loyalitas (PRD v2.1 Addendum §4.1).
                </p>
              </div>
              <span className="text-xs font-mono text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 font-semibold">
                Sistem Tier Bergulir
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                    <th className="py-2.5 px-3">TIER LOYALITAS</th>
                    <th className="py-2.5 px-3">AMBANG BELANJA (ROLLING 3 BULAN)</th>
                    <th className="py-2.5 px-3">DISKON INVOICE</th>
                    <th className="py-2.5 px-3">BONUS POIN</th>
                    <th className="py-2.5 px-3">LAYANAN PRIORITAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className={activeMember.currentTier === CustomerTier.PLATINUM ? 'bg-purple-50/70 font-bold' : ''}>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-extrabold bg-purple-100 text-purple-900 border border-purple-300">
                        PLATINUM
                      </span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">&gt; Rp 70 Juta / bulan</td>
                    <td className="py-3 px-3 text-emerald-700 font-extrabold">Ekstra 1% di Faktur</td>
                    <td className="py-3 px-3 text-purple-800 font-extrabold">+15% Poin Loyalitas</td>
                    <td className="py-3 px-3 text-slate-700">Prioritas Alokasi Stok, Kuota Terjamin, Buffer Stock Alerts</td>
                  </tr>

                  <tr className={activeMember.currentTier === CustomerTier.GOLD ? 'bg-amber-50/70 font-bold' : ''}>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                        GOLD
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-900">Rp 40 Jt - Rp 70 Juta / bulan</td>
                    <td className="py-3 px-3 text-slate-500">Harga Standar UKM</td>
                    <td className="py-3 px-3 text-amber-800 font-extrabold">+10% Poin Loyalitas</td>
                    <td className="py-3 px-3 text-slate-700">Layanan Dedicated Key Account Representative</td>
                  </tr>

                  <tr className={activeMember.currentTier === CustomerTier.SILVER ? 'bg-slate-100/70 font-bold' : ''}>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-800 border border-slate-300">
                        SILVER
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-900">Rp 20 Jt - Rp 40 Juta / bulan</td>
                    <td className="py-3 px-3 text-slate-500">Harga Standar UKM</td>
                    <td className="py-3 px-3 text-slate-600">Poin Standar (1x)</td>
                    <td className="py-3 px-3 text-slate-700">Prioritas Jadwal Pengiriman Standing Order</td>
                  </tr>

                  <tr className={activeMember.currentTier === CustomerTier.BRONZE ? 'bg-orange-50/70 font-bold' : ''}>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-bold bg-orange-100 text-orange-900 border border-orange-300">
                        BRONZE
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-900">Rp 10 Jt - Rp 20 Juta / bulan</td>
                    <td className="py-3 px-3 text-slate-500">Harga Standar UKM</td>
                    <td className="py-3 px-3 text-slate-600">Poin Standar (1x)</td>
                    <td className="py-3 px-3 text-slate-700">Akses Kuota Promo Member Bulanan</td>
                  </tr>

                  <tr className={(!activeMember.currentTier || activeMember.currentTier === CustomerTier.REGULER) ? 'bg-emerald-50/40 font-bold' : ''}>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        REGULER
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">&lt; Rp 10 Juta / bulan</td>
                    <td className="py-3 px-3 text-slate-500">Harga Standar UKM</td>
                    <td className="py-3 px-3 text-slate-600">Poin Standar (1x)</td>
                    <td className="py-3 px-3 text-slate-500">Layanan Reguler</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: ORIENTAL PAY (DOMPET INTERNAL CLOSED-LOOP)     */}
      {/* ======================================================== */}
      {activeTab === 'wallet' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Wallet Balance Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-teal-200 bg-gradient-to-br from-teal-900 via-emerald-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-teal-300" />
                  <span className="text-xs uppercase tracking-widest text-teal-200 font-bold font-mono">
                    Dompet Tertutup Resmi Oriental Pay (Closed-Loop)
                  </span>
                  <span className="bg-teal-500/20 text-teal-200 border border-teal-400/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                    OJK & AML Compliant
                  </span>
                </div>
                <div>
                  <span className="text-xs text-teal-200/80 font-mono block">Saldo Siap Belanja:</span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5">
                    Rp {(activeMember.orientalPayBalance || 0).toLocaleString('id-ID')}
                  </h2>
                  <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
                    Akun: <strong>{activeMember.fullName}</strong> ({activeMember.memberCode})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowTopupModal(true)}
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Top-Up / Deposit Saldo</span>
                </button>
              </div>
            </div>

            {/* Compliance Guarantee Alert */}
            <div className="mt-6 pt-4 border-t border-teal-700/50 flex items-start gap-2.5 text-xs text-teal-200/90">
              <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
              <span>
                <strong>Prinsip Closed-Loop:</strong> Saldo Oriental Pay diterbitkan khusus untuk transaksi barang & jasa di ekosistem Oriental (Retail Swalayan, Suplai Bahan UKM, Maklon). Tidak melayani transfer P2P antar-nasabah maupun penarikan tunai keluar rekening bank.
              </span>
            </div>

            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Sources of Funds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border-slate-200">
              <div className="flex items-center gap-2 text-teal-700">
                <ArrowDownLeft className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wide">1. Payout Setor Jelantah</h4>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Hasil penjualan minyak jelantah di drop point POS Waste langsung dicairkan tanpa potongan ke saldo Oriental Pay Anda.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-slate-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <Percent className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wide">2. Komisi Referral Bisnis</h4>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Komisi 0.5% dari belanja rekan usaha B2B dapat dicairkan langsung ke saldo belanja tanpa masa tunggu (holding period).
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-slate-200">
              <div className="flex items-center gap-2 text-purple-700">
                <Share2 className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wide">3. Afiliasi Influencer 1%</h4>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Komisi penjualan 1.0% dari tautan produk promosi otomatis masuk ke dompet Oriental Pay dan dapat dibelanjakan kembali.
              </p>
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-base">Buku Besar Transaksi Oriental Pay (Ledger)</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {activeMember.orientalPayHistory?.length || 0} Mutasi Tercatat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                    <th className="py-2.5 px-3">WAKTU</th>
                    <th className="py-2.5 px-3">TIPE MUTASI</th>
                    <th className="py-2.5 px-3">DESKRIPSI TRANSAKSI</th>
                    <th className="py-2.5 px-3">NO. REFERENSI</th>
                    <th className="py-2.5 px-3 text-right">NOMINAL</th>
                    <th className="py-2.5 px-3 text-right">SALDO AKHIR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!activeMember.orientalPayHistory || activeMember.orientalPayHistory.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada mutasi saldo Oriental Pay pada akun ini.
                      </td>
                    </tr>
                  ) : (
                    activeMember.orientalPayHistory.map((tx) => {
                      const isIncome = tx.amount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 text-slate-600">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleString('id-ID') : (tx.date || '-')}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.type === 'TOPUP'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : tx.type === 'WASTE_PAYOUT'
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                  : tx.type === 'REFERRAL_COMMISSION'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-800 font-sans font-medium">{tx.description}</td>
                          <td className="py-3 px-3 text-slate-500">{tx.referenceId || tx.referenceInvoice || '-'}</td>
                          <td className={`py-3 px-3 text-right font-black ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isIncome ? '+' : ''}Rp {tx.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            Rp {tx.balanceAfter.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: AFILIASI INFLUENCER & REFERRAL BISNIS          */}
      {/* ======================================================== */}
      {activeTab === 'affiliate' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Notice */}
          <div className="glass-panel p-6 rounded-2xl border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-purple-50/40">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-indigo-700 font-bold block">
                  Program Monetisasi & Komisi Ekosistem
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Afiliasi Influencer Produk (1.0%) & Referral Bisnis (0.5%)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Dapatkan komisi penjualan langsung yang otomatis masuk ke saldo dompet Oriental Pay Anda.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-indigo-200 text-right">
                <span className="text-[10px] text-slate-500 font-mono block">Kode Afiliasi Aktif:</span>
                <span className="text-lg font-black text-indigo-800 font-mono">
                  {activeMember.influencerAffiliateCode || `ORT-${activeMember.memberCode.slice(-4)}`}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generator Afiliasi Produk (1.0%) */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 border-purple-200">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Generator Link Afiliasi Produk (1.0%)</h4>
                </div>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded font-mono">
                  Komisi Flat 1%
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih barang dari katalog Oriental. Bagikan tautan ke audiens media sosial Anda. Setiap transaksi berhasil menghasilkan <strong>komisi 1.0%</strong> langsung ke Oriental Pay.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">Pilih Produk untuk Dipromosikan:</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category}) - Rp {(p.variants[0]?.price || 0).toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateLink}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Terbitkan Tautan Afiliasi Baru</span>
                </button>

                {affiliateSuccessNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{affiliateSuccessNotice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Referral Bisnis B2B (0.5%) */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 border-emerald-200">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Referral Mitra Bisnis B2B (0.5%)</h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                  Komisi 0.5% Omset
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Ajak pemilik kafe, restoran, hotel atau toko grosir untuk mendaftar One Identity. Anda berhak menerima <strong>0.5%</strong> dari seluruh transaksi belanja rekan usaha tersebut.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">Tautan Pendaftaran Mitra Baru:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={businessReferralLink}
                      className="flex-1 bg-white border border-slate-300 px-3 py-2 rounded-xl text-xs font-mono text-emerald-900 truncate"
                    />
                    <button
                      onClick={() => handleCopyText(businessReferralLink, 'biz-ref')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      {copiedLink === 'biz-ref' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'biz-ref' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold block text-slate-800">Syarat Kualifikasi (PRD v2.1 §2.2):</span>
                  <span>• Pengusul belanja &ge; Rp 60 Jt/bulan</span>
                  <span className="block">• Rekan terdaftar belanja &ge; Rp 30 Jt/bulan</span>
                  <span className="block">• Komisi 0.5% cair tanpa batas holding period ke Oriental Pay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Generated Influencer Links Table */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Daftar Tautan Afiliasi Produk Aktif ({memberLinks.length})</h4>
                <p className="text-xs text-slate-500">Pelacakan klik, konversi transaksi, dan akumulasi komisi afiliasi.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                    <th className="py-2.5 px-3">PRODUK</th>
                    <th className="py-2.5 px-3">TAUTAN AFILIASI</th>
                    <th className="py-2.5 px-3 text-center">KLIK</th>
                    <th className="py-2.5 px-3 text-center">PENJUALAN</th>
                    <th className="py-2.5 px-3 text-right">KOMISI (1%)</th>
                    <th className="py-2.5 px-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memberLinks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada tautan produk yang diterbitkan. Gunakan generator di atas untuk membuat link.
                      </td>
                    </tr>
                  ) : (
                    memberLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-bold text-slate-900">{link.productName}</td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate text-[11px]">
                          {link.shareUrl || link.referralUrl}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-700">
                          {link.clicksCount ?? link.totalClicks ?? 0}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-700">
                          {link.salesCount ?? link.totalSalesQty ?? 0}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-purple-700">
                          Rp {(link.totalCommissionEarned ?? link.commissionEarned ?? 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleCopyText(link.shareUrl || link.referralUrl || '', link.id)}
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:border-purple-400 hover:text-purple-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            {copiedLink === link.id ? 'Tersalin!' : 'Salin Link'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 5: DIREKTORI DATABASE MEMBER (ONE IDENTITY)       */}
      {/* ======================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Bar & Filter */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, kode member, barcode, HP, atau nama bisnis..."
                  value={searchDirectory}
                  onChange={(e) => setSearchDirectory(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              {/* Filter Wilayah */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 shadow-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Wilayah</option>
                <option value={RegionCode.WATAMPONE}>Watampone (102)</option>
                <option value={RegionCode.MAKASSAR}>Makassar (101)</option>
              </select>

              {/* Filter Segmen */}
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 shadow-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Segmen Bisnis</option>
                <option value={CustomerSegment.B2B_RESTAURANT}>B2B Restaurant</option>
                <option value={CustomerSegment.B2B_WARUNG}>B2B Warung</option>
                <option value={CustomerSegment.B2B_CAFE}>B2B Café</option>
                <option value={CustomerSegment.B2B_GROSIR}>B2B Grosir</option>
                <option value={CustomerSegment.B2C_RETAIL}>B2C Retail</option>
                <option value={CustomerSegment.MITRA_WASTE}>Mitra Waste</option>
              </select>
            </div>

            {/* Tombol Pendaftaran Member Baru */}
            <button
              onClick={() => setShowRegModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Member Baru (One Identity)</span>
            </button>
          </div>

          {/* Table of Members */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Database Pelanggan Ekosistem Oriental
                </h3>
                <p className="text-xs text-slate-500">
                  Data One Identity lengkap dengan Tier Loyalitas (Rolling 3 Bulan) dan Saldo Oriental Pay.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                {filteredMembers.length} Pelanggan Terdaftar
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 font-mono">
                    <th className="py-2.5 px-3">KODE MEMBER & BARCODE</th>
                    <th className="py-2.5 px-3">NAMA LENGKAP & KONTAK</th>
                    <th className="py-2.5 px-3">TIER & ORIENTAL PAY</th>
                    <th className="py-2.5 px-3">PROFIL BISNIS & SEGMEN</th>
                    <th className="py-2.5 px-3 text-center">POIN & KUPON</th>
                    <th className="py-2.5 px-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredMembers.map((m) => {
                    const isCurrent = m.memberCode === activeMember.memberCode;
                    const mTier = getTierVisuals(m.currentTier);
                    return (
                      <tr key={m.id} className={`hover:bg-slate-50/80 transition ${isCurrent ? 'bg-emerald-50/40' : ''}`}>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <span className="font-bold text-emerald-800 block text-xs">
                              {m.memberCode}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1 font-mono">
                              <Barcode className="w-3 h-3 text-slate-400" />
                              {m.barcode}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-sans">
                            <span className="font-bold text-slate-900 block text-xs">
                              {m.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {m.phone}
                            </span>
                            {m.email && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {m.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-extrabold border ${mTier.badgeClass}`}>
                              {mTier.label}
                            </span>
                            <span className="text-[11px] font-bold text-teal-800 block">
                              Rp {(m.orientalPayBalance || 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-sans space-y-1">
                            <span className="font-semibold text-slate-800 text-xs block">
                              {m.businessName || 'Pelanggan Retail Perorangan'}
                            </span>
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {m.segment}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="space-y-0.5">
                            <span className="font-bold text-amber-700 text-xs block">
                              {m.totalLoyaltyPoints} Poin
                            </span>
                            <button
                              onClick={() => openDoorprizeDrawer(m)}
                              className="text-[10px] text-purple-700 hover:text-purple-900 font-semibold underline cursor-pointer"
                            >
                              {m.doorprizeCoupons?.length || 0} Kupon Doorprize
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-sans">
                            {isCurrent ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold">
                                Member Aktif
                              </span>
                            ) : (
                              <button
                                onClick={() => selectActiveMember(m.memberCode)}
                                className="px-3 py-1 bg-white border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer"
                              >
                                Pilih Member
                              </button>
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
      {/* SUB-TAB 6: MANAJEMEN PENGGUNA & DELEGASI RBAC            */}
      {/* ======================================================== */}
      {activeTab === 'rbac' && (
        currentUser.role === UserRole.ADMIN_KASIR ? (
          <div className="glass-panel p-8 rounded-2xl border-rose-200 bg-white text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Akses Pendelegasian Staf Dibatasi</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Peran Kasir terisolasi dari manajemen pendelegasian staf. Hanya Super Admin dan Admin Manager yang memiliki kewenangan mendelegasikan pengguna baru.
            </p>
            <button
              onClick={() => setActiveTab('card')}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm hover:bg-emerald-700"
            >
              Kembali ke Kartu Member
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* RBAC Header */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center text-indigo-400 border border-indigo-400/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-mono tracking-widest text-indigo-300 font-bold">
                      Sistem Kontrol Akses Berjenjang (RBAC)
                    </span>
                    <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Multi-Tier Delegation
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    Akun Anda: {currentUser.name}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Wewenang: <strong className="text-emerald-300 font-mono">{currentUser.role}</strong> ({currentUser.email})
                  </p>
                </div>
              </div>

              {/* Switch Active User / Simulator for Testing */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 text-xs">
                  <span className="text-slate-300 text-[10px] block font-mono">Simulasi Login Staf:</span>
                  <select
                    value={currentUser.id}
                    onChange={(e) => {
                      const u = systemUsers.find((x) => x.id === e.target.value);
                      if (u) setCurrentUser(u);
                    }}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer mt-0.5"
                  >
                    {systemUsers.map((u) => (
                      <option key={u.id} value={u.id} className="text-slate-900">
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {(currentUser.role === UserRole.SUPER_ADMIN ||
                  currentUser.role === UserRole.ADMIN_MANAGER) && (
                  <button
                    onClick={() => setShowDelegationModal(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Delegasikan Staf Baru</span>
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Daftar Pengguna & Staf Didelegasikan</h3>
                  <p className="text-xs text-slate-500">
                    Hierarki pendelegasian akun staf di lingkungan Oriental Ecosystem.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-600">
                  {systemUsers.length} Akun Terdaftar
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                      <th className="py-2.5 px-3">NAMA PENGGUNA & KONTAK</th>
                      <th className="py-2.5 px-3">PERAN / HAK AKSES</th>
                      <th className="py-2.5 px-3">PENDELEGASI (CREATOR)</th>
                      <th className="py-2.5 px-3">TANGGAL DIBUAT</th>
                      <th className="py-2.5 px-3 text-center">STATUS</th>
                      <th className="py-2.5 px-3 text-right">KONTROL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {systemUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3">
                          <div className="font-sans">
                            <span className="font-bold text-slate-900 text-xs block">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {u.email} • {u.phone}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === UserRole.SUPER_ADMIN
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : u.role === UserRole.ADMIN_MANAGER
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : u.role === UserRole.ADMIN_KASIR
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-sans">
                          {u.delegatedByName ? (
                            <span className="text-xs text-slate-800 font-medium">
                              {u.delegatedByName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Akun Pemilik Utama</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {new Date(u.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {u.isActive ? 'Aktif' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {u.role !== UserRole.SUPER_ADMIN && (
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                                u.isActive
                                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}
      {/* 1. Modal Registrasi Customer One Identity (Sesuai Excel) */}
      <MemberRegistrationModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        onSubmit={(dto) => {
          registerNewMember(dto);
        }}
      />

      {/* 2. Modal Drawer Kupon Undian Doorprize */}
      <DoorprizeDrawerModal
        isOpen={showDoorprizeModal}
        onClose={() => setShowDoorprizeModal(false)}
        member={selectedDrawerMember}
      />

      {/* 3. Modal Delegasi Staf Baru RBAC */}
      <UserDelegationModal
        isOpen={showDelegationModal}
        onClose={() => setShowDelegationModal(false)}
        currentUser={currentUser}
        onDelegate={(dto) => {
          delegateNewUser(dto);
        }}
      />

      {/* 4. Modal Top-Up Dompet Oriental Pay (Simulasi/Kasir) */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-teal-700">
                <Wallet className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 text-base">Top-Up Saldo Oriental Pay</h3>
              </div>
              <button
                onClick={() => setShowTopupModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <span className="text-[11px] text-teal-700 block font-mono">Member Tujuan:</span>
                <span className="text-sm font-bold text-teal-950">{activeMember.fullName} ({activeMember.memberCode})</span>
                <span className="text-[11px] text-teal-800 block mt-0.5">
                  Saldo Saat Ini: Rp {(activeMember.orientalPayBalance || 0).toLocaleString('id-ID')}
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1.5 font-mono">
                  Nominal Tambah Saldo:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[250000, 500000, 1000000, 2500000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTopupAmount(val)}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold font-mono transition border cursor-pointer ${
                      topupAmount === val
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +{val >= 1000000 ? `${val / 1000000} Jt` : `${val / 1000} Rb`}
                  </button>
                ))}
              </div>

              {topupSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deposit saldo berhasil ditambahkan ke dompet Oriental Pay!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTopupModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessTopup}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-teal-600/20"
              >
                Konfirmasi Top-Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
