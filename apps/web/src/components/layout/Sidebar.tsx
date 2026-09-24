import React, { useState } from 'react';
import {
  Store,
  Layers,
  Users,
  LineChart,
  Boxes,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Gift,
  Share2,
  FileSpreadsheet,
  Recycle,
  Factory,
  UtensilsCrossed,
  Lock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEcosystem } from '../../context/EcosystemContext';

export type NavTabId =
  | 'RETAIL'
  | 'GROSIR'
  | 'WASTE'
  | 'WHITELABEL'
  | 'UKM_SUPPLY'
  | 'MEMBERS'
  | 'ACCOUNTING'
  | 'ECOSYSTEM';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  currentUserRole: 'SUPER_ADMIN' | 'ADMIN_MANAGER' | 'ADMIN_KASIR';
  setCurrentUserRole: (role: 'SUPER_ADMIN' | 'ADMIN_MANAGER' | 'ADMIN_KASIR') => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  id: NavTabId;
  label: string;
  subtitle: string;
  icon: any;
  badge?: string | null;
  badgeColor?: string;
  restrictedToKasir?: boolean;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUserRole,
  setCurrentUserRole,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { retailCart, member, financials, wasteHistory, standingOrders, currentUser, setCurrentUser, systemUsers } = useEcosystem();

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'TRANSAKSI KASIR',
      items: [
        {
          id: 'RETAIL' as NavTabId,
          label: 'Kasir Retail (B2C)',
          subtitle: 'Swalayan & Barcode',
          icon: Store,
          badge: retailCart.length > 0 ? `${retailCart.length}` : null,
          badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
        },
        {
          id: 'GROSIR' as NavTabId,
          label: 'Grosir (B2B 3-Ply)',
          subtitle: 'Partai & Continuous Form',
          icon: Layers,
        },
        {
          id: 'WASTE' as NavTabId,
          label: 'Pembelian Limbah',
          subtitle: 'Minyak Jelantah & Bagi Hasil',
          icon: Recycle,
          badge: wasteHistory.length > 0 ? `${wasteHistory.length}` : null,
          badgeColor: 'bg-amber-500 text-slate-950 font-bold',
        },
      ],
    },
    {
      groupTitle: 'PELANGGAN & CRM',
      items: [
        {
          id: 'MEMBERS' as NavTabId,
          label: 'Member One Identity',
          subtitle: 'Poin, Doorprize & Afiliasi',
          icon: Users,
          badge: `${member.totalPoints} pt`,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
        },
      ],
    },
    {
      groupTitle: 'FINANSIAL & SAK',
      items: [
        {
          id: 'ACCOUNTING' as NavTabId,
          label: 'Akuntansi Standar SAK',
          subtitle: 'Laba Rugi, Neraca, Arus Kas',
          icon: LineChart,
          restrictedToKasir: true,
        },
      ],
    },
    {
      groupTitle: 'EKOSISTEM & SUPPLY',
      items: [
        {
          id: 'WHITELABEL' as NavTabId,
          label: 'White Label Maklon',
          subtitle: 'Pabrikan & Pasokan B2B UKM',
          icon: Factory,
          restrictedToKasir: true,
        },
        {
          id: 'UKM_SUPPLY' as NavTabId,
          label: 'B2B Pasokan & Referral',
          subtitle: 'Katalog, Standing Order, Komisi',
          icon: UtensilsCrossed,
          badge: `${standingOrders.length} SO`,
          badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40',
        },
        {
          id: 'ECOSYSTEM' as NavTabId,
          label: 'Pilar Rantai Pasok',
          subtitle: 'Pusat Sinergi Hub',
          icon: Boxes,
          restrictedToKasir: true,
        },
      ],
    },
  ];


  return (
    <aside
      className={cn(
        'relative z-30 flex flex-col border-r border-slate-200 bg-white/95 backdrop-blur-xl transition-all duration-300 select-none min-h-screen shadow-sm',
        isCollapsed ? 'w-20' : 'w-72',
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
            <span className="text-white font-extrabold text-xl font-mono">O</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-slate-900 text-base tracking-tight font-outfit truncate">
                ORIENTAL
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 truncate">
                Digital Ecosystem
              </span>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition hidden lg:flex items-center justify-center"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items Container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {group.groupTitle}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const isRestricted = item.restrictedToKasir && currentUserRole === 'ADMIN_KASIR';

                return (
                  <button
                    key={item.id}
                    disabled={isRestricted}
                    onClick={() => {
                      if (isRestricted) {
                        alert(`Akses Ditolak: Peran Kasir terisolasi ketat dari modul manajerial (${item.label}) sesuai aturan RBAC Sprint 1.`);
                        return;
                      }
                      setActiveTab(item.id);
                    }}
                    title={
                      isRestricted
                        ? `Akses Ditolak: Akun kasir terisolasi dari ${item.label}`
                        : isCollapsed
                        ? `${item.label}`
                        : undefined
                    }
                    className={cn(
                      'group relative flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-semibold'
                        : isRestricted
                        ? 'text-slate-400 bg-slate-50/80 cursor-not-allowed opacity-60 border border-slate-200/60'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                        isActive ? 'text-white' : isRestricted ? 'text-slate-400' : 'text-slate-500 group-hover:text-emerald-600',
                      )}
                    />

                    {!isCollapsed && (
                      <div className="flex flex-1 items-center justify-between overflow-hidden text-left">
                        <div className="truncate">
                          <p className="truncate leading-tight font-medium">{item.label}</p>
                          <p className={cn(
                            'text-[10px] font-normal truncate mt-0.5',
                            isActive ? 'text-emerald-100' : isRestricted ? 'text-slate-400' : 'text-slate-400'
                          )}>
                            {isRestricted ? 'Terkunci (Manajerial)' : item.subtitle}
                          </p>
                        </div>
                        {isRestricted ? (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[9px] rounded font-mono bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1 flex-shrink-0">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Kasir Terisolasi</span>
                          </span>
                        ) : item.badge ? (
                          <span
                            className={cn(
                              'ml-2 px-2 py-0.5 text-[10px] rounded-full font-mono flex-shrink-0',
                              isActive
                                ? 'bg-emerald-700/60 text-white'
                                : item.badgeColor || 'bg-slate-100 text-slate-600',
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    )}

                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Role Card & Footer Pinned */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80">
        <div
          className={cn(
            'p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-3 shadow-xs',
            isCollapsed && 'justify-center p-2',
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0 shadow-xs">
            {currentUser.name
              ? currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'CS'}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <select
                  value={currentUser.role}
                  onChange={(e) => {
                    const newRole = e.target.value as any;
                    setCurrentUserRole(newRole);
                    const matchedUser = systemUsers.find((u) => u.role === newRole) || {
                      ...currentUser,
                      role: newRole,
                    };
                    setCurrentUser(matchedUser);
                  }}
                  className="bg-transparent text-[10px] text-emerald-700 font-mono focus:outline-none cursor-pointer w-full truncate font-semibold"
                >
                  <option value="SUPER_ADMIN" className="bg-white text-slate-900">
                    Super Admin (Owner)
                  </option>
                  <option value="ADMIN_MANAGER" className="bg-white text-slate-900">
                    Admin Manager
                  </option>
                  <option value="ADMIN_KASIR" className="bg-white text-slate-900">
                    Admin Kasir (Terisolasi)
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
