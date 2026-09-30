import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Building2,
  FileSpreadsheet,
  Check,
  Sparkles,
  QrCode,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Store,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { CustomerSegment, RegionCode, RegisterMemberDto } from '@oriental/types';

interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: RegisterMemberDto) => void;
}

export const MemberRegistrationModal: React.FC<MemberRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeStep, setActiveStep] = useState<'DATA_AWAL' | 'PROFIL_BISNIS' | 'SURVEY'>('DATA_AWAL');

  // Form Fields State matching Template Form Costumer One Identity.xlsx
  const [regionCode, setRegionCode] = useState<RegionCode>(RegionCode.WATAMPONE);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nik, setNik] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Pria' | 'Wanita'>('Pria');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [segment, setSegment] = useState<CustomerSegment>(CustomerSegment.B2C_RETAIL);

  // Business Profile (Bisnis 1)
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Warung');
  const [businessLocation, setBusinessLocation] = useState('');
  const [picName, setPicName] = useState('');
  const [picRole, setPicRole] = useState('Pemilik / Owner');
  const [picWhatsapp, setPicWhatsapp] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [businessModel, setBusinessModel] = useState('Single Ownership');
  const [featuredProducts, setFeaturedProducts] = useState<string[]>(['Indonesian Food']);

  // Survey Data
  const [outletCount, setOutletCount] = useState(1);
  const [monthlySpendEstimate, setMonthlySpendEstimate] = useState('Rp. 15 Jt - 30 Jt');
  const [mainRawMaterials, setMainRawMaterials] = useState<string[]>(['Bahan Masakan', 'Bumbu Dapur']);
  const [posUsage, setPosUsage] = useState<'Pakai' | 'Sedang bertimbang untuk pakai' | 'Tidak pakai'>('Pakai');
  const [managementStructure, setManagementStructure] = useState('Tidak ada, saya mengelola Sendiri');
  const [businessGoals, setBusinessGoals] = useState<string[]>(['Buka Cabang']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('Nama Lengkap dan Nomor WhatsApp Aktif wajib diisi!');
      return;
    }

    const dto: RegisterMemberDto = {
      regionCode,
      fullName,
      phone,
      nik: nik || undefined,
      birthDate: birthDate || undefined,
      gender,
      email: email || undefined,
      address: address || undefined,
      segment,
      businessName: businessName || undefined,
      businessType: businessName ? businessType : undefined,
      businessLocation: businessName ? businessLocation : undefined,
      picName: businessName ? picName || fullName : undefined,
      picRole: businessName ? picRole : undefined,
      picWhatsapp: businessName ? picWhatsapp || phone : undefined,
      socialMedia: businessName ? socialMedia : undefined,
      businessModel: businessName ? businessModel : undefined,
      featuredProducts: businessName ? featuredProducts : undefined,
      outletCount: businessName ? outletCount : 1,
      monthlySpendEstimate,
      mainRawMaterials,
      posUsage,
      managementStructure,
      businessGoals,
    };

    onSubmit(dto);
    onClose();
  };

  const toggleRawMaterial = (item: string) => {
    setMainRawMaterials((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const toggleFeaturedProduct = (item: string) => {
    setFeaturedProducts((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const toggleGoal = (item: string) => {
    setBusinessGoals((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                  Sesuai Template Form Costumer One Identity
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Pendaftaran Member One Identity
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep('DATA_AWAL')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeStep === 'DATA_AWAL'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>1. Data Awal & ID Retail</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('PROFIL_BISNIS')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeStep === 'PROFIL_BISNIS'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>2. Profil Bisnis (B2B/UKM)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('SURVEY')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeStep === 'SURVEY'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>3. Survey Kebutuhan & Belanja</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
          {/* STEP 1: DATA AWAL & ID RETAIL */}
          {activeStep === 'DATA_AWAL' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between">
                <div>
                  <p className="font-bold">Format Penomoran Standar One Identity Oriental:</p>
                  <p className="text-[11px] font-mono mt-0.5 text-slate-600">
                    Kode Daerah ({regionCode}) - YYMMDD - No. Urut (Contoh: {regionCode}-260923-01)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRegionCode(RegionCode.WATAMPONE)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      regionCode === RegionCode.WATAMPONE
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-300'
                    }`}
                  >
                    102 (Watampone/Bone)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegionCode(RegionCode.MAKASSAR)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      regionCode === RegionCode.MAKASSAR
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-300'
                    }`}
                  >
                    101 (Makassar)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Nama Lengkap Pemilik <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Catur / Ibu Rahmawati"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Nomor KTP (NIK) <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="730801xxxxxxxxxx (16 Digit)"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Alamat E-Mail Aktif <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="nama@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Jenis Kelamin</label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === 'Pria'}
                        onChange={() => setGender('Pria')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Pria</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === 'Wanita'}
                        onChange={() => setGender('Wanita')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Wanita</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-700 font-semibold block mb-1">
                    Alamat Domisili / Rumah
                  </label>
                  <input
                    type="text"
                    placeholder="Jl. Ahmad Yani No. 12, Watampone"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-700 font-semibold block mb-1">
                    Segmen Utama Pelanggan
                  </label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs font-semibold text-xs"
                  >
                    <option value={CustomerSegment.B2C_RETAIL}>Member Swalayan Retail (B2C)</option>
                    <option value={CustomerSegment.B2B_GROSIR}>Member Grosir Partai Besar (B2B)</option>
                    <option value={CustomerSegment.B2B_RESTAURANT}>UKM Kuliner: Restoran / Rumah Makan</option>
                    <option value={CustomerSegment.B2B_CAFE}>UKM Kuliner: Café</option>
                    <option value={CustomerSegment.B2B_COFFEESHOP}>UKM Kuliner: Coffee Shop</option>
                    <option value={CustomerSegment.B2B_WARUNG}>UKM Kuliner: Warung Makan / Kaki Lima</option>
                    <option value={CustomerSegment.B2B_HOTEL}>Horeka: Hotel & Hospitality</option>
                    <option value={CustomerSegment.MITRA_WASTE}>Mitra Penyedia Tempat Waste Daur Ulang</option>
                    <option value={CustomerSegment.MITRA_WHITE_LABEL}>Mitra Maklon White Label Produksi</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROFIL BISNIS (B2B / UKM SUPPLY) */}
          {activeStep === 'PROFIL_BISNIS' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900">
                <p className="font-semibold">
                  Bagian ini diisi apabila member memiliki usaha/bisnis untuk mendapatkan kode turunan UKM Supply (-100) atau Grosir (-900).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Nama Bisnis / Usaha</label>
                  <input
                    type="text"
                    placeholder="Contoh: RM Maliku Fried Chicken / Café Simpang Badik"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Bentuk Usaha</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  >
                    <option>Warung</option>
                    <option>Café</option>
                    <option>Coffee Shop</option>
                    <option>Restoran</option>
                    <option>Hotel</option>
                    <option>Tenant</option>
                    <option>Toko</option>
                    <option>Preorder</option>
                    <option>Grosir</option>
                    <option>Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Nama PIC & Jabatan</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama PIC"
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                      className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Jabatan"
                      value={picRole}
                      onChange={(e) => setPicRole(e.target.value)}
                      className="w-28 p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Nomor WhatsApp PIC</label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={picWhatsapp}
                    onChange={(e) => setPicWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Alamat & Lokasi Bisnis</label>
                  <input
                    type="text"
                    placeholder="Jl. Merdeka No. 4, Watampone"
                    value={businessLocation}
                    onChange={(e) => setBusinessLocation(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Model Bisnis</label>
                  <select
                    value={businessModel}
                    onChange={(e) => setBusinessModel(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  >
                    <option>Single Ownership</option>
                    <option>Product Distribution Franchise</option>
                    <option>Business Format Franchise</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-700 font-semibold block mb-1.5">
                    Produk Unggulan Bisnis (Pilih yang relevan):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Indonesian Food',
                      'Chinese Food',
                      'Signature Coffee',
                      'Signature Non-Coffee',
                      'Roti & Bakery',
                      'Pastry',
                      'Kemasan Plastik',
                      'Frozen Food Olahan',
                    ].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleFeaturedProduct(item)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                          featuredProducts.includes(item)
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SURVEY KEBUTUHAN & BELANJA */}
          {activeStep === 'SURVEY' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Jumlah Outlet Saat Ini</label>
                  <input
                    type="number"
                    min="1"
                    value={outletCount}
                    onChange={(e) => setOutletCount(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Estimasi Nominal Belanja Perbulan
                  </label>
                  <select
                    value={monthlySpendEstimate}
                    onChange={(e) => setMonthlySpendEstimate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs font-mono"
                  >
                    <option>&lt; Rp. 8.000.000</option>
                    <option>Rp. 8 Jt - 15 Jt</option>
                    <option>Rp. 15 Jt - 30 Jt</option>
                    <option>Rp. 30 Jt - 50 Jt</option>
                    <option>Rp. 50 Jt - 80 Jt</option>
                    <option>Rp. 80 Jt - 120 Jt</option>
                    <option>Rp. 120 Jt - 150 Jt</option>
                    <option>&gt; Rp. 150.000.000</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Apakah Bisnis Menggunakan POS?
                  </label>
                  <select
                    value={posUsage}
                    onChange={(e) => setPosUsage(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  >
                    <option>Pakai</option>
                    <option>Sedang bertimbang untuk pakai</option>
                    <option>Tidak pakai</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Struktur Manajemen Bisnis
                  </label>
                  <select
                    value={managementStructure}
                    onChange={(e) => setManagementStructure(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs text-xs"
                  >
                    <option>Tidak ada, saya mengelola Sendiri</option>
                    <option>Ada Divisi (Keuangan/Pajak/Operasional)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-700 font-semibold block mb-1.5">
                    Kebutuhan Utama Bahan Baku Bisnis:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Frozen Food Olahan',
                      'Bahan Masakan',
                      'Bahan Minuman',
                      'Kemasan Plastik',
                      'Bumbu Dapur',
                      'Daging Fresh',
                      'Frozen Daging',
                      'Sayur & Buah Segar',
                      'Sayur & Buah Beku',
                      'Cemilan Instan',
                    ].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleRawMaterial(item)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                          mainRawMaterials.includes(item)
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-700 font-semibold block mb-1.5">
                    Mimpi / Rencana Pengembangan Bisnis:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Buka Cabang', 'Tambah Bisnis', 'Perbaiki Management', 'Penambahan Menu'].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleGoal(item)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                          businessGoals.includes(item)
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex gap-2">
              {activeStep !== 'DATA_AWAL' && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveStep(activeStep === 'SURVEY' ? 'PROFIL_BISNIS' : 'DATA_AWAL')
                  }
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  Kembali
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {activeStep !== 'SURVEY' ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveStep(activeStep === 'DATA_AWAL' ? 'PROFIL_BISNIS' : 'SURVEY')
                  }
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Lanjut ke Langkah Berikutnya
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Simpan & Terbitkan ID One Identity
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
