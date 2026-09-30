import React, { useState, useEffect } from 'react';
import { EcosystemProvider } from './context/EcosystemContext';
import { AdminLayout, AdminTabId } from './components/layout/AdminLayout';
import { MultiOutletManagement } from './pages/MultiOutletManagement';
import { InventoryControl } from './pages/InventoryControl';
import { WmsInventoryControl } from './pages/WmsInventoryControl';
import { LandedCostLogistics } from './pages/LandedCostLogistics';
import { AccountingDashboard } from './pages/AccountingDashboard';
import { EscrowPayLedger } from './pages/EscrowPayLedger';

const getTabFromPath = (path: string): AdminTabId => {
  const clean = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean.includes('wms') || clean.includes('gudang') || clean.includes('rak')) return 'WMS';
  if (clean.includes('inventory') || clean.includes('fefo') || clean.includes('master') || clean.includes('sku')) return 'INVENTORY_CONTROL';
  if (clean.includes('landed') || clean.includes('logistik') || clean.includes('laut') || clean.includes('cbm')) return 'LANDED_COST';
  if (clean.includes('accounting') || clean.includes('keuangan') || clean.includes('sak') || clean.includes('pajak')) return 'ACCOUNTING';
  if (clean.includes('escrow') || clean.includes('ledger') || clean.includes('pay-ledger')) return 'ESCROW_LEDGER';
  return 'MULTI_OUTLET';
};

const getPathFromTab = (tab: AdminTabId): string => {
  switch (tab) {
    case 'INVENTORY_CONTROL':
      return '/inventory-control';
    case 'WMS':
      return '/wms';
    case 'LANDED_COST':
      return '/landed-cost';
    case 'ACCOUNTING':
      return '/accounting';
    case 'ESCROW_LEDGER':
      return '/escrow-ledger';
    case 'MULTI_OUTLET':
    default:
      return '/';
  }
};

const AdminAppContent: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<AdminTabId>(() => getTabFromPath(window.location.pathname));

  const setActiveTab = (tab: AdminTabId) => {
    setActiveTabState(tab);
    const path = getPathFromTab(tab);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'MULTI_OUTLET' && <MultiOutletManagement />}
      {activeTab === 'INVENTORY_CONTROL' && <InventoryControl />}
      {activeTab === 'WMS' && <WmsInventoryControl />}
      {activeTab === 'LANDED_COST' && <LandedCostLogistics />}
      {activeTab === 'ACCOUNTING' && <AccountingDashboard />}
      {activeTab === 'ESCROW_LEDGER' && <EscrowPayLedger />}
    </AdminLayout>
  );
};

export function App() {
  return (
    <EcosystemProvider>
      <AdminAppContent />
    </EcosystemProvider>
  );
}

export default App;
