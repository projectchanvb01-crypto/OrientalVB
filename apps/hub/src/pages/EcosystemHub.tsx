import React, { useState } from 'react';
import {
  GraduationCap,
  PlayCircle,
  FileText,
  Award,
  QrCode,
  Users,
  UserPlus,
  Wallet,
  ShieldCheck,
  Star,
  Trophy,
  ChevronRight,
  CheckCircle,
  Clock,
  BookOpen,
  Video,
  HelpCircle,
  Download,
  CalendarDays,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Coins,
  Building2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3,
  Phone,
  Mail,
  Shield,
  Crown,
  Medal,
  Target,
  BarChart3,
  AlertCircle,
  Zap,
  Gift,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// ─── Type Definitions ──────────────────────────────────────────────────────────

type LearnTab = 'KATALOG' | 'AKTIF' | 'SELESAI';
type HubTab = 'LEARN' | 'PIC_DELEGATION' | 'ORIENTAL_PAY' | 'LOYALTY_TIER';

type CourseCategory = 'semua' | 'ukm' | 'internal' | 'publik';
type CourseLevel = 'Pemula' | 'Menengah' | 'Mahir';
type CourseStatus = 'available' | 'enrolled' | 'completed' | 'locked';

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: 'ukm' | 'internal' | 'publik';
  level: CourseLevel;
  durationHours: number;
  videoCount: number;
  quizCount: number;
  price: number | 'gratis';
  memberDiscount: number;
  pointReward: number;
  status: CourseStatus;
  progressPct: number;
  thumbnail: string; // gradient class
  tags: string[];
  rating: number;
  enrolled: number;
  certificate: boolean;
}

interface PicSubAccount {
  id: string;
  name: string;
  role: 'Chef' | 'Barista' | 'Purchasing' | 'Manager';
  phone: string;
  email: string;
  isActive: boolean;
  permissions: string[];
  lastLogin: string;
}

interface PayTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  source: 'Referral' | 'Cashback' | 'Waste' | 'Belanja' | 'Kursus';
  amount: number;
  description: string;
  date: string;
}

interface LoyaltyTier {
  name: string;
  minSpend: number;
  maxSpend: number | null;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  extraDiscount: string;
  pointMultiplier: string;
  benefits: string[];
}

// ─── Static Data ───────────────────────────────────────────────────────────────

const COURSES: Course[] = [
  {
    id: 'C001',
    title: 'SOP Dapur Higienis & HACCP untuk Warung Makan',
    instructor: 'Chef Budi Santoso',
    category: 'ukm',
    level: 'Pemula',
    durationHours: 4,
    videoCount: 12,
    quizCount: 3,
    price: 150000,
    memberDiscount: 30,
    pointReward: 50,
    status: 'enrolled',
    progressPct: 65,
    thumbnail: 'from-orange-500 to-red-600',
    tags: ['Dapur', 'Higienitas', 'HACCP'],
    rating: 4.8,
    enrolled: 214,
    certificate: true,
  },
  {
    id: 'C002',
    title: 'Teknik Barista Profesional: Espresso & Latte Art',
    instructor: 'Reza Barista Champion',
    category: 'ukm',
    level: 'Menengah',
    durationHours: 6,
    videoCount: 18,
    quizCount: 4,
    price: 250000,
    memberDiscount: 30,
    pointReward: 80,
    status: 'available',
    progressPct: 0,
    thumbnail: 'from-amber-700 to-stone-800',
    tags: ['Barista', 'Kopi', 'Latte Art'],
    rating: 4.9,
    enrolled: 378,
    certificate: true,
  },
  {
    id: 'C003',
    title: 'Manajemen HPP & Harga Jual Warung yang Menguntungkan',
    instructor: 'Dra. Sari Ekonomi',
    category: 'ukm',
    level: 'Pemula',
    durationHours: 3,
    videoCount: 9,
    quizCount: 2,
    price: 'gratis',
    memberDiscount: 0,
    pointReward: 30,
    status: 'completed',
    progressPct: 100,
    thumbnail: 'from-emerald-500 to-teal-700',
    tags: ['HPP', 'Keuangan', 'Warung'],
    rating: 4.7,
    enrolled: 512,
    certificate: true,
  },
  {
    id: 'C004',
    title: 'Standar Layanan Kasir & Etiket Pelanggan Oriental',
    instructor: 'Tim Oriental Internal',
    category: 'internal',
    level: 'Pemula',
    durationHours: 2,
    videoCount: 6,
    quizCount: 2,
    price: 'gratis',
    memberDiscount: 0,
    pointReward: 20,
    status: 'available',
    progressPct: 0,
    thumbnail: 'from-sky-500 to-indigo-600',
    tags: ['Kasir', 'Pelayanan', 'Internal'],
    rating: 4.6,
    enrolled: 89,
    certificate: true,
  },
  {
    id: 'C005',
    title: 'Strategi Bisnis Kuliner: Dari Warung ke Cabang',
    instructor: 'Prof. Hendra MBA',
    category: 'publik',
    level: 'Mahir',
    durationHours: 8,
    videoCount: 24,
    quizCount: 5,
    price: 350000,
    memberDiscount: 20,
    pointReward: 120,
    status: 'locked',
    progressPct: 0,
    thumbnail: 'from-violet-600 to-purple-800',
    tags: ['Bisnis', 'Ekspansi', 'Strategi'],
    rating: 4.9,
    enrolled: 156,
    certificate: true,
  },
  {
    id: 'C006',
    title: 'Food Safety & Pengelolaan Limbah Dapur Bertanggung Jawab',
    instructor: 'Tim Oriental Waste',
    category: 'ukm',
    level: 'Pemula',
    durationHours: 2.5,
    videoCount: 8,
    quizCount: 2,
    price: 'gratis',
    memberDiscount: 0,
    pointReward: 25,
    status: 'available',
    progressPct: 0,
    thumbnail: 'from-lime-500 to-green-700',
    tags: ['Food Safety', 'Limbah', 'UCO'],
    rating: 4.5,
    enrolled: 301,
    certificate: false,
  },
];

