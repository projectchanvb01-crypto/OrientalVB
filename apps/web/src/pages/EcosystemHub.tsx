import React from 'react';
import {
  Boxes,
  UtensilsCrossed,
  Recycle,
  Factory,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const EcosystemHub: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-950 border border-emerald-500/40 shadow-xl text-white">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge variant="success" className="uppercase tracking-widest text-[10px] bg-white/20 text-white border-white/30 backdrop-blur-md">
            Ekosistem Perdagangan Terintegrasi
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            Pusat Sinergi Rantai Nilai Perdagangan Digital
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Menghubungkan rantai pasok UKM kuliner terfragmentasi, kemitraan pabrik maklon White Label, ekonomi sirkular pengelolaan limbah bernilai ekonomis, dan portal edukasi bisnis terpadu.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Grid of Business Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pillar 1: UKM Kuliner Supply Chain */}
        <Card className="hover:border-emerald-500/50 hover:shadow-md transition">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-base text-slate-900">Oriental UKM Kuliner Supply Chain</CardTitle>
              </div>
              <CardDescription className="text-slate-500">
                Pengadaan bahan baku terjadwal dengan katalog harga bertingkat per segmen bisnis.
              </CardDescription>
            </div>
            <Badge variant="success">B2B Procurement</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <p className="text-slate-500 text-[10px]">Hotel & Resto</p>
                <p className="font-bold text-emerald-700 mt-0.5">Tier Korporat</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <p className="text-slate-500 text-[10px]">Café & Coffee</p>
                <p className="font-bold text-amber-700 mt-0.5">Tier Horeka</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <p className="text-slate-500 text-[10px]">Warung Makan</p>
                <p className="font-bold text-purple-700 mt-0.5">Tier UMKM</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs shadow-xs">
              <span className="text-slate-600 font-mono">Insentif Poin Loyalitas:</span>
              <span className="font-bold text-emerald-700 font-mono">Rp 50.000 = 1 Poin</span>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 2: Waste Purchasing */}
        <Card className="hover:border-amber-500/50 hover:shadow-md transition">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Recycle className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-base text-slate-900">Oriental Waste Purchasing</CardTitle>
              </div>
              <CardDescription className="text-slate-500">
                Reverse logistics & pembelian limbah daur ulang (minyak jelantah, karton, plastik).
              </CardDescription>
            </div>
            <Badge variant="warning">Circular Economy</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Model Bisnis:</span>
                <span className="font-bold text-slate-900">Profit Sharing Mitra Tempat</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aturan Poin Limbah:</span>
                <span className="font-bold text-amber-700 font-mono">1 Kilogram = 1 Poin Member</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Akses Partisipasi:</span>
                <span className="font-bold text-emerald-700">Terbuka untuk Semua Konsumen</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 3: White Label */}
        <Card className="hover:border-purple-500/50 hover:shadow-md transition">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-base text-slate-900">Oriental White Label</CardTitle>
              </div>
              <CardDescription className="text-slate-500">
                Kemitraan strategis dengan vendor pabrikan untuk produksi merek dagang khusus.
              </CardDescription>
            </div>
            <Badge variant="purple">Maklon & Produksi</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Standar Mutu:</span>
                <span className="font-bold text-slate-900">PIRT, BPOM & Halal Terverifikasi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aturan Poin Produksi:</span>
                <span className="font-bold text-purple-700 font-mono">Rp 10.000 = 1 Poin Member</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 4: Oriental Learn */}
        <Card className="hover:border-teal-500/50 hover:shadow-md transition">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-base text-slate-900">Oriental Learn (LMS & Sertifikasi)</CardTitle>
              </div>
              <CardDescription className="text-slate-500">
                Portal edukasi online (video mandiri & kuis) dan pelatihan offline terakreditasi.
              </CardDescription>
            </div>
            <Badge variant="secondary">Academy & Kursus</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Format Materi:</span>
                <span className="font-bold text-slate-900">Video HLS, Bank Soal & Modul PDF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Output Kelulusan:</span>
                <span className="font-bold text-teal-700">E-Sertifikat Terverifikasi QR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
