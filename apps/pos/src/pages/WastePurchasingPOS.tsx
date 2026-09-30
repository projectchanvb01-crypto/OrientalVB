import React, { useState } from 'react';
import {
  Recycle,
  Scale,
  Users,
  Building2,
  DollarSign,
  Printer,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Droplets,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import { WastePurchaseRecord, WasteLocationPartner } from '@oriental/types';

export const WastePurchasingPOS: React.FC = () => {
  const {
    wasteCategories,
    wastePartners,
    wasteHistory,
    recordWastePurchase,
    membersList,
    activeMember,
    financials,
    wasteSettlementClaims,
    generateWasteSettlementClaim,
  } = useEcosystem();

  // Active view tab: POS Kasir Timbang or Rekapitulasi & Mitra
  const [activeSubTab, setActiveSubTab] = useState<'POS' | 'HISTORY' | 'PARTNERS'>('POS');

  // Form State: Penimbangan
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>(
    wasteCategories[0]?.code || 'UCO-JELANTAH',
  );
  const [grossWeight, setGrossWeight] = useState<number>(25.0);
  const [tareWeight, setTareWeight] = useState<number>(1.0); // Tara default jerigen 25L
  const [containerType, setContainerType] = useState<string>('JERIGEN_25L');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    wastePartners[0]?.id || '',
  );

  // Penyetor Member One Identity vs Non-Member
  const [isMember, setIsMember] = useState<boolean>(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeMember.id);
  const [nonMemberName, setNonMemberName] = useState<string>('');
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [notes, setNotes] = useState<string>('Jerigen minyak dalam kondisi tertutup baik');

  // Modal Cetak Nota Timbangan
  const [latestReceipt, setLatestReceipt] = useState<WastePurchaseRecord | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Selected Category Data
  const currentCategory =
    wasteCategories.find((c) => c.code === selectedCategoryCode) || wasteCategories[0];
  const selectedPartner =
    wastePartners.find((p) => p.id === selectedPartnerId) || wastePartners[0];

  // Weight Calculations
  const netWeight = Math.max(0, Number((grossWeight - tareWeight).toFixed(2)));
  const buyingPricePerKg = currentCategory?.buyingPricePerKg || 8000;
  const factorySellingPricePerKg = currentCategory?.factorySellingPricePerKg || 10500;

  // Financial Calculations
  const totalCostPaid = Math.round(netWeight * buyingPricePerKg);
  const factoryEstimatedTotal = Math.round(netWeight * factorySellingPricePerKg);
  const grossMargin = factoryEstimatedTotal - totalCostPaid;

  // PRD v2.1 Addendum §2.3: Sharing flat 5% dari Total Nilai Beli yang dibayarkan ke Nasabah
  const partnerProfitSharePct = 5;
  const partnerEarnedAmount = Math.round((totalCostPaid * partnerProfitSharePct) / 100);
  const orientalNetMargin = grossMargin - partnerEarnedAmount;

  // Payout Method: Tunai vs Dompet Oriental Pay
  const [payoutMethod, setPayoutMethod] = useState<'CASH' | 'ORIENTAL_PAY'>('CASH');

  // PRD RULE: 1 kg = 1 Poin Member
  const pointsAwarded = Math.floor(netWeight);

  // Filter Members for Search
  const filteredMembers = membersList.filter(
    (m) =>
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone.includes(memberSearch) ||
      (m.businessName && m.businessName.toLowerCase().includes(memberSearch.toLowerCase())),
  );

  const selectedMemberObj = membersList.find((m) => m.id === selectedMemberId);

  // Container presets
  const handlePresetContainer = (type: string, tare: number) => {
    setContainerType(type);
    setTareWeight(tare);
  };

  // Weight increment helper
  const addWeight = (delta: number) => {
    setGrossWeight((prev) => Number((Math.max(0, prev + delta)).toFixed(2)));
  };

  // Submit Waste Transaction
  const handleProcessTransaction = () => {
    if (netWeight <= 0) {
      alert('Berat bersih timbangan harus lebih dari 0 kg!');
      return;
    }

    const sellerName = isMember
      ? selectedMemberObj
        ? `${selectedMemberObj.fullName} (${selectedMemberObj.businessName || selectedMemberObj.memberCode})`
        : 'Member Terdaftar'
      : nonMemberName.trim() || 'Penyetor Umum (Non-Member)';

    const sellerMemberId = isMember ? selectedMemberId : 'NON_MEMBER';

    const record = recordWastePurchase({
      sellerMemberId,
      sellerName,
      operatorId: 'usr-operator-waste',
      locationPartnerId: selectedPartner?.id || 'prt-mks-01',
      wasteCategory: currentCategory.name,
      grossWeightKg: grossWeight,
      tareWeightKg: tareWeight,
      netWeightKg: netWeight,
      pricePerKg: buyingPricePerKg,
      factorySellingPricePerKg,
      partnerProfitSharePct,
      qualityGrade: selectedCategoryCode.includes('SUPER') ? 'SUPER' : 'STANDAR',
      notes,
      payoutMethod: isMember ? payoutMethod : 'CASH',
    });

    setLatestReceipt(record);
    setShowReceiptModal(true);

    // Reset weight input for next queue
    setGrossWeight(0);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl bg-gradient-to-r from-amber-900/90 via-amber-800 to-amber-950 text-white border border-amber-500/30 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
              Sprint 4 • Reverse Logistics & Ekonomi Sirkular
            </span>
            <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-mono font-medium">
              1 Kg = 1 Poin Member
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-outfit text-white">
            Pusat Pembelian Limbah (Waste Purchasing POS)
          </h1>
          <p className="text-xs text-amber-100/90 max-w-2xl leading-relaxed">
            Pencatatan penimbangan digital komoditas <strong className="text-amber-300">Minyak Jelantah (Used Cooking Oil / UCO)</strong>, konversi poin loyalitas, serta kalkulasi otomatis bagi hasil tempat <strong className="text-amber-300">flat 5% dari Nilai Beli Nasabah</strong> (PRD v2.1 Addendum §2.3).
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex gap-3 text-right font-mono">
          <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <p className="text-[10px] text-amber-200 uppercase font-semibold">Total Jelantah</p>
            <p className="text-lg font-black text-amber-300">
              {wasteHistory.reduce((s, h) => s + h.netWeightKg, 0).toFixed(1)} <span className="text-xs text-white">Kg</span>
            </p>
          </div>
          <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <p className="text-[10px] text-emerald-200 uppercase font-semibold">Utang Bagi Hasil Mitra (Flat 5%)</p>
            <p className="text-lg font-black text-emerald-300">
              Rp {financials.wastePayable.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('POS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'POS'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" /> Kasir Timbangan Minyak Jelantah
        </button>
        <button
          onClick={() => setActiveSubTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'HISTORY'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Riwayat Timbangan ({wasteHistory.length})
        </button>
        <button
          onClick={() => setActiveSubTab('PARTNERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'PARTNERS'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Mitra Drop Point & Bagi Hasil 5%
        </button>
      </div>

      {activeSubTab === 'POS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: Timbangan Digital & Komoditas (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Panel Pilihan Mutu Minyak Jelantah */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Komoditas Minyak Jelantah (UCO)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Active Commodity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wasteCategories.map((cat) => {
                  const isSelected = selectedCategoryCode === cat.code;
                  const isComingSoon = cat.isComingSoon;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        if (!isComingSoon) {
                          setSelectedCategoryCode(cat.code);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                        isComingSoon
                          ? 'border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed border-dashed'
                          : isSelected
                          ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 cursor-pointer'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 cursor-pointer'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-xs text-slate-900">{cat.name}</p>
                          {isSelected && !isComingSoon && <CheckCircle className="w-4 h-4 text-amber-600" />}
                          {isComingSoon && (
                            <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {cat.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Harga Beli:</span>
                          <span className="font-bold text-amber-700">
                            {isComingSoon ? '-' : `Rp ${cat.buyingPricePerKg.toLocaleString('id-ID')}/kg`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Jual Pabrik:</span>
                          <span className="font-bold text-emerald-700">
                            {isComingSoon ? '-' : `Rp ${cat.factorySellingPricePerKg.toLocaleString('id-ID')}/kg`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel Timbangan Digital (Live Scale Simulation) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-600" />
                  Indikator Timbangan Digital
                </span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                  Sensitivitas: 0.05 Kg
                </span>
              </div>

              {/* Digital LED Display */}
              <div className="bg-slate-950 p-6 rounded-2xl border-4 border-slate-800 text-center space-y-2 relative overflow-hidden shadow-inner">
                <div className="absolute top-3 left-4 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                  Oriental Digital Scale • Model ORT-WST2026
                </div>
                <div className="absolute top-3 right-4 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">STABLE</span>
                </div>

                <div className="py-4">
                  <span className="text-6xl font-black font-mono tracking-tight text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                    {netWeight.toFixed(2)}
                  </span>
                  <span className="text-2xl font-bold font-mono text-amber-500/80 ml-2">KG NETTO</span>
                </div>

                {/* Sub Weights Breakdown */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-slate-400 text-xs font-mono">
                  <div className="text-left pl-4">
                    <span>Bruto (Kotor): </span>
                    <strong className="text-slate-200">{grossWeight.toFixed(2)} Kg</strong>
                  </div>
                  <div className="text-right pr-4">
                    <span>Tara Wadah: </span>
                    <strong className="text-slate-200">{tareWeight.toFixed(2)} Kg</strong>
                  </div>
                </div>
              </div>

              {/* Quick Container / Tare Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">
                  Preset Wadah / Tara Berat
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetContainer('JERIGEN_5L', 0.25)}
                    className={`p-2 rounded-xl text-xs font-mono font-medium border text-center transition cursor-pointer ${
                      containerType === 'JERIGEN_5L'
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Jerigen 5L (0.25 kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetContainer('JERIGEN_18L', 0.8)}
                    className={`p-2 rounded-xl text-xs font-mono font-medium border text-center transition cursor-pointer ${
                      containerType === 'JERIGEN_18L'
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Jerigen 18L (0.80 kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetContainer('JERIGEN_25L', 1.0)}
                    className={`p-2 rounded-xl text-xs font-mono font-medium border text-center transition cursor-pointer ${
                      containerType === 'JERIGEN_25L'
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Jerigen 25L (1.00 kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetContainer('DRUM_200L', 8.5)}
                    className={`p-2 rounded-xl text-xs font-mono font-medium border text-center transition cursor-pointer ${
                      containerType === 'DRUM_200L'
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Drum 200L (8.50 kg)
                  </button>
                </div>
              </div>

              {/* Quick Weight Adjusters */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">
                  Input / Tambah Berat Cepat (Bruto)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addWeight(1)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    +1 Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => addWeight(5)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    +5 Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => addWeight(10)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    +10 Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => addWeight(25)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    +25 Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => addWeight(50)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    +50 Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrossWeight(0)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-mono font-bold transition cursor-pointer ml-auto"
                  >
                    Zero / Reset
                  </button>
                </div>
              </div>

              {/* Manual Input Override */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">
                    Input Manual Bruto (Kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={grossWeight || ''}
                    onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">
                    Input Manual Tara (Kg):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={tareWeight || ''}
                    onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Penyetor, Mitra Tempat & Checkout (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Lokasi Mitra Drop Point */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  Mitra Penyedia Tempat (Drop Point)
                </span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                  Sharing: Flat 5% Nilai Beli
                </span>
              </div>

              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
              >
                {wastePartners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location}) - PIC: {p.contactPerson}
                  </option>
                ))}
              </select>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Kontak PIC:</span>
                  <span className="font-bold text-slate-800">{selectedPartner?.phone}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Jelantah Mitra:</span>
                  <span className="font-bold text-amber-700">{selectedPartner?.totalWeightCollectedKg} kg</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Akumulasi Saldo Bagi Hasil (10%):</span>
                  <span className="font-bold text-emerald-700">Rp {selectedPartner?.totalEarnings.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Identitas Penyetor (Universal Access: Member One Identity / Umum) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Identitas Penyetor Limbah
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setIsMember(true)}
                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                      isMember ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Member (Poin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMember(false)}
                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                      !isMember ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Non-Member
                  </button>
                </div>
              </div>

              {isMember ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari Member (Nama, Kode, No HP)..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    {filteredMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.businessName || m.memberCode}) - Poin: {m.totalLoyaltyPoints} pt
                      </option>
                    ))}
                  </select>

                  {selectedMemberObj && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-mono flex items-center justify-between text-emerald-900">
                      <div>
                        <p className="font-bold">{selectedMemberObj.fullName}</p>
                        <p className="text-[10px] text-emerald-700">Kode: {selectedMemberObj.memberCode}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-700 block">Poin Bertambah:</span>
                        <span className="font-extrabold text-xs text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                          +{pointsAwarded} Poin
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">
                    Nama Penyetor Umum / Pengepul Mandiri:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pak Daeng Sampara (Pengepul Losari)"
                    value={nonMemberName}
                    onChange={(e) => setNonMemberName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic font-mono">
                    *Penyetor non-member tidak mendapatkan akumulasi poin undian.
                  </p>
                </div>
              )}

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Catatan Mutu / Kondisi:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Kalkulasi Finansial SAK & Bagi Hasil */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Ringkasan Kalkulasi Finansial SAK
                </span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  Double-Entry
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Berat Bersih (Netto):</span>
                  <span className="font-bold text-slate-900">{netWeight.toFixed(2)} Kg</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tarif Beli ke Penyetor:</span>
                  <span className="font-bold text-slate-900">
                    Rp {buyingPricePerKg.toLocaleString('id-ID')} / kg
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimasi Jual ke Pabrik:</span>
                  <span className="font-bold text-slate-700">
                    Rp {factorySellingPricePerKg.toLocaleString('id-ID')} / kg
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span>Margin Kotor (Gross Margin):</span>
                  <span className="font-bold text-amber-700">
                    Rp {grossMargin.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                  <div>
                    <span className="font-bold block">Bagi Hasil Mitra Tempat (Flat 5% Nilai Beli):</span>
                    <span className="text-[10px] text-emerald-600">Dicatat pada Biaya Operasional Drop Point</span>
                  </div>
                  <span className="font-bold text-sm">
                    Rp {partnerEarnedAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 text-[11px]">
                  <span>Margin Bersih Oriental:</span>
                  <span className="font-bold text-slate-900">
                    Rp {orientalNetMargin.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Total Uang yang Dibayarkan ke Penyetor */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block font-mono">
                    Total Pembayaran ke Penyetor
                  </span>
                  <span className="text-xl font-black font-mono text-amber-700">
                    Rp {totalCostPaid.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono block">Reward Poin:</span>
                  <span className="text-sm font-bold font-mono text-emerald-700">
                    {pointsAwarded} Poin
                  </span>
                </div>
              </div>

              {/* Pilihan Metode Pencairan / Payout */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Metode Pembayaran ke Penyetor:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('CASH')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      payoutMethod === 'CASH'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Uang Tunai (Cash)</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isMember}
                    onClick={() => setPayoutMethod('ORIENTAL_PAY')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      !isMember
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : payoutMethod === 'ORIENTAL_PAY'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs cursor-pointer'
                        : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50 cursor-pointer'
                    }`}
                    title={!isMember ? 'Hanya untuk Member One Identity' : 'Kredit langsung ke dompet Oriental Pay'}
                  >
                    <span>Dompet Oriental Pay</span>
                  </button>
                </div>
                {payoutMethod === 'ORIENTAL_PAY' && isMember && (
                  <p className="text-[10px] text-purple-700 bg-purple-50 p-2 rounded-lg font-medium border border-purple-200">
                    💡 Dana Rp {totalCostPaid.toLocaleString('id-ID')} akan langsung dikreditkan ke saldo dompet Oriental Pay {selectedMemberObj?.fullName || 'Member'}. Bebas biaya potongan.
                  </p>
                )}
              </div>

              {/* Tombol Eksekusi Pembayaran */}
              <button
                type="button"
                onClick={handleProcessTransaction}
                disabled={netWeight <= 0}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
                  netWeight > 0
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <DollarSign className="w-4 h-4" /> Selesaikan Pembelian & Cetak Nota Timbang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: History Penimbangan */}
      {activeSubTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Buku Log Timbangan & Pembelian Limbah
            </h2>
            <span className="text-xs font-mono text-slate-500">
              Total Transaksi: <strong>{wasteHistory.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Nota</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Penyetor</th>
                  <th className="py-2.5 px-3">Drop Point</th>
                  <th className="py-2.5 px-3 text-right">Netto (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Biaya Dibayar</th>
                  <th className="py-2.5 px-3 text-right">Fee Mitra (10%)</th>
                  <th className="py-2.5 px-3 text-center">Poin</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {wasteHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-amber-700">{item.receiptNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}{' '}
                      {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{item.sellerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.locationPartnerName}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.netWeightKg.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-900">
                      Rp {item.totalCostPaid.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      Rp {item.partnerEarnedAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        +{item.pointsAwarded}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setLatestReceipt(item);
                          setShowReceiptModal(true);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold transition cursor-pointer"
                      >
                        Lihat Nota
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Mitra Drop Point & Bagi Hasil */}
      {/* SUBTAB 3: Mitra Drop Point & Bagi Hasil 5% */}
      {activeSubTab === 'PARTNERS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wastePartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {partner.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    Sharing: Flat 5%
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{partner.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{partner.location}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>PIC Lapangan:</span>
                    <span className="font-bold text-slate-800">{partner.contactPerson}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>No. WhatsApp:</span>
                    <span className="font-bold text-slate-800">{partner.phone}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Jelantah Terkumpul:</span>
                    <span className="font-bold text-amber-700">{partner.totalWeightCollectedKg.toFixed(1)} Kg</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 bg-emerald-50 p-2 rounded-lg font-bold">
                    <span>Saldo Bagi Hasil:</span>
                    <span>Rp {partner.totalEarnings.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const period = '2026-09';
                    try {
                      const claim = generateWasteSettlementClaim(partner.id, period);
                      alert(`Klaim bagi hasil berhasil dibuat: ${claim.claimNumber} senilai Rp ${(claim.claimAmount || 0).toLocaleString('id-ID')} untuk ${partner.name}`);
                    } catch (e: any) {
                      alert(e.message || 'Gagal membuat klaim');
                    }
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer"
                >
                  Ajukan Klaim Bagi Hasil (Sep 2026)
                </button>
              </div>
            ))}
          </div>

          {/* Tabel Rekonsiliasi Klaim Bagi Hasil Mitra */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Buku Rekonsiliasi & Klaim Bagi Hasil Mitra (Flat 5%)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  SOP Addendum v2.1 §2.3: Rekonsiliasi settlement setiap akhir bulan berdasarkan akumulasi nilai timbangan.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                {wasteSettlementClaims.length} Klaim Tercatat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No. Klaim</th>
                    <th className="py-2.5 px-3">Mitra Drop Point</th>
                    <th className="py-2.5 px-3">Periode</th>
                    <th className="py-2.5 px-3 text-right">Volume (Kg)</th>
                    <th className="py-2.5 px-3 text-right">Nilai Beli Nasabah</th>
                    <th className="py-2.5 px-3 text-right">Bagi Hasil (5%)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {wasteSettlementClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{claim.claimNumber}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{claim.partnerName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{claim.periodMonth}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{claim.totalKgCollected.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-800">
                        Rp {(claim.totalCustomerPayout || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                        Rp {(claim.claimAmount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK NOTA BUKTI TIMBANG (Clean, Professional Receipt) */}
      {showReceiptModal && latestReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Recycle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 font-outfit">
                  Bukti Timbang & Pembayaran Limbah
                </h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Receipt Continuous Paper Simulation */}
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl font-mono text-xs space-y-2 text-slate-800">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm tracking-wider">ORIENTAL ECOSYSTEM</p>
                <p className="text-[10px] text-slate-500 uppercase">Divisi Pembelian Minyak Jelantah (UCO)</p>
                <p className="text-[10px] text-slate-500">Makassar - Watampone • Sulsel</p>
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Nota:</span>
                  <span className="font-bold">{latestReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal:</span>
                  <span>{new Date(latestReceipt.createdAt).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penyetor:</span>
                  <span className="font-bold">{latestReceipt.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Drop Point:</span>
                  <span>{latestReceipt.locationPartnerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Komoditas:</span>
                  <span>{latestReceipt.wasteCategory}</span>
                </div>
              </div>

              <div className="py-2 border-y border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Berat Kotor (Bruto):</span>
                  <span>{latestReceipt.grossWeightKg.toFixed(2)} Kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Tara Wadah:</span>
                  <span>-{latestReceipt.tareWeightKg.toFixed(2)} Kg</span>
                </div>
                <div className="flex justify-between font-bold text-amber-900 bg-amber-100/60 px-1 py-0.5 rounded">
                  <span>BERAT BERSIH (NETTO):</span>
                  <span>{latestReceipt.netWeightKg.toFixed(2)} KG</span>
                </div>
                <div className="flex justify-between">
                  <span>Harga per Kg:</span>
                  <span>Rp {latestReceipt.pricePerKg.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="pt-1 space-y-1">
                <div className="flex justify-between text-xs font-black">
                  <span>TOTAL TUNAI DIBAYARKAN:</span>
                  <span className="text-amber-700">Rp {latestReceipt.totalCostPaid.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                  <span>POIN MEMBER DIPEROLEH:</span>
                  <span>+{latestReceipt.pointsAwarded} Poin</span>
                </div>
              </div>

              <div className="pt-2 text-[9px] text-slate-400 text-center border-t border-dashed border-slate-300">
                Terima kasih atas kontribusi Anda dalam pelestarian lingkungan dan ekonomi sirkular Oriental.
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" /> Cetak Nota Thermal
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold font-mono transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
