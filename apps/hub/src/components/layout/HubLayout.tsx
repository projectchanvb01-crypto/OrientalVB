import React, { useState } from 'react';
import { 
  Home,
  ShoppingBag, 
  CreditCard, 
  GraduationCap, 
  Award, 
  Wallet, 
  Sparkles, 
  Bell, 
  PhoneCall, 
  QrCode, 
  ArrowUpRight, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  User, 
  Layers,
  Smartphone,
  Monitor,
  Compass,
  Tag,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

export type HubTabId = 'BERANDA' | 'UKM_SUPPLY' | 'MEMBERS' | 'ECOSYSTEM' | 'WHITELABEL';

interface HubLayoutProps {
  activeTab: HubTabId;
  setActiveTab: (tab: HubTabId) => void;
  children: React.ReactNode;
}

export const HubLayout: React.FC<HubLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const { 
    currentUser, 
    activeMember 
  } = useEcosystem();

  const orientalPayBalance = activeMember?.orientalPayBalance ?? 2450000;
  const loyaltyPoints = activeMember?.totalLoyaltyPoints ?? 12850;

  // View mode: 'phone' (default max-w-md centered with phone frame) or 'expanded' (full desktop)
  const [viewMode, setViewMode] = useState<'phone' | 'expanded'>('phone');

  // Gojek 5 Bottom Navigation Tabs
  const bottomTabs = [
    {
      id: 'BERANDA' as HubTabId,
      label: 'Beranda',
      icon: Home,
      hasDot: false,
    },
    {
      id: 'UKM_SUPPLY' as HubTabId,
      label: 'Katalog',
      icon: ShoppingBag,
      hasDot: false,
    },
    {
      id: 'MEMBERS' as HubTabId,
      label: 'Promo',
      icon: Tag,
      hasDot: true,
    },
    {
      id: 'ECOSYSTEM' as HubTabId,
      label: 'Aktivitas',
      icon: FileText,
      hasDot: false,
    },
    {
      id: 'WHITELABEL' as HubTabId,
      label: 'White Label',
      icon: Award,
      hasDot: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-900 flex flex-col font-sans select-none antialiased relative justify-center items-center py-0 sm:py-6 overflow-x-hidden">
      {/* Background Decorative Gojek Green Circle (Exact match with reference image) */}
      {viewMode === 'phone' && (
        <div className="hidden lg:flex fixed inset-0 items-center justify-center pointer-events-none z-0">
          <div className="w-[560px] h-[560px] rounded-full bg-[#00AA13] shadow-[0_20px_60px_rgba(0,170,19,0.35)]"></div>
        </div>
      )}

      {/* Top Floating Viewport Control (Desktop only) */}
      <div className="hidden lg:flex fixed top-3 right-4 z-50 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-md items-center gap-2 text-xs font-semibold text-slate-700">
        <span className="text-[10px] text-slate-400 font-mono">TAMPILAN:</span>
        <button
          onClick={() => setViewMode('phone')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
            viewMode === 'phone'
              ? 'bg-[#00AA13] text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Smartphone Gojek</span>
        </button>
        <button
          onClick={() => setViewMode('expanded')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
            viewMode === 'expanded'
              ? 'bg-[#00AA13] text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Layar Penuh</span>
        </button>
      </div>

      {/* Main Container */}
      <div className={`relative z-10 transition-all duration-300 w-full flex justify-center ${
        viewMode === 'expanded' ? 'max-w-7xl px-4' : ''
      }`}>
        {/* Hardware Frame Wrapper for Phone Mode */}
        {viewMode === 'phone' ? (
          <div className="relative">
            {/* Phone Hardware Left Buttons (Volume & Silence) */}
            <div className="hidden sm:block absolute -left-[14px] top-24 w-1.5 h-7 bg-slate-800 rounded-l-sm"></div>
            <div className="hidden sm:block absolute -left-[14px] top-36 w-1.5 h-12 bg-slate-800 rounded-l-sm"></div>
            <div className="hidden sm:block absolute -left-[14px] top-52 w-1.5 h-12 bg-slate-800 rounded-l-sm"></div>

            {/* Phone Hardware Right Button (Power) */}
            <div className="hidden sm:block absolute -right-[14px] top-32 w-1.5 h-16 bg-slate-800 rounded-r-sm"></div>

            {/* 3D POPOUT HIGHLIGHT CARD (Overhanging Left Frame, matching GoRide in reference photo!) */}
            {activeTab === 'BERANDA' && (
              <div
                onClick={() => setActiveTab('UKM_SUPPLY')}
                className="hidden sm:flex flex-col items-center justify-between absolute -left-12 top-[122px] z-30 w-36 h-40 bg-white rounded-3xl p-3 shadow-[0_16px_36px_rgba(0,170,19,0.32)] border-2 border-emerald-400 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 group"
                title="Layanan Utama OriSupply - Buka Katalog"
              >
                <div className="w-full flex-1 bg-[#E6FCE6] rounded-2xl flex flex-col items-center justify-center p-2 border border-emerald-100 group-hover:bg-[#d4fad4] transition">
                  <span className="text-4xl filter drop-shadow select-none group-hover:scale-110 transition duration-300">🛵💨</span>
                </div>
                <div className="text-center mt-1.5">
                  <div className="text-sm font-black text-slate-900 leading-tight tracking-tight">OriSupply</div>
                  <div className="text-[10px] font-bold text-[#00AA13] bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">Bahan Resto</div>
                </div>
              </div>
            )}

            {/* Phone Screen Canvas (390 x 844 standard iPhone aspect) */}
            <div className="w-full sm:w-[412px] h-screen sm:h-[844px] bg-white sm:rounded-[48px] sm:border-[10px] sm:border-slate-950 sm:shadow-[0_30px_70px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden relative">
              {/* Smartphone Status Bar & Dynamic Island */}
              <div className="bg-white pt-2.5 px-6 pb-1.5 flex items-center justify-between text-xs font-bold font-mono text-slate-900 select-none shrink-0 border-b border-slate-50">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-black">14:35</span>
                  <span className="text-[10px] text-slate-400">↗</span>
                </div>
                {/* Dynamic Island Notch */}
                <div className="w-24 h-5 bg-slate-950 rounded-full mx-auto hidden sm:flex items-center justify-end pr-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#1e293b] border border-slate-800"></div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>4G</span>
                  <div className="w-5 h-2.5 border border-slate-800 rounded-sm p-0.5 flex items-center">
                    <div className="h-full w-full bg-slate-800 rounded-2xs"></div>
                  </div>
                </div>
              </div>

              {/* Sub-page Navigation Header */}
              {activeTab !== 'BERANDA' && (
                <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs shrink-0">
                  <button
                    onClick={() => setActiveTab('BERANDA')}
                    className="flex items-center gap-1 text-xs font-bold text-[#00AA13] hover:text-emerald-800 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <div className="text-xs font-black text-slate-900 font-mono uppercase tracking-wide">
                    {activeTab === 'UKM_SUPPLY' && 'Katalog Bahan Baku'}
                    {activeTab === 'MEMBERS' && 'Member & Promo'}
                    {activeTab === 'ECOSYSTEM' && 'Oriental Learn & Pay'}
                    {activeTab === 'WHITELABEL' && 'Mitra White Label'}
                  </div>
                  <div className="w-8"></div>
                </div>
              )}

              {/* Scrollable Screen Content */}
              <main className="flex-1 overflow-y-auto px-4 py-2.5 space-y-4 no-scrollbar">
                {children}
              </main>

              {/* Gojek Iconic 5-Tab Bottom Navigation Bar */}
              <nav className="sticky bottom-0 inset-x-0 bg-white/98 backdrop-blur-lg border-t border-slate-200/80 z-40 px-2 pt-1.5 pb-1 shadow-lg flex flex-col shrink-0">
                <div className="flex items-center justify-around">
                  {bottomTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative group cursor-pointer ${
                          isActive
                            ? 'text-[#00AA13] font-bold'
                            : 'text-slate-400 hover:text-slate-600 font-medium'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-2xl transition-all relative ${
                            isActive ? 'bg-[#00AA13]/10 text-[#00AA13]' : 'group-hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                          {tab.hasDot && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border border-white"></span>
                          )}
                        </div>
                        <span className="text-[10px] leading-tight mt-0.5 tracking-tight font-sans">
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* iOS Home Indicator Bar */}
                <div className="w-28 h-1 bg-slate-900 rounded-full mx-auto mt-1 mb-0.5"></div>
              </nav>
            </div>
          </div>
        ) : (
          /* Expanded Full-Screen Mode for Desktop Dashboard */
          <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200 min-h-screen flex flex-col overflow-hidden">
            {/* Expanded Top Navigation */}
            <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00AA13] flex items-center justify-center text-white font-black text-lg shadow-sm">
                  O
                </div>
                <div>
                  <h1 className="text-base font-black text-slate-900 tracking-tight">Oriental Superapp</h1>
                  <p className="text-[11px] text-slate-500 font-mono">B2B Resto Supply & Omnichannel Ecosystem</p>
                </div>
              </div>

              {/* Desktop Nav Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {bottomTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-white text-[#00AA13] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Content */}
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
              {children}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
