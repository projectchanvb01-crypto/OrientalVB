import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  BookOpen,
  Banknote,
  LayoutList,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Timer,
  Building2,
  Package,
  Eye,
  MessageSquareWarning,
  Lock,
  Unlock,
  BarChart3,
  DollarSign,
  FileText,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

// ─── Types ─────────────────────────────────────────────────────────────────────

type EscrowStatus = 'HOLDING' | 'RELEASED' | 'DISPUTED';
type LedgerType = 'CREDIT' | 'DEBIT';
type Sprint12Tab = 'ESCROW' | 'LEDGER';
type LedgerFilter = 'SEMUA' | 'CREDIT' | 'DEBIT';

interface EscrowOrder {
  id: string;
  orderId: string;
  partnerId: string;
  partnerName: string;
  productName: string;
  consumerName: string;
  totalAmount: number;
  holdStartDate: string;
  holdUntilDate: string;
  holdDaysRemaining: number;
  status: EscrowStatus;
  deliveryStatus: 'DIKIRIM' | 'DITERIMA' | 'DIKONFIRMASI';
  notes?: string;
}

interface LedgerEntry {
  id: string;
  date: string;
  type: LedgerType;
  accountCode: string;
  accountName: string;
  description: string;
  source: 'Referral' | 'Waste' | 'Cashback' | 'Belanja' | 'Kursus' | 'Escrow Release' | 'Escrow Hold';
  amount: number;
  balanceAfter: number;
  ref?: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const ESCROW_ORDERS: EscrowOrder[] = [
  {
    id: 'ESC001',
    orderId: 'WL-ORD-2026-0091',
    partnerId: 'PTR001',
    partnerName: 'UD Celebes Bakery Mandiri',
    productName: 'Kopi Arabika White Label 250gr',
    consumerName: 'Kafe Sunrise Makassar',
    totalAmount: 3750000,
    holdStartDate: '15 Sep 2026',
    holdUntilDate: '29 Sep 2026',
    holdDaysRemaining: 1,
    status: 'HOLDING',
    deliveryStatus: 'DIKONFIRMASI',
    notes: 'Konsumen sudah konfirmasi terima, menunggu auto-release besok.',
  },
  {
    id: 'ESC002',
    orderId: 'WL-ORD-2026-0087',
    partnerId: 'PTR002',
    partnerName: 'CV Rempah Nusantara',
    productName: 'Bumbu Rendang Instan Premium 500gr',
    consumerName: 'Hotel Grand Makassar',
    totalAmount: 8200000,
    holdStartDate: '10 Sep 2026',
    holdUntilDate: '24 Sep 2026',
    holdDaysRemaining: 0,
    status: 'RELEASED',
    deliveryStatus: 'DIKONFIRMASI',
  },
  {
    id: 'ESC003',
    orderId: 'WL-ORD-2026-0095',
    partnerId: 'PTR001',
    partnerName: 'UD Celebes Bakery Mandiri',
    productName: 'Croissant Butter White Label (Frozen) 12pcs',
    consumerName: 'Coffeeshop Kopi Darat',
    totalAmount: 1850000,
    holdStartDate: '20 Sep 2026',
    holdUntilDate: '04 Okt 2026',
    holdDaysRemaining: 6,
    status: 'HOLDING',
    deliveryStatus: 'DIKIRIM',
  },
  {
    id: 'ESC004',
    orderId: 'WL-ORD-2026-0078',
    partnerId: 'PTR003',
    partnerName: 'PT Maju Bersama Food',
    productName: 'Sambal Matah Bali Kemasan 200gr',
    consumerName: 'Warung Seafood Bu Yati',
    totalAmount: 975000,
    holdStartDate: '05 Sep 2026',
    holdUntilDate: '19 Sep 2026',
    holdDaysRemaining: 0,
    status: 'DISPUTED',
    deliveryStatus: 'DIKIRIM',
    notes: 'Komplain: kemasan rusak saat pengiriman. Sedang investigasi oleh tim Oriental.',
  },
  {
    id: 'ESC005',
    orderId: 'WL-ORD-2026-0101',
    partnerId: 'PTR002',
    partnerName: 'CV Rempah Nusantara',
    productName: 'Pasta Cabai Merah Organik 1kg',
    consumerName: 'Restoran Dapur Nusantara',
    totalAmount: 5400000,
    holdStartDate: '25 Sep 2026',
    holdUntilDate: '09 Okt 2026',
    holdDaysRemaining: 11,
    status: 'HOLDING',
    deliveryStatus: 'DITERIMA',
  },
];

const LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'LED001',
    date: '24 Sep 2026',
    type: 'DEBIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Auto-Release Escrow — WL-ORD-2026-0087 (CV Rempah Nusantara)',
    source: 'Escrow Release',
    amount: 8200000,
    balanceAfter: 24350000,
    ref: 'ESC002',
  },
  {
    id: 'LED002',
    date: '22 Sep 2026',
    type: 'CREDIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Komisi Referral Bisnis — Warung Pak Eko (Sep 2026)',
    source: 'Referral',
    amount: 48750,
    balanceAfter: 32550000,
    ref: 'REF-2026-09-0041',
  },
  {
    id: 'LED003',
    date: '20 Sep 2026',
    type: 'CREDIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Escrow Hold — WL-ORD-2026-0095 (UD Celebes Bakery)',
    source: 'Escrow Hold',
    amount: 1850000,
    balanceAfter: 32501250,
    ref: 'ESC003',
  },
  {
    id: 'LED004',
    date: '19 Sep 2026',
    type: 'CREDIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Escrow Hold — WL-ORD-2026-0101 (CV Rempah Nusantara)',
    source: 'Escrow Hold',
    amount: 5400000,
    balanceAfter: 30651250,
    ref: 'ESC005',
  },
  {
    id: 'LED005',
    date: '15 Sep 2026',
    type: 'CREDIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Escrow Hold — WL-ORD-2026-0091 (UD Celebes Bakery)',
    source: 'Escrow Hold',
    amount: 3750000,
    balanceAfter: 25251250,
    ref: 'ESC001',
  },
  {
    id: 'LED006',
    date: '12 Sep 2026',
    type: 'DEBIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Pembelian UKM Supply — Minyak Goreng Kemasan (Kafe Sunrise)',
    source: 'Belanja',
    amount: 120000,
    balanceAfter: 21501250,
    ref: 'TXN-UKM-2026-0312',
  },
  {
    id: 'LED007',
    date: '10 Sep 2026',
    type: 'CREDIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Hasil Penjualan UCO — 6.5 kg Minyak Jelantah',
    source: 'Waste',
    amount: 32500,
    balanceAfter: 21621250,
    ref: 'WST-2026-09-0089',
  },
  {
    id: 'LED008',
    date: '08 Sep 2026',
    type: 'DEBIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Pembelian Kursus — Barista Profesional (after disc 30%)',
    source: 'Kursus',
    amount: 175000,
    balanceAfter: 21588750,
    ref: 'LRN-C002',
  },
  {
    id: 'LED009',
    date: '05 Sep 2026',
    type: 'CREDIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Cashback Promo September 2026',
    source: 'Cashback',
    amount: 15000,
    balanceAfter: 21763750,
    ref: 'CB-SEP-2026',
  },
  {
    id: 'LED010',
    date: '01 Sep 2026',
    type: 'CREDIT',
    accountCode: '2-1050',
    accountName: 'Titipan Saldo Oriental Pay',
    description: 'Komisi Referral Bisnis — Kafe Sunrise (Ags 2026)',
    source: 'Referral',
    amount: 22500,
    balanceAfter: 21748750,
    ref: 'REF-2026-08-0033',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const statusConfig: Record<EscrowStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  HOLDING: {
    label: 'Dalam Karantina',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    icon: <Lock className="w-3.5 h-3.5" />,
  },
  RELEASED: {
    label: 'Dana Dicairkan',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    icon: <Unlock className="w-3.5 h-3.5" />,
  },
  DISPUTED: {
    label: 'Dalam Sengketa',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    icon: <MessageSquareWarning className="w-3.5 h-3.5" />,
  },
};

