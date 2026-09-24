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
} from 'lucide-react';
import { CustomerSegment, RegionCode, UserRole, MemberOneIdentity } from '@oriental/types';
import { useEcosystem } from '../context/EcosystemContext';
import { MemberRegistrationModal } from '../components/members/MemberRegistrationModal';
import { DoorprizeDrawerModal } from '../components/members/DoorprizeDrawerModal';
import { UserDelegationModal } from '../components/auth/UserDelegationModal';

const AFFILIATE_PRODUCTS = [
  { id: 'p1', slug: 'minyak-goreng-oriental-2l', name: 'Minyak Goreng Oriental 2L', price: 34000, commission: 340 },
  { id: 'p2', slug: 'beras-premium-pulen-5kg', name: 'Beras Premium Pulen 5Kg', price: 74000, commission: 740 },
  { id: 'p3', slug: 'kopi-susu-gula-aren-250ml', name: 'Kopi Susu Gula Aren 250ml', price: 12000, commission: 120 },
  { id: 'p4', slug: 'gula-pasir-kristal-1kg', name: 'Gula Pasir Kristal Putih 1Kg', price: 17500, commission: 175 },
];

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
  } = useEcosystem();

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'card' | 'directory' | 'rbac'>('card');

  // Modals state
  const [showRegModal, setShowRegModal] = useState(false);
  const [showDoorprizeModal, setShowDoorprizeModal] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [selectedDrawerMember, setSelectedDrawerMember] = useState<MemberOneIdentity>(activeMember);

  // Directory Filters
  const [searchDirectory, setSearchDirectory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');

  // Referral / Affiliate State
  const [copiedBusiness, setCopiedBusiness] = useState(false);
  const [copiedProduct, setCopiedProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(AFFILIATE_PRODUCTS[0]);

  // Links
  const businessReferralLink = `https://oriental.co.id/register-merchant?ref=${activeMember.memberCode}`;
  const productAffiliateLink = `https://oriental.co.id/product/${selectedProduct.slug}?aff=${activeMember.memberCode}&pid=${selectedProduct.id}`;

  const handleCopyBusiness = () => {
    navigator.clipboard.writeText(businessReferralLink);
    setCopiedBusiness(true);
    setTimeout(() => setCopiedBusiness(false), 2000);
  };

  const handleCopyProduct = () => {
    navigator.clipboard.writeText(productAffiliateLink);
    setCopiedProduct(true);
    setTimeout(() => setCopiedProduct(false), 2000);
  };

  const openDoorprizeDrawer = (m: MemberOneIdentity) => {
    setSelectedDrawerMember(m);
    setShowDoorprizeModal(true);
  };

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
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'card'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Kartu & Poin Member Aktif</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direktori One Identity ({membersList.length})</span>
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
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              currentUser.role === UserRole.ADMIN_KASIR
                ? 'text-slate-400 bg-slate-50/60 cursor-not-allowed opacity-60 border border-slate-200'
                : activeTab === 'rbac'
                ? 'bg-indigo-600 text-white shadow-xs cursor-pointer'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Manajemen Staf & RBAC ({systemUsers.length})</span>
            {currentUser.role === UserRole.ADMIN_KASIR && (
              <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-200 font-mono">
                Terkunci
              </span>
            )}
          </button>
        </div>

        {/* Active Member Quick Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <span className="text-[11px] text-slate-500 font-mono">Member Kasir:</span>
          <select
            value={activeMember.memberCode}
            onChange={(e) => selectActiveMember(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          >
            {membersList.map((m) => (
              <option key={m.id} value={m.memberCode}>
                {m.fullName} ({m.memberCode})
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
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 border border-emerald-500/40 shadow-xl text-white">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-300 animate-ping"></span>
                  <span className="text-xs uppercase tracking-widest text-emerald-200 font-bold font-mono">
                    Oriental One Identity Card
                  </span>
                  <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    Wilayah {activeMember.regionCode === RegionCode.WATAMPONE ? 'Watampone (102)' : 'Makassar (101)'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{activeMember.fullName}</h2>
                  <p className="text-sm text-emerald-100">
                    {activeMember.phone} • {activeMember.segment}
                    {activeMember.businessName && ` • ${activeMember.businessName}`}
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
                </div>
              </div>

              <div className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-xl border border-emerald-100">
                <QrCode className="w-24 h-24 text-slate-900" />
                <span className="text-[10px] font-mono text-slate-700 mt-1 font-bold">SCAN DI KASIR</span>
              </div>
            </div>

            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Grid: Points & Doorprize Coupons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="glass-panel p-6 rounded-2xl border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold font-mono">
                  Total Poin Loyalitas
                </span>
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {activeMember.totalLoyaltyPoints}
                </span>
                <span className="text-sm text-amber-700 ml-2 font-semibold">Poin Aktif</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Terakumulasi dari transaksi 5-Channel (Retail Rp 100rb=1pt, Grosir Rp 200rb=1pt, UKM Supply Rp 50rb=1pt, Waste 1kg=1pt).
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-purple-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-purple-800 font-semibold font-mono">
                    Kupon Undian Doorprize
                  </span>
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 font-mono">
                      {activeMember.doorprizeCoupons?.length || 0}
                    </span>
                    <span className="text-sm text-purple-700 ml-2 font-semibold">Kupon Terdaftar</span>
                  </div>
                  <button
                    onClick={() => openDoorprizeDrawer(activeMember)}
                    className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Lihat Nomor Kupon</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Otomatis terbit setiap kelipatan transaksi Rp 150.000 untuk pengundian akbar tahunan.
              </p>
            </div>
          </div>

          {/* Program Komisi & Afiliasi Ganda */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Program Komisi & Afiliasi Ganda</h3>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold shadow-xs">
                Akumulasi Belanja: Rp {activeMember.totalSpendMonth.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Referral Bisnis */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                    1. Referral Bisnis / Pengusaha (0.5%)
                  </span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-mono font-semibold">
                    Link Profil Member
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Bagikan <strong>tautan akun member Anda</strong> ke rekan pengusaha. Anda mendapatkan <strong>komisi 0.5%</strong> dari total omset belanja rekan bisnis yang terdaftar di bawah jaringan Anda.
                </p>
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] text-slate-600 font-mono font-medium">Tautan Pendaftaran Rekan Bisnis:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={businessReferralLink}
                      className="flex-1 bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs text-emerald-800 font-mono font-semibold truncate shadow-xs"
                    />
                    <button
                      onClick={handleCopyBusiness}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                    >
                      {copiedBusiness ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedBusiness ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Afiliasi Influencer */}
              <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-purple-800 tracking-wider">
                    2. Afiliasi Influencer (1.0%)
                  </span>
                  <span className="text-[10px] text-purple-800 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded font-mono font-semibold">
                    Link Produk Spesifik
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Pilih <strong>produk katalog yang ingin Anda promosikan</strong> di media sosial. Dapatkan komisi langsung <strong>1.0%</strong> dari setiap barang yang terjual melalui tautan ini.
                </p>

                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-600 font-mono block mb-1 font-medium">Pilih Produk Promo:</label>
                    <select
                      value={selectedProduct.id}
                      onChange={(e) => {
                        const found = AFFILIATE_PRODUCTS.find((p) => p.id === e.target.value);
                        if (found) setSelectedProduct(found);
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 shadow-xs focus:outline-none focus:border-purple-500"
                    >
                      {AFFILIATE_PRODUCTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Rp {p.price.toLocaleString('id-ID')} • Komisi Rp {p.commission.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-mono block mb-1 font-medium">Tautan Afiliasi Produk:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={productAffiliateLink}
                        className="flex-1 bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs text-purple-800 font-mono font-semibold truncate shadow-xs"
                      />
                      <button
                        onClick={handleCopyProduct}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        {copiedProduct ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedProduct ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
      {/* SUB-TAB 2: DIREKTORI DATABASE MEMBER (ONE IDENTITY)       */}
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

            {/* Tombol Pendaftaran Member Baru (Hanya di CRM / Backoffice) */}
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
                  Sesuai Standar Template Form Costumer One Identity (ID Daerah, Barcode 8-digit, Multi-Profil Usaha, Survey Kebutuhan).
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
                    <th className="py-2.5 px-3">PROFIL BISNIS & SEGMEN</th>
                    <th className="py-2.5 px-3">WILAYAH & ALAMAT</th>
                    <th className="py-2.5 px-3 text-center">POIN & KUPON</th>
                    <th className="py-2.5 px-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredMembers.map((m) => {
                    const isCurrent = m.memberCode === activeMember.memberCode;
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
                          <div className="font-sans space-y-1">
                            <span className="font-semibold text-slate-800 text-xs block">
                              {m.businessName || 'Pelanggan Retail Perorangan'}
                            </span>
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {m.segment}
                            </span>
                            {m.businessProfiles && m.businessProfiles.length > 1 && (
                              <span className="text-[10px] text-indigo-700 font-bold ml-1">
                                (+{m.businessProfiles.length - 1} Unit Bisnis)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <div className="text-[11px] text-slate-700">
                            <span className="font-semibold text-slate-900 block">
                              {m.regionCode === RegionCode.WATAMPONE ? 'Watampone (Bone)' : 'Makassar'}
                            </span>
                            <span className="text-slate-500 line-clamp-1">
                              {m.address || '-'}
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
                                Member Kasir Aktif
                              </span>
                            ) : (
                              <button
                                onClick={() => selectActiveMember(m.memberCode)}
                                className="px-3 py-1 bg-white border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer"
                              >
                                Pilih di Kasir
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
      {/* SUB-TAB 3: MANAJEMEN PENGGUNA & DELEGASI RBAC            */}
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
          {/* RBAC Header & Current Login Info */}
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

          {/* Role Delegation Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Tier 1: Pemilik Bisnis
              </span>
              <h4 className="text-base font-extrabold text-slate-900 mt-1">Super Admin (Owner)</h4>
              <p className="text-xs text-slate-600 mt-1">
                Wewenang absolut: Akses Laporan Keuangan SAK, Margin Keuntungan, Pengaturan Sistem, & Pendelegasian Manager / Kasir.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-indigo-200 bg-indigo-50/30">
              <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block">
                Tier 2: Supervisi Operasional
              </span>
              <h4 className="text-base font-extrabold text-slate-900 mt-1">Admin Manager</h4>
              <p className="text-xs text-slate-600 mt-1">
                Didelegasikan oleh Owner: Berhak mendelegasikan akun Admin Kasir, Staff Gudang, dan Operator Waste.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-emerald-200 bg-emerald-50/30">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                Tier 3: Petugas Kasir Terisolasi
              </span>
              <h4 className="text-base font-extrabold text-slate-900 mt-1">Admin Kasir POS</h4>
              <p className="text-xs text-slate-600 mt-1">
                Terisolasi ketat: Hanya membuka kasir penjualan. Tidak bisa melihat laporan laba/rugi keuangan dan tidak bisa membuat member baru di kasir.
              </p>
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
    </div>
  );
};
