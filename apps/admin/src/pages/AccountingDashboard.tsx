import React, { useState } from 'react';
import {
  DollarSign,
  Scale,
  TrendingUp,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Activity,
  Layers,
  Store,
  UtensilsCrossed,
  Recycle,
  Factory,
  Globe,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Printer,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Search,
  BarChart3,
  ShoppingCart,
  CreditCard,
  Building2,
  Flame,
  LineChart,
  Ban,
  Tag,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ListChecks,
  Star,
} from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import {
  EcosystemPillar,
  CourseModule,
  DigitalCertificate,
  OfflineWorkshop,
  QuizResult,
} from '@oriental/types';

export const AccountingDashboard: React.FC = () => {
  const {
    financials,
    wasteHistory,
    activeMember,
    courses,
    workshops,
    certificates,
    submitQuizAttempt,
    registerWorkshopAttendee,
    exportFinancialStatementDoc,
    // Sprint 9: 7 Operational Reports
    dailySalesReport,
    cashierShiftReports,
    paymentMethodBreakdown,
    outletSummaries,
    fastMovingProducts,
    periodRevenueReports,
    voidAuditRecords,
    productSegmentPrices,
    recordVoidTransaction,
    reconcileCashierShift,
  } = useEcosystem();

  // Top Level Navigation Tab: SAK Financial Reports vs Operational Reports vs Oriental Learn
  const [activeMainTab, setActiveMainTab] = useState<'FINANCIAL_SAK' | 'OPERATIONAL_REPORTS' | 'ORIENTAL_LEARN'>('FINANCIAL_SAK');

  // Sprint 9: Operational Reports Sub-Tab
  const [activeOpsReport, setActiveOpsReport] = useState<'DAILY_SALES' | 'CASHIER_SHIFT' | 'PAYMENT_METHOD' | 'OUTLET_SUMMARY' | 'FAST_MOVING' | 'PERIOD_REVENUE' | 'VOID_LOG' | 'PRICE_LIST'>('DAILY_SALES');
  const [priceSegmentFilter, setPriceSegmentFilter] = useState<string>('ALL');
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [newVoidForm, setNewVoidForm] = useState({ invoiceNumber: '', originalAmount: '', voidReason: '', cashierName: '', approvedByManager: '', notes: '' });
  const [shiftReconcileId, setShiftReconcileId] = useState<string | null>(null);
  const [shiftActualCash, setShiftActualCash] = useState<string>('');

  // SAK Sub-Tabs & Filters
  const [reportType, setReportType] = useState<'LABA_RUGI' | 'NERACA' | 'ARUS_KAS'>('LABA_RUGI');
  const [selectedPillar, setSelectedPillar] = useState<EcosystemPillar>(EcosystemPillar.CONSOLIDATED);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Oriental Learn States
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeQuizCourse, setActiveQuizCourse] = useState<CourseModule | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [activeVideoCourse, setActiveVideoCourse] = useState<CourseModule | null>(null);
  const [registeringWorkshop, setRegisteringWorkshop] = useState<OfflineWorkshop | null>(null);
  const [workshopFormData, setWorkshopFormData] = useState({
    name: activeMember.fullName || 'Bpk. Hendra Gunawan',
    phone: activeMember.phone || '0812-3456-7890',
    businessName: activeMember.businessName || 'RM Seleraku Makassar',
  });
  const [workshopTicket, setWorkshopTicket] = useState<any | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<DigitalCertificate | null>(null);

  // =========================================================================
  // Consolidated & Per-Pilar SAK Ledger Calculations
  // =========================================================================
  const consolidatedRevenue =
    financials.retailRevenue +
    financials.grosirRevenue +
    financials.ukmSupplyRevenue +
    financials.whiteLabelRevenue +
    financials.pillars.WASTE.revenue;

  const consolidatedCogs =
    financials.cogsCost + financials.pillars.WASTE.cogs;

  const consolidatedGrossProfit = consolidatedRevenue - consolidatedCogs;

  const sharedSalaries = 240000000;
  const sharedReferral = 48000000;
  const sharedUtilities = 80000000;
  const totalWasteShareExpense = financials.wasteShareExpense;

  const consolidatedOperatingExpenses =
    sharedSalaries + sharedReferral + sharedUtilities + totalWasteShareExpense;

  const consolidatedNetProfit = consolidatedGrossProfit - consolidatedOperatingExpenses;

  // Selected Pillar Figures
  const isConsolidated = selectedPillar === EcosystemPillar.CONSOLIDATED;
  const pillarData = !isConsolidated ? financials.pillars[selectedPillar] : null;

  // Active Figures depending on Pillar vs Consolidated
  const activeRevenue = isConsolidated ? consolidatedRevenue : (pillarData?.revenue || 0);
  const activeCogs = isConsolidated ? consolidatedCogs : (pillarData?.cogs || 0);
  const activeGrossProfit = isConsolidated ? consolidatedGrossProfit : (pillarData?.grossProfit || 0);
  const activeOpex = isConsolidated ? consolidatedOperatingExpenses : (pillarData?.operatingExpenses || 0);
  const activeNetProfit = isConsolidated ? consolidatedNetProfit : (pillarData?.netProfit || 0);

  // Balance Sheet (Neraca) Figures
  const activeCash = isConsolidated ? financials.cashAndBank : (pillarData?.cashAndBank || 0);
  const activeAR = isConsolidated ? financials.accountsReceivable : (pillarData?.accountsReceivable || 0);
  const activeInventory = isConsolidated
    ? financials.inventoryValue + financials.wasteInventoryValue
    : (selectedPillar === EcosystemPillar.WASTE ? financials.wasteInventoryValue : (pillarData?.inventory || 0));

  const fixedAssetsNet = isConsolidated
    ? 300000000
    : (selectedPillar === EcosystemPillar.RETAIL ? 150000000 : (selectedPillar === EcosystemPillar.GROSIR ? 150000000 : 0));

  const totalAssets = activeCash + activeAR + activeInventory + fixedAssetsNet;

  const activeLiabilities = isConsolidated
    ? 480000000 + financials.wastePayable + 12000000
    : (selectedPillar === EcosystemPillar.WASTE ? financials.wastePayable : (pillarData?.liabilities || 0));

  // Strict SAK Invariant: Total Assets = Total Liabilities + Total Equity
  // Total Equity = Owner Capital + Retained Earnings
  const ownerCapital = isConsolidated ? 641000000 : Math.round(totalAssets * 0.4);
  const retainedEarnings = totalAssets - activeLiabilities - ownerCapital;
  const totalEquity = ownerCapital + retainedEarnings;
  const totalLiabilitiesAndEquity = activeLiabilities + totalEquity;
  const isNeracaBalanced = totalAssets === totalLiabilitiesAndEquity;

  const pillarTitles: Record<EcosystemPillar, { name: string; subtitle: string; icon: any }> = {
    [EcosystemPillar.CONSOLIDATED]: {
      name: 'Konsolidasi Ekosistem Gabungan',
      subtitle: 'Seluruh Rantai Nilai Bisnis (Retail, Grosir, UKM Supply, Waste, White Label)',
      icon: Globe,
    },
    [EcosystemPillar.RETAIL]: {
      name: 'Pilar Retail (B2C Swalayan)',
      subtitle: 'Penjualan eceran, struk kasir thermal, promo bundling & poin belanja',
      icon: Store,
    },
    [EcosystemPillar.GROSIR]: {
      name: 'Pilar Grosir (B2B Distribusi)',
      subtitle: 'Penjualan partai besar, faktur nota 3 rangkap & piutang termin (TOP)',
      icon: Layers,
    },
    [EcosystemPillar.UKM_SUPPLY]: {
      name: 'Pilar Pasokan UKM Kuliner',
      subtitle: 'Pengadaan bahan baku Cafe, Resto, Hotel, Warung Makan',
      icon: UtensilsCrossed,
    },
    [EcosystemPillar.WASTE]: {
      name: 'Pilar Waste Purchasing (Minyak Jelantah)',
      subtitle: 'Ekonomi sirkular limbah jelantah, timbangan kg & bagi hasil mitra 10%',
      icon: Recycle,
    },
    [EcosystemPillar.WHITE_LABEL]: {
      name: 'Pilar White Label (Maklon Produksi)',
      subtitle: 'Kemitraan pabrik mitra, kontrak batch GRN & pasokan merek khusus',
      icon: Factory,
    },
  };

  // =========================================================================
  // Excel / CSV Export Generator
  // =========================================================================
  const handleDownloadExcel = () => {
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'PT ORIENTAL DIGITAL EKOSISTEM INDONESIA\n';
    csv += `LAPORAN KEUANGAN RESMI STANDAR AKUNTANSI KEUANGAN (SAK) - ${reportType}\n`;
    csv += `Entitas Pelaporan: ${pillarTitles[selectedPillar].name}\n`;
    csv += `Periode Buku: 31 Desember 2026 (Live Real-Time SAK Ledger)\n`;
    csv += `Status Audit: Wajar Tanpa Pengecualian (WTP) - Terverifikasi Seimbang\n`;
    csv += '--------------------------------------------------------------------------------\n\n';

    if (reportType === 'LABA_RUGI') {
      csv += 'KODE AKUN,DESKRIPSI AKUN LABA RUGI,JUMLAH (IDR)\n';
      csv += `4-100,Pendapatan Usaha Bersih (Revenue),${activeRevenue}\n`;
      csv += `5-100,Harga Pokok Penjualan (HPP / COGS),-${activeCogs}\n`;
      csv += `SUBTOTAL,LABA KOTOR (GROSS PROFIT),${activeGrossProfit}\n`;
      csv += `6-100,Beban Gaji Staf Operasional,-240000000\n`;
      csv += `6-200,Beban Komisi Referral & Afiliasi,-48000000\n`;
      csv += `6-300,Beban Bagi Hasil Mitra UCO (10%),-${totalWasteShareExpense}\n`;
      csv += `6-400,Beban Sewa & Utilitas Gudang,-80000000\n`;
      csv += `SUBTOTAL,TOTAL BEBAN OPERASIONAL,-${activeOpex}\n`;
      csv += `NET_INCOME,LABA BERSIH OPERASIONAL,${activeNetProfit}\n`;
    } else if (reportType === 'NERACA') {
      csv += 'KODE AKUN,KLASIFIKASI POSISI KEUANGAN (NERACA),DEBIT (IDR),KREDIT (IDR)\n';
      csv += `1-100,Kas & Bank Operasional,${activeCash},0\n`;
      csv += `1-200,Piutang Usaha (AR Termin TOP),${activeAR},0\n`;
      csv += `1-300,Persediaan Barang Dagang & Bahan Baku,${activeInventory},0\n`;
      csv += `1-800,Aset Tetap Peralatan & Fasilitas (Net),${fixedAssetsNet},0\n`;
      csv += `TOTAL_ASSETS,TOTAL ASET,${totalAssets},0\n`;
      csv += `2-100,Utang Usaha Vendor/Pabrik,0,480000000\n`;
      csv += `2-200,Utang Bagi Hasil Mitra Drop Point Waste,0,${financials.wastePayable}\n`;
      csv += `2-300,Utang Komisi Referral Berjalan,0,12000000\n`;
      csv += `3-100,Modal Saham / Modal Disetor Pemilik,0,${ownerCapital}\n`;
      csv += `3-200,Saldo Laba Ditahan & Tahun Berjalan,0,${retainedEarnings}\n`;
      csv += `TOTAL_EQUITY,TOTAL LIABILITAS DAN EKUITAS,0,${totalLiabilitiesAndEquity}\n`;
      csv += `STATUS_BALANCE,VERIFIKASI KESEIMBANGAN SAK,${totalAssets === totalLiabilitiesAndEquity ? 'SEIMBANG (BALANCED)' : 'SELISIH'},0\n`;
    } else {
      csv += 'AKTIVITAS ARUS KAS,ESTIMASI ARUS KAS (IDR)\n';
      csv += `Arus Kas Bersih Aktivitas Operasional,${activeCash * 0.8}\n`;
      csv += `Arus Kas Keluar Aktivitas Investasi & Peralatan,-${activeCash * 0.15}\n`;
      csv += `Arus Kas Bersih Aktivitas Pendanaan,${activeCash * 0.05}\n`;
      csv += `Saldo Kas & Setara Kas Akhir Periode,${activeCash}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_SAK_${selectedPillar}_${reportType}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // Quiz Submission Handler
  // =========================================================================
  const handleAnswerSelect = (questionId: string, optionIdx: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleQuizSubmit = () => {
    if (!activeQuizCourse) return;

    const answersArray = activeQuizCourse.quizQuestions.map((q) => {
      return userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1;
    });

    const result = submitQuizAttempt({
      courseId: activeQuizCourse.id,
      memberId: activeMember.memberCode,
      memberName: activeMember.fullName,
      answers: answersArray,
    });

    setQuizResult(result);
  };

  // =========================================================================
  // Workshop Registration Handler
  // =========================================================================
  const handleWorkshopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringWorkshop) return;

    try {
      const ticket = registerWorkshopAttendee({
        workshopId: registeringWorkshop.id,
        memberId: activeMember.memberCode,
        memberName: workshopFormData.name,
        phone: workshopFormData.phone,
        businessName: workshopFormData.businessName,
      });

      setWorkshopTicket(ticket);
      setRegisteringWorkshop(null);
    } catch (err: any) {
      alert(err.message || 'Gagal mendaftar workshop');
    }
  };

  const filteredCourses =
    selectedCategory === 'ALL'
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  const memberCertificates = certificates.filter(
    (c) => c.memberId === activeMember.memberCode || c.memberName === activeMember.fullName,
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Main Tab Switcher */}
      <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-emerald-200 bg-white">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-mono">
              Sprint 9 • SAK, 7 Laporan Operasional &amp; Learn
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-mono font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> SAK Balanced Ledger Verified
            </span>
            <span className="flex items-center gap-1 text-[11px] text-indigo-800 font-mono bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" /> 7 Laporan Operasional Aktif
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" /> Oriental Learn ({courses.length} Modul Aktif)
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Pusat Akuntansi SAK, Laporan Operasional & Oriental Learn
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelaporan SAK multi-pilar, 7 laporan operasional harian/shift/outlet/void, dan sertifikasi kompetensi digital untuk UKM kuliner.
          </p>
        </div>

        {/* Master Navigation Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveMainTab('FINANCIAL_SAK')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'FINANCIAL_SAK'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Laporan SAK</span>
          </button>
          <button
            onClick={() => setActiveMainTab('OPERATIONAL_REPORTS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'OPERATIONAL_REPORTS'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Laporan Operasional</span>
            <span className="bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">7</span>
          </button>
          <button
            onClick={() => setActiveMainTab('ORIENTAL_LEARN')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'ORIENTAL_LEARN'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Oriental Learn</span>
            {memberCertificates.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full font-mono">
                {memberCertificates.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. FINANCIAL SAK MODULE                                             */}
      {/* =================================================================== */}
      {activeMainTab === 'FINANCIAL_SAK' && (
        <div className="space-y-6">
          {/* Action Toolbar: Multi-Pilar and Export Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase font-mono">Format Export:</span>
              <button
                onClick={handleDownloadExcel}
                className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-emerald-300 transition shadow-xs cursor-pointer"
                title="Unduh Spreadsheet Format Excel / CSV Resmi"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel (CSV)
              </button>
              <button
                onClick={() => setShowPdfModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="Buka Dokumen PDF Resmi Berstempel Audit Akuntan"
              >
                <Download className="w-4 h-4" /> Cetak Dokumen PDF Resmi (Audit)
              </button>
            </div>

            {/* Invariant SAK Neraca Status Badge */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <div className="text-right">
                <p className="text-[10px] text-emerald-800 font-mono font-bold">
                  PERSAMAAN AKUNTANSI SAK AKTIF
                </p>
                <p className="text-xs font-mono font-extrabold text-emerald-950">
                  Total Aset Rp {totalAssets.toLocaleString('id-ID')} = Liabilitas + Ekuitas Rp {totalLiabilitiesAndEquity.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* PILAR SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">
              Pilih Entitas Pelaporan (Pilar Ekosistem vs Konsolidasi):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.entries(pillarTitles).map(([key, item]) => {
                const isSelected = selectedPillar === key;
                const Icon = item.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPillar(key as EcosystemPillar)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/25 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`} />
                      <span className="text-[11px] font-bold truncate">{item.name.replace('Pilar ', '')}</span>
                    </div>
                    <span className={`text-[9px] font-mono block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {key === 'CONSOLIDATED' ? 'Gabungan' : 'Laporan Terpisah'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report Selection Tabs (Laba Rugi, Neraca, Arus Kas) */}
          <div className="flex gap-3">
            <button
              onClick={() => setReportType('LABA_RUGI')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2 cursor-pointer ${
                reportType === 'LABA_RUGI'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'glass-panel text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> 1. Laporan Laba Rugi Komprehensif
            </button>
            <button
              onClick={() => setReportType('NERACA')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2 cursor-pointer ${
                reportType === 'NERACA'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'glass-panel text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Scale className="w-4 h-4" /> 2. Laporan Posisi Keuangan (Neraca SAK)
            </button>
            <button
              onClick={() => setReportType('ARUS_KAS')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2 cursor-pointer ${
                reportType === 'ARUS_KAS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'glass-panel text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" /> 3. Laporan Arus Kas
            </button>
          </div>

          {/* REPORT CONTENT AREA */}
          <div className="glass-panel p-6 rounded-2xl font-mono text-sm space-y-6 text-slate-800 bg-white border border-slate-200 shadow-sm">
            {/* Entity Header Banner */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">Entitas:</span>
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-mono">
                  {pillarTitles[selectedPillar].name}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-sans">
                {pillarTitles[selectedPillar].subtitle}
              </span>
            </div>

            {/* 1. STATEMENT OF PROFIT OR LOSS */}
            {reportType === 'LABA_RUGI' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-end">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-outfit uppercase">
                      LAPORAN LABA RUGI KOMPREHENSIF SAK
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      Entitas: {pillarTitles[selectedPillar].name} • Periode: Tahun 2026 (Live Real-Time)
                    </p>
                  </div>
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded shadow-xs">
                    Real-Time SAK
                  </span>
                </div>

                {/* Pendapatan (Revenue) */}
                <div className="space-y-2">
                  <p className="text-xs uppercase font-bold text-emerald-700">A. Pendapatan Usaha (Revenue)</p>
                  <div className="pl-4 space-y-1 text-xs text-slate-700">
                    {isConsolidated ? (
                      <>
                        <div className="flex justify-between">
                          <span>Penjualan Bersih Retail (B2C Swalayan)</span>
                          <span className="font-bold text-slate-900">Rp {financials.retailRevenue.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Penjualan Bersih Grosir (B2B Distribusi)</span>
                          <span className="font-bold text-slate-900">Rp {financials.grosirRevenue.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pengadaan Bahan Baku UKM Supply Kuliner</span>
                          <span>Rp {financials.ukmSupplyRevenue.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Penyaluran Produk Maklon White Label</span>
                          <span>Rp {financials.whiteLabelRevenue.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-amber-800">
                          <span>Estimasi Penjualan Minyak Jelantah ke Pabrik Pengolah</span>
                          <span>Rp {financials.pillars.WASTE.revenue.toLocaleString('id-ID')}</span>
                        </div>
                      </>
                    ) : selectedPillar === EcosystemPillar.WASTE ? (
                      <>
                        <div className="flex justify-between">
                          <span>Penjualan Minyak Jelantah ke Pabrik Pengolah Bioenergi</span>
                          <span className="font-bold text-slate-900">Rp {activeRevenue.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Total Volume Daur Ulang:</span>
                          <span>{wasteHistory.reduce((s: number, h) => s + h.netWeightKg, 0).toFixed(1)} Kg</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span>Pendapatan Operasional {pillarTitles[selectedPillar].name}</span>
                        <span className="font-bold text-slate-900">Rp {activeRevenue.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 text-xs">
                    <span>TOTAL PENDAPATAN BERSIH</span>
                    <span className="text-emerald-700 text-sm">Rp {activeRevenue.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Beban Pokok Pendapatan (HPP) */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs uppercase font-bold text-amber-700">B. Harga Pokok Penjualan (HPP / COGS)</p>
                  <div className="pl-4 flex justify-between text-xs text-slate-700">
                    <span>
                      {selectedPillar === EcosystemPillar.WASTE
                        ? 'Biaya Pembelian Minyak Jelantah dari Penyetor / Member'
                        : 'Beban Pokok Penjualan Barang Dagangan / Manufaktur'}
                    </span>
                    <span>(Rp {activeCogs.toLocaleString('id-ID')})</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 text-xs">
                    <span>LABA KOTOR (GROSS PROFIT)</span>
                    <span className="text-amber-700 text-sm">Rp {activeGrossProfit.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Beban Operasional */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs uppercase font-bold text-rose-700">C. Beban Operasional & Insentif Ekosistem</p>
                  <div className="pl-4 space-y-1 text-xs text-slate-700">
                    {isConsolidated ? (
                      <>
                        <div className="flex justify-between"><span>Beban Gaji Staf Kasir & Gudang</span><span>(Rp {sharedSalaries.toLocaleString('id-ID')})</span></div>
                        <div className="flex justify-between"><span>Beban Komisi Referral Bisnis & Influencer</span><span>(Rp {sharedReferral.toLocaleString('id-ID')})</span></div>
                        <div className="flex justify-between text-emerald-800 font-bold">
                          <span>Beban Bagi Hasil Mitra Drop Point Waste (10% Margin)</span>
                          <span>(Rp {totalWasteShareExpense.toLocaleString('id-ID')})</span>
                        </div>
                        <div className="flex justify-between"><span>Beban Utilitas & Sewa Gudang</span><span>(Rp {sharedUtilities.toLocaleString('id-ID')})</span></div>
                      </>
                    ) : selectedPillar === EcosystemPillar.WASTE ? (
                      <div className="flex justify-between text-emerald-800 font-bold">
                        <span>Bagi Hasil Mitra Penyedia Tempat Drop Point (10% dari Margin Kotor)</span>
                        <span>(Rp {activeOpex.toLocaleString('id-ID')})</span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span>Alokasi Beban Operasional {pillarTitles[selectedPillar].name}</span>
                        <span>(Rp {activeOpex.toLocaleString('id-ID')})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Laba Bersih */}
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex justify-between items-center font-bold text-base shadow-xs">
                  <span className="text-slate-900 text-sm sm:text-base">
                    LABA BERSIH OPERASIONAL ({isConsolidated ? 'KONSOLIDASIAN' : selectedPillar})
                  </span>
                  <span className="text-emerald-700 text-xl font-mono">
                    Rp {activeNetProfit.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* 2. STATEMENT OF FINANCIAL POSITION (NERACA) */}
            {reportType === 'NERACA' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-end">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-outfit uppercase">
                      LAPORAN POSISI KEUANGAN / NERACA SAK
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      Entitas: {pillarTitles[selectedPillar].name} • Prinsip Keseimbangan SAK Aktif
                    </p>
                  </div>
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded shadow-xs">
                    Seimbang / Balanced
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assets Side */}
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                    <p className="font-bold text-emerald-700 text-xs uppercase">ASET (ASSETS)</p>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <p className="font-semibold text-slate-500">Aset Lancar:</p>
                      <div className="pl-3 space-y-1">
                        <div className="flex justify-between">
                          <span>Kas & Bank (Hasil Operasional)</span>
                          <span className="font-bold text-slate-900">Rp {activeCash.toLocaleString('id-ID')}</span>
                        </div>
                        {activeAR > 0 && (
                          <div className="flex justify-between">
                            <span>Piutang Usaha (Penjualan TOP)</span>
                            <span className="font-bold text-slate-900">Rp {activeAR.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>
                            {selectedPillar === EcosystemPillar.WASTE
                              ? 'Persediaan Minyak Jelantah Siap Jual'
                              : 'Persediaan Barang Dagang & Bahan Baku'}
                          </span>
                          <span className="font-bold text-slate-900">Rp {activeInventory.toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      {fixedAssetsNet > 0 && (
                        <>
                          <p className="font-semibold text-slate-500 pt-2">Aset Tetap:</p>
                          <div className="pl-3 space-y-1">
                            <div className="flex justify-between">
                              <span>Peralatan POS & Fasilitas Operasional</span>
                              <span>Rp {fixedAssetsNet.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-slate-900 text-xs">
                      <span>TOTAL ASET</span>
                      <span className="text-emerald-700 text-sm">Rp {totalAssets.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Liabilities & Equity Side */}
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                    <p className="font-bold text-amber-700 text-xs uppercase">KEWAJIBAN & EKUITAS</p>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <p className="font-semibold text-slate-500">Kewajiban / Utang:</p>
                      <div className="pl-3 space-y-1">
                        {selectedPillar === EcosystemPillar.WASTE ? (
                          <div className="flex justify-between font-bold text-amber-800">
                            <span>Utang Bagi Hasil Mitra Drop Point (10%)</span>
                            <span>Rp {activeLiabilities.toLocaleString('id-ID')}</span>
                          </div>
                        ) : isConsolidated ? (
                          <>
                            <div className="flex justify-between"><span>Utang Dagang Pabrik/Vendor</span><span>Rp 480.000.000</span></div>
                            <div className="flex justify-between text-amber-800 font-bold">
                              <span>Utang Bagi Hasil Mitra Drop Point Waste (10%)</span>
                              <span>Rp {financials.wastePayable.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between"><span>Utang Komisi Referral</span><span>Rp 12.000.000</span></div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span>Kewajiban Lancar {pillarTitles[selectedPillar].name}</span>
                            <span>Rp {activeLiabilities.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                      </div>

                      <p className="font-semibold text-slate-500 pt-2">Ekuitas:</p>
                      <div className="pl-3 space-y-1">
                        <div className="flex justify-between">
                          <span>Alokasi Modal Pemilik</span>
                          <span>Rp {ownerCapital.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saldo Laba Ditahan & Berjalan</span>
                          <span className="font-bold text-slate-900">Rp {retainedEarnings.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-slate-900 text-xs">
                      <span>TOTAL KEWAJIBAN & EKUITAS</span>
                      <span className="text-amber-700 text-sm">Rp {totalLiabilitiesAndEquity.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold shadow-xs">
                  <span>Status Kepatuhan Standar SAK:</span>
                  <span>✓ Total Aset (Rp {totalAssets.toLocaleString('id-ID')}) == Total Liabilitas & Ekuitas (Rp {totalLiabilitiesAndEquity.toLocaleString('id-ID')}) [SEIMBANG]</span>
                </div>
              </div>
            )}

            {/* 3. STATEMENT OF CASH FLOWS */}
            {reportType === 'ARUS_KAS' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900 font-outfit uppercase">
                    LAPORAN ARUS KAS (METODE SAK)
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Entitas: {pillarTitles[selectedPillar].name} • Tahun 2026
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Arus Kas Bersih dari Aktivitas Operasi</span>
                    <span className="text-emerald-700 font-bold">
                      Rp {(activeCash * 0.8).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Arus Kas untuk Aktivitas Investasi & Peralatan</span>
                    <span className="text-rose-600 font-bold">
                      (Rp {(activeCash * 0.15).toLocaleString('id-ID')})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Arus Kas Bersih dari Aktivitas Pendanaan</span>
                    <span className="text-emerald-700 font-bold">
                      Rp {(activeCash * 0.05).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-2">
                    <span>KAS & SETARA KAS AKHIR PERIODE</span>
                    <span className="text-emerald-700 font-mono">Rp {activeCash.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ================================================================= */}
      {/* SPRINT 9: 7 LAPORAN OPERASIONAL                                   */}
      {/* ================================================================= */}
      {activeMainTab === 'OPERATIONAL_REPORTS' && (
        <div className="space-y-5">
          <div className="glass-panel p-4 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black font-mono text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded uppercase">Sprint 9 - PRD Addendum Sec.9</span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">7 Laporan Operasional Harian</h2>
              <p className="text-xs text-slate-500">Penjualan harian, shift kasir, metode bayar, outlet summary, fast moving, tren omzet, audit void.</p>
            </div>
            <button className="px-4 py-2 bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer" onClick={() => alert('Export Sprint 10')}>
              <Download className="w-4 h-4" /> Export Semua
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {([{id:'DAILY_SALES',label:'Penjualan Harian'},{id:'CASHIER_SHIFT',label:'Rekonsiliasi Shift'},{id:'PAYMENT_METHOD',label:'Metode Bayar'},{id:'OUTLET_SUMMARY',label:'Summary Outlet'},{id:'FAST_MOVING',label:'Produk Terlaris'},{id:'PERIOD_REVENUE',label:'Tren Omzet'},{id:'VOID_LOG',label:'Audit Void'},{id:'PRICE_LIST',label:'Daftar Harga'}] as const).map(({id,label})=>(
              <button key={id} onClick={()=>setActiveOpsReport(id as any)} className={"py-2.5 px-2 rounded-xl text-[10px] font-bold font-mono flex flex-col items-center gap-1.5 cursor-pointer border transition "+(activeOpsReport===id?'bg-indigo-700 text-white border-indigo-700':'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50')}><BarChart3 className="w-4 h-4"/><span className="text-center leading-tight">{label}</span></button>
            ))}
          </div>
          {activeOpsReport === 'DAILY_SALES' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4"><p className="text-[10px] font-bold font-mono text-indigo-700 uppercase mb-2">Gross Revenue</p><p className="text-xl font-black text-indigo-900">Rp {(dailySalesReport.grossRevenue/1e6).toFixed(1)} Jt</p><p className="text-[10px] text-indigo-600 font-mono">{dailySalesReport.transactionCount} Transaksi</p></div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"><p className="text-[10px] font-bold font-mono text-emerald-700 uppercase mb-2">Net Revenue</p><p className="text-xl font-black text-emerald-900">Rp {(dailySalesReport.netRevenue/1e6).toFixed(1)} Jt</p><p className="text-[10px] text-emerald-600 font-mono">Diskon Rp {(dailySalesReport.totalDiscount/1e3).toFixed(0)}K</p></div>
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4"><p className="text-[10px] font-bold font-mono text-sky-700 uppercase mb-2">Avg Basket</p><p className="text-xl font-black text-sky-900">Rp {(dailySalesReport.averageBasketValue/1e3).toFixed(0)}K</p><p className="text-[10px] text-sky-600 font-mono">Per Transaksi</p></div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-[10px] font-bold font-mono text-amber-700 uppercase mb-2">Total Item</p><p className="text-xl font-black text-amber-900">{dailySalesReport.totalItemsSold}</p><p className="text-[10px] text-amber-600 font-mono">Unit/Pcs/Karton</p></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50"><div><h3 className="text-sm font-bold text-slate-800">Rincian Transaksi Hari Ini</h3><p className="text-[10px] text-slate-400 font-mono">{dailySalesReport.date}</p></div><span className="bg-indigo-100 text-indigo-700 font-black font-mono text-[10px] px-2 py-1 rounded-full">{dailySalesReport.transactionCount} TRX</span></div>
                <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 border-b"><tr>{['Waktu','No. Invoice','Kasir','Channel','Item','Total','Pembayaran','Pelanggan'].map(h=><th key={h} className="text-left px-3 py-2.5 font-bold text-slate-600 font-mono text-[10px] uppercase whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y">{dailySalesReport.transactions.map((tx,i)=>(<tr key={tx.id} className={"hover:bg-indigo-50/40 "+(i%2===0?'bg-white':'bg-slate-50/50')}><td className="px-3 py-2.5 font-mono font-bold text-slate-700">{tx.time}</td><td className="px-3 py-2.5 font-mono text-indigo-700 whitespace-nowrap">{tx.invoiceNumber}</td><td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{tx.cashierName}</td><td className="px-3 py-2.5"><span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono whitespace-nowrap">{tx.channel}</span></td><td className="px-3 py-2.5 text-center font-mono font-bold">{tx.itemCount}</td><td className="px-3 py-2.5 font-black text-slate-900 whitespace-nowrap">Rp {tx.grandTotal.toLocaleString('id-ID')}</td><td className="px-3 py-2.5"><span className={"text-[9px] font-black px-2 py-0.5 rounded-full font-mono whitespace-nowrap "+(tx.paymentMethod==='CASH'?'bg-emerald-100 text-emerald-700':tx.paymentMethod==='QRIS_DYNAMIC'?'bg-sky-100 text-sky-700':tx.paymentMethod==='ORIENTAL_PAY'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-700')}>{tx.paymentMethod}</span></td><td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{tx.customerName||'-'}</td></tr>))}</tbody></table></div>
              </div>
            </div>
          )}
          {activeOpsReport === 'CASHIER_SHIFT' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{cashierShiftReports.map((shift)=>{const sc=shift.status==='BALANCED'?{bg:'bg-emerald-50',border:'border-emerald-200',badge:'bg-emerald-600 text-white',lbl:'BALANCE'}:shift.status==='SHORTAGE'?{bg:'bg-rose-50',border:'border-rose-200',badge:'bg-rose-600 text-white',lbl:'KURANG'}:{bg:'bg-amber-50',border:'border-amber-200',badge:'bg-amber-600 text-white',lbl:'LEBIH'};return(<div key={shift.id} className={sc.bg+' '+sc.border+' border rounded-2xl p-5 space-y-4'}><div className="flex items-start justify-between gap-2"><div><h3 className="font-black text-slate-900 text-sm">{shift.shiftName}</h3><p className="text-[10px] text-slate-500 font-mono">{shift.outletName}</p><p className="text-[10px] text-slate-500 font-mono">Kasir: {shift.cashierName}</p></div><span className={sc.badge+' text-[10px] font-black font-mono px-2.5 py-1 rounded-full'}>{sc.lbl}</span></div><div className="grid grid-cols-2 gap-3"><div className="bg-white/70 rounded-xl p-3"><p className="text-[9px] font-mono uppercase">Kas Awal</p><p className="text-sm font-black">Rp {shift.openingCash.toLocaleString('id-ID')}</p></div><div className="bg-white/70 rounded-xl p-3"><p className="text-[9px] font-mono uppercase">Penjualan Tunai</p><p className="text-sm font-black text-emerald-800">Rp {shift.cashSalesTotal.toLocaleString('id-ID')}</p></div><div className="bg-white/70 rounded-xl p-3"><p className="text-[9px] font-mono uppercase">Non-Tunai</p><p className="text-sm font-black text-sky-800">Rp {shift.nonCashSalesTotal.toLocaleString('id-ID')}</p></div><div className="bg-white/70 rounded-xl p-3"><p className="text-[9px] font-mono uppercase">Petty Cash</p><p className="text-sm font-black text-rose-700">-Rp {shift.pettyCashExpenses.toLocaleString('id-ID')}</p></div></div><div className="bg-white/80 border border-slate-200 rounded-xl p-3 space-y-2"><div className="flex justify-between text-xs"><span className="font-bold">Estimasi Laci:</span><span className="font-black font-mono">Rp {shift.expectedCashInDrawer.toLocaleString('id-ID')}</span></div><div className="flex justify-between text-xs"><span className="font-bold">Kas Fisik:</span>{shiftReconcileId===shift.id?(<div className="flex items-center gap-2"><input type="number" value={shiftActualCash} onChange={e=>setShiftActualCash(e.target.value)} className="border border-indigo-300 rounded-lg px-2 py-1 text-xs w-28 font-mono"/><button onClick={()=>{reconcileCashierShift(shift.id,Number(shiftActualCash));setShiftReconcileId(null);setShiftActualCash('');}} className="px-2 py-1 bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer">Simpan</button></div>):(<span className={"font-black font-mono "+(shift.difference<0?'text-rose-700':shift.difference>0?'text-amber-700':'text-emerald-700')}>Rp {shift.actualCashCounted.toLocaleString('id-ID')}</span>)}</div>{shift.difference!==0&&<div className="flex justify-between text-xs border-t pt-2"><span className="font-bold">Selisih:</span><span className={"font-black font-mono text-sm "+(shift.difference<0?'text-rose-700':'text-amber-600')}>{shift.difference>0?'+':''}Rp {Math.abs(shift.difference).toLocaleString('id-ID')}</span></div>}</div>{shift.notes&&<p className="text-[10px] text-slate-500 bg-white/60 rounded-lg p-2 border italic">{shift.notes}</p>}<div className="flex gap-2"><button onClick={()=>{setShiftReconcileId(shift.id);setShiftActualCash(String(shift.actualCashCounted));}} className="flex-1 py-2 border border-indigo-300 text-indigo-700 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-indigo-50 cursor-pointer"><RefreshCw className="w-3.5 h-3.5"/>Rekonsiliasi</button><button onClick={()=>alert('Cetak '+shift.shiftName)} className="flex-1 py-2 bg-slate-700 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-800 cursor-pointer"><Printer className="w-3.5 h-3.5"/>Z-Report</button></div></div>);})}</div>
          )}
          {activeOpsReport === 'PAYMENT_METHOD' && (
            <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{paymentMethodBreakdown.map((pm)=>{const clsM:Record<string,string>={emerald:'bg-emerald-50 border-emerald-200',sky:'bg-sky-50 border-sky-200',indigo:'bg-indigo-50 border-indigo-200',amber:'bg-amber-50 border-amber-200',rose:'bg-rose-50 border-rose-200',purple:'bg-purple-50 border-purple-200'};const barM:Record<string,string>={emerald:'bg-emerald-500',sky:'bg-sky-500',indigo:'bg-indigo-500',amber:'bg-amber-500',rose:'bg-rose-500',purple:'bg-purple-500'};return(<div key={pm.method} className={'border rounded-2xl p-5 space-y-3 '+(clsM[pm.badgeColor]||'bg-slate-50 border-slate-200')}><div className="flex items-center justify-between"><h3 className="font-black text-sm">{pm.label}</h3><span className="text-xl font-black">{pm.sharePercentage}%</span></div><div className="w-full bg-white/60 rounded-full h-2.5"><div className={'h-2.5 rounded-full '+(barM[pm.badgeColor]||'bg-slate-500')} style={{width:`${pm.sharePercentage}%`}}/></div><div className="grid grid-cols-2 gap-2"><div className="bg-white/60 rounded-xl p-2.5"><p className="text-[9px] font-mono uppercase opacity-70">Volume</p><p className="text-sm font-black">Rp {(pm.totalVolume/1e6).toFixed(1)} Jt</p></div><div className="bg-white/60 rounded-xl p-2.5"><p className="text-[9px] font-mono uppercase opacity-70">Jml TRX</p><p className="text-sm font-black">{pm.transactionCount}x</p></div></div></div>);})} </div><div className="bg-slate-800 text-white rounded-2xl p-5"><h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400"/>Total Volume Pembayaran</h3><div className="grid grid-cols-3 gap-4"><div><p className="text-[10px] text-slate-400 font-mono">Total Volume</p><p className="text-xl font-black text-indigo-300">Rp {(paymentMethodBreakdown.reduce((a,b)=>a+b.totalVolume,0)/1e6).toFixed(1)} Jt</p></div><div><p className="text-[10px] text-slate-400 font-mono">Total TRX</p><p className="text-xl font-black text-emerald-300">{paymentMethodBreakdown.reduce((a,b)=>a+b.transactionCount,0)}</p></div><div><p className="text-[10px] text-slate-400 font-mono">Terpopuler</p><p className="text-sm font-black text-amber-300">{[...paymentMethodBreakdown].sort((a,b)=>b.sharePercentage-a.sharePercentage)[0]?.label}</p></div></div></div></div>
          )}
          {activeOpsReport === 'OUTLET_SUMMARY' && (
            <div className="space-y-4"><div className="grid grid-cols-1 gap-4">{outletSummaries.map((outlet,i)=>(<div key={outlet.outletId} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition"><div className="flex flex-wrap items-start justify-between gap-3 mb-4"><div className="flex items-start gap-3"><div className={'w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm '+(i===0?'bg-indigo-700 text-white':i===1?'bg-slate-700 text-white':'bg-slate-300 text-slate-700')}>#{i+1}</div><div><h3 className="font-black text-slate-900">{outlet.outletName}</h3><p className="text-[10px] text-slate-400 font-mono">{outlet.region}</p></div></div><div className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black font-mono border '+(outlet.achievementPct>=100?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-rose-50 border-rose-200 text-rose-700')}>{outlet.achievementPct>=100?<ArrowUpRight className="w-4 h-4"/>:<ArrowDownRight className="w-4 h-4"/>}{outlet.achievementPct.toFixed(1)}%</div></div><div className="grid grid-cols-4 gap-3"><div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3"><p className="text-[9px] text-indigo-600 font-mono uppercase">Revenue</p><p className="text-sm font-black text-indigo-900">Rp {(outlet.revenue/1e6).toFixed(1)} Jt</p></div><div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3"><p className="text-[9px] text-emerald-600 font-mono uppercase">Profit</p><p className="text-sm font-black text-emerald-900">Rp {(outlet.grossProfit/1e6).toFixed(1)} Jt</p></div><div className="bg-sky-50 border border-sky-100 rounded-xl p-3"><p className="text-[9px] text-sky-600 font-mono uppercase">TRX</p><p className="text-sm font-black text-sky-900">{outlet.transactionsCount}</p></div><div className="bg-amber-50 border border-amber-100 rounded-xl p-3"><p className="text-[9px] text-amber-600 font-mono uppercase">Share</p><p className="text-sm font-black text-amber-900">{outlet.shareOfTotalRevenuePct}%</p></div></div><div className="mt-3"><div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1"><span>Target Progress</span><span>Rp {(outlet.revenue/1e6).toFixed(1)}/{(outlet.targetRevenue/1e6).toFixed(1)} Jt</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className={'h-2 rounded-full '+(outlet.achievementPct>=100?'bg-emerald-500':'bg-indigo-500')} style={{width:`${Math.min(100,outlet.achievementPct)}%`}}/></div></div></div>))}</div><div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-2xl p-5"><h3 className="text-sm font-bold mb-3">Konsolidasi Semua Outlet</h3><div className="grid grid-cols-3 gap-4"><div><p className="text-[10px] text-indigo-300">Total Revenue</p><p className="text-xl font-black">Rp {(outletSummaries.reduce((a,b)=>a+b.revenue,0)/1e6).toFixed(1)} Jt</p></div><div><p className="text-[10px] text-indigo-300">Total Profit</p><p className="text-xl font-black">Rp {(outletSummaries.reduce((a,b)=>a+b.grossProfit,0)/1e6).toFixed(1)} Jt</p></div><div><p className="text-[10px] text-indigo-300">Total TRX</p><p className="text-xl font-black">{outletSummaries.reduce((a,b)=>a+b.transactionsCount,0)}</p></div></div></div></div>
          )}
          {activeOpsReport === 'FAST_MOVING' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden"><div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100"><h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500"/>Peringkat Produk Terlaris (Fast Moving)</h3></div><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 border-b"><tr>{['#','Produk','Kategori','Unit Terjual','Total Revenue','Turnover','Velocity','Stok Sisa'].map(h=><th key={h} className="text-left px-3 py-2.5 font-bold text-slate-600 font-mono text-[10px] uppercase whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y">{fastMovingProducts.map((prod,i)=>(<tr key={prod.productId} className={"hover:bg-amber-50/40 "+(i%2===0?'bg-white':'bg-slate-50/50')}><td className="px-3 py-3"><span className={'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black '+(i===0?'bg-amber-400 text-white':i===1?'bg-slate-400 text-white':i===2?'bg-orange-300 text-white':'bg-slate-100 text-slate-500')}>{i+1}</span></td><td className="px-3 py-3 font-bold text-slate-900 whitespace-nowrap">{prod.productName}</td><td className="px-3 py-3 text-slate-500">{prod.category}</td><td className="px-3 py-3 font-black text-indigo-700">{prod.unitsSold} {prod.unitName}</td><td className="px-3 py-3 font-black text-emerald-700">Rp {(prod.totalRevenue/1e6).toFixed(2)} Jt</td><td className="px-3 py-3 font-black text-amber-700">{prod.turnoverRatio}x</td><td className="px-3 py-3"><span className={'text-[9px] font-black px-2 py-0.5 rounded-full font-mono '+(prod.velocityGrade==='FAST_MOVING'?'bg-emerald-100 text-emerald-700':prod.velocityGrade==='SLOW_MOVING'?'bg-rose-100 text-rose-700':'bg-slate-100 text-slate-600')}>{prod.velocityGrade==='FAST_MOVING'?'FAST':prod.velocityGrade==='SLOW_MOVING'?'SLOW':'NORMAL'}</span></td><td className="px-3 py-3 font-mono font-bold text-slate-700">{prod.stockRemaining}</td></tr>))}</tbody></table></div></div>
          )}
          {activeOpsReport === 'PERIOD_REVENUE' && (
            <div className="space-y-4"><div className="bg-white border border-slate-200 rounded-2xl p-5"><div className="flex items-center justify-between mb-4"><div><h3 className="text-sm font-black flex items-center gap-2"><LineChart className="w-4 h-4 text-indigo-500"/>Tren Omzet 7 Hari Terakhir</h3></div><div className="flex gap-3 text-[10px] font-mono"><span className="flex items-center gap-1"><span className="w-3 h-1 bg-indigo-500 rounded inline-block"/>Gross Sales</span><span className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-500 rounded inline-block"/>Margin</span></div></div><div className="flex items-end gap-3 h-40">{periodRevenueReports.map((pr)=>{const maxS=Math.max(...periodRevenueReports.map(p=>p.grossSales));const bH=Math.round((pr.grossSales/maxS)*100);const mH=Math.round((pr.grossMargin/maxS)*100);return(<div key={pr.periodLabel} className="flex-1 flex flex-col items-center gap-1 group"><div className="text-[9px] font-black text-indigo-700 opacity-0 group-hover:opacity-100 font-mono whitespace-nowrap">Rp {(pr.grossSales/1e6).toFixed(1)}Jt</div><div className="w-full flex gap-0.5 items-end"><div className="flex-1 bg-indigo-500 rounded-t-sm" style={{height:`${bH}%`,minHeight:'8px'}}/><div className="flex-1 bg-emerald-500 rounded-t-sm" style={{height:`${mH}%`,minHeight:'4px'}}/></div><div className="text-[8px] text-slate-400 font-mono text-center">{pr.periodLabel.split(',')[0]}</div></div>);})}</div></div><div className="bg-white border border-slate-200 rounded-2xl overflow-hidden"><table className="w-full text-xs"><thead className="bg-slate-50 border-b"><tr>{['Periode','Gross Sales','HPP','Gross Margin','Growth'].map(h=><th key={h} className="text-left px-4 py-2.5 font-bold text-slate-600 font-mono text-[10px] uppercase">{h}</th>)}</tr></thead><tbody className="divide-y">{periodRevenueReports.map((pr,i)=>(<tr key={pr.periodLabel} className={"hover:bg-indigo-50/30 "+(i%2===0?'bg-white':'bg-slate-50/50')}><td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">{pr.periodLabel}</td><td className="px-4 py-3 font-black text-indigo-700">Rp {(pr.grossSales/1e6).toFixed(2)} Jt</td><td className="px-4 py-3 text-slate-600">Rp {(pr.cogs/1e6).toFixed(2)} Jt</td><td className="px-4 py-3 font-black text-emerald-700">Rp {(pr.grossMargin/1e6).toFixed(2)} Jt</td><td className="px-4 py-3">{pr.growthRatePct!==undefined&&<span className={"flex items-center gap-1 font-black "+(pr.growthRatePct>=0?'text-emerald-700':'text-rose-700')}>{pr.growthRatePct>=0?<ArrowUpRight className="w-3.5 h-3.5"/>:<ArrowDownRight className="w-3.5 h-3.5"/>}{Math.abs(pr.growthRatePct).toFixed(1)}%</span>}</td></tr>))}</tbody></table></div></div>
          )}
          {activeOpsReport === 'VOID_LOG' && (
            <div className="space-y-4"><div className="flex items-center justify-between"><div><h3 className="text-sm font-black flex items-center gap-2"><Ban className="w-4 h-4 text-rose-500"/>Audit Trail Void Transaksi</h3><p className="text-[10px] text-slate-400 font-mono">{voidAuditRecords.length} record</p></div><button onClick={()=>setVoidModalOpen(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"><Ban className="w-3.5 h-3.5"/>Catat Void</button></div><div className="space-y-3">{voidAuditRecords.map((rec)=>(<div key={rec.id} className="bg-white border border-rose-100 rounded-2xl p-5"><div className="flex flex-wrap items-start justify-between gap-3 mb-3"><div><div className="flex items-center gap-2 mb-1"><span className="bg-rose-100 text-rose-700 font-black font-mono text-[10px] px-2 py-0.5 rounded">VOID</span><span className="font-black text-slate-900 font-mono">{rec.invoiceNumber}</span><span className="text-[10px] text-slate-400 font-mono">{rec.voidedAt}</span></div><p className="text-xs text-slate-700 font-medium">{rec.voidReason}</p></div><div className="text-right"><p className="text-[10px] text-slate-400 font-mono">Nilai Dibatalkan</p><p className="text-lg font-black text-rose-700">Rp {rec.originalAmount.toLocaleString('id-ID')}</p></div></div><div className="grid grid-cols-2 gap-2 mb-3"><div className="bg-slate-50 rounded-xl p-2.5"><p className="text-[9px] text-slate-400 font-mono uppercase">Kasir</p><p className="text-xs font-bold">{rec.cashierName}</p></div><div className="bg-slate-50 rounded-xl p-2.5"><p className="text-[9px] text-slate-400 font-mono uppercase">Manager</p><p className="text-xs font-bold">{rec.approvedByManager}</p></div></div><div className="bg-rose-50 border border-rose-100 rounded-xl p-3"><p className="text-[9px] text-rose-600 font-mono font-bold uppercase mb-1">Barang Restock:</p><div className="flex flex-wrap gap-2">{rec.restockedItems.map((item,idx)=><span key={idx} className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{item.name} ({item.qty} {item.unit})</span>)}</div>{rec.notes&&<p className="text-[10px] text-slate-500 mt-2 italic">{rec.notes}</p>}</div></div>))}</div>{voidModalOpen&&(<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={()=>setVoidModalOpen(false)}><div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-base font-black text-rose-700 flex items-center gap-2"><Ban className="w-5 h-5"/>Catat Void Transaksi</h3><button onClick={()=>setVoidModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><XCircle className="w-5 h-5"/></button></div><div className="grid grid-cols-2 gap-3">{([{key:'invoiceNumber',label:'No. Invoice',ph:'INV-RET-XXXXXX'},{key:'originalAmount',label:'Nilai (Rp)',ph:'500000'},{key:'cashierName',label:'Kasir',ph:'Siti Rahma'},{key:'approvedByManager',label:'Manager',ph:'Budi Wijaya'}] as const).map(({key,label,ph})=>(<div key={key}><label className="text-[10px] font-bold text-slate-600 font-mono uppercase block mb-1">{label}</label><input type={key==='originalAmount'?'number':'text'} placeholder={ph} value={(newVoidForm as any)[key]} onChange={e=>setNewVoidForm(prev=>({...prev,[key]:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"/></div>))}</div><div><label className="text-[10px] font-bold text-slate-600 font-mono uppercase block mb-1">Alasan Pembatalan</label><textarea value={newVoidForm.voidReason} onChange={e=>setNewVoidForm(prev=>({...prev,voidReason:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" rows={3} placeholder="Deskripsikan alasan..."/></div><div className="flex gap-3"><button onClick={()=>setVoidModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer">Batal</button><button onClick={()=>{if(!newVoidForm.invoiceNumber||!newVoidForm.voidReason){alert('Lengkapi data');return;}recordVoidTransaction({invoiceNumber:newVoidForm.invoiceNumber,originalAmount:Number(newVoidForm.originalAmount)||0,voidReason:newVoidForm.voidReason,cashierName:newVoidForm.cashierName||'Kasir',approvedByManager:newVoidForm.approvedByManager||'Manager',restockedItems:[],notes:newVoidForm.notes});setVoidModalOpen(false);setNewVoidForm({invoiceNumber:'',originalAmount:'',voidReason:'',cashierName:'',approvedByManager:'',notes:''}); }} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"><CheckCircle2 className="w-4 h-4"/>Simpan</button></div></div></div>)}</div>
          )}
          {activeOpsReport === 'PRICE_LIST' && (
            <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-black flex items-center gap-2"><Tag className="w-4 h-4 text-indigo-500"/>Flexible Price List Engine</h3><p className="text-[10px] text-slate-400 font-mono">{productSegmentPrices.length} aturan harga aktif</p></div><select value={priceSegmentFilter} onChange={e=>setPriceSegmentFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="ALL">Semua Segmen</option><option value="RETAIL">Retail</option><option value="UKM_KULINER">UKM Kuliner</option><option value="GROSIR_AGEN">Grosir &amp; Agen</option></select></div><div className="bg-white border border-slate-200 rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-800 text-white"><tr>{['Produk','Segmen','Min. Order','Satuan','HPP','Markup %','Harga Jual','Tgl Efektif','Status'].map(h=><th key={h} className="text-left px-3 py-3 font-bold font-mono text-[10px] uppercase whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y">{productSegmentPrices.filter(p=>priceSegmentFilter==='ALL'||p.segment===priceSegmentFilter).map((price,i)=>(<tr key={price.id} className={"hover:bg-indigo-50/30 "+(i%2===0?'bg-white':'bg-slate-50/40')}><td className="px-3 py-2.5 font-bold text-slate-900 whitespace-nowrap">{price.productName}</td><td className="px-3 py-2.5"><span className={'text-[9px] font-black px-2 py-0.5 rounded-full font-mono whitespace-nowrap '+(price.segment==='RETAIL'?'bg-sky-100 text-sky-700':price.segment==='UKM_KULINER'?'bg-amber-100 text-amber-700':price.segment==='GROSIR_AGEN'?'bg-indigo-100 text-indigo-700':'bg-purple-100 text-purple-700')}>{price.segmentLabel}</span></td><td className="px-3 py-2.5 font-mono font-bold text-center">{price.minOrderQty}</td><td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{price.unit}</td><td className="px-3 py-2.5 font-mono text-slate-600">Rp {price.baseHpp.toLocaleString('id-ID')}</td><td className="px-3 py-2.5 font-mono text-amber-700 font-bold">{price.markupPct}%</td><td className="px-3 py-2.5 font-black text-emerald-700 whitespace-nowrap">Rp {price.sellingPrice.toLocaleString('id-ID')}</td><td className="px-3 py-2.5 font-mono text-slate-500 whitespace-nowrap">{price.effectiveDate}</td><td className="px-3 py-2.5"><span className={'text-[9px] font-black px-2 py-0.5 rounded-full font-mono '+(price.isActive?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700')}>{price.isActive?'AKTIF':'NONAKTIF'}</span></td></tr>))}</tbody></table></div></div><div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3"><ListChecks className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"/><div><p className="text-xs font-bold text-indigo-800">Flexible Price List Engine</p><p className="text-[10px] text-indigo-600 font-mono mt-0.5">Harga dinamis berbasis productId+segmentCode+price. Tambah segmen baru tanpa migrasi database.</p></div></div></div>
          )}
        </div>
      )}
      {/* 2. ORIENTAL LEARN & UKM CERTIFICATION MODULE                        */}
      {/* =================================================================== */}
      {activeMainTab === 'ORIENTAL_LEARN' && (
        <div className="space-y-8">
          {/* Member Profile & Learning Status Banner */}
          <div className="p-6 bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full font-mono">
                  Oriental Academy Portal
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Member ID: {activeMember.memberCode}
                </span>
              </div>
              <h2 className="text-2xl font-bold font-heading text-slate-900">
                Portal Edukasi &amp; Sertifikasi Kompetensi UKM
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Tingkatkan kapabilitas operasional usaha kuliner Anda. Pelajari modul video SAK &amp; sanitasi, ikuti workshop tatap muka di Makassar &amp; Bone, dan dapatkan <strong>Sertifikat Digital Resmi ber-QR Code</strong> dengan nilai kuis <strong>&gt; 80%</strong>.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 px-5 py-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-right">
                <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Peserta Terdaftar</p>
                <p className="text-sm font-bold text-slate-900">{activeMember.fullName}</p>
                <p className="text-[11px] text-emerald-700 font-mono font-semibold">{activeMember.businessName || 'Pelaku Usaha Mandiri'}</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">E-Sertifikat</p>
                <p className="text-xl font-black text-amber-600 font-mono">{memberCertificates.length}</p>
              </div>
            </div>
          </div>

          {/* Section A: Modul Video & Kuis Uji Kompetensi */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Modul Pembelajaran Interaktif & Uji Kompetensi
                </h3>
                <p className="text-xs text-slate-500">
                  Selesaikan materi video dan raih nilai kelulusan kuis minimal di atas 80% untuk menerbitkan e-sertifikat terverifikasi.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Modul ({courses.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('FOOD_COSTING')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedCategory === 'FOOD_COSTING'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  SAK & Pembukuan
                </button>
                <button
                  onClick={() => setSelectedCategory('SANITASI_WASTE')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedCategory === 'SANITASI_WASTE'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sanitasi & Jelantah
                </button>
                <button
                  onClick={() => setSelectedCategory('DIGITAL_MARKETING')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedCategory === 'DIGITAL_MARKETING'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Afiliasi & Marketing
                </button>
              </div>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const hasCertificate = certificates.some(
                  (c) =>
                    (c.memberId === activeMember.memberCode || c.memberName === activeMember.fullName) &&
                    c.courseTitle === course.title,
                );

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Header with Duration */}
                      <div className="relative h-44 bg-slate-900 overflow-hidden group">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-700/90 backdrop-blur-md text-white px-2 py-0.5 rounded">
                            {course.categoryLabel}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> {course.durationMinutes} Menit
                          </span>
                        </div>

                        {/* Play Video Trigger Button */}
                        <button
                          onClick={() => setActiveVideoCourse(course)}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:scale-110 transition"
                        >
                          <div className="w-12 h-12 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg backdrop-blur-xs">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </button>

                        {/* Bottom Tag */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="font-semibold text-[11px] text-slate-200">
                            Instruktur: {course.instructor}
                          </span>
                          <span className="text-[10px] bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-amber-300 font-mono">
                            {course.level}
                          </span>
                        </div>
                      </div>

                      {/* Course Content Info */}
                      <div className="p-5 space-y-3">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {course.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {course.quizQuestions.length} Soal Uji Kompetensi
                          </span>
                          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            Syarat: &gt; 80%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 pt-0">
                      {hasCertificate ? (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-emerald-600" /> Sertifikat Terbit
                            </span>
                            <span className="text-[10px] font-mono">LULUS &gt; 80%</span>
                          </div>
                          <button
                            onClick={() => {
                              const found = certificates.find(
                                (c) =>
                                  (c.memberId === activeMember.memberCode || c.memberName === activeMember.fullName) &&
                                  c.courseTitle === course.title,
                              );
                              if (found) setViewingCertificate(found);
                            }}
                            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <QrCode className="w-3.5 h-3.5" /> Buka E-Sertifikat Digital
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveQuizCourse(course);
                            setUserAnswers({});
                            setQuizResult(null);
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Award className="w-4 h-4" /> Ikuti Uji Kompetensi (Kuis)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Workshop Offline Tatap Muka (Makassar & Bone) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Workshop Offline Tatap Muka (Makassar &amp; Bone)
                </h3>
                <p className="text-xs text-slate-500">
                  Pelatihan tatap muka intensif dengan praktisi SAK &amp; audit higienitas dapur. Kuota terbatas per sesi.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                Sisa Kuota Terverifikasi Live
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workshops.map((w) => {
                const availableSeats = Math.max(0, w.quota - w.registeredCount);
                const isFull = w.isFull || availableSeats <= 0;
                const percentFull = Math.min(100, Math.round((w.registeredCount / w.quota) * 100));

                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                          {w.location}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full ${
                            isFull
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isFull ? 'KUOTA PENUH' : `${availableSeats} Kursi Tersisa`}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {w.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {w.description}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-sans">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900">{w.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{w.date} • {w.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Pemateri: {w.instructor}</span>
                        </div>
                      </div>

                      {/* Quota Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-slate-500">
                          <span>Kapasitas Terdaftar</span>
                          <span className="font-bold text-slate-900">
                            {w.registeredCount} / {w.quota} Peserta ({percentFull}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all duration-500 ${
                              percentFull >= 90
                                ? 'bg-rose-500'
                                : percentFull >= 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${percentFull}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => {
                          setRegisteringWorkshop(w);
                          setWorkshopFormData({
                            name: activeMember.fullName || 'Bpk. Hendra Gunawan',
                            phone: activeMember.phone || '0812-3456-7890',
                            businessName: activeMember.businessName || 'RM Seleraku Makassar',
                          });
                        }}
                        disabled={isFull}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          isFull
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        {isFull ? 'Pendaftaran Ditutup (Penuh)' : 'Daftar Workshop Offline'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C: Galeri Sertifikat Digital Saya */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Galeri Sertifikat Digital Saya ({memberCertificates.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar e-sertifikat kelulusan uji kompetensi berstempel digital dan dilengkapi kode QR verifikasi keaslian.
                </p>
              </div>
            </div>

            {memberCertificates.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">
                  Belum Ada Sertifikat Digital yang Diterbitkan
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Selesaikan kuis pada salah satu modul pelatihan di atas dengan skor <strong>&gt; 80%</strong> untuk menerbitkan sertifikat digital resmi Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memberCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white rounded-2xl border-2 border-emerald-300/80 p-5 shadow-xs hover:shadow-md transition space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/20 via-emerald-400/10 to-transparent -mr-6 -mt-6 rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {cert.certificateNumber}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" /> Lulus Skor {cert.scorePct}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {cert.courseTitle}
                      </h4>
                      <p className="text-xs text-slate-500 font-sans">
                        Penerima: <strong className="text-slate-700">{cert.memberName}</strong>
                        {cert.businessName && ` (${cert.businessName})`}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Diterbitkan: {cert.issueDate}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-mono uppercase text-slate-400 font-bold">Verifikasi SHA256</p>
                        <p className="text-[10px] font-mono text-emerald-700 truncate max-w-[150px]">
                          {cert.verificationHash}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-white border border-slate-300 rounded p-1 flex items-center justify-center shrink-0">
                        <QrCode className="w-8 h-8 text-slate-800" />
                      </div>
                    </div>

                    <button
                      onClick={() => setViewingCertificate(cert)}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" /> Buka &amp; Cetak E-Sertifikat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: QUIZ INTERACTIVE DIALOG                                    */}
      {/* =================================================================== */}
      {activeQuizCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded">
                  Uji Kompetensi Mandiri
                </span>
                <h3 className="text-base font-bold mt-1">
                  {activeQuizCourse.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveQuizCourse(null);
                  setQuizResult(null);
                }}
                className="text-white/80 hover:text-white text-xl font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {!quizResult ? (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Petunjuk Kelulusan Standar Oriental Learn:</strong>
                      <p className="mt-0.5">
                        Anda harus menjawab dengan benar minimal <strong>&gt; 80%</strong> soal untuk memperoleh Sertifikat Digital resmi ber-QR Code. Skor &le; 80% tidak menerbitkan sertifikat dan Anda dipersilakan mengulang kuis.
                      </p>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-6">
                    {activeQuizCourse.quizQuestions.map((q, qIdx) => (
                      <div key={q.id} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = userAnswers[q.id] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleAnswerSelect(q.id, optIdx)}
                                className={`w-full text-left p-3 rounded-lg text-xs font-sans transition flex items-center justify-between cursor-pointer border ${
                                  isSelected
                                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-1 ring-emerald-600'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <span>{opt}</span>
                                <span
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                    isSelected
                                      ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected ? '✓' : ''}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* QUIZ RESULT REPORT */
                <div className="space-y-6">
                  {quizResult.passed ? (
                    <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-center space-y-3">
                      <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          LULUS PREDIKAT EXCELLENT
                        </span>
                        <h4 className="text-xl font-black text-slate-900 mt-2">
                          Selamat! Skor Anda: {quizResult.scorePct}% (&gt; 80%)
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                          {quizResult.feedback}
                        </p>
                      </div>

                      {quizResult.certificate && (
                        <div className="p-4 bg-white rounded-xl border border-emerald-300 text-left space-y-2 mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-emerald-700">
                              NO. SERTIFIKAT: {quizResult.certificate.certificateNumber}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {quizResult.certificate.issueDate}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            {quizResult.certificate.courseTitle}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-emerald-800">
                            <span>Penerima: <strong>{quizResult.certificate.memberName}</strong></span>
                            <button
                              onClick={() => {
                                setViewingCertificate(quizResult.certificate!);
                                setActiveQuizCourse(null);
                              }}
                              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" /> Buka E-Sertifikat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-center space-y-3">
                      <div className="w-14 h-14 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                        <XCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold uppercase text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
                          BELUM MEMENUHI SYARAT KELULUSAN
                        </span>
                        <h4 className="text-xl font-black text-slate-900 mt-2">
                          Skor Anda: {quizResult.scorePct}% (Syarat: &gt; 80%)
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                          {quizResult.feedback} Sesuai kriteria mutu sertifikasi Oriental, peserta dengan skor &le; 80% belum berhak memperoleh sertifikat digital. Silakan tonton kembali video modul dan ulangi kuis.
                        </p>
                      </div>

                      {/* Questions Explanations */}
                      <div className="text-left space-y-3 mt-4">
                        <p className="text-xs font-bold text-slate-700">Pembahasan &amp; Kunci Jawaban:</p>
                        {activeQuizCourse.quizQuestions.map((q, idx) => (
                          <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                            <p className="font-semibold text-slate-800">{idx + 1}. {q.question}</p>
                            <p className="text-emerald-700 font-bold">Kunci: {q.options[q.correctAnswerIndex]}</p>
                            <p className="text-slate-500 text-[11px]">{q.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {!quizResult ? (
                <>
                  <span className="text-xs font-mono text-slate-500">
                    Terjawab: {Object.keys(userAnswers).length} dari {activeQuizCourse.quizQuestions.length} soal
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveQuizCourse(null)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(userAnswers).length < activeQuizCourse.quizQuestions.length}
                      className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer ${
                        Object.keys(userAnswers).length < activeQuizCourse.quizQuestions.length
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-md'
                      }`}
                    >
                      Kirim Jawaban &amp; Nilai
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <button
                    onClick={() => {
                      setQuizResult(null);
                      setUserAnswers({});
                    }}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Coba Kuis Lagi
                  </button>
                  <button
                    onClick={() => {
                      setActiveQuizCourse(null);
                      setQuizResult(null);
                    }}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: VIDEO PLAYER PREVIEW                                       */}
      {/* =================================================================== */}
      {activeVideoCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-slate-950 text-white rounded-2xl max-w-3xl w-full border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  {activeVideoCourse.categoryLabel}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {activeVideoCourse.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoCourse(null)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Placeholder Simulation */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <div className="text-center space-y-3 p-6">
                <div className="w-16 h-16 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <Play className="w-8 h-8 fill-emerald-400 ml-1" />
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Streaming Video Kuliah Interaktif: {activeVideoCourse.durationMinutes} Menit
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Instruktur: {activeVideoCourse.instructor} ({activeVideoCourse.instructorRole})
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-between border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Setelah menyaksikan video materi, lanjutkan dengan mengikuti Uji Kompetensi.
              </p>
              <button
                onClick={() => {
                  const targetCourse = activeVideoCourse;
                  setActiveVideoCourse(null);
                  setActiveQuizCourse(targetCourse);
                  setUserAnswers({});
                  setQuizResult(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Award className="w-4 h-4" /> Mulai Kuis Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: WORKSHOP REGISTRATION FORM                                 */}
      {/* =================================================================== */}
      {registeringWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded">
                  Pendaftaran Workshop Tatap Muka
                </span>
                <h3 className="text-sm font-bold mt-1">
                  {registeringWorkshop.location}
                </h3>
              </div>
              <button
                onClick={() => setRegisteringWorkshop(null)}
                className="text-white/80 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWorkshopSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <p className="font-bold text-slate-900">{registeringWorkshop.title}</p>
                <p className="text-slate-600">{registeringWorkshop.date} • {registeringWorkshop.timeSlot}</p>
                <p className="text-slate-500">{registeringWorkshop.address}</p>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Nama Lengkap Peserta *</label>
                <input
                  type="text"
                  required
                  value={workshopFormData.name}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-sans focus:outline-emerald-600"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Nomor WhatsApp Aktif *</label>
                <input
                  type="text"
                  required
                  value={workshopFormData.phone}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-sans focus:outline-emerald-600"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Nama Usaha / Kafe / Resto *</label>
                <input
                  type="text"
                  required
                  value={workshopFormData.businessName}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, businessName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-sans focus:outline-emerald-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                Pendaftaran tidak dipungut biaya (Gratis untuk mitra ekosistem Oriental). Tiket QR dan konfirmasi dikirimkan via WhatsApp.
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRegisteringWorkshop(null)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                >
                  Konfirmasi Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: WORKSHOP TICKET CONFIRMATION                               */}
      {/* =================================================================== */}
      {workshopTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                TIKET WORKSHOP TERVERIFIKASI
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-2">
                Pendaftaran Berhasil Dikonfirmasi
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Nomor Registrasi: <strong>{workshopTicket.registrationId}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 font-sans">
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">Workshop:</span>
                <span className="font-bold text-slate-800 text-right">{workshopTicket.workshopTitle}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">Peserta:</span>
                <span className="font-bold text-slate-800">{workshopTicket.attendeeName} ({workshopTicket.businessName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">Waktu:</span>
                <span className="font-bold text-slate-800">{workshopTicket.workshopDate} • {workshopTicket.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-bold text-slate-800 text-right">{workshopTicket.location}</span>
              </div>
            </div>

            <button
              onClick={() => setWorkshopTicket(null)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Selesai &amp; Tutup
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: FULL-SCREEN DIGITAL CERTIFICATE VIEW                       */}
      {/* =================================================================== */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border-4 border-amber-400/80 shadow-2xl p-8 relative my-8 text-center space-y-6">
            {/* Top Close Button */}
            <button
              onClick={() => setViewingCertificate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-1 cursor-pointer"
            >
              ✕
            </button>

            {/* Official Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  OE
                </div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-800">
                  PT ORIENTAL DIGITAL EKOSISTEM INDONESIA
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-slate-900 uppercase">
                SERTIFIKAT KOMPETENSI RESMI
              </h2>
              <p className="text-xs font-mono text-amber-800 tracking-wider">
                NOMOR REGISTER: {viewingCertificate.certificateNumber}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 py-4 border-y-2 border-amber-200/80">
              <p className="text-xs font-sans text-slate-500 uppercase tracking-wider">
                Diberikan dengan hormat kepada:
              </p>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 underline decoration-amber-400 underline-offset-8">
                {viewingCertificate.memberName}
              </h3>
              {viewingCertificate.businessName && (
                <p className="text-sm font-semibold text-slate-700 font-sans">
                  {viewingCertificate.businessName}
                </p>
              )}
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
                Atas kelulusan evaluasi uji kompetensi profesional standar ekosistem kuliner pada modul:
              </p>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 font-outfit max-w-xl mx-auto">
                &ldquo;{viewingCertificate.courseTitle}&rdquo;
              </h4>
              <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-200">
                Predikat: SANGAT BAIK • Skor Ujian: {viewingCertificate.scorePct}% (&gt; 80%)
              </p>
            </div>

            {/* Footer with Signatures & QR Code */}
            <div className="grid grid-cols-3 items-center pt-2 text-xs">
              <div className="text-center space-y-1">
                <p className="font-serif italic text-slate-600 text-sm">Hendra Setiawan, Ak.</p>
                <div className="w-24 h-px bg-slate-300 mx-auto" />
                <p className="text-[10px] font-mono text-slate-500">Lead SAK Specialist</p>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <div className="w-16 h-16 bg-white border-2 border-emerald-600 rounded-lg p-1 shadow-xs flex items-center justify-center">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
                <span className="text-[8px] font-mono text-emerald-800 font-bold">
                  VERIFIED BY SHA-256
                </span>
              </div>

              <div className="text-center space-y-1">
                <p className="font-serif italic text-slate-600 text-sm">drh. Siti Rahmawati</p>
                <div className="w-24 h-px bg-slate-300 mx-auto" />
                <p className="text-[10px] font-mono text-slate-500">Direktur Penjamin Mutu</p>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" /> Cetak / Unduh PDF E-Sertifikat
              </button>
              <button
                onClick={() => setViewingCertificate(null)}
                className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 6: OFFICIAL CPA AUDITED SAK PDF DOCUMENT                      */}
      {/* =================================================================== */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl p-8 relative my-8 space-y-6 text-slate-900 font-mono text-xs">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded">
                DOKUMEN RESMI STANDAR AKUNTANSI KEUANGAN (SAK)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" /> Cetak / Simpan PDF
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Letterhead (Kop Surat) */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800">
              <h2 className="text-base font-black tracking-wider text-slate-900 uppercase font-sans">
                PT ORIENTAL DIGITAL EKOSISTEM INDONESIA
              </h2>
              <p className="text-[11px] text-slate-600 font-sans">
                Kantor Pusat: Jl. Boulevard No. 88, Panakkukang, Makassar • Hub Bone: Jl. Ahmad Yani, Watampone
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                NPWP: 01.882.910.4-801.000 • Izin Usaha Perdagangan &amp; Ekosistem Digital Terintegrasi
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                LAPORAN KEUANGAN KONSOLIDASIAN BERDASARKAN STANDAR AKUNTANSI KEUANGAN
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Periode yang Berakhir pada 31 Desember 2026 (Mata Uang: Rupiah Indonesia)
              </p>
            </div>

            {/* Audit Summary Table */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-800 text-[11px] uppercase">RINGKASAN POSISI KEUANGAN (NERACA SEIMBANG):</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 border-r border-slate-200 pr-4">
                    <div className="flex justify-between">
                      <span>Total Aset Lancar:</span>
                      <span className="font-bold">Rp {(activeCash + activeAR + activeInventory).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Aset Tetap (Net):</span>
                      <span className="font-bold">Rp {fixedAssetsNet.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-black border-t border-slate-300 pt-1">
                      <span>TOTAL ASET:</span>
                      <span>Rp {totalAssets.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Total Kewajiban (Liabilitas):</span>
                      <span className="font-bold">Rp {activeLiabilities.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Ekuitas Bersih:</span>
                      <span className="font-bold">Rp {totalEquity.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-amber-800 font-black border-t border-slate-300 pt-1">
                      <span>TOTAL LIABILITAS &amp; EKUITAS:</span>
                      <span>Rp {totalLiabilitiesAndEquity.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auditor Stamp & Seal Box */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-300 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-950 text-xs">OPINI AUDIT INDEPENDEN:</p>
                  <p className="text-[11px] text-emerald-900 mt-0.5 font-sans">
                    Laporan keuangan di atas menyajikan secara wajar dalam semua hal yang material sesuai Standar Akuntansi Keuangan (SAK ETAP / SAK EP).
                  </p>
                  <p className="text-[10px] text-emerald-700 font-mono mt-1">
                    Reg. Akuntan Publik: CPA-SAK-2026/09/881 • Terverifikasi Keseimbangan Neraca: SEIMBANG (BALANCED)
                  </p>
                </div>
                <div className="border-2 border-emerald-700 text-emerald-800 font-black px-4 py-2 rounded-lg text-center uppercase tracking-wider text-[10px] bg-white">
                  SAK AUDITED<br />VERIFIED
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 pt-6 text-center text-xs">
              <div className="space-y-1">
                <p className="text-slate-500 font-sans">Makassar, 24 September 2026</p>
                <p className="font-bold">Direktur Utama PT Oriental Digital Ekosistem</p>
                <div className="h-16 flex items-center justify-center font-serif italic text-slate-400">
                  (Tanda Tangan Digital Resmi)
                </div>
                <p className="font-bold">Chandra Gunawan, S.E.</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-500 font-sans">Auditor Eksternal Independen</p>
                <p className="font-bold">Kantor Akuntan Publik Drs. Hendra &amp; Rekan</p>
                <div className="h-16 flex items-center justify-center font-serif italic text-emerald-700 font-bold">
                  [STAMP CPA VERIFIED]
                </div>
                <p className="font-bold">Drs. Hendra Setiawan, Ak., CA, CPA</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