const INITIAL_PIC_ACCOUNTS: PicSubAccount[] = [
  {
    id: 'PIC001',
    name: 'Ahmad Fauzi',
    role: 'Purchasing',
    phone: '081234567890',
    email: 'ahmad.fauzi@warungmamak.id',
    isActive: true,
    permissions: ['Buat Pesanan', 'Lihat Katalog', 'Jadwal Kirim'],
    lastLogin: '28 Sep 2026, 09:14',
  },
  {
    id: 'PIC002',
    name: 'Sinta Dewi',
    role: 'Chef',
    phone: '085678901234',
    email: 'sinta@warungmamak.id',
    isActive: true,
    permissions: ['Buat Pesanan', 'Lihat Katalog'],
    lastLogin: '27 Sep 2026, 14:22',
  },
  {
    id: 'PIC003',
    name: 'Rizal Aditya',
    role: 'Manager',
    phone: '082345678901',
    email: 'rizal@warungmamak.id',
    isActive: false,
    permissions: ['Buat Pesanan', 'Lihat Katalog', 'Jadwal Kirim', 'Lihat Laporan', 'Kelola PIC'],
    lastLogin: '20 Sep 2026, 11:05',
  },
];

const PAY_TRANSACTIONS: PayTransaction[] = [
  { id: 'T001', type: 'CREDIT', source: 'Referral', amount: 48750, description: 'Komisi referral bisnis — Warung Pak Eko', date: '28 Sep 2026' },
  { id: 'T002', type: 'DEBIT', source: 'Belanja', amount: 120000, description: 'Pembayaran UKM Supply — Minyak Goreng 20L', date: '27 Sep 2026' },
  { id: 'T003', type: 'CREDIT', source: 'Cashback', amount: 15000, description: 'Cashback promo bulanan September', date: '26 Sep 2026' },
  { id: 'T004', type: 'CREDIT', source: 'Waste', amount: 32500, description: 'Penjualan UCO 6.5 kg × Rp 5.000', date: '25 Sep 2026' },
  { id: 'T005', type: 'DEBIT', source: 'Kursus', amount: 175000, description: 'Pembelian kursus Barista Profesional (after disc.)', date: '24 Sep 2026' },
  { id: 'T006', type: 'CREDIT', source: 'Referral', amount: 22500, description: 'Komisi referral bisnis — Kafe Sunrise', date: '22 Sep 2026' },
];

