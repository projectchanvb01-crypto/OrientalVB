import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Warehouse, 
  Ship, 
  FileSpreadsheet, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Activity, 
  Sparkles, 
  Cpu, 
  Clock, 
  AlertTriangle,
  Lock,
  Boxes
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

export type AdminTabId = 
  | 'MULTI_OUTLET' 
  | 'INVENTORY_CONTROL' 
  | 'WMS' 
  | 'LANDED_COST' 
  | 'ACCOUNTING' 
  | 'ESCROW_LEDGER';

interface AdminLayoutProps {
  activeTab: AdminTabId;
  setActiveTab: (tab: AdminTabId) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const { currentUser, setCurrentUser, systemUsers } = useEcosystem();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuGroups = [
    {
      groupTitle: 'Pusat Kendali & Master',
      items: [
        {
          id: 'MULTI_OUTLET' as AdminTabId,
          label: 'Jaringan Multi-Cabang',
          desc: 'Makassar & Bone Inter-Store',
          icon: Building2,
          badge: 'Sprint 8',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        },
        {
          id: 'INVENTORY_CONTROL' as AdminTabId,
          label: 'Master SKU & Unit Dinamis',
          desc: 'Konversi Renceng & Tier UKM',
          icon: Boxes,
          badge: 'FEFO Rules',
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        },
      ],
    },
    {
      groupTitle: 'Gudang & Logistik Antar-Pulau',
      items: [
        {
          id: 'WMS' as AdminTabId,
          label: 'WMS & Lokasi Rak FEFO',
          desc: 'Buffer vs Picking & Opname',
          icon: Warehouse,
          badge: 'Sprint 10',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        },
        {
          id: 'LANDED_COST' as AdminTabId,
          label: 'Ekspedisi Laut & Landed Cost',
          desc: 'Kalkulator CBM & Supplier PO',
          icon: Ship,
          badge: 'Sprint 11',
          badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        },
      ],
    },
    {
      groupTitle: 'Finansial & Kepatuhan SAK',
      items: [
        {
          id: 'ACCOUNTING' as AdminTabId,
          label: 'Akuntansi SAK & DJP Coretax',
          desc: 'Laba Rugi, Neraca & Faktur',
          icon: FileSpreadsheet,
          badge: 'MoM / YoY',
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        },
        {
          id: 'ESCROW_LEDGER' as AdminTabId,
          label: 'Escrow 14 Hari & Pay Ledger',
          desc: 'Karantina Maklon & Buku Besar',
          icon: ShieldCheck,
          badge: 'Sprint 12',
          badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        },
      ],
    },
  ];

  const handleRoleChange = (role: string) => {
    const matched = systemUsers.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser({
        ...currentUser,
        role: role as any,
      });
    }
  };

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex overflow-hidden font-sans">
      {/* Sidebar Control Plane */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        } bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 select-none z-30`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-950">
              <Cpu className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="leading-tight truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white font-mono">
                    ORIENTAL ADMIN
                  </span>
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1 py-0.2 rounded font-mono font-bold">
                    PORT 3003
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  One-Person Control Plane
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Group Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2">
                  {group.groupTitle}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left group ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950 font-bold border border-indigo-500/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                      title={isSidebarCollapsed ? `${item.label} (${item.desc})` : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                      {!isSidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate">{item.label}</span>
                            <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                              isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                            }`}>
                              {item.badge}
                            </span>
                          </div>
                          <div className={`text-[10px] truncate mt-0.5 ${
                            isActive ? 'text-indigo-200' : 'text-slate-400'
                          }`}>
                            {item.desc}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Current User & Role Switcher */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Otorisasi Hak Akses (RBAC)
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                <select
                  value={currentUser.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-indigo-300 py-0.5 px-1 focus:outline-none focus:border-indigo-500 mt-0.5"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Owner)</option>
                  <option value="ADMIN_MANAGER">ADMIN_MANAGER (Kepala Cabang)</option>
                  <option value="ADMIN_PURCHASING">ADMIN_PURCHASING (Pengadaan)</option>
                  <option value="STAFF_GUDANG">STAFF_GUDANG (WMS)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Backoffice Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-900">
        {/* Top Control Plane Ribbon */}
        <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white font-mono">
                  Autonomous Engine Active
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  CRON 00:01 LIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                FEFO Clearance Diskon Otomatis • Auto-Lock TOP Jatuh Tempo • Auto-Release Escrow 14 Hari
              </div>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Total Omzet Bulan Ini</div>
              <div className="text-xs font-bold font-mono text-emerald-400">Rp 482.500.000</div>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Escrow 14h Karantina</div>
              <div className="text-xs font-bold font-mono text-violet-400">Rp 35.000.000</div>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Piutang TOP Overdue</div>
              <div className="text-xs font-bold font-mono text-amber-400">Rp 18.500.000 (Locked)</div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar bg-slate-900/90">
          {children}
        </main>

        {/* Backoffice SAK Compliance Footer */}
        <footer className="bg-slate-950 border-t border-slate-800 py-2.5 px-6 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
          <div>
            Oriental Backoffice Control Plane • Single-Owner Architecture • SAK ETAP & DJP Coretax Compliant
          </div>
          <div className="flex items-center gap-3">
            <span>Server: PostgreSQL 16 ACID</span>
            <span>•</span>
            <span className="text-emerald-400">Online Consistency Required</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