const deliveryConfig: Record<EscrowOrder['deliveryStatus'], { label: string; color: string }> = {
  DIKIRIM: { label: '🚚 Dikirim', color: 'text-sky-700' },
  DITERIMA: { label: '📦 Diterima', color: 'text-violet-700' },
  DIKONFIRMASI: { label: '✅ Dikonfirmasi', color: 'text-emerald-700' },
};

const sourceIcon: Record<LedgerEntry['source'], React.ReactNode> = {
  Referral: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
  Waste: <RefreshCw className="w-3.5 h-3.5 text-lime-500" />,
  Cashback: <Sparkles className="w-3.5 h-3.5 text-pink-500" />,
  Belanja: <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />,
  Kursus: <BookOpen className="w-3.5 h-3.5 text-violet-500" />,
  'Escrow Release': <Unlock className="w-3.5 h-3.5 text-amber-500" />,
  'Escrow Hold': <Lock className="w-3.5 h-3.5 text-indigo-500" />,
};

// ─── Countdown Bar ─────────────────────────────────────────────────────────────

const CountdownBar: React.FC<{ daysRemaining: number; totalDays?: number }> = ({ daysRemaining, totalDays = 14 }) => {
  const pct = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));
  const isUrgent = daysRemaining <= 2;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-slate-500">Progress karantina</span>
        <span className={`font-bold ${isUrgent ? 'text-emerald-600' : 'text-amber-600'}`}>
          {daysRemaining === 0 ? 'Siap dicairkan' : `${daysRemaining} hari tersisa`}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isUrgent ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-slate-400">
        <span>Hari 0</span>
        <span>Hari 14 (Auto-Release)</span>
      </div>
    </div>
  );
};

