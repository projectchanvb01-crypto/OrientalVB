import React, { useState, useEffect } from 'react';
import {
  Bell,
  Wifi,
  Clock,
  TrendingUp,
  DollarSign,
  Maximize2,
  Calendar,
  Layers,
  ChevronRight,
  Store,
  Users,
  LineChart,
  Boxes,
  Recycle,
  Factory,
  UtensilsCrossed,
} from 'lucide-react';
import { NavTabId } from './Sidebar';
import { useEcosystem } from '../../context/EcosystemContext';

interface HeaderProps {
  activeTab: NavTabId;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { financials } = useEcosystem();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabLabels: Record<NavTabId, { title: string; category: string; icon: any }> = {
    RETAIL: { title: 'Kasir Retail (B2C)', category: 'Point of Sale', icon: Store },
    GROSIR: { title: 'Grosir (B2B 3-Ply)', category: 'Point of Sale', icon: Layers },
    WASTE: { title: 'Pembelian Minyak Jelantah (UCO)', category: 'Ekonomi Sirkular', icon: Recycle },
    WHITELABEL: { title: 'White Label & Pasokan B2B UKM', category: 'Kemitraan Maklon', icon: Factory },
    UKM_SUPPLY: { title: 'Pasokan B2B UKM & Referral', category: 'Pasokan Kuliner', icon: UtensilsCrossed },
    MEMBERS: { title: 'Member One Identity & CRM', category: 'Pelanggan', icon: Users },
    ACCOUNTING: { title: 'Akuntansi Kepatuhan SAK', category: 'Keuangan', icon: LineChart },
    ECOSYSTEM: { title: 'Pilar Ekosistem & Rantai Pasok', category: 'Ekosistem Bisnis', icon: Boxes },
  };


  const current = tabLabels[activeTab] || tabLabels.RETAIL;
  const TabIcon = current.icon;

  const totalOmsetLive = financials.retailRevenue + financials.grosirRevenue;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-xl shadow-xs">
      {/* Left: Breadcrumbs & Module Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <span>Oriental</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">{current.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shadow-xs">
            <TabIcon className="w-3.5 h-3.5" />
            {current.title}
          </span>
        </div>
      </div>

      {/* Center/Right: Live Business Stats & Store Ticker */}
      <div className="flex items-center gap-4">
        {/* Live POS Sales Ticker */}
        <div className="hidden xl:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-xs shadow-xs">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500">Omset POS Live:</span>
            <span className="font-bold text-slate-900">
              Rp {totalOmsetLive.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Kasir Tx:</span>
            <span className="font-bold text-emerald-600">{financials.totalTransactionsCount}</span>
          </div>
        </div>

        {/* Real-time Clock */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-xs text-slate-700 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="font-bold">{currentTime}</span>
        </div>

        {/* PWA Connection Status */}
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl font-mono font-medium shadow-xs">
          <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
          <span className="hidden md:inline">Online Sync</span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          title="Fullscreen Mode (F11)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
