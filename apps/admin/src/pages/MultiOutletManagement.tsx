import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  Truck,
  ArrowRightLeft,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Printer,
  ChevronRight,
  ShieldCheck,
  Store,
  Boxes,
  UtensilsCrossed,
  Recycle,
  Factory,
  Layers,
  Sparkles,
  Eye,
  Plus,
} from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import {
  OutletLocation,
  OutletBusinessLineMatrix,
  InterStoreTransferRecord,
  BranchPriceProposal,
  UserRole,
} from '@oriental/types';

export const MultiOutletManagement: React.FC = () => {
  const {
    outletsList,
    activeOutletId,
    activeOutlet,
    setActiveOutletId,
    toggleOutletBusinessLine,
    stockTransfers,
    createStockTransfer,
    dispatchStockTransfer,
    receiveStockTransfer,
    cancelStockTransfer,
    branchPriceProposals,
    submitBranchPriceProposal,
    reviewBranchPriceProposal,
    finalizeBranchPriceProposal,
    products,
    currentUser,
  } = useEcosystem();

  const [activeSubTab, setActiveSubTab] = useState<'OUTLETS' | 'TRANSFERS' | 'PRICE_PROPOSALS'>('OUTLETS');

  // Modal: Buat Transfer Stok
  const [showCreateTransferModal, setShowCreateTransferModal] = useState(false);
  const [transferSourceId, setTransferSourceId] = useState<string>('OUTLET-WATAMPONE-01');
  const [transferTargetId, setTransferTargetId] = useState<string>('OUTLET-MAKASSAR-01');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'prod-minyak');
  const [transferQuantity, setTransferQuantity] = useState<number>(10);
  const [transferVariantUnit, setTransferVariantUnit] = useState<string>('Karton');
  const [transferDriverName, setTransferDriverName] = useState<string>('Dg. Baso');
  const [transferVehiclePlate, setTransferVehiclePlate] = useState<string>('DD 8192 AY');
  const [transferNotes, setTransferNotes] = useState<string>('Pengiriman buffer stock antar cabang');

  // Modal: Detail Surat Jalan Transfer
  const [selectedTransferForView, setSelectedTransferForView] = useState<InterStoreTransferRecord | null>(null);

  // Modal: Buat Pengajuan Harga Cabang
  const [showPriceProposalModal, setShowPriceProposalModal] = useState(false);
  const [propOutletId, setPropOutletId] = useState<string>('OUTLET-MAKASSAR-01');
  const [propProductId, setPropProductId] = useState<string>(products[0]?.id || 'prod-minyak');
  const [propPrice, setPropPrice] = useState<number>(32500);
  const [propType, setPropType] = useState<'PRICE_DROP' | 'LOCAL_PROMO'>('PRICE_DROP');
  const [propReason, setPropReason] = useState<string>(
    'Persaingan ketat pasar lokal Pettarani - Grosir Surya menjual minyak 2L seharga Rp 32.500',
  );
  const [propCompName, setPropCompName] = useState<string>('Grosir Surya Pettarani');
  const [propCompPrice, setPropCompPrice] = useState<number>(32500);

  // 4 File Bukti Foto (SOP Wajib Addendum §8.1)
  const [uploadedPhotos, setUploadedPhotos] = useState<{ name: string; url: string }[]>([
    {
      name: 'Foto 1 - Price Tag Rak Kompetitor.jpg',
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
    },
    {
      name: 'Foto 2 - Brosur Promo Pesaing.jpg',
      url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500',
    },
    {
      name: 'Foto 3 - Struk Kasir Pesaing.jpg',
      url: 'https://images.unsplash.com/photo-1554415707-9e496667b2d2?w=500',
    },
    {
      name: 'Foto 4 - Display Toko Pesaing.jpg',
      url: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500',
    },
  ]);

  const [customPhotoInputName, setCustomPhotoInputName] = useState('');

  // Review Modal state for Regional & Owner
  const [reviewingProposal, setReviewingProposal] = useState<BranchPriceProposal | null>(null);
  const [reviewNotesInput, setReviewNotesInput] = useState('');

  // Handlers
  const handleAddSamplePhoto = () => {
    if (uploadedPhotos.length >= 6) {
      alert('Maksimal 6 foto lampiran');
      return;
    }
    const sampleUrls = [
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      'https://images.unsplash.com/photo-1554415707-9e496667b2d2?w=500',
    ];
    const pickedUrl = sampleUrls[uploadedPhotos.length % sampleUrls.length];
    const name = customPhotoInputName.trim() || `Foto ${uploadedPhotos.length + 1} - Dokumentasi Survei Pasar.jpg`;
    setUploadedPhotos((prev) => [...prev, { name, url: pickedUrl }]);
    setCustomPhotoInputName('');
  };

  const handleRemovePhoto = (idx: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferSourceId === transferTargetId) {
      alert('Cabang asal dan cabang tujuan tidak boleh sama!');
      return;
    }

    if (transferQuantity <= 0) {
      alert('Kuantitas transfer harus lebih besar dari 0!');
      return;
    }

    const newTransfer = createStockTransfer({
      sourceOutletId: transferSourceId,
      targetOutletId: transferTargetId,
      items: [
        {
          productId: selectedProductId,
          variantUnitName: transferVariantUnit,
          quantity: transferQuantity,
        },
      ],
      driverName: transferDriverName,
      vehiclePlate: transferVehiclePlate,
      notes: transferNotes,
    });

    setShowCreateTransferModal(false);
    setSelectedTransferForView(newTransfer);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedPhotos.length < 4) {
      alert('SOP Addendum §8.1: Wajib mengunggah minimal 4 foto bukti harga kompetitor!');
      return;
    }

    try {
      submitBranchPriceProposal({
        outletId: propOutletId,
        productId: propProductId,
        proposedPrice: propPrice,
        proposalType: propType,
        reason: propReason,
        competitorName: propCompName,
        competitorPrice: propCompPrice,
        proofAttachments: uploadedPhotos,
      });

      alert('Usulan harga/promo cabang berhasil diajukan untuk ditinjau oleh Regional Manager!');
      setShowPriceProposalModal(false);
    } catch (err: any) {
      alert(err.message || 'Gagal mengajukan usulan harga');
    }
  };

  const isRegionalOrOwner =
    currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.REGIONAL_MANAGER;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-blue-500/20">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30 font-mono">
                Sprint 8 • PRD Addendum §8
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                Multi-Store & Regional Governance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white">
              Multi-Outlet & Tata Kelola Regional
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed font-sans">
              Manajemen 3 jaringan cabang (Watampone Pusat, Makassar, dan Bone Selatan), konfigurasi checklist lini bisnis per lokasi, surat jalan transfer stok antar gudang, serta workflow approval berjenjang penyesuaian harga cabang.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-3 font-mono">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center min-w-[100px]">
              <p className="text-[10px] uppercase text-blue-200 font-bold">Cabang Aktif</p>
              <p className="text-xl font-black text-white">{outletsList.filter((o) => o.isActive).length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center min-w-[110px]">
              <p className="text-[10px] uppercase text-amber-200 font-bold">Transfer Stok</p>
              <p className="text-xl font-black text-amber-300">
                {stockTransfers.filter((t) => t.status === 'IN_TRANSIT').length} <span className="text-xs text-white">Jalan</span>
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center min-w-[110px]">
              <p className="text-[10px] uppercase text-emerald-200 font-bold">Review Harga</p>
              <p className="text-xl font-black text-emerald-300">
                {branchPriceProposals.filter((p) => p.status === 'SUBMITTED' || p.status === 'REVIEWED_BY_REGIONAL').length} <span className="text-xs text-white">Pending</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('OUTLETS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'OUTLETS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Master Cabang & Matriks Lini Bisnis ({outletsList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('TRANSFERS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'TRANSFERS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Transfer Stok Antar Cabang ({stockTransfers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('PRICE_PROPOSALS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'PRICE_PROPOSALS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Pengajuan Harga Cabang ({branchPriceProposals.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: MASTER CABANG & MATRIKS LINI BISNIS            */}
      {/* ======================================================== */}
      {activeSubTab === 'OUTLETS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-outfit">
                Jaringan Cabang & Konfigurasi Lini Bisnis (Checklist Matrix)
              </h2>
              <p className="text-xs text-slate-500">
                Sesuai PRD Addendum §8: Setiap outlet dapat memiliki kombinasi lini bisnis yang berbeda sesuai kondisi pasar daerah.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Konteks Cabang Aktif: <strong>{activeOutlet.name}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {outletsList.map((outlet) => {
              const isCurrentActive = outlet.id === activeOutletId;
              return (
                <div
                  key={outlet.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-2xs space-y-4 ${
                    isCurrentActive
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                            {outlet.code}
                          </span>
                          {outlet.isHeadquarters && (
                            <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                              👑 Pusat (HQ)
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">{outlet.name}</h3>
                      </div>
                      {isCurrentActive && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                          Aktif Digunakan
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 font-mono">
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{outlet.address}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Kepala Toko: <strong>{outlet.managerName}</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Kapasitas Gudang: <strong>{outlet.warehouseCapacityCbm.toLocaleString('id-ID')} m³</strong></span>
                      </p>
                    </div>

                    {/* Lini Bisnis Checklist Matrix */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block font-mono">
                        Lini Bisnis Beroperasi:
                      </span>
                      <div className="space-y-1.5 text-xs">
                        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                          <span className="flex items-center gap-2">
                            <Store className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-slate-800 font-medium">Retail Swalayan (B2C)</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={outlet.businessLines.hasRetail}
                            onChange={() => toggleOutletBusinessLine(outlet.id, 'hasRetail')}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                          <span className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-slate-800 font-medium">Grosir Sembako & B2B</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={outlet.businessLines.hasGrosir}
                            onChange={() => toggleOutletBusinessLine(outlet.id, 'hasGrosir')}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                          <span className="flex items-center gap-2">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-slate-800 font-medium">Pasokan UKM HOREKA</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={outlet.businessLines.hasUkmSupply}
                            onChange={() => toggleOutletBusinessLine(outlet.id, 'hasUkmSupply')}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                          <span className="flex items-center gap-2">
                            <Recycle className="w-3.5 h-3.5 text-teal-600" />
                            <span className="text-slate-800 font-medium">Limbah Jelantah (UCO)</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={outlet.businessLines.hasWaste}
                            onChange={() => toggleOutletBusinessLine(outlet.id, 'hasWaste')}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                          <span className="flex items-center gap-2">
                            <Factory className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-slate-800 font-medium">White Label Maklon</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={outlet.businessLines.hasWhiteLabel}
                            onChange={() => toggleOutletBusinessLine(outlet.id, 'hasWhiteLabel')}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Switch Active Branch Button */}
                  <div className="pt-3">
                    {isCurrentActive ? (
                      <div className="w-full py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl text-center border border-blue-200">
                        ✓ Sedang Mengelola Cabang Ini
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveOutletId(outlet.id)}
                        className="w-full py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Pilih & Kelola Cabang Ini
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: TRANSFER STOK ANTAR CABANG                    */}
      {/* ======================================================== */}
      {activeSubTab === 'TRANSFERS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-outfit">
                Buku Mutasi & Surat Jalan Transfer Stok Antar Gudang
              </h2>
              <p className="text-xs text-slate-500">
                Perpindahan stok fisik antar cabang (Draft → In Transit memotong stok asal → Received menambah stok tujuan).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateTransferModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Buat Surat Jalan Transfer Baru
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Transfer</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Cabang Asal</th>
                  <th className="py-2.5 px-3">Cabang Tujuan</th>
                  <th className="py-2.5 px-3 text-right">Total Satuan Dasar</th>
                  <th className="py-2.5 px-3">Ekspedisi / Driver</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {stockTransfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-bold text-blue-700">{trf.transferNumber}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(trf.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-900">{trf.sourceOutletName}</td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-900">{trf.targetOutletName}</td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {trf.totalBaseUnits} unit
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {trf.driverName} ({trf.vehiclePlate || 'N/A'})
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          trf.status === 'RECEIVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : trf.status === 'IN_TRANSIT'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : trf.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {trf.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTransferForView(trf)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Surat Jalan
                        </button>

                        {trf.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => dispatchStockTransfer(trf.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Kirim
                          </button>
                        )}

                        {trf.status === 'IN_TRANSIT' && (
                          <button
                            type="button"
                            onClick={() => receiveStockTransfer(trf.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Terima
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: PENGAJUAN HARGA & PROMO TINGKAT CABANG          */}
      {/* ======================================================== */}
      {activeSubTab === 'PRICE_PROPOSALS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-outfit">
                Alur Persetujuan Harga & Promo Cabang (PRD Addendum §8.1)
              </h2>
              <p className="text-xs text-slate-500">
                Rantai Persetujuan: <strong>Kepala Toko submit (wajib min. 4 foto) ➔ Regional Manager Review ➔ Super Admin Final Approval</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPriceProposalModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Ajukan Penyesuaian Harga Cabang
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {branchPriceProposals.map((proposal) => {
              const diff = proposal.proposedPrice - proposal.currentPrice;
              return (
                <div
                  key={proposal.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {proposal.proposalNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(proposal.submittedAt).toLocaleDateString('id-ID')}
                        </span>
                        <span className="text-[10px] font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                          {proposal.proposalType === 'PRICE_DROP' ? 'Penurunan Harga Reguler' : 'Promo Lokal Terbatas'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">
                        {proposal.outletName} • Usulan Penyesuaian: {proposal.productName}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        proposal.status === 'APPROVED_BY_OWNER'
                          ? 'bg-emerald-100 text-emerald-800'
                          : proposal.status === 'REVIEWED_BY_REGIONAL'
                          ? 'bg-blue-100 text-blue-800'
                          : proposal.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {proposal.status === 'APPROVED_BY_OWNER'
                        ? '✓ Disetujui Super Admin'
                        : proposal.status === 'REVIEWED_BY_REGIONAL'
                        ? '⏳ Menunggu Final Owner'
                        : proposal.status === 'REJECTED'
                        ? '✕ Ditolak'
                        : '⏳ Menunggu Review Regional'}
                    </span>
                  </div>

                  {/* Pricing Comparison Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Harga Saat Ini:</span>
                      <strong className="text-slate-800">Rp {proposal.currentPrice.toLocaleString('id-ID')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Usulan Harga Baru:</span>
                      <strong className="text-blue-700">Rp {proposal.proposedPrice.toLocaleString('id-ID')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Harga Pesaing Lokal:</span>
                      <strong className="text-rose-600">Rp {proposal.competitorPrice.toLocaleString('id-ID')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pesaing:</span>
                      <strong className="text-slate-800 font-sans">{proposal.competitorName}</strong>
                    </div>
                  </div>

                  {/* Strategic Reason */}
                  <p className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                    <strong>Alasan Strategis Kepala Toko:</strong> {proposal.reason}
                  </p>

                  {/* 4 Photo Attachments Gallery (Strict SOP §8.1) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        Bukti Survei Harga Pasar (Wajib Min. 4 Foto: {proposal.proofAttachments.length} Terlampir)
                      </span>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        SOP Terpenuhi
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {proposal.proofAttachments.map((att, idx) => (
                        <div
                          key={att.id || idx}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex flex-col justify-end p-2 cursor-pointer shadow-2xs"
                        >
                          <img
                            src={att.url}
                            alt={att.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          <span className="relative z-10 text-[9px] text-white font-mono font-medium truncate">
                            {att.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Approval Trail Notes */}
                  {(proposal.regionalReviewNotes || proposal.ownerReviewNotes) && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                      {proposal.regionalReviewNotes && (
                        <p className="text-blue-900">
                          <strong>Catatan Regional Manager:</strong> {proposal.regionalReviewNotes}
                        </p>
                      )}
                      {proposal.ownerReviewNotes && (
                        <p className="text-emerald-900">
                          <strong>Catatan Final Super Admin (Owner):</strong> {proposal.ownerReviewNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Review Action Buttons for Regional Manager & Owner */}
                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                    {proposal.status === 'SUBMITTED' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const notes = prompt('Masukkan catatan review Regional Manager:') || 'Disetujui untuk diteruskan ke Owner';
                            reviewBranchPriceProposal(proposal.id, true, notes);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer"
                        >
                          Approve (Regional Review)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const notes = prompt('Alasan penolakan usulan:') || 'Ditolak: margin tidak mencukupi';
                            reviewBranchPriceProposal(proposal.id, false, notes);
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold font-mono transition cursor-pointer border border-rose-200"
                        >
                          Tolak
                        </button>
                      </>
                    )}

                    {proposal.status === 'REVIEWED_BY_REGIONAL' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const notes = prompt('Masukkan catatan final persetujuan Owner:') || 'Disetujui Super Admin - Perbarui harga POS';
                            finalizeBranchPriceProposal(proposal.id, true, notes);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer shadow-xs"
                        >
                          Finalize Approval (Super Admin Owner)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const notes = prompt('Alasan penolakan Owner:') || 'Ditolak oleh Owner';
                            finalizeBranchPriceProposal(proposal.id, false, notes);
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold font-mono transition cursor-pointer border border-rose-200"
                        >
                          Tolak Usulan
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BUAT TRANSFER STOK BARU                           */}
      {/* ======================================================== */}
      {showCreateTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-3xl shadow-2xl space-y-4 animate-fadeIn border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-outfit">
                <Truck className="w-5 h-5 text-blue-600" />
                Buat Surat Jalan Transfer Stok Antar Gudang
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateTransferModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTransfer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Cabang Asal (Pengirim):</label>
                  <select
                    value={transferSourceId}
                    onChange={(e) => setTransferSourceId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {outletsList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Cabang Tujuan (Penerima):</label>
                  <select
                    value={transferTargetId}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {outletsList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Pilih Produk:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Tersedia: {p.totalStockInBaseUnits} {p.baseUnitName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Kuantitas Transfer:</label>
                  <input
                    type="number"
                    min="1"
                    value={transferQuantity}
                    onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Satuan Kemasan:</label>
                  <select
                    value={transferVariantUnit}
                    onChange={(e) => setTransferVariantUnit(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Karton">Karton</option>
                    <option value="Dus">Dus</option>
                    <option value="Sak">Sak</option>
                    <option value="Bal">Bal</option>
                    <option value="Pouch">Pouch (Satuan Dasar)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Nama Driver / Kurir:</label>
                  <input
                    type="text"
                    value={transferDriverName}
                    onChange={(e) => setTransferDriverName(e.target.value)}
                    placeholder="Contoh: Dg. Baso"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Plat Nomor Kendaraan:</label>
                  <input
                    type="text"
                    value={transferVehiclePlate}
                    onChange={(e) => setTransferVehiclePlate(e.target.value)}
                    placeholder="Contoh: DD 8192 AY"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Catatan / Instruksi Pengiriman:</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTransferModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition cursor-pointer shadow-md shadow-blue-600/25"
                >
                  Terbitkan Surat Jalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DETAIL SURAT JALAN TRANSFER PREVIEW              */}
      {/* ======================================================== */}
      {selectedTransferForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4 animate-fadeIn border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-outfit">
                <Printer className="w-5 h-5 text-blue-600" />
                Surat Jalan Pengiriman Stok Antar Cabang
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTransferForView(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl font-mono text-xs space-y-2.5 text-slate-800">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm tracking-wider">ORIENTAL ECOSYSTEM</p>
                <p className="text-[10px] text-slate-500">SURAT JALAN TRANSFER ANTAR GUDANG</p>
                <p className="text-[10px] text-slate-400 font-bold">{selectedTransferForView.transferNumber}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cabang Asal:</span>
                  <span className="font-bold">{selectedTransferForView.sourceOutletName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cabang Tujuan:</span>
                  <span className="font-bold">{selectedTransferForView.targetOutletName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver / Plat:</span>
                  <span>{selectedTransferForView.driverName} ({selectedTransferForView.vehiclePlate || '-'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal:</span>
                  <span>{new Date(selectedTransferForView.createdAt).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-blue-700">{selectedTransferForView.status}</span>
                </div>
              </div>

              <div className="py-2 border-y border-dashed border-slate-300 space-y-1 text-[11px]">
                <p className="font-bold text-[10px] uppercase text-slate-500 mb-1">Rincian Barang Dikirim:</p>
                {selectedTransferForView.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.productName} ({item.quantity} {item.variantUnitName})</span>
                    <span className="font-bold">{item.baseUnitsTotal} satuan dasar</span>
                  </div>
                ))}
              </div>

              {selectedTransferForView.notes && (
                <p className="text-[10px] text-slate-500 italic">
                  Catatan: {selectedTransferForView.notes}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-dashed border-slate-300 text-center text-[10px]">
                <div>
                  <p className="text-slate-400">Pengirim (Gudang Asal)</p>
                  <div className="h-10" />
                  <p className="font-bold text-slate-700">( {selectedTransferForView.dispatchedBy || 'Petugas Gudang'} )</p>
                </div>
                <div>
                  <p className="text-slate-400">Penerima (Gudang Tujuan)</p>
                  <div className="h-10" />
                  <p className="font-bold text-slate-700">( {selectedTransferForView.receivedBy || 'Kepala Toko'} )</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Surat Jalan
              </button>
              <button
                type="button"
                onClick={() => setSelectedTransferForView(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs font-mono transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BUAT PENGAJUAN HARGA & PROMO CABANG (MIN 4 FOTO)  */}
      {/* ======================================================== */}
      {showPriceProposalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl p-6 rounded-3xl shadow-2xl space-y-4 animate-fadeIn border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-outfit">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  Pengajuan Penyesuaian Harga / Promo Tingkat Cabang
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  SOP Addendum §8.1: Wajib melampirkan minimal 4 foto bukti harga kompetitor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceProposalModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Cabang Pengusul:</label>
                  <select
                    value={propOutletId}
                    onChange={(e) => setPropOutletId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {outletsList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Jenis Usulan:</label>
                  <select
                    value={propType}
                    onChange={(e) => setPropType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="PRICE_DROP">Penurunan Harga Reguler (Menyesuaikan Pesaing)</option>
                    <option value="LOCAL_PROMO">Promo Diskon Terbatas Tingkat Cabang</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Produk yang Diajukan:</label>
                <select
                  value={propProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setPropProductId(e.target.value);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Harga Normal: Rp {(p.variants[0]?.price || 30000).toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Nama Pesaing / Kompetitor:</label>
                  <input
                    type="text"
                    value={propCompName}
                    onChange={(e) => setPropCompName(e.target.value)}
                    placeholder="Contoh: Grosir Surya Pettarani"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Harga Jual Pesaing (Rp):</label>
                  <input
                    type="number"
                    value={propCompPrice}
                    onChange={(e) => setPropCompPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Usulan Harga Baru Cabang (Rp):</label>
                <input
                  type="number"
                  value={propPrice}
                  onChange={(e) => setPropPrice(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-base font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Alasan Strategis & Perhitungan Margin:</label>
                <textarea
                  rows={2}
                  value={propReason}
                  onChange={(e) => setPropReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Photo Proof Upload Area (Min 4 Photos Validation) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase text-[11px] font-mono flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    Lampiran Bukti Foto Kompetitor (Minimal 4 Foto):
                  </label>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      uploadedPhotos.length >= 4
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {uploadedPhotos.length} / 4 Foto Terpenuhi {uploadedPhotos.length >= 4 ? '✅' : '❌'}
                  </span>
                </div>

                {/* Upload inputs simulation */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPhotoInputName}
                    onChange={(e) => setCustomPhotoInputName(e.target.value)}
                    placeholder="Judul / Deskripsi Bukti Foto..."
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSamplePhoto}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    + Tambah Foto
                  </button>
                </div>

                {/* Photo Previews */}
                <div className="grid grid-cols-2 gap-2">
                  {uploadedPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                        />
                        <span className="text-[10px] font-mono text-slate-700 truncate font-medium">
                          {photo.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {uploadedPhotos.length < 4 && (
                  <p className="text-[10px] text-rose-600 font-medium">
                    ⚠️ Tombol submit dinonaktifkan sampai minimal 4 bukti foto survei pasar terlampir.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPriceProposalModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadedPhotos.length < 4}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition ${
                    uploadedPhotos.length >= 4
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Ajukan ke Regional Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