// ─── Escrow Card ───────────────────────────────────────────────────────────────

const EscrowCard: React.FC<{ order: EscrowOrder; onDispute: (id: string) => void; onRelease: (id: string) => void }> = ({
  order,
  onDispute,
  onRelease,
}) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[order.status];
  const dlv = deliveryConfig[order.deliveryStatus];

  return (
    <Card className={`border-2 ${cfg.border} transition-all hover:shadow-md`}>
      <CardContent className="pt-5 space-y-4">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold font-mono text-slate-500">{order.orderId}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.color} flex items-center gap-1`}>
                {cfg.icon} {cfg.label}
              </span>
              <span className={`text-[10px] font-semibold ${dlv.color}`}>{dlv.label}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5 truncate">{order.productName}</h4>
            <p className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">{order.partnerName}</span> → {order.consumerName}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-base font-extrabold text-slate-900">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-slate-400">Total Order</p>
          </div>
        </div>

        {/* Holding dates */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-slate-400">Tanggal Tahan</p>
            <p className="font-bold text-slate-800">{order.holdStartDate}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-slate-400">Batas Auto-Release</p>
            <p className="font-bold text-slate-800">{order.holdUntilDate}</p>
          </div>
        </div>

        {/* Countdown — only for HOLDING */}
        {order.status === 'HOLDING' && (
          <CountdownBar daysRemaining={order.holdDaysRemaining} />
        )}

        {/* Notes */}
        {order.notes && (
          <div className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
            order.status === 'DISPUTED' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}>
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {order.notes}
          </div>
        )}

        {/* Actions */}
        {order.status === 'HOLDING' && (
          <div className="flex gap-2 pt-1">
            {order.holdDaysRemaining === 0 && (
              <button
                onClick={() => onRelease(order.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer shadow-sm"
              >
                <Unlock className="w-3.5 h-3.5" /> Release Dana Mitra
              </button>
            )}
            <button
              onClick={() => onDispute(order.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition cursor-pointer"
            >
              <MessageSquareWarning className="w-3.5 h-3.5" /> Buka Sengketa
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-2.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

        {order.status === 'RELEASED' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-800 font-semibold">
              Dana Rp {order.totalAmount.toLocaleString('id-ID')} telah otomatis dicairkan ke saldo mitra pada {order.holdUntilDate}.
            </p>
          </div>
        )}

        {order.status === 'DISPUTED' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <p className="text-xs text-rose-800 font-semibold">
              Dana ditahan hingga sengketa diselesaikan. Tim Oriental akan menghubungi kedua pihak.
            </p>
          </div>
        )}

        {/* Journal Preview (expanded) */}
        {expanded && (
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jurnal SAK Otomatis (Preview)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="text-slate-400 text-[10px]">
                    <th className="text-left pb-1">Akun</th>
                    <th className="text-right pb-1">Debit</th>
                    <th className="text-right pb-1">Kredit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-1.5 text-slate-700">1-1001 Kas / Bank</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">Rp {order.totalAmount.toLocaleString('id-ID')}</td>
                    <td className="py-1.5 text-right text-slate-400">—</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-700">2-1060 Dana Escrow Tertahan</td>
                    <td className="py-1.5 text-right text-slate-400">—</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">Rp {order.totalAmount.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="py-1.5 text-slate-500 text-[10px]" colSpan={3}>
                      → Saat release: Dr 2-1060 / Cr 2-1055 (Utang Mitra White Label)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Escrow Section ────────────────────────────────────────────────────────────

const EscrowSection: React.FC = () => {
  const [orders, setOrders] = useState<EscrowOrder[]>(ESCROW_ORDERS);
  const [filterStatus, setFilterStatus] = useState<EscrowStatus | 'SEMUA'>('SEMUA');

  const filtered = orders.filter((o) => filterStatus === 'SEMUA' || o.status === filterStatus);

  const summary = {
    holding: orders.filter((o) => o.status === 'HOLDING').reduce((s, o) => s + o.totalAmount, 0),
    released: orders.filter((o) => o.status === 'RELEASED').reduce((s, o) => s + o.totalAmount, 0),
    disputed: orders.filter((o) => o.status === 'DISPUTED').reduce((s, o) => s + o.totalAmount, 0),
    totalOrders: orders.length,
    pendingRelease: orders.filter((o) => o.status === 'HOLDING' && o.holdDaysRemaining === 0).length,
  };

  const handleRelease = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'RELEASED', holdDaysRemaining: 0 } : o)),
    );
  };

  const handleDispute = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'DISPUTED' } : o)));
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] text-amber-700 font-semibold">Dana Tertahan</span>
          </div>
          <p className="text-lg font-extrabold text-amber-800">Rp {(summary.holding / 1e6).toFixed(2)}Jt</p>
          <p className="text-[10px] text-amber-600 mt-0.5">{orders.filter((o) => o.status === 'HOLDING').length} pesanan aktif</p>
        </Card>
        <Card className="p-4 border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-2 mb-1">
            <Unlock className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] text-emerald-700 font-semibold">Dana Dicairkan</span>
          </div>
          <p className="text-lg font-extrabold text-emerald-800">Rp {(summary.released / 1e6).toFixed(2)}Jt</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{orders.filter((o) => o.status === 'RELEASED').length} pesanan selesai</p>
        </Card>
        <Card className={`p-4 ${summary.pendingRelease > 0 ? 'border-teal-300 bg-teal-50' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Zap className={`w-4 h-4 ${summary.pendingRelease > 0 ? 'text-teal-600' : 'text-slate-400'}`} />
            <span className={`text-[11px] font-semibold ${summary.pendingRelease > 0 ? 'text-teal-700' : 'text-slate-500'}`}>Siap Auto-Release</span>
          </div>
          <p className={`text-2xl font-extrabold ${summary.pendingRelease > 0 ? 'text-teal-700' : 'text-slate-500'}`}>{summary.pendingRelease}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">pesanan hari ini</p>
        </Card>
        <Card className={`p-4 ${summary.disputed > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-4 h-4 ${summary.disputed > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
            <span className={`text-[11px] font-semibold ${summary.disputed > 0 ? 'text-rose-700' : 'text-slate-500'}`}>Dalam Sengketa</span>
          </div>
          <p className={`text-lg font-extrabold ${summary.disputed > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
            {summary.disputed > 0 ? `Rp ${(summary.disputed / 1e6).toFixed(2)}Jt` : '—'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{orders.filter((o) => o.status === 'DISPUTED').length} pesanan sengketa</p>
        </Card>
      </div>

      {/* Auto-Release Cron Info */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 p-4 flex items-center gap-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
          <Timer className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Autonomous Cron Engine</p>
          <p className="text-sm font-bold text-white">Auto-Release berjalan setiap hari pukul 00:01</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Setelah 14 hari tanpa komplain/dispute → dana otomatis dicairkan ke saldo Oriental Pay mitra. Tidak perlu approval manual.
          </p>
        </div>
        <div className="flex-shrink-0 text-right hidden sm:block">
          <p className="text-[10px] text-slate-400 font-mono">Cron Schedule</p>
          <p className="text-sm font-bold text-amber-300 font-mono">0 0 * * *</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['SEMUA', 'HOLDING', 'RELEASED', 'DISPUTED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
              filterStatus === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {s === 'SEMUA' ? 'Semua' : s === 'HOLDING' ? '🔒 Ditahan' : s === 'RELEASED' ? '✅ Dicairkan' : '⚠️ Sengketa'}
            <span className="ml-1.5 text-[10px] opacity-70">
              ({orders.filter((o) => s === 'SEMUA' || o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Order Cards */}
      <div className="space-y-4">
        {filtered.map((order) => (
          <EscrowCard key={order.id} order={order} onRelease={handleRelease} onDispute={handleDispute} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Tidak ada pesanan escrow dengan filter ini.</p>
          </div>
        )}
      </div>

      {/* Escrow Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alur Managed Direct-Fulfillment & Escrow</CardTitle>
          <CardDescription>Proses holding dana 14 hari sesuai PRD v2.1 §5.4</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {[
              { step: '1', label: 'Konsumen pesan via Superapp', icon: '🛒', color: 'bg-sky-100 border-sky-300 text-sky-800' },
              { step: '2', label: 'Dana ditampung di Escrow Oriental', icon: '🔒', color: 'bg-amber-100 border-amber-300 text-amber-800' },
              { step: '3', label: 'Mitra terima order & kirim barang', icon: '🚚', color: 'bg-violet-100 border-violet-300 text-violet-800' },
              { step: '4', label: 'Konsumen konfirmasi terima', icon: '✅', color: 'bg-teal-100 border-teal-300 text-teal-800' },
              { step: '5', label: 'Karantina 14 hari dimulai', icon: '⏳', color: 'bg-orange-100 border-orange-300 text-orange-800' },
              { step: '6', label: 'Auto-release ke saldo mitra', icon: '💰', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.step}>
                <div className={`flex-shrink-0 p-3 rounded-xl border-2 ${s.color} text-center min-w-[120px]`}>
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-[10px] font-bold leading-tight">{s.label}</p>
                  <p className="text-[9px] mt-1 opacity-60">Step {s.step}</p>
                </div>
                {i < arr.length - 1 && (
                  <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0 rotate-90 sm:rotate-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Pay Ledger Section ────────────────────────────────────────────────────────

const PayLedgerSection: React.FC = () => {
  const [filter, setFilter] = useState<LedgerFilter>('SEMUA');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const currentBalance = useMemo(() => {
    const credits = LEDGER_ENTRIES.filter((e) => e.type === 'CREDIT').reduce((s, e) => s + e.amount, 0);
    const debits = LEDGER_ENTRIES.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0);
    return credits - debits;
  }, []);

  const totalEscrowHeld = LEDGER_ENTRIES.filter((e) => e.source === 'Escrow Hold').reduce((s, e) => s + e.amount, 0);
  const totalReleased = LEDGER_ENTRIES.filter((e) => e.source === 'Escrow Release').reduce((s, e) => s + e.amount, 0);

  const filtered = LEDGER_ENTRIES.filter((e) => filter === 'SEMUA' || e.type === filter);

  const sourceLabel: Record<LedgerEntry['source'], string> = {
    Referral: 'Komisi Referral',
    Waste: 'Penjualan Limbah',
    Cashback: 'Cashback Promo',
    Belanja: 'Pembelian Ekosistem',
    Kursus: 'Pembelian Kursus',
    'Escrow Release': 'Release Escrow Mitra',
    'Escrow Hold': 'Holding Escrow',
  };

  return (
    <div className="space-y-6">
      {/* Ledger Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-800 via-violet-900 to-slate-900 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-44 h-44 bg-violet-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-violet-300" />
            <div>
              <p className="text-xs text-violet-300 font-bold uppercase tracking-widest">Buku Besar Oriental Pay</p>
              <p className="text-[11px] text-violet-400/70">Akun 2-1050 — Titipan Saldo Oriental Pay (Liabilitas)</p>
            </div>
          </div>
          <p className="text-[11px] text-violet-300 mb-1">Total Saldo Tersimpan (Liabilitas)</p>
          <p className="text-4xl font-extrabold tracking-tight mb-4">
            Rp {currentBalance.toLocaleString('id-ID')}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-[10px] text-violet-200">Total Escrow Held</p>
              <p className="text-sm font-bold">Rp {totalEscrowHeld.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-[10px] text-violet-200">Total Released</p>
              <p className="text-sm font-bold">Rp {totalReleased.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-[10px] text-violet-200">Entri Jurnal</p>
              <p className="text-sm font-bold">{LEDGER_ENTRIES.length} Transaksi</p>
            </div>
          </div>
        </div>
      </div>

      {/* SAK Note */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
        <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-800 space-y-1">
          <p className="font-bold">Standar Akuntansi SAK — Perlakuan Oriental Pay</p>
          <ul className="list-disc list-inside space-y-0.5 text-indigo-700">
            <li>Saldo Oriental Pay dicatat sebagai <strong>Liabilitas</strong> pada akun <code className="bg-indigo-100 px-1 rounded">2-1050 Titipan Saldo Oriental Pay</code></li>
            <li>Dana Escrow Tertahan dicatat pada akun <code className="bg-indigo-100 px-1 rounded">2-1060 Dana Escrow Tertahan</code></li>
            <li>Setiap pencairan escrow ke mitra dicatat sebagai <strong>Dr 2-1060 / Cr 2-1055 Utang Mitra White Label</strong></li>
            <li>Double-entry audit trail otomatis — tidak ada manipulasi buku besar setelah tutup periode</li>
          </ul>
        </div>
      </div>

      {/* COA Quick Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Chart of Accounts — Escrow & Oriental Pay</CardTitle>
          <CardDescription>Kode akun SAK yang digunakan modul Sprint 12</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-2 px-3 text-left">Kode Akun</th>
                  <th className="py-2 px-3 text-left">Nama Akun</th>
                  <th className="py-2 px-3 text-left">Tipe</th>
                  <th className="py-2 px-3 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { code: '1-1001', name: 'Kas / Bank', type: 'Aset', desc: 'Penerimaan dana dari konsumen' },
                  { code: '2-1050', name: 'Titipan Saldo Oriental Pay', type: 'Liabilitas', desc: 'Saldo dompet member yang belum digunakan' },
                  { code: '2-1055', name: 'Utang Mitra White Label', type: 'Liabilitas', desc: 'Kewajiban pembayaran ke mitra setelah escrow release' },
                  { code: '2-1060', name: 'Dana Escrow Tertahan', type: 'Liabilitas', desc: 'Dana ditahan selama masa karantina 14 hari' },
                  { code: '4-1010', name: 'Pendapatan Komisi Escrow', type: 'Pendapatan', desc: 'Fee platform atas layanan escrow (jika diterapkan)' },
                ].map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-indigo-700">{row.code}</td>
                    <td className="py-2.5 px-3 text-slate-800">{row.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.type === 'Aset' ? 'bg-sky-100 text-sky-800' :
                        row.type === 'Liabilitas' ? 'bg-rose-100 text-rose-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>{row.type}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Entries */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h4 className="text-sm font-bold text-slate-900">Jurnal Buku Besar — Akun 2-1050</h4>
          <div className="flex gap-1.5">
            {(['SEMUA', 'CREDIT', 'DEBIT'] as LedgerFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                {f === 'SEMUA' ? 'Semua' : f === 'CREDIT' ? '↑ Kredit' : '↓ Debit'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition overflow-hidden"
            >
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                {/* Type indicator */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  entry.type === 'CREDIT' ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'
                }`}>
                  {entry.type === 'CREDIT'
                    ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    : <ArrowUpRight className="w-4 h-4 text-rose-500" />
                  }
                </div>

                {/* Source icon */}
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {sourceIcon[entry.source]}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{entry.description}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span>{entry.date}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">{entry.accountCode}</span>
                    <span>•</span>
                    <span>{sourceLabel[entry.source]}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-extrabold ${entry.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {entry.type === 'CREDIT' ? '+' : '-'}Rp {entry.amount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">Saldo: Rp {entry.balanceAfter.toLocaleString('id-ID')}</p>
                </div>

                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expandedId === entry.id ? 'rotate-180' : ''}`} />
              </div>

              {/* Expanded double-entry detail */}
              {expandedId === entry.id && (
                <div className="border-t border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Jurnal Double-Entry SAK</p>
                  <table className="w-full text-[11px] font-mono">
                    <thead>
                      <tr className="text-[10px] text-slate-400">
                        <th className="text-left pb-1">Tanggal</th>
                        <th className="text-left pb-1">Kode & Nama Akun</th>
                        <th className="text-right pb-1">Debit</th>
                        <th className="text-right pb-1">Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-1.5 text-slate-500">{entry.date}</td>
                        <td className="py-1.5 text-slate-700">
                          {entry.type === 'CREDIT' ? '1-1001 Kas / Bank' : `${entry.accountCode} ${entry.accountName}`}
                        </td>
                        <td className="py-1.5 text-right font-bold text-slate-900">
                          {entry.type === 'CREDIT' ? `Rp ${entry.amount.toLocaleString('id-ID')}` : '—'}
                        </td>
                        <td className="py-1.5 text-right text-slate-400">
                          {entry.type === 'CREDIT' ? '—' : `Rp ${entry.amount.toLocaleString('id-ID')}`}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-400"></td>
                        <td className="py-1.5 text-slate-700 pl-4">
                          {entry.type === 'CREDIT' ? `${entry.accountCode} ${entry.accountName}` : '1-1001 Kas / Bank'}
                        </td>
                        <td className="py-1.5 text-right text-slate-400">
                          {entry.type === 'CREDIT' ? '—' : `Rp ${entry.amount.toLocaleString('id-ID')}`}
                        </td>
                        <td className="py-1.5 text-right font-bold text-slate-900">
                          {entry.type === 'CREDIT' ? `Rp ${entry.amount.toLocaleString('id-ID')}` : '—'}
                        </td>
                      </tr>
                      {entry.ref && (
                        <tr className="bg-slate-100">
                          <td className="py-1 text-[10px] text-slate-400 pl-1" colSpan={4}>
                            Ref: {entry.ref} — {entry.description}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export const EscrowPayLedger: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Sprint12Tab>('ESCROW');

  const tabs: { id: Sprint12Tab; label: string; icon: React.ReactNode; subtitle: string }[] = [
    { id: 'ESCROW', label: 'Escrow 14 Hari', icon: <ShieldCheck className="w-4 h-4" />, subtitle: 'Manajemen holding dana mitra' },
    { id: 'LEDGER', label: 'Pay Ledger SAK', icon: <BookOpen className="w-4 h-4" />, subtitle: 'Buku besar Oriental Pay' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-800 via-violet-900 to-slate-900 border border-indigo-500/30 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-violet-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="purple" className="text-[10px] bg-white/20 text-white border-white/30 uppercase tracking-widest">
                Sprint 12 — Escrow & Pay Ledger
              </Badge>
              <Badge variant="secondary" className="text-[10px] bg-violet-500/30 text-white border-white/20">
                <Lock className="w-2.5 h-2.5 mr-1 inline" /> Closed-Loop SAK Compliant
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
              White Label Escrow 14 Hari & Pay Ledger
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Sistem holding dana pesanan mitra White Label selama 14 hari masa karantina kualitas, dengan buku besar saldo tertutup Oriental Pay yang sepenuhnya mematuhi standar akuntansi SAK.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center flex-shrink-0">
            {[
              { label: 'Escrow Aktif', value: `${ESCROW_ORDERS.filter((o) => o.status === 'HOLDING').length}` },
              { label: 'Karantina', value: '14 Hari' },
              { label: 'Akun SAK', value: '5' },
              { label: 'Auto Cron', value: '00:01' },
            ].map((s) => (
              <div key={s.label} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-lg font-extrabold text-white">{s.value}</p>
                <p className="text-[10px] text-indigo-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-700/25'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
            }`}
          >
            {tab.icon}
            <div className="text-left hidden sm:block">
              <p className="leading-tight">{tab.label}</p>
              <p className={`text-[10px] font-normal ${activeTab === tab.id ? 'text-indigo-200' : 'text-slate-400'}`}>{tab.subtitle}</p>
            </div>
            <span className="sm:hidden">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'ESCROW' && <EscrowSection />}
      {activeTab === 'LEDGER' && <PayLedgerSection />}
    </div>
  );
};
