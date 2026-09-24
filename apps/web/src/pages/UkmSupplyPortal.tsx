import React, { useState } from 'react';
import {
  Store,
  Calendar,
  Users,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Percent,
  Link as LinkIcon,
  Copy,
  Plus,
  Truck,
  ShieldCheck,
  ChevronRight,
  Download,
  Building,
  Coffee,
  UtensilsCrossed,
  Hotel,
  Soup,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import { CustomerSegment, StandingOrder, ReferralType } from '@oriental/types';

export const UkmSupplyPortal: React.FC = () => {
  const {
    products,
    standingOrders,
    commissions,
    withdrawals,
    createStandingOrder,
    toggleStandingOrderStatus,
    dispatchStandingOrder,
    evaluateBusinessReferral,
    recordBusinessReferralCommission,
    recordInfluencerReferralCommission,
    requestCommissionWithdrawal,
    getCommissionWallet,
    membersList,
    activeMember,
    selectActiveMember,
  } = useEcosystem();

  const [activeTab, setActiveTab] = useState<'SEGMENT_CATALOG' | 'STANDING_ORDERS' | 'REFERRAL_ENGINE'>('SEGMENT_CATALOG');

  // Segment Simulator state
  const [simulatedSegment, setSimulatedSegment] = useState<string>(activeMember.segment || CustomerSegment.B2B_CAFE);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Standing Order Form Modal state
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [soCustomerMemberId, setSoCustomerMemberId] = useState<string>(activeMember.id);
  const [soFrequency, setSoFrequency] = useState<'SETIAP_SENIN' | 'RABU_SABTU' | 'MINGGUAN' | 'DUA_MINGGUAN'>('RABU_SABTU');
  const [soTimeSlot, setSoTimeSlot] = useState<string>('Pagi (06:00 - 09:00 WITA) - Sebelum Buka Outlet');
  const [soAddress, setSoAddress] = useState<string>(activeMember.address || 'Jl. Boulevard Panakkukang No. 88, Makassar');
  const [soProductId, setSoProductId] = useState<string>(products[0]?.id || 'prod-minyak');
  const [soQuantity, setSoQuantity] = useState<number>(2);

  // Business Referral Simulator state
  const [refereeId, setRefereeId] = useState<string>(membersList[1]?.id || 'mem-003');
  const [simulatedTxAmount, setSimulatedTxAmount] = useState<number>(35000000);
  const [bizFeedback, setBizFeedback] = useState<string | null>(null);

  // Influencer Link Generator state
  const [influencerProductId, setInfluencerProductId] = useState<string>(products[0]?.id || 'prod-minyak');
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [simulatedSaleAmount, setSimulatedSaleAmount] = useState<number>(2500000);
  const [infFeedback, setInfFeedback] = useState<string | null>(null);

  // Commission Withdrawal Modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [bankName, setBankName] = useState<string>('BCA (Bank Central Asia)');
  const [accountNumber, setAccountNumber] = useState<string>('8910-234-551');
  const [accountHolderName, setAccountHolderName] = useState<string>(activeMember.fullName);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // Delivery Dispatch Feedback
  const [dispatchSuccess, setDispatchSuccess] = useState<{ invoiceNumber: string; totalAmount: number; pointsEarned: number } | null>(null);

  // Wallet data for active member
  const wallet = getCommissionWallet(activeMember.id);

  // Helper to determine product unit price based on strict segment isolation
  const getSegmentPrice = (product: typeof products[0], segment: string) => {
    switch (segment) {
      case CustomerSegment.B2B_CAFE:
        return product.ukmCafePrice || product.ukmPrice || 0;
      case CustomerSegment.B2B_HOTEL:
        return product.ukmHotelPrice || product.ukmPrice || 0;
      case CustomerSegment.B2B_WARUNG:
        return product.ukmWarungPrice || product.ukmPrice || 0;
      case CustomerSegment.B2B_RESTAURANT:
        return product.ukmRestoPrice || product.ukmPrice || 0;
      case CustomerSegment.B2B_COFFEESHOP:
        return product.ukmCoffeeshopPrice || product.ukmPrice || 0;
      default:
        return product.ukmPrice || product.variants[1]?.price || 0;
    }
  };

  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case CustomerSegment.B2B_CAFE:
        return 'Café & Eatery';
      case CustomerSegment.B2B_HOTEL:
        return 'Hotel & Hospitality';
      case CustomerSegment.B2B_WARUNG:
        return 'Warung Makan Khas';
      case CustomerSegment.B2B_RESTAURANT:
        return 'Restoran & Bistro';
      case CustomerSegment.B2B_COFFEESHOP:
        return 'Coffeeshop & Roastery';
      default:
        return 'Mitra Bisnis UKM';
    }
  };

  // Filter products by category
  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  // Active referrer qualification status
  const refereeMember = membersList.find((m) => m.id === refereeId) || membersList[1] || activeMember;
  const qualification = evaluateBusinessReferral(
    activeMember.totalSpendMonth,
    refereeMember.totalSpendMonth,
  );

  // Handle Standing Order Creation
  const handleCreateStandingOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = membersList.find((m) => m.id === soCustomerMemberId) || activeMember;
    const selectedProd = products.find((p) => p.id === soProductId) || products[0];
    const unitPrice = getSegmentPrice(selectedProd, customer.segment);
    const subtotal = unitPrice * soQuantity;

    const frequencyLabels = {
      SETIAP_SENIN: 'Setiap Hari Senin',
      RABU_SABTU: 'Setiap Hari Rabu & Sabtu',
      MINGGUAN: 'Mingguan (Setiap Kamis)',
      DUA_MINGGUAN: 'Dua Mingguan (Setiap 2 Minggu)',
    };

    createStandingOrder({
      customerMemberId: customer.id,
      customerName: customer.businessName || customer.fullName,
      customerSegment: customer.segment,
      deliveryFrequency: soFrequency,
      frequencyLabel: frequencyLabels[soFrequency],
      deliveryTimeSlot: soTimeSlot,
      deliveryAddress: soAddress,
      items: [
        {
          productId: selectedProd.id,
          productName: `${selectedProd.name} (${selectedProd.packUnitName})`,
          unit: selectedProd.packUnitName,
          quantity: soQuantity,
          unitPrice,
          subtotal,
        },
      ],
      totalAmountPerDelivery: subtotal,
      nextDeliveryDate: '2026-09-28',
    });

    setShowOrderModal(false);
  };

  // Handle Dispatch Delivery
  const handleDispatch = (orderId: string) => {
    try {
      const result = dispatchStandingOrder(orderId);
      setDispatchSuccess(result);
      setTimeout(() => setDispatchSuccess(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses dispatch');
    }
  };

  // Handle Business Commission simulation
  const handleRecordBusinessCommission = () => {
    if (!qualification.qualified) {
      setBizFeedback(`⚠️ Tidak dapat mencatat komisi: ${qualification.reason}`);
      setTimeout(() => setBizFeedback(null), 5000);
      return;
    }

    const comm = recordBusinessReferralCommission(activeMember.id, refereeMember.id, simulatedTxAmount);
    setBizFeedback(`✅ Berhasil! Komisi 0.5% (Rp ${comm.commissionAmount.toLocaleString('id-ID')}) terakumulasi ke dompet Anda dari omset rekanan Rp ${simulatedTxAmount.toLocaleString('id-ID')}.`);
    setTimeout(() => setBizFeedback(null), 6000);
  };

  // Handle Influencer Commission simulation
  const handleRecordInfluencerCommission = () => {
    const comm = recordInfluencerReferralCommission(simulatedSaleAmount, activeMember.id);
    setInfFeedback(`✅ Berhasil! Penjualan teratribusi Rp ${simulatedSaleAmount.toLocaleString('id-ID')} menghasilkan komisi 1.0% (Rp ${comm.commissionAmount.toLocaleString('id-ID')}) ke dompet Anda.`);
    setTimeout(() => setInfFeedback(null), 6000);
  };

  // Handle Withdrawal Request
  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    try {
      const req = requestCommissionWithdrawal({
        memberId: activeMember.id,
        memberName: `${activeMember.fullName} (${activeMember.businessName || 'Affiliate'})`,
        amount: withdrawAmount,
        bankName,
        accountNumber,
        accountHolderName,
      });

      setWithdrawSuccess(`✅ Pengajuan penarikan dana ${req.requestNumber} sebesar Rp ${req.amount.toLocaleString('id-ID')} disetujui & diproses transfer.`);
      setTimeout(() => {
        setWithdrawSuccess(null);
        setShowWithdrawModal(false);
      }, 3000);
    } catch (err: any) {
      setWithdrawError(err.message || 'Pengajuan penarikan dana gagal.');
    }
  };

  const affiliateUrl = `https://oriental.co.id/ref/${activeMember.memberCode}?prod=${products.find((p) => p.id === influencerProductId)?.baseSku || 'SKU-001'}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-400/30 mb-3">
              <Store className="w-3.5 h-3.5" />
              SPRINT 5: B2B UKM SUPPLY & REFERRAL DUAL ENGINE
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Pusat Pasokan B2B UKM Kuliner & Mesin Referral
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-3xl">
              Katalog pasokan bahan baku kuliner dengan penyesuaian harga khusus per segmen (Hotel, Café, Warung, Resto, Coffeeshop), sistem Weekly Delivery terjadwal, dan mesin referral bisnis 0.5% & influencer 1.0%.
            </p>
          </div>

          {/* Quick Active Member & Wallet Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[280px]">
            <div className="text-xs text-emerald-200">Akun Member Aktif:</div>
            <div className="font-bold text-white text-base truncate">{activeMember.fullName}</div>
            <div className="text-xs text-emerald-300 font-mono">{activeMember.businessName || 'Mitra Usaha'} • {activeMember.memberCode}</div>
            <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-200">Saldo Dompet Komisi:</div>
                <div className="text-lg font-black text-amber-300">
                  Rp {wallet.availableBalance.toLocaleString('id-ID')}
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow transition"
              >
                Tarik Komisi
              </button>
            </div>
          </div>
        </div>

        {/* Segment Simulator Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Simulasi Login Segmen Member:
          </span>
          {[
            { id: CustomerSegment.B2B_CAFE, label: 'Café (Strict Isolation)', icon: Coffee, desc: 'Hanya melihat harga Café' },
            { id: CustomerSegment.B2B_HOTEL, label: 'Hotel', icon: Hotel, desc: 'Harga Hotel' },
            { id: CustomerSegment.B2B_RESTAURANT, label: 'Resto', icon: UtensilsCrossed, desc: 'Harga Restoran' },
            { id: CustomerSegment.B2B_WARUNG, label: 'Warung', icon: Soup, desc: 'Harga Warung' },
            { id: CustomerSegment.B2B_COFFEESHOP, label: 'Coffeeshop', icon: Store, desc: 'Harga Coffeeshop' },
          ].map((seg) => {
            const Icon = seg.icon;
            const isSelected = simulatedSegment === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => {
                  setSimulatedSegment(seg.id);
                  // Also match with a mock member if exists
                  const matched = membersList.find((m) => m.segment === seg.id);
                  if (matched) selectActiveMember(matched.id);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? 'bg-amber-400 text-slate-900 shadow-md font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {seg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('SEGMENT_CATALOG')}
          className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
            activeTab === 'SEGMENT_CATALOG'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
          }`}
        >
          <Store className="w-4 h-4" />
          Katalog Pasokan & Isolasi Harga Segmen
        </button>

        <button
          onClick={() => setActiveTab('STANDING_ORDERS')}
          className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
            activeTab === 'STANDING_ORDERS'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Standing Orders (Weekly Delivery)
          <span className="bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs px-2 py-0.5 rounded-full font-bold">
            {standingOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('REFERRAL_ENGINE')}
          className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
            activeTab === 'REFERRAL_ENGINE'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
          }`}
        >
          <Percent className="w-4 h-4" />
          Mesin Referral & Dompet Komisi
          <span className="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs px-2 py-0.5 rounded-full font-bold">
            Rp {wallet.availableBalance.toLocaleString('id-ID')}
          </span>
        </button>
      </div>

      {/* Global Alerts / Feedback */}
      {dispatchSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold">Pengiriman Pasokan Berhasil Disimulasikan!</span> Faktur:{' '}
              <span className="font-mono font-bold">{dispatchSuccess.invoiceNumber}</span> • Nilai: Rp{' '}
              {dispatchSuccess.totalAmount.toLocaleString('id-ID')} • Poin Loyalitas Diperoleh:{' '}
              <span className="font-bold text-amber-600">+{dispatchSuccess.pointsEarned} Poin</span> (Aturan B2B: Rp 10.000 = 1 Poin).
            </div>
          </div>
          <button
            onClick={() => setDispatchSuccess(null)}
            className="text-xs font-semibold underline text-emerald-700 hover:text-emerald-900"
          >
            Tutup
          </button>
        </div>
      )}

      {/* TAB 1: SEGMENTED B2B CATALOG (STRICT PRICE ISOLATION) */}
      {activeTab === 'SEGMENT_CATALOG' && (
        <div className="space-y-6">
          {/* Strict Isolation Notice Card */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-300 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Strict Segment Price Isolation Aktif: Segmen {getSegmentLabel(simulatedSegment)}
                </h3>
                <span className="bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[11px] px-2 py-0.5 rounded font-mono font-bold">
                  Acceptance Criteria 1
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {simulatedSegment === CustomerSegment.B2B_CAFE ? (
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Akun kategori "Café" HANYA melihat harga katalog khusus café. Sistem mengunci dan menyembunyikan secara total harga segmen Hotel, Resto, Warung, dan Coffeeshop dari antarmuka pengguna.
                  </span>
                ) : (
                  <span>
                    Anda sedang melihat katalog harga otomatis untuk segmen <strong>{getSegmentLabel(simulatedSegment)}</strong>. Sistem secara otomatis menerapkan kontrak harga khusus segmen ini.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['ALL', 'Sembako', 'Bahan Baku', 'Minuman', 'Mie Instan'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const segmentPrice = getSegmentPrice(prod, simulatedSegment);

              return (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Category & Isolation Tag */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-medium">
                        {prod.category}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {prod.baseSku}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Kemasan Pasokan: 1 {prod.packUnitName} = {prod.unitsPerPack} {prod.baseUnitName}
                    </p>

                    {/* Strict Price Isolation Card */}
                    <div className="mt-4 bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-800/60 dark:to-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3.5">
                      <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                        <span>Harga Khusus Segmen {getSegmentLabel(simulatedSegment)}:</span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded">
                          Strict Isolation
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          Rp {segmentPrice.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          / {prod.packUnitName}
                        </span>
                      </div>

                      {/* Explicit Notice that other prices are concealed */}
                      <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 italic">
                        🔒 Harga segmen lain disembunyikan sesuai hak akses akun {getSegmentLabel(simulatedSegment)}.
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Total Stok Tersedia:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {Math.floor(prod.totalStockInBaseUnits / prod.unitsPerPack)} {prod.packUnitName} ({prod.totalStockInBaseUnits} {prod.baseUnitName})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSoProductId(prod.id);
                        setShowOrderModal(true);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Atur Standing Order
                    </button>
                    <button
                      onClick={() => {
                        setInfluencerProductId(prod.id);
                        setActiveTab('REFERRAL_ENGINE');
                      }}
                      title="Buat Link Afiliasi Produk Ini"
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STANDING ORDERS (WEEKLY DELIVERY) */}
      {activeTab === 'STANDING_ORDERS' && (
        <div className="space-y-6">
          {/* Top Bar with KPIs & Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Pemesanan Pasokan Bahan Baku Terjadwal (Weekly Delivery)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pengadaan rutin otomatis untuk operasional kafe, resto, dan hotel tanpa repot input pesanan harian.
              </p>
            </div>
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl shadow transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Buat Jadwal Standing Order Baru
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jadwal Standing Order Aktif</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {standingOrders.filter((so) => so.status === 'ACTIVE').length} Rute
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nilai Pasokan Rutin per Siklus</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  Rp {standingOrders.reduce((sum, so) => sum + (so.status === 'ACTIVE' ? so.totalAmountPerDelivery : 0), 0).toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Slot Pengiriman Paling Diminati</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  Pagi (06:00 - 09:00 WITA)
                </div>
              </div>
            </div>
          </div>

          {/* Standing Orders Cards List */}
          <div className="space-y-4">
            {standingOrders.map((so) => {
              const isActive = so.status === 'ACTIVE';

              return (
                <div
                  key={so.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition ${
                    isActive ? 'border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {so.orderNumber}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {getSegmentLabel(so.customerSegment)}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isActive
                              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                              : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                          }`}
                        >
                          {isActive ? 'AKTIF BERJALAN' : 'DI-JEDA (PAUSED)'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {so.customerName}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          📍 {so.deliveryAddress}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          🔄 {so.frequencyLabel}
                        </span>
                        <span>•</span>
                        <span>⏰ {so.deliveryTimeSlot}</span>
                      </div>
                    </div>

                    {/* Per-delivery amount and action buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Nilai per Pengiriman:</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          Rp {so.totalAmountPerDelivery.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-amber-600 font-semibold">
                          +{Math.floor(so.totalAmountPerDelivery / 10000)} Poin Loyalty
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Active / Pause */}
                        <button
                          onClick={() => toggleStandingOrderStatus(so.id, isActive ? 'PAUSED' : 'ACTIVE')}
                          className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                            isActive
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                          }`}
                          title={isActive ? 'Jeda Pengiriman' : 'Aktifkan Kembali'}
                        >
                          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {isActive ? 'Pause' : 'Aktifkan'}
                        </button>

                        {/* Dispatch Button */}
                        <button
                          onClick={() => handleDispatch(so.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition flex items-center gap-1.5"
                          title="Simulasikan Eksekusi Pengiriman Hari Ini"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Dispatch Hari Ini
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items in this Standing Order */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Rincian Pasokan Rutin:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {so.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs flex justify-between items-center"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{item.productName}</div>
                            <div className="text-slate-500">
                              {item.quantity} {item.unit} @ Rp {item.unitPrice.toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            Rp {item.subtotal.toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REFERRAL DUAL ENGINE & COMMISSION WALLET */}
      {activeTab === 'REFERRAL_ENGINE' && (
        <div className="space-y-6">
          {/* Top Wallet Overview */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-800/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    Dompet Komisi Pengguna
                  </span>
                  <span className="text-indigo-200 text-xs font-mono">Acceptance Criteria 2</span>
                </div>
                <h2 className="text-3xl font-black text-amber-300 mt-2">
                  Rp {wallet.availableBalance.toLocaleString('id-ID')}
                </h2>
                <p className="text-xs text-indigo-200 mt-1">
                  Saldo komisi akumulatif dari Referral Bisnis (0.5%) dan Afiliasi Influencer (1.0%) siap ditarik (withdraw).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
                  <div className="text-xs text-indigo-200">Total Komisi Diperoleh:</div>
                  <div className="text-lg font-bold text-white">
                    Rp {wallet.totalEarned.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">{wallet.commissionsCount} mutasi masuk</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
                  <div className="text-xs text-indigo-200">Total Dana Ditarik:</div>
                  <div className="text-lg font-bold text-white">
                    Rp {wallet.totalWithdrawn.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-amber-300 font-medium">{wallet.withdrawalsCount} penarikan</div>
                </div>

                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={wallet.availableBalance <= 0}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-sm px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Ajukan Penarikan (Withdraw)
                </button>
              </div>
            </div>
          </div>

          {/* Dual Engine Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engine 1: Business Referral (0.5%) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 rounded-lg">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        1. Mesin Referral Bisnis / Pengusaha
                      </h3>
                      <p className="text-xs text-slate-500">Komisi otomatis 0.5% dari omset transaksi rekanan</p>
                    </div>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-xs px-2.5 py-1 rounded-full font-bold">
                    0.5% Rate
                  </span>
                </div>

                {/* Qualification Thresholds Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Validasi Ambang Batas Belanja Bulanan:</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        qualification.qualified
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                      }`}
                    >
                      {qualification.qualified ? 'QUALIFIED (MEMENUHI)' : 'BELUM MEMENUHI'}
                    </span>
                  </div>

                  {/* Referrer spend tracker */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        1. Pengusul / Anda (Min Rp 60.000.000):
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        Rp {activeMember.totalSpendMonth.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (activeMember.totalSpendMonth / 60000000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Referee spend tracker */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        2. Rekanan Usaha (Min Rp 30.000.000):
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        Rp {refereeMember.totalSpendMonth.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (refereeMember.totalSpendMonth / 30000000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    ℹ️ {qualification.reason}
                  </div>
                </div>

                {/* Simulation Form */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Pilih Rekanan Usaha yang Direferensikan:
                    </label>
                    <select
                      value={refereeId}
                      onChange={(e) => setRefereeId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {membersList
                        .filter((m) => m.id !== activeMember.id)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.fullName} ({m.businessName || 'B2B Partner'}) - Belanja: Rp {m.totalSpendMonth.toLocaleString('id-ID')}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Nominal Transaksi Pasokan Rekanan:
                    </label>
                    <input
                      type="number"
                      value={simulatedTxAmount}
                      onChange={(e) => setSimulatedTxAmount(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <div className="text-[11px] text-slate-500 mt-1">
                      Estimasi Komisi 0.5%: <strong className="text-indigo-600">Rp {Math.round(simulatedTxAmount * 0.005).toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                </div>

                {bizFeedback && (
                  <div className="mt-3 text-xs p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border border-indigo-200">
                    {bizFeedback}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleRecordBusinessCommission}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Catat Transaksi Rekanan & Akumulasi 0.5%
                </button>
              </div>
            </div>

            {/* Engine 2: Influencer Affiliate (1.0%) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-purple-600 rounded-lg">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        2. Mesin Referral Influencer
                      </h3>
                      <p className="text-xs text-slate-500">Generator link afiliasi per produk & komisi flat 1.0%</p>
                    </div>
                  </div>
                  <span className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200 text-xs px-2.5 py-1 rounded-full font-bold">
                    1.0% Rate
                  </span>
                </div>

                {/* Affiliate Link Generator */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Pilih Produk untuk Dibuatkan Link Afiliasi:
                    </label>
                    <select
                      value={influencerProductId}
                      onChange={(e) => setInfluencerProductId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.baseSku}) - {p.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Link Afiliasi Teratribusi:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={affiliateUrl}
                        className="flex-1 text-xs font-mono p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(affiliateUrl);
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2500);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl transition flex items-center gap-1 border"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {linkCopied ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Simulasi Pembelian via Link Afiliasi:
                    </label>
                    <input
                      type="number"
                      value={simulatedSaleAmount}
                      onChange={(e) => setSimulatedSaleAmount(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <div className="text-[11px] text-slate-500 mt-1">
                      Estimasi Komisi 1.0%: <strong className="text-purple-600">Rp {Math.round(simulatedSaleAmount * 0.01).toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                </div>

                {infFeedback && (
                  <div className="mt-3 text-xs p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border border-purple-200">
                    {infFeedback}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleRecordInfluencerCommission}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  <Percent className="w-4 h-4" />
                  Simulasi Penjualan Afiliasi & Akumulasi 1.0%
                </button>
              </div>
            </div>
          </div>

          {/* Ledgers: Commission History & Withdrawal History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commissions History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Riwayat Komisi Masuk
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Tipe</th>
                      <th className="py-2.5 px-3">Transaksi</th>
                      <th className="py-2.5 px-3">Nilai</th>
                      <th className="py-2.5 px-3">Rate</th>
                      <th className="py-2.5 px-3 text-right">Komisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              c.referralType === ReferralType.BUSINESS
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            }`}
                          >
                            {c.referralType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                          {c.sourceTransactionId}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          Rp {c.transactionAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">
                          {c.commissionRatePct}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                          +Rp {c.commissionAmount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Withdrawals History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                Riwayat Pengajuan Penarikan (Withdraw)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">No. Klaim</th>
                      <th className="py-2.5 px-3">Rekening Tujuan</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {w.requestNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900 dark:text-white">{w.bankName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {w.accountNumber} a/n {w.accountHolderName}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                            {w.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-rose-600">
                          -Rp {w.amount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE STANDING ORDER */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Buat Jadwal Standing Order (Weekly Delivery)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Konfigurasikan jadwal pasokan otomatis dengan harga khusus segmen kuliner.
            </p>

            <form onSubmit={handleCreateStandingOrder} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mitra Usaha Kuliner:
                </label>
                <select
                  value={soCustomerMemberId}
                  onChange={(e) => setSoCustomerMemberId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.businessName || 'Mitra'}) - Segmen: {getSegmentLabel(m.segment)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Frekuensi Pengiriman:
                </label>
                <select
                  value={soFrequency}
                  onChange={(e) => setSoFrequency(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="RABU_SABTU">Setiap Hari Rabu & Sabtu (Rekomendasi Resto/Kafe)</option>
                  <option value="SETIAP_SENIN">Setiap Hari Senin (Awal Pekan Operasional)</option>
                  <option value="MINGGUAN">Mingguan (1x Seminggu)</option>
                  <option value="DUA_MINGGUAN">Dua Mingguan (Setiap 2 Pekan)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Time Slot Pengantaran:
                </label>
                <select
                  value={soTimeSlot}
                  onChange={(e) => setSoTimeSlot(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Pagi (06:00 - 09:00 WITA) - Sebelum Buka Outlet">
                    Pagi (06:00 - 09:00 WITA) - Sebelum Buka Outlet
                  </option>
                  <option value="Siang (13:00 - 15:00 WITA) - Waktu Jeda Operasional">
                    Siang (13:00 - 15:00 WITA) - Waktu Jeda Operasional
                  </option>
                  <option value="Sore (17:00 - 19:00 WITA) - Persiapan Shift Malam">
                    Sore (17:00 - 19:00 WITA) - Persiapan Shift Malam
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Alamat Pengiriman Outlet:
                </label>
                <input
                  type="text"
                  value={soAddress}
                  onChange={(e) => setSoAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Produk Bahan Baku:
                  </label>
                  <select
                    value={soProductId}
                    onChange={(e) => setSoProductId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.packUnitName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Jumlah / Pengiriman:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={soQuantity}
                    onChange={(e) => setSoQuantity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow transition"
                >
                  Simpan Jadwal Pengiriman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WITHDRAW COMMISSION WALLET */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Pengajuan Penarikan Komisi (Withdraw)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Saldo tersedia: <strong className="text-emerald-600">Rp {wallet.availableBalance.toLocaleString('id-ID')}</strong>.
            </p>

            {withdrawError && (
              <div className="mb-4 text-xs p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="mb-4 text-xs p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                {withdrawSuccess}
              </div>
            )}

            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nominal Penarikan (Rp):
                </label>
                <input
                  type="number"
                  min={10000}
                  max={wallet.availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bank / E-Wallet Tujuan:
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="BCA (Bank Central Asia)">BCA (Bank Central Asia)</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="BRI (Bank Rakyat Indonesia)">BRI (Bank Rakyat Indonesia)</option>
                  <option value="BNI (Bank Negara Indonesia)">BNI (Bank Negara Indonesia)</option>
                  <option value="Bank Sulselbar">Bank Sulselbar</option>
                  <option value="GoPay / OVO / DANA">E-Wallet (GoPay / OVO / DANA)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nomor Rekening / No. E-Wallet:
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Pemilik Rekening:
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={withdrawAmount <= 0 || withdrawAmount > wallet.availableBalance}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black py-2.5 px-5 rounded-xl shadow transition"
                >
                  Konfirmasi Penarikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
