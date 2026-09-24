import React, { useState } from 'react';
import {
  Factory,
  Package,
  ShoppingBag,
  FileCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Building,
  Award,
  ShieldCheck,
  PlusCircle,
  Truck,
  Search,
  DollarSign,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import { WhiteLabelB2BOrder, WhiteLabelBatchReceipt } from '@oriental/types';

export const WhiteLabelPortal: React.FC = () => {
  const {
    whiteLabelVendors,
    whiteLabelContracts,
    whiteLabelCatalog,
    whiteLabelReceipts,
    whiteLabelOrders,
    registerWhiteLabelVendor,
    createWhiteLabelContract,
    receiveWhiteLabelBatch,
    orderWhiteLabelProduct,
    membersList,
    activeMember,
    financials,
  } = useEcosystem();

  const [activeTab, setActiveTab] = useState<'B2B_CATALOG' | 'RECEIVE_BATCH' | 'CONTRACTS' | 'VENDORS'>('B2B_CATALOG');

  // Form State: B2B UKM Ordering
  const [selectedProductId, setSelectedProductId] = useState<string>(whiteLabelCatalog[0]?.id || '');
  const [orderQty, setOrderQty] = useState<number>(5);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(activeMember.id);
  const [latestOrder, setLatestOrder] = useState<WhiteLabelB2BOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);

  // Form State: Receive Batch (GRN)
  const [selectedContractId, setSelectedContractId] = useState<string>(whiteLabelContracts[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState<string>(`BATCH-${Date.now().toString().slice(-4)}`);
  const [receivedQty, setReceivedQty] = useState<number>(50);
  const [qcPassed, setQcPassed] = useState<boolean>(true);
  const [qcNotes, setQcNotes] = useState<string>('Lolos inspeksi organoleptik, kemasan steril utuh, tanggal kadaluarsa jelas.');
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [latestBatch, setLatestBatch] = useState<WhiteLabelBatchReceipt | null>(null);

  // Form State: Register Vendor
  const [showVendorModal, setShowVendorModal] = useState<boolean>(false);
  const [newVendorName, setNewVendorName] = useState<string>('');
  const [newCompanyName, setNewCompanyName] = useState<string>('');
  const [newContactPerson, setNewContactPerson] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newPirt, setNewPirt] = useState<string>('');
  const [newBpom, setNewBpom] = useState<string>('');
  const [newHalal, setNewHalal] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Bakery & Pastry');

  // Active product for B2B ordering
  const activeProduct = whiteLabelCatalog.find((p) => p.id === selectedProductId) || whiteLabelCatalog[0];
  const selectedCustomerObj = membersList.find((m) => m.id === selectedCustomerId) || activeMember;

  // USER DIRECTIVE: Nominal transaksi setiap Rp 10.000 = 1 Poin untuk Customer B2B UKM Supply
  const totalOrderAmount = (activeProduct?.priceToB2B || 0) * orderQty;
  const estimatedOrderPoints = Math.floor(totalOrderAmount / 10000);

  // Handle B2B Order Placement
  const handlePlaceOrder = () => {
    if (!activeProduct) return;
    if (orderQty <= 0) {
      alert('Jumlah pesanan harus lebih dari 0');
      return;
    }
    if (activeProduct.stockAvailable < orderQty) {
      alert(`Stok tidak mencukupi! Hanya tersedia ${activeProduct.stockAvailable} ${activeProduct.unit}`);
      return;
    }

    try {
      const order = orderWhiteLabelProduct({
        customerMemberId: selectedCustomerObj.id,
        customerName: `${selectedCustomerObj.fullName} (${selectedCustomerObj.businessName || 'Cafe/Resto'})`,
        customerSegment: selectedCustomerObj.segment,
        productId: activeProduct.id,
        quantity: orderQty,
      });

      setLatestOrder(order);
      setShowOrderModal(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Goods Receipt Note (GRN)
  const handleReceiveBatch = () => {
    if (receivedQty <= 0) {
      alert('Jumlah penerimaan batch harus lebih dari 0');
      return;
    }

    try {
      const receipt = receiveWhiteLabelBatch({
        contractId: selectedContractId,
        batchNumber,
        receivedQuantity: receivedQty,
        qcPassed,
        qcNotes,
      });

      setLatestBatch(receipt);
      setShowBatchModal(true);
      setBatchNumber(`BATCH-${Date.now().toString().slice(-4)}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Register Vendor
  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) {
      alert('Nama vendor wajib diisi');
      return;
    }

    registerWhiteLabelVendor({
      vendorName: newVendorName,
      companyName: newCompanyName || newVendorName,
      contactPerson: newContactPerson,
      phone: newPhone,
      address: newAddress,
      pirtNumber: newPirt,
      bpomNumber: newBpom,
      halalCertNumber: newHalal,
      qcSlaStandard: 'Good Manufacturing Practices (GMP) & HACCP',
      category: newCategory,
    });

    setShowVendorModal(false);
    alert(`Vendor pabrikan ${newVendorName} berhasil didaftarkan.`);
    setNewVendorName('');
    setNewCompanyName('');
    setNewContactPerson('');
    setNewPhone('');
    setNewAddress('');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl bg-gradient-to-r from-purple-900/90 via-purple-800 to-indigo-950 text-white border border-purple-500/30 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-400/20 text-purple-300 border border-purple-400/40">
              Sprint 4 • Kemitraan Pabrikasi Maklon & Supply B2B
            </span>
            <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-mono font-medium">
              B2B UKM Reward: Rp 10.000 = 1 Poin
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-outfit text-white">
            Portal Kemitraan White Label & Pasokan B2B UKM
          </h1>
          <p className="text-xs text-purple-100/90 max-w-2xl leading-relaxed">
            Menghubungkan mitra pabrik maklon terverifikasi (PIRT, BPOM, Halal) dengan pelaku usaha kuliner (Cafe, Resto, Hotel). Setiap pemesanan produk maklon oleh customer B2B UKM Supply memperoleh insentif <strong className="text-purple-300">1 Poin per Rp 10.000</strong> belanja.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex gap-3 text-right font-mono">
          <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <p className="text-[10px] text-purple-200 uppercase font-semibold">Vendor Terdaftar</p>
            <p className="text-lg font-black text-purple-300">{whiteLabelVendors.length} Pabrik</p>
          </div>
          <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <p className="text-[10px] text-emerald-200 uppercase font-semibold">Omset B2B Maklon</p>
            <p className="text-lg font-black text-emerald-300">
              Rp {financials.whiteLabelRevenue.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('B2B_CATALOG')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'B2B_CATALOG'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Pasokan Produk B2B UKM Supply (Poin Rp 10k = 1 pt)
        </button>
        <button
          onClick={() => setActiveTab('RECEIVE_BATCH')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'RECEIVE_BATCH'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" /> Penerimaan Batch (GRN & QC)
        </button>
        <button
          onClick={() => setActiveTab('CONTRACTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'CONTRACTS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Kontrak Maklon Produksi ({whiteLabelContracts.length})
        </button>
        <button
          onClick={() => setActiveTab('VENDORS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'VENDORS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" /> Direktori & Izin Vendor ({whiteLabelVendors.length})
        </button>
      </div>

      {/* TAB 1: B2B UKM SUPPLY CATALOG & ORDERING */}
      {activeTab === 'B2B_CATALOG' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Product Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                Katalog Produk Pabrikan Maklon Oriental
              </h2>
              <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold border border-purple-200">
                Aturan Poin: Rp 10.000 = 1 Poin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {whiteLabelCatalog.map((prod) => {
                const isSelected = selectedProductId === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProductId(prod.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md uppercase">
                          {prod.category}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          prod.stockAvailable > 20
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          Stok: {prod.stockAvailable} {prod.unit}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mt-2">{prod.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        Pabrik Mitra: <strong>{prod.vendorName}</strong>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Harga Grosir B2B:</span>
                        <span className="text-base font-black font-mono text-purple-900">
                          Rp {prod.priceToB2B.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono"> / {prod.unit}</span>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isSelected ? 'Terpilih' : 'Pilih Produk'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Riwayat Order B2B Maklon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-600" />
                Riwayat Order B2B Produk Maklon ({whiteLabelOrders.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">No. Order</th>
                      <th className="py-2 px-3">Customer B2B</th>
                      <th className="py-2 px-3">Produk</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-3 text-center">Poin Didapat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {whiteLabelOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-purple-700">{ord.orderNumber}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">{ord.customerName}</td>
                        <td className="py-2 px-3 text-slate-600">{ord.productName}</td>
                        <td className="py-2 px-3 text-right font-bold">{ord.quantity}</td>
                        <td className="py-2 px-3 text-right text-slate-900">Rp {ord.totalAmount.toLocaleString('id-ID')}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            +{ord.pointsAwarded} pt
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Order Checkout Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                  Form Order Pasokan B2B UKM
                </span>
                <span className="text-[10px] font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded font-bold border border-purple-200">
                  Rp 10.000 = 1 Poin
                </span>
              </div>

              {/* Customer B2B Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">
                  Pilih Customer B2B UKM Supply:
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                >
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.businessName || m.memberCode}) - {m.segment}
                    </option>
                  ))}
                </select>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono flex items-center justify-between">
                  <span className="text-slate-500">Saldo Poin Customer Saat Ini:</span>
                  <span className="font-bold text-emerald-700">{selectedCustomerObj.totalLoyaltyPoints} Poin</span>
                </div>
              </div>

              {/* Product Summary */}
              {activeProduct && (
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs font-mono">
                  <p className="font-bold text-purple-900">{activeProduct.name}</p>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Harga Satuan B2B:</span>
                    <span className="font-bold text-slate-900">Rp {activeProduct.priceToB2B.toLocaleString('id-ID')} / {activeProduct.unit}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Stok Gudang Oriental:</span>
                    <span className="font-bold text-emerald-700">{activeProduct.stockAvailable} {activeProduct.unit}</span>
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">
                  Jumlah Pesanan ({activeProduct?.unit || 'Pcs'}):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={activeProduct?.stockAvailable || 999}
                    value={orderQty}
                    onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold font-mono text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setOrderQty((q) => q + 5)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-mono font-bold cursor-pointer"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderQty((q) => q + 10)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-mono font-bold cursor-pointer"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* Financial & Point Summary */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Belanja:</span>
                  <span className="font-bold text-slate-900">Rp {totalOrderAmount.toLocaleString('id-ID')}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
                  <div>
                    <span className="font-bold block text-xs">Poin Loyalitas Customer:</span>
                    <span className="text-[10px] text-emerald-700">Rp 10.000 = 1 Poin B2B UKM Supply</span>
                  </div>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    +{estimatedOrderPoints} Poin
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950 text-white flex items-center justify-between shadow-inner">
                  <div>
                    <span className="text-[10px] text-purple-300 uppercase tracking-widest block">Total Pembayaran</span>
                    <span className="text-xl font-black text-white font-mono">
                      Rp {totalOrderAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-[10px] bg-purple-800 text-purple-200 px-2 py-1 rounded font-mono font-bold">
                    Lunas Cash / Transfer
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-600/30"
              >
                <ShoppingBag className="w-4 h-4" /> Proses Order Pasokan & Tambah Poin B2B
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECEIVE BATCH (GRN & QC) */}
      {activeTab === 'RECEIVE_BATCH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form Penerimaan Batch (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  Form Penerimaan Barang Batch (GRN)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mencatat kedatangan barang dari pabrik maklon dan verifikasi kontrol kualitas (QC).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase font-mono">
                  Pilih Kontrak Maklon:
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                >
                  {whiteLabelContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} - {c.productName} ({c.vendorName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                    Nomor Batch / Lot:
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                    Jumlah Diterima:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={receivedQty}
                    onChange={(e) => setReceivedQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* QC Checkbox */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="qcCheckbox"
                    checked={qcPassed}
                    onChange={(e) => setQcPassed(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="qcCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer font-mono">
                    Lolos Inspeksi Standar Mutu (QC Passed)
                  </label>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Catatan Hasil QC:</label>
                  <input
                    type="text"
                    value={qcNotes}
                    onChange={(e) => setQcNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleReceiveBatch}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <CheckCircle className="w-4 h-4" /> Simpan GRN & Tambah ke Inventori
              </button>
            </div>
          </div>

          {/* Riwayat Batch Receipts (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Riwayat Penerimaan Batch (Goods Receipt Note)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">No. GRN</th>
                      <th className="py-2 px-3">Tanggal</th>
                      <th className="py-2 px-3">Produk</th>
                      <th className="py-2 px-3">No. Batch</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Nilai Batch</th>
                      <th className="py-2 px-3 text-center">Status QC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {whiteLabelReceipts.map((rcp) => (
                      <tr key={rcp.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-purple-700">{rcp.receiptNumber}</td>
                        <td className="py-2 px-3 text-slate-500">{rcp.receivedDate}</td>
                        <td className="py-2 px-3 text-slate-800 font-sans font-medium">{rcp.productName}</td>
                        <td className="py-2 px-3 text-slate-600">{rcp.batchNumber}</td>
                        <td className="py-2 px-3 text-right font-bold">{rcp.receivedQuantity} {rcp.unit}</td>
                        <td className="py-2 px-3 text-right text-slate-900">Rp {rcp.totalValue.toLocaleString('id-ID')}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rcp.qcPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {rcp.qcPassed ? 'QC PASS' : 'QC REJECT'}
                          </span>
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

      {/* TAB 3: CONTRACTS */}
      {activeTab === 'CONTRACTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whiteLabelContracts.map((ctr) => (
              <div key={ctr.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {ctr.contractNumber}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Status: {ctr.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{ctr.productName}</h3>
                  <p className="text-xs text-purple-700 font-medium">Merek Khusus: {ctr.brandName}</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">Mitra Pabrik: {ctr.vendorName}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Target Volume Kontrak:</span>
                    <span className="font-bold text-slate-900">{ctr.targetQuantity} {ctr.unit}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya HPP Produksi / Satuan:</span>
                    <span className="font-bold text-slate-900">Rp {ctr.productionCostPerUnit.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Harga Jual ke B2B:</span>
                    <span className="font-bold text-emerald-700">Rp {ctr.sellingPriceToB2B.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-purple-900 bg-purple-50 p-2 rounded-lg font-bold">
                    <span>Total Nilai Kontrak:</span>
                    <span>Rp {ctr.totalContractValue.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VENDORS */}
      {activeTab === 'VENDORS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-700">
              Mitra Pabrikan & UMKM Produsen Terverifikasi
            </h2>
            <button
              onClick={() => setShowVendorModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> Registrasi Pabrik Maklon Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whiteLabelVendors.map((vdr) => (
              <div key={vdr.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {vdr.code}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Terverifikasi
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{vdr.vendorName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{vdr.address}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>PIC & Telepon:</span>
                    <span className="font-bold text-slate-800">{vdr.contactPerson} ({vdr.phone})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Kategori Produk:</span>
                    <span className="font-bold text-purple-800">{vdr.category}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Izin BPOM:</span>
                    <span className="font-bold text-slate-800">{vdr.bpomNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Sertifikat Halal:</span>
                    <span className="font-bold text-slate-800">{vdr.halalCertNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Standar QC / SLA:</span>
                    <span className="text-[10px] font-bold text-emerald-700">{vdr.qcSlaStandard}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL ORDER SUCCESS */}
      {showOrderModal && latestOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 font-outfit">
                Pemesanan Pasokan B2B Berhasil!
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                No. Order: <strong>{latestOrder.orderNumber}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{latestOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Produk Maklon:</span>
                <span className="font-bold text-slate-900">{latestOrder.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah:</span>
                <span>{latestOrder.quantity} Kemasan</span>
              </div>
              <div className="flex justify-between font-bold text-purple-900 pt-1 border-t border-slate-200">
                <span>Total Belanja:</span>
                <span>Rp {latestOrder.totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span>Poin B2B UKM Supply:</span>
                <span>+{latestOrder.pointsAwarded} Poin Member</span>
              </div>
            </div>

            <button
              onClick={() => setShowOrderModal(false)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* MODAL REGISTER VENDOR */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form onSubmit={handleRegisterVendor} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 font-outfit">
                Registrasi Vendor Pabrikan / UMKM Maklon Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowVendorModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Vendor / Merk:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: UD Celebes Bakery Mandiri"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama PIC:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Daeng Naba"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">No. WhatsApp:</label>
                  <input
                    type="text"
                    required
                    placeholder="+62 8..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Alamat Fasilitas Pabrik:</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Perintis Kemerdekaan KM 10, Makassar"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">No. Izin BPOM / PIRT:</label>
                  <input
                    type="text"
                    placeholder="BPOM RI MD / P-IRT"
                    value={newBpom}
                    onChange={(e) => setNewBpom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">No. Sertifikat Halal:</label>
                  <input
                    type="text"
                    placeholder="ID73..."
                    value={newHalal}
                    onChange={(e) => setNewHalal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer"
              >
                Simpan & Verifikasi Vendor
              </button>
              <button
                type="button"
                onClick={() => setShowVendorModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold font-mono transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
