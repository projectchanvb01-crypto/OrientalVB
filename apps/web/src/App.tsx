import React, { useState, useEffect } from 'react';
import { Store, Lock } from 'lucide-react';
import { RetailPOS } from './pages/RetailPOS';
import { PriceCheckerStation } from './pages/PriceCheckerStation';
import { GrosirPOS } from './pages/GrosirPOS';
import { WastePurchasingPOS } from './pages/WastePurchasingPOS';
import { WhiteLabelPortal } from './pages/WhiteLabelPortal';
import { MemberPortal } from './pages/MemberPortal';
import { AccountingDashboard } from './pages/AccountingDashboard';
import { EcosystemHub } from './pages/EcosystemHub';
import { UkmSupplyPortal } from './pages/UkmSupplyPortal';
import { MultiOutletManagement } from './pages/MultiOutletManagement';
import { InventoryControl } from './pages/InventoryControl';
import { LandedCostLogistics } from './pages/LandedCostLogistics';
import { EscrowPayLedger } from './pages/EscrowPayLedger';
import { EcosystemProvider, useEcosystem } from './context/EcosystemContext';
import { AppLayout } from './components/layout/AppLayout';
import { NavTabId } from './components/layout/Sidebar';

// URL Routing mapping
const getTabFromPath = (path: string): NavTabId => {
  const clean = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean.includes('price-checker') || clean.includes('cek-harga') || clean.includes('kiosk')) return 'PRICE_CHECKER';
  if (clean.includes('waste') || clean.includes('limbah') || clean.includes('jelantah')) return 'WASTE';
  if (clean.includes('white-label') || clean.includes('whitelabel') || clean.includes('maklon')) return 'WHITELABEL';
  if (clean.includes('ukm') || clean.includes('supply') || clean.includes('referral') || clean.includes('standing')) return 'UKM_SUPPLY';
  if (clean.includes('member')) return 'MEMBERS';
  if (clean.includes('grosir')) return 'GROSIR';
  if (clean.includes('landed') || clean.includes('logistik') || clean.includes('laut')) return 'LANDED_COST';
  if (clean.includes('inventory') || clean.includes('fefo') || clean.includes('umur') || clean.includes('wms') || clean.includes('gudang')) return 'INVENTORY_CONTROL';
  if (clean.includes('outlet') || clean.includes('cabang') || clean.includes('transfer')) return 'MULTI_OUTLET';
  if (clean.includes('accounting') || clean.includes('keuangan')) return 'ACCOUNTING';
  if (clean.includes('ecosystem') || clean.includes('hub')) return 'ECOSYSTEM';
  if (clean.includes('escrow') || clean.includes('ledger') || clean.includes('pay-ledger')) return 'ESCROW_LEDGER';
  if (clean.includes('retail') || clean === '/') return 'RETAIL';
  return 'RETAIL';
};

const getPathFromTab = (tab: NavTabId): string => {
  switch (tab) {
    case 'PRICE_CHECKER':
      return '/price-checker';
    case 'WASTE':
      return '/waste';
    case 'WHITELABEL':
      return '/white-label';
    case 'UKM_SUPPLY':
      return '/ukm-supply';
    case 'MEMBERS':
      return '/members';
    case 'GROSIR':
      return '/grosir';
    case 'MULTI_OUTLET':
      return '/multi-outlet';
    case 'INVENTORY_CONTROL':
      return '/inventory-control';
    case 'LANDED_COST':
      return '/landed-cost';
    case 'ACCOUNTING':
      return '/accounting';
    case 'ECOSYSTEM':
      return '/ecosystem';
    case 'ESCROW_LEDGER':
      return '/escrow-ledger';
    case 'RETAIL':
    default:
      return '/retail-pos';
  }
};

const ManagerialAccessBlocked: React.FC<{ menuName: string; onReturn: () => void }> = ({
  menuName,
  onReturn,
}) => (
  <div className="flex flex-col items-center justify-center min-h-[460px] p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-sm space-y-5 animate-fadeIn">
    <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
      <Lock className="w-8 h-8" />
    </div>
    <div className="max-w-md space-y-2">
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
        Akses Ditolak • RBAC Kebijakan Sprint 1
      </span>
      <h2 className="text-xl font-black text-slate-900 mt-2">
        Akses Menu Manajerial ({menuName}) Terisolasi
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed">
        Berdasarkan kebijakan hak akses berjenjang (RBAC Sprint 1), akun kasir <strong>(ADMIN_KASIR)</strong> terisolasi ketat hanya pada operasional kasir dan CRM pelanggan. Modul akuntansi keuangan SAK, kontrak pabrikasi maklon, dan pengaturan pilar ekosistem hanya dapat diakses oleh <strong>Super Admin (Owner)</strong> atau <strong>Admin Manager</strong>.
      </p>
    </div>
    <button
      onClick={onReturn}
      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
    >
      <Store className="w-4 h-4" />
      <span>Kembali ke Kasir Retail POS</span>
    </button>
  </div>
);