const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'Reguler',
    minSpend: 0,
    maxSpend: 10000000,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: <Star className="w-5 h-5 text-slate-400" />,
    extraDiscount: '—',
    pointMultiplier: '1×',
    benefits: ['Akses katalog UKM Supply', 'Poin standar setiap transaksi'],
  },
  {
    name: 'Bronze',
    minSpend: 10000000,
    maxSpend: 20000000,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Medal className="w-5 h-5 text-amber-600" />,
    extraDiscount: 'TBD',
    pointMultiplier: 'TBD',
    benefits: ['Benefit sedang dikonfirmasi', 'Notifikasi sebelum evaluasi turun tier'],
  },
  {
    name: 'Silver',
    minSpend: 20000000,
    maxSpend: 40000000,
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    icon: <Medal className="w-5 h-5 text-slate-500" />,
    extraDiscount: 'TBD',
    pointMultiplier: 'TBD',
    benefits: ['Benefit sedang dikonfirmasi', 'Notifikasi sebelum evaluasi turun tier'],
  },
  {
    name: 'Gold',
    minSpend: 40000000,
    maxSpend: 70000000,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    icon: <Trophy className="w-5 h-5 text-yellow-500" />,
    extraDiscount: '—',
    pointMultiplier: '+10%',
    benefits: ['Multiplier poin +10%', 'Prioritas jadwal pengiriman', 'Akses laporan pembelian detail'],
  },
  {
    name: 'Platinum',
    minSpend: 70000000,
    maxSpend: null,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-300',
    icon: <Crown className="w-5 h-5 text-violet-600" />,
    extraDiscount: 'Extra 1%',
    pointMultiplier: '+15%',
    benefits: ['Diskon ekstra 1% setiap transaksi', 'Multiplier poin +15%', 'Dedicated account manager', 'Early access promo & produk baru'],
  },
];

// ─── Sub-Components ────────────────────────────────────────────────────────────

// --- Oriental Learn Tab ---

const CategoryPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
      active ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
    }`}
  >
    {label}
  </button>
);

const CourseCard: React.FC<{ course: Course; onEnroll: (id: string) => void }> = ({ course, onEnroll }) => {
  const statusConfig = {
    available: { label: 'Tersedia', badge: 'secondary' as const, action: 'Daftar Sekarang' },
    enrolled: { label: 'Sedang Belajar', badge: 'success' as const, action: 'Lanjutkan' },
    completed: { label: 'Selesai ✓', badge: 'default' as const, action: 'Lihat Sertifikat' },
    locked: { label: 'Terkunci', badge: 'warning' as const, action: 'Selesaikan Prasyarat' },
  };

  const cfg = statusConfig[course.status];
  const discountedPrice =
    course.price === 'gratis'
      ? 'Gratis'
      : `Rp ${((course.price as number) * (1 - course.memberDiscount / 100)).toLocaleString('id-ID')}`;
  const originalPrice = course.price === 'gratis' ? null : `Rp ${(course.price as number).toLocaleString('id-ID')}`;

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className={`h-28 bg-gradient-to-br ${course.thumbnail} relative flex items-end p-4`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 border border-white/30">
            {course.level}
          </span>
          <span className="text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 border border-white/30 capitalize">
            {course.category === 'ukm' ? 'UKM Member' : course.category === 'internal' ? 'Internal' : 'Publik'}
          </span>
        </div>
        {course.status === 'completed' && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        )}
        {course.status === 'locked' && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-slate-700/70 rounded-full flex items-center justify-center shadow">
            <Lock className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-col flex-1 gap-3 pt-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">{course.title}</h4>
          <p className="text-[11px] text-slate-500 mt-1">oleh {course.instructor}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Video className="w-3 h-3" />{course.videoCount} video</span>
          <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{course.quizCount} kuis</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.durationHours} jam</span>
        </div>

        {/* Rating & Enrolled */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-amber-500 font-bold">★ {course.rating}</span>
          <span className="text-slate-400">({course.enrolled.toLocaleString('id-ID')} peserta)</span>
          {course.certificate && (
            <span className="flex items-center gap-1 text-teal-600 font-semibold ml-auto">
              <Award className="w-3 h-3" />Sertifikat
            </span>
          )}
        </div>

        {/* Progress bar (enrolled) */}
        {course.status === 'enrolled' && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Progress</span>
              <span className="font-bold text-teal-600">{course.progressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all"
                style={{ width: `${course.progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {course.tags.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">{t}</span>
          ))}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div>
            <p className="text-base font-extrabold text-slate-900">{discountedPrice}</p>
            {originalPrice && course.memberDiscount > 0 && (
              <p className="text-[10px] text-slate-400 line-through">{originalPrice} <span className="text-emerald-600 no-underline font-bold ml-1">Disc {course.memberDiscount}%</span></p>
            )}
            {course.price !== 'gratis' && (
              <p className="text-[10px] text-teal-600 font-semibold">+{course.pointReward} poin member</p>
            )}
          </div>
          <Badge variant={cfg.badge}>{cfg.label}</Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <button
          onClick={() => onEnroll(course.id)}
          disabled={course.status === 'locked'}
          className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            course.status === 'locked'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : course.status === 'completed'
              ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
              : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 shadow-sm hover:shadow-md'
          }`}
        >
          {course.status === 'enrolled' ? <PlayCircle className="w-3.5 h-3.5" /> : course.status === 'completed' ? <Award className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
          {cfg.action}
        </button>
      </CardFooter>
    </Card>
  );
};

const EsertifikatCard: React.FC<{ course: Course }> = ({ course }) => (
  <div className="relative overflow-hidden rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-5 shadow-md">
    <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-100 rounded-full blur-2xl opacity-60" />
    <div className="relative z-10 flex items-start gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
        <Award className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">E-Sertifikat Resmi</p>
        <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">{course.title}</h4>
        <p className="text-[11px] text-slate-500 mt-0.5">oleh {course.instructor}</p>
        <div className="flex items-center gap-3 mt-3">
          <button className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition cursor-pointer">
            <QrCode className="w-3.5 h-3.5" /> Verifikasi QR
          </button>
          <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  </div>
);

const OrientalLearnSection: React.FC = () => {
  const [learnTab, setLearnTab] = useState<LearnTab>('KATALOG');
  const [category, setCategory] = useState<CourseCategory>('semua');
  const [courses, setCourses] = useState<Course[]>(COURSES);

  const filtered = courses.filter((c) => {
    if (learnTab === 'AKTIF') return c.status === 'enrolled';
    if (learnTab === 'SELESAI') return c.status === 'completed';
    if (category === 'semua') return true;
    return c.category === category;
  });

  const completedCourses = courses.filter((c) => c.status === 'completed');

  const handleEnroll = (id: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id && c.status === 'available' ? { ...c, status: 'enrolled', progressPct: 0 } : c)),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Kursus Tersedia', value: courses.filter((c) => c.status !== 'locked').length, icon: <BookOpen className="w-4 h-4 text-teal-600" />, color: 'text-teal-700' },
          { label: 'Sedang Belajar', value: courses.filter((c) => c.status === 'enrolled').length, icon: <PlayCircle className="w-4 h-4 text-sky-500" />, color: 'text-sky-700' },
          { label: 'Selesai', value: completedCourses.length, icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, color: 'text-emerald-700' },
          { label: 'Poin Diraih', value: completedCourses.reduce((a, c) => a + c.pointReward, 0), icon: <Coins className="w-4 h-4 text-amber-500" />, color: 'text-amber-700' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-[11px] text-slate-500">{s.label}</span></div>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['KATALOG', 'AKTIF', 'SELESAI'] as LearnTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setLearnTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              learnTab === t ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'
            }`}
          >
            {t === 'KATALOG' ? '📚 Katalog' : t === 'AKTIF' ? '▶️ Sedang Belajar' : '🏆 Sertifikat'}
          </button>
        ))}
      </div>

      {/* Katalog */}
      {learnTab === 'KATALOG' && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {(['semua', 'ukm', 'internal', 'publik'] as CourseCategory[]).map((cat) => (
              <CategoryPill
                key={cat}
                label={{ semua: 'Semua', ukm: 'UKM Eksklusif', internal: 'Internal', publik: 'Publik' }[cat]}
                active={category === cat}
                onClick={() => setCategory(cat)}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} onEnroll={handleEnroll} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-12 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Tidak ada kursus di kategori ini.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Active */}
      {learnTab === 'AKTIF' && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <PlayCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Anda belum mendaftar kursus apapun.</p>
              <button onClick={() => setLearnTab('KATALOG')} className="mt-4 text-xs text-teal-600 font-bold hover:underline cursor-pointer">
                Jelajahi Katalog →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => <CourseCard key={c.id} course={c} onEnroll={handleEnroll} />)}
            </div>
          )}
        </div>
      )}

      {/* Certificates */}
      {learnTab === 'SELESAI' && (
        <div className="space-y-4">
          {completedCourses.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada sertifikat diraih.</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 flex items-center gap-3">
                <BadgeCheck className="w-6 h-6 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-teal-800">Sertifikat Terverifikasi QR Oriental</p>
                  <p className="text-[11px] text-teal-600">Setiap sertifikat memiliki kode QR unik yang dapat diverifikasi secara publik melalui portal Oriental.</p>
                </div>
              </div>
              <div className="space-y-3">
                {completedCourses.map((c) => <EsertifikatCard key={c.id} course={c} />)}
              </div>
            </>
          )}
        </div>
      )}

      {/* Workshop Offline Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 p-5 flex items-center gap-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-6 h-6 text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">Workshop Offline</p>
          <h4 className="text-sm font-bold text-white">Pelatihan Tatap Muka Terakreditasi Oriental</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Registrasi tempat duduk & QR check-in tersedia — jadwal berikutnya: Oktober 2026</p>
        </div>
        <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-xl transition cursor-pointer">
          Daftar <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// --- PIC Delegation Tab ---

const ROLE_PERMISSIONS: Record<PicSubAccount['role'], string[]> = {
  Chef: ['Buat Pesanan', 'Lihat Katalog'],
  Barista: ['Buat Pesanan', 'Lihat Katalog'],
  Purchasing: ['Buat Pesanan', 'Lihat Katalog', 'Jadwal Kirim'],
  Manager: ['Buat Pesanan', 'Lihat Katalog', 'Jadwal Kirim', 'Lihat Laporan', 'Kelola PIC'],
};

const ALL_PERMISSIONS = ['Buat Pesanan', 'Lihat Katalog', 'Jadwal Kirim', 'Lihat Laporan', 'Kelola PIC'];

const ROLE_COLORS: Record<PicSubAccount['role'], string> = {
  Chef: 'text-orange-700 bg-orange-50 border-orange-200',
  Barista: 'text-amber-700 bg-amber-50 border-amber-200',
  Purchasing: 'text-sky-700 bg-sky-50 border-sky-200',
  Manager: 'text-violet-700 bg-violet-50 border-violet-200',
};

const PicDelegationSection: React.FC = () => {
  const [accounts, setAccounts] = useState<PicSubAccount[]>(INITIAL_PIC_ACCOUNTS);
  const [showForm, setShowForm] = useState(false);
  const [newPic, setNewPic] = useState<Partial<PicSubAccount>>({ role: 'Purchasing', permissions: ROLE_PERMISSIONS['Purchasing'] });

  const toggleActive = (id: string) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  };

  const handleRoleChange = (role: PicSubAccount['role']) => {
    setNewPic((p) => ({ ...p, role, permissions: ROLE_PERMISSIONS[role] }));
  };

  const handleAddPic = () => {
    if (!newPic.name || !newPic.phone) return;
    const id = `PIC${String(accounts.length + 1).padStart(3, '0')}`;
    setAccounts((prev) => [
      ...prev,
      {
        id,
        name: newPic.name!,
        role: newPic.role as PicSubAccount['role'],
        phone: newPic.phone!,
        email: newPic.email || '',
        isActive: true,
        permissions: newPic.permissions || [],
        lastLogin: '—',
      },
    ]);
    setNewPic({ role: 'Purchasing', permissions: ROLE_PERMISSIONS['Purchasing'] });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-slate-900">Akun Induk UKM — Delegasi PIC</h3>
          <p className="text-xs text-slate-500 mt-1">
            Kelola sub-akun tim Anda (Chef, Barista, Purchasing, Manager) untuk membuat pesanan bahan baku UKM Supply secara mandiri.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" /> Tambah PIC
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-emerald-800">Form Tambah Akun PIC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Nama Lengkap *</label>
                <input
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Nama PIC"
                  value={newPic.name || ''}
                  onChange={(e) => setNewPic((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Nomor HP *</label>
                <input
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="08xxxxxxxxxx"
                  value={newPic.phone || ''}
                  onChange={(e) => setNewPic((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Email</label>
                <input
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="email@domain.com"
                  value={newPic.email || ''}
                  onChange={(e) => setNewPic((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Role</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                  value={newPic.role}
                  onChange={(e) => handleRoleChange(e.target.value as PicSubAccount['role'])}
                >
                  {(['Chef', 'Barista', 'Purchasing', 'Manager'] as PicSubAccount['role'][]).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Hak Akses</label>
              <div className="flex gap-2 flex-wrap">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPic.permissions?.includes(perm) || false}
                      onChange={(e) => {
                        setNewPic((p) => ({
                          ...p,
                          permissions: e.target.checked
                            ? [...(p.permissions || []), perm]
                            : (p.permissions || []).filter((x) => x !== perm),
                        }));
                      }}
                      className="rounded"
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddPic}
                className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Simpan PIC
              </button>
              <button onClick={() => setShowForm(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer">
                Batal
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PIC List */}
      <div className="space-y-3">
        {accounts.map((acc) => (
          <Card key={acc.id} className={`transition ${!acc.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-slate-700 text-base flex-shrink-0">
                  {acc.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{acc.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[acc.role]}`}>
                      {acc.role}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${acc.isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                      {acc.isActive ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-1.5 flex-wrap text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{acc.phone}</span>
                    {acc.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{acc.email}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Login terakhir: {acc.lastLogin}</span>
                  </div>

                  {/* Permissions */}
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {acc.permissions.map((p) => (
                      <span key={p} className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />{p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(acc.id)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${acc.isActive ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                    title={acc.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {acc.isActive ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setAccounts((prev) => prev.filter((a) => a.id !== acc.id))}
                    className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                    title="Hapus PIC"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info box */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-sky-800 space-y-1">
          <p className="font-bold">Hierarki Akun UKM</p>
          <p>Akun Induk (Owner UKM) dapat mengatur limit belanja, metode pembayaran (TOP/Cash), dan hak otorisasi setiap PIC. Akun PIC hanya dapat membuat keranjang pesanan — persetujuan akhir tetap di tangan akun induk jika limit dilampaui.</p>
        </div>
      </div>
    </div>
  );
};

// --- Oriental Pay Tab ---

const OrientalPaySection: React.FC = () => {
  const [showBalance, setShowBalance] = useState(true);
  const balance = PAY_TRANSACTIONS.reduce((acc, t) => (t.type === 'CREDIT' ? acc + t.amount : acc - t.amount), 0);
  const totalCredit = PAY_TRANSACTIONS.filter((t) => t.type === 'CREDIT').reduce((a, t) => a + t.amount, 0);
  const totalDebit = PAY_TRANSACTIONS.filter((t) => t.type === 'DEBIT').reduce((a, t) => a + t.amount, 0);

  const sourceIcon: Record<PayTransaction['source'], React.ReactNode> = {
    Referral: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    Cashback: <Gift className="w-4 h-4 text-pink-500" />,
    Waste: <RefreshCw className="w-4 h-4 text-lime-500" />,
    Belanja: <ArrowUpRight className="w-4 h-4 text-rose-500" />,
    Kursus: <GraduationCap className="w-4 h-4 text-violet-500" />,
  };

  return (
    <div className="space-y-6">
      {/* Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-emerald-200 font-semibold uppercase tracking-widest">Oriental Pay</p>
              <p className="text-[11px] text-emerald-300/70 mt-0.5">Closed-Loop Ecosystem Wallet</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/50 border border-emerald-600/40 px-2 py-0.5 rounded-full">● Internal</span>
              <button onClick={() => setShowBalance(!showBalance)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer">
                {showBalance ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-emerald-200 mb-1">Saldo Tersedia</p>
            <p className="text-4xl font-extrabold tracking-tight">
              {showBalance ? `Rp ${balance.toLocaleString('id-ID')}` : 'Rp ••••••'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-[10px] text-emerald-200">Total Masuk (30 hr)</p>
              <p className="text-base font-bold">Rp {totalCredit.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-[10px] text-emerald-200">Total Keluar (30 hr)</p>
              <p className="text-base font-bold">Rp {totalDebit.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Source of Funds */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Komisi Referral', icon: <TrendingUp className="w-4 h-4 text-emerald-600" />, desc: 'Otomatis dari program referral bisnis & influencer' },
          { label: 'Hasil Waste', icon: <RefreshCw className="w-4 h-4 text-lime-600" />, desc: 'Saldo penjualan UCO & limbah organik' },
          { label: 'Cashback', icon: <Gift className="w-4 h-4 text-pink-500" />, desc: 'Cashback promo & event ekosistem Oriental' },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">{s.icon}</div>
            <p className="text-xs font-bold text-slate-900">{s.label}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
          </Card>
        ))}
      </div>

      {/* Policy */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-bold">Kebijakan Oriental Pay — Closed-Loop</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-700">
            <li>Saldo <strong>hanya dapat digunakan</strong> untuk transaksi di dalam ekosistem Oriental</li>
            <li>Transfer antar member & penarikan ke rekening bank <strong>tidak tersedia</strong></li>
            <li>Dana masuk otomatis dari referral, cashback, dan penjualan waste — tanpa klaim manual</li>
            <li>Saldo dicatat sebagai liabilitas (Titipan Pelanggan) sesuai standar akuntansi SAK</li>
          </ul>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">Riwayat Transaksi</h4>
        <div className="space-y-2">
          {PAY_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                {sourceIcon[tx.source]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{tx.description}</p>
                <p className="text-[11px] text-slate-500">{tx.source} • {tx.date}</p>
              </div>
              <div className={`text-sm font-extrabold flex-shrink-0 ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {tx.type === 'CREDIT' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Loyalty Tier Tab ---

const LoyaltyTierSection: React.FC = () => {
  const currentSpend = 42500000; // Rp 42.5 juta avg — Gold tier
  const currentTier = LOYALTY_TIERS.find(
    (t) => currentSpend >= t.minSpend && (t.maxSpend === null || currentSpend < t.maxSpend),
  )!;
  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(currentTier) + 1];

  const pctToNext = nextTier
    ? Math.min(((currentSpend - currentTier.minSpend) / ((nextTier.minSpend || 1) - currentTier.minSpend)) * 100, 100)
    : 100;

  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className={`relative overflow-hidden rounded-3xl p-6 border-2 ${currentTier.border} ${currentTier.bg}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-white border-2 ${currentTier.border} flex items-center justify-center shadow-md flex-shrink-0`}>
            {currentTier.icon}
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tier Aktif Anda</p>
            <h3 className={`text-2xl font-extrabold ${currentTier.color}`}>{currentTier.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Dievaluasi setiap bulan berdasarkan rata-rata belanja 3 bulan terakhir</p>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Rata-rata belanja bulanan</span>
                <span className={`font-bold ${currentTier.color}`}>Rp {currentSpend.toLocaleString('id-ID')}</span>
              </div>
              {nextTier && (
                <>
                  <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden border border-white/80">
                    <div
                      className={`h-full rounded-full transition-all bg-gradient-to-r ${currentTier.name === 'Gold' ? 'from-yellow-400 to-amber-500' : 'from-violet-500 to-purple-600'}`}
                      style={{ width: `${pctToNext}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Rp {(nextTier.minSpend - currentSpend).toLocaleString('id-ID')} lagi untuk naik ke tier <strong>{nextTier.name}</strong>
                  </p>
                </>
              )}
              {!nextTier && <p className="text-xs font-bold text-violet-700">🎉 Anda berada di tier tertinggi — Platinum!</p>}
            </div>
          </div>
        </div>
      </div>

      {/* All Tiers */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900">Semua Tier UKM Supply</h4>
        <p className="text-xs text-slate-500">Scope: khusus channel UKM Supply Chain. Evaluasi rolling 3 bulan, dievaluasi setiap bulan.</p>

        <div className="space-y-2">
          {LOYALTY_TIERS.map((tier) => {
            const isActive = tier.name === currentTier.name;
            const isExpanded = expandedTier === tier.name;
            return (
              <div
                key={tier.name}
                className={`rounded-2xl border-2 transition-all ${tier.border} ${isActive ? tier.bg + ' shadow-md' : 'bg-white'}`}
              >
                <button
                  onClick={() => setExpandedTier(isExpanded ? null : tier.name)}
                  className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl border-2 ${tier.border} bg-white flex items-center justify-center flex-shrink-0`}>
                    {tier.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-extrabold ${tier.color}`}>{tier.name}</span>
                      {isActive && <span className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">Tier Anda</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {tier.maxSpend ? `Rp ${tier.minSpend.toLocaleString('id-ID')} – Rp ${tier.maxSpend.toLocaleString('id-ID')} / bln` : `> Rp ${tier.minSpend.toLocaleString('id-ID')} / bln`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 text-[11px]">
                    <div className="text-center hidden sm:block">
                      <p className="text-slate-500">Diskon Ekstra</p>
                      <p className={`font-bold ${tier.color}`}>{tier.extraDiscount}</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-slate-500">Point Multiplier</p>
                      <p className={`font-bold ${tier.color}`}>{tier.pointMultiplier}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-200/60 pt-3 space-y-2">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Benefit</p>
                    <ul className="space-y-1.5">
                      {tier.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />{b}
                        </li>
                      ))}
                    </ul>
                    {(tier.name === 'Bronze' || tier.name === 'Silver') && (
                      <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Benefit detail untuk tier ini sedang dikonfirmasi oleh manajemen Oriental.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Downgrade Policy */}
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-rose-800 space-y-1">
          <p className="font-bold">Kebijakan Evaluasi & Downgrade</p>
          <ul className="list-disc list-inside space-y-0.5 text-rose-700">
            <li>Tier dievaluasi setiap bulan berdasarkan <strong>rata-rata belanja 3 bulan terakhir</strong></li>
            <li>Member akan <strong>dinotifikasi terlebih dahulu</strong> sebelum evaluasi downgrade</li>
            <li>Downgrade berlaku <strong>segera setelah evaluasi</strong> jika rata-rata tidak terpenuhi</li>
            <li>Member baru mulai dari tier <strong>Reguler</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export const EcosystemHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HubTab>('LEARN');

  const tabs: { id: HubTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'LEARN', label: 'Oriental Learn', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'PIC_DELEGATION', label: 'Delegasi PIC', icon: <Users className="w-4 h-4" /> },
    { id: 'ORIENTAL_PAY', label: 'Oriental Pay', icon: <Wallet className="w-4 h-4" /> },
    { id: 'LOYALTY_TIER', label: 'Tier Loyalitas', icon: <Crown className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-950 border border-emerald-500/40 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="success" className="uppercase tracking-widest text-[10px] bg-white/20 text-white border-white/30 backdrop-blur-md">
                Sprint 11 — Superapp Hub
              </Badge>
              <Badge variant="success" className="text-[10px] bg-emerald-500/30 text-white border-white/20">
                <Sparkles className="w-2.5 h-2.5 mr-1 inline" /> USP Oriental Ecosystem
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
              Pusat Sinergi Ekosistem Oriental
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Portal edukasi UKM terintegrasi, delegasi akun PIC multi-level, dompet ekosistem Oriental Pay, dan program loyalitas tier UKM Supply — semua dalam satu platform.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center flex-shrink-0">
            {[
              { label: 'Kursus', value: COURSES.length },
              { label: 'Peserta', value: '1.2K+' },
              { label: 'Sertifikat', value: '450+' },
              { label: 'Tier', value: '5' },
            ].map((s) => (
              <div key={s.label} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-lg font-extrabold text-white">{s.value}</p>
                <p className="text-[10px] text-emerald-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className="text-[9px] px-1.5 py-0.5 bg-white/30 rounded-full font-bold">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'LEARN' && <OrientalLearnSection />}
        {activeTab === 'PIC_DELEGATION' && <PicDelegationSection />}
        {activeTab === 'ORIENTAL_PAY' && <OrientalPaySection />}
        {activeTab === 'LOYALTY_TIER' && <LoyaltyTierSection />}
      </div>
    </div>
  );
};