const AppContent: React.FC = () => {
  const { currentUser, setCurrentUser, systemUsers } = useEcosystem();

  // Initialize state based on the current URL in browser address bar
  const [activeTab, setActiveTabState] = useState<NavTabId>(() =>
    getTabFromPath(window.location.pathname),
  );

  const currentUserRole = currentUser.role as 'SUPER_ADMIN' | 'ADMIN_MANAGER' | 'REGIONAL_MANAGER' | 'ADMIN_KASIR';
  const setCurrentUserRole = (role: any) => {
    const matchedUser = systemUsers.find((u) => u.role === (role as any)) || {
      ...currentUser,
      role: role as any,
    };
    setCurrentUser(matchedUser);
  };

  // Change tab and synchronize browser URL without full reload
  const setActiveTab = (tab: NavTabId) => {
    setActiveTabState(tab);
    const targetPath = getPathFromTab(tab);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Listen to browser Back and Forward navigation buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isKasir = currentUser.role === 'ADMIN_KASIR';

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUserRole={currentUserRole}
      setCurrentUserRole={setCurrentUserRole}
    >
      {activeTab === 'RETAIL' && <RetailPOS />}
      {activeTab === 'PRICE_CHECKER' && <PriceCheckerStation />}
      {activeTab === 'GROSIR' && <GrosirPOS />}
      {activeTab === 'WASTE' && <WastePurchasingPOS />}
      {activeTab === 'MEMBERS' && <MemberPortal />}

      {/* Strict RBAC Guards on Managerial Modules */}
      {activeTab === 'ACCOUNTING' &&
        (isKasir ? (
          <ManagerialAccessBlocked
            menuName="Akuntansi Standar SAK"
            onReturn={() => setActiveTab('RETAIL')}
          />
        ) : (
          <AccountingDashboard />
        ))}

      {activeTab === 'WHITELABEL' &&
        (isKasir ? (
          <ManagerialAccessBlocked
            menuName="White Label Maklon"
            onReturn={() => setActiveTab('RETAIL')}
          />
        ) : (
          <WhiteLabelPortal />
        ))}

      {activeTab === 'UKM_SUPPLY' && <UkmSupplyPortal />}

      {activeTab === 'MULTI_OUTLET' &&
        (isKasir ? (
          <ManagerialAccessBlocked
            menuName="Multi-Outlet & Tata Kelola Cabang"
            onReturn={() => setActiveTab('RETAIL')}
          />
        ) : (
          <MultiOutletManagement />
        ))}

      {activeTab === 'INVENTORY_CONTROL' &&
        (isKasir ? (
          <ManagerialAccessBlocked
            menuName="Inventory Control & Umur Barang"
            onReturn={() => setActiveTab('RETAIL')}
          />
        ) : (
          <InventoryControl />
        ))}

      {activeTab === 'LANDED_COST' &&
        (isKasir ? (
          <ManagerialAccessBlocked
            menuName="Landed Cost Laut & Pengadaan"
            onReturn={() => setActiveTab('RETAIL')}
          />
        ) : (
          <LandedCostLogistics />
        ))}

      {activeTab === 'ECOSYSTEM' &&
        (isKasir ? (
          <ManagerialAccessBlocked
            menuName="Pusat Sinergi Ekosistem"
            onReturn={() => setActiveTab('RETAIL')}
          />
        ) : (
          <EcosystemHub />
        ))}

      {activeTab === 'ESCROW_LEDGER' &&
        (isKasir ? (
          <ManagerialAccessBlocked
            menuName="Escrow & Pay Ledger"
            onReturn={() => setActiveTab('RETAIL')}
          />
        ) : (
          <EscrowPayLedger />
        ))}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <EcosystemProvider>
      <AppContent />
    </EcosystemProvider>
  );
};

export default App;
